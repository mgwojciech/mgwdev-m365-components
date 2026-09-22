import { IHttpClient } from "mgwdev-m365-helpers";
import {
    IDataverseEntityDefinition,
    IDataverseEntitySummary,
    IDataverseFormField,
    IDataverseOptionSetValue,
} from "../../model/DataverseFormField";

const ODATA_VERSION = "v9.2";
const DEFAULT_HEADERS: RequestInit = {
    headers: { "OData-MaxVersion": "4.0", "OData-Version": "4.0", "Accept": "application/json", Prefer: "odata.include-annotations=*" },
};
const OPTIONSET_TYPES = new Set(["Picklist", "State", "Status", "MultiSelectPicklist", "Boolean"]);
const ATTRIBUTE_TYPE_CAST: Record<string, string> = {
    Picklist: "Microsoft.Dynamics.CRM.PicklistAttributeMetadata",
    State: "Microsoft.Dynamics.CRM.StateAttributeMetadata",
    Status: "Microsoft.Dynamics.CRM.StatusAttributeMetadata",
    MultiSelectPicklist: "Microsoft.Dynamics.CRM.MultiSelectPicklistAttributeMetadata",
    Boolean: "Microsoft.Dynamics.CRM.BooleanAttributeMetadata",
};

// module-level caches so repeated form/lookup renders don't re-fetch metadata that rarely changes
const entitySummaryCache = new Map<string, Promise<IDataverseEntitySummary>>();
const entityDefinitionCache = new Map<string, Promise<IDataverseEntityDefinition>>();

export class DataverseEntityMetadataService {
    constructor(protected dataverseClient: IHttpClient, protected dataverseEnv: string) { }

    public getEntitySummary(entityName: string): Promise<IDataverseEntitySummary> {
        const cacheKey = `${this.dataverseEnv}|${entityName}`;
        let cached = entitySummaryCache.get(cacheKey);
        if (!cached) {
            cached = this.fetchEntitySummary(entityName);
            entitySummaryCache.set(cacheKey, cached);
        }
        return cached;
    }

    public async searchEntitiesByPrimaryName(summary: IDataverseEntitySummary, searchText: string): Promise<{ id: string; displayName: string; entityLogicalName: string; }[]> {
        
        let url = `${this.dataverseEnv}/api/data/${ODATA_VERSION}/${summary.entitySetName}?$select=${summary.primaryIdAttribute},${summary.primaryNameAttribute}&$top=25`;
        if (searchText) {
            url += `&$filter=contains(${summary.primaryNameAttribute},'${searchText.replace(/'/g, "''")}')`;
        }
        const response = await this.dataverseClient.get(url);
        const results = await response.json();
        return (results.value || []).map((item: any) => ({
            id: item[summary.primaryIdAttribute],
            displayName: item[summary.primaryNameAttribute],
            entityLogicalName: summary.logicalName,
        }));
    }

    public async getEntityDefinition(entityName: string, fieldsToRender?: string[]): Promise<IDataverseEntityDefinition> {
        const cacheKey = `${this.dataverseEnv}|${entityName}`;
        let cached = entityDefinitionCache.get(cacheKey);
        if (!cached) {
            cached = this.fetchEntityDefinition(entityName, fieldsToRender);

            entityDefinitionCache.set(cacheKey, cached);
        }
        return cached;
    }

    private async fetchEntitySummary(entityName: string): Promise<IDataverseEntitySummary> {
        const url = `${this.dataverseEnv}/api/data/${ODATA_VERSION}/EntityDefinitions(LogicalName='${entityName}')?$select=LogicalName,DisplayName,PrimaryIdAttribute,PrimaryNameAttribute,EntitySetName`;
        const response = await this.dataverseClient.get(url, DEFAULT_HEADERS);
        if (!response.ok) {
            throw new Error(`Failed to load entity metadata for '${entityName}'`);
        }
        const data = await response.json();
        return this.mapEntitySummary(data);
    }

    private async fetchEntityDefinition(entityName: string, fieldsToRender?: string[]): Promise<IDataverseEntityDefinition> {
        let url = `${this.dataverseEnv}/api/data/${ODATA_VERSION}/EntityDefinitions(LogicalName='${entityName}')/Attributes`;
        if (fieldsToRender && fieldsToRender.length > 0) {
            url += `?$filter=${fieldsToRender.map(f => `LogicalName eq '${f}' or SchemaName eq '${f}'`).join(' or ')}`;
        }
        const [attributesResponse, response] = await Promise.all([
            this.dataverseClient.get(url, DEFAULT_HEADERS),
            this.dataverseClient.get(`${this.dataverseEnv}/api/data/${ODATA_VERSION}/EntityDefinitions(LogicalName='${entityName}')?$select=LogicalName,DisplayName,PrimaryIdAttribute,PrimaryNameAttribute,EntitySetName`, DEFAULT_HEADERS)
        ]);
        if (!response.ok) {
            throw new Error(`Failed to load entity definition for '${entityName}'`);
        }
        const attributesData = await attributesResponse.json();
        const data = await response.json();
        // exclude "shadow" attributes (e.g. base/text companions of a real field)
        const attributes = ((attributesData.value || []) as any[]).filter((a) => !(a.AttributeOf || a.AttributeType === "Owner"));
        const optionSetAttributes = attributes.filter((a) => OPTIONSET_TYPES.has(a.AttributeType));
        const lookupAttributes = attributes.filter((a) => a.AttributeType === "Lookup");
        const [optionsByLogicalName, lookupInfoByLogicalName] = await Promise.all([
            this.loadOptionSets(entityName, optionSetAttributes),
            this.loadEntitySummaries(entityName, lookupAttributes),
        ]);
        const fields: IDataverseFormField[] = attributes.map((a) =>
            this.mapAttribute(a, optionsByLogicalName.get(a.LogicalName), lookupInfoByLogicalName.get(a.LogicalName))
        );
        return {
            ...this.mapEntitySummary(data),
            fields,
        };
    }

    private mapEntitySummary(data: any): IDataverseEntitySummary {
        return {
            logicalName: data.LogicalName,
            entitySetName: data.EntitySetName,
            primaryIdAttribute: data.PrimaryIdAttribute,
            primaryNameAttribute: data.PrimaryNameAttribute,
            displayName: data.DisplayName?.UserLocalizedLabel?.Label || data.LogicalName,
        };
    }

    private mapAttribute(attr: any, options?: IDataverseOptionSetValue[], lookupInfo?: IDataverseEntitySummary): IDataverseFormField {
        const requiredLevel = attr.RequiredLevel?.Value;
        return {
            logicalName: attr.LogicalName,
            displayName: attr.DisplayName?.UserLocalizedLabel?.Label || attr.LogicalName,
            attributeType: attr.AttributeType,
            isRequired: requiredLevel === "ApplicationRequired" || requiredLevel === "SystemRequired",
            isReadOnly: !attr.IsValidForCreate && !attr.IsValidForUpdate,
            description: attr.Description?.UserLocalizedLabel?.Label,
            maxLength: attr.MaxLength,
            minValue: attr.MinValue,
            maxValue: attr.MaxValue,
            schemaName: attr.SchemaName,
            options,
            targets: attr.Targets,
            targetLookupInfo: lookupInfo,
        };
    }

    private async loadEntitySummaries(
        entityName: string,
        attrs: any[]
    ): Promise<Map<string, IDataverseEntitySummary>> {
        const map = new Map<string, IDataverseEntitySummary>();
        await Promise.all(
            attrs.map(async (attr) => {
               const summary = await this.getEntitySummary(attr.Targets?.[0]);
               if (summary) {
                   map.set(attr.LogicalName, summary);
               }
            })
        );
        return map;
    }

    private async loadOptionSets(
        entityName: string,
        attrs: any[]
    ): Promise<Map<string, IDataverseOptionSetValue[]>> {
        const map = new Map<string, IDataverseOptionSetValue[]>();
        await Promise.all(
            attrs.map(async (attr) => {
                const cast = ATTRIBUTE_TYPE_CAST[attr.AttributeType];
                if (!cast) {
                    return;
                }
                const url = `${this.dataverseEnv}/api/data/${ODATA_VERSION}/EntityDefinitions(LogicalName='${entityName}')/Attributes(LogicalName='${attr.LogicalName}')/${cast}?$select=LogicalName&$expand=OptionSet`;
                try {
                    const response = await this.dataverseClient.get(url, DEFAULT_HEADERS);
                    if (!response.ok) {
                        return;
                    }
                    const data = await response.json();
                    if (attr.AttributeType === "Boolean") {
                        const options: IDataverseOptionSetValue[] = [];
                        if (data.OptionSet?.FalseOption) {
                            options.push({
                                value: data.OptionSet.FalseOption.Value,
                                label: data.OptionSet.FalseOption.Label?.UserLocalizedLabel?.Label || "No",
                            });
                        }
                        if (data.OptionSet?.TrueOption) {
                            options.push({
                                value: data.OptionSet.TrueOption.Value,
                                label: data.OptionSet.TrueOption.Label?.UserLocalizedLabel?.Label || "Yes",
                            });
                        }
                        map.set(attr.LogicalName, options);
                    } else {
                        const options: IDataverseOptionSetValue[] = (data.OptionSet?.Options || []).map((o: any) => ({
                            value: o.Value,
                            label: o.Label?.UserLocalizedLabel?.Label || String(o.Value),
                        }));
                        map.set(attr.LogicalName, options);
                    }
                } catch {
                    // option set could not be loaded - field will render without selectable options
                }
            })
        );
        return map;
    }
}
