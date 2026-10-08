import * as React from "react";
import { Field } from "@fluentui/react-components";
import { IHttpClient } from "mgwdev-m365-helpers";
import { AbstractGraphEntityPicker } from "../../common/graphEntityPicker/AbstractGraphEntityPicker";
import { DataverseEntityMetadataService } from "../../../services/dataverse/DataverseEntityMetadataService";
import { IDataverseFormField, IDataverseLookupValue } from "../../../model/DataverseFormField";
import { IFormFieldRenderer, IFormFieldRendererContext } from "./IFormFieldRenderer";

const LOOKUP_TYPES = new Set(["Lookup", "Customer", "Owner"]);

export class LookupFieldRenderer implements IFormFieldRenderer {
    protected entityMetadataService: DataverseEntityMetadataService;
    constructor(private dataverseClient: IHttpClient, private dataverseEnv: string) {
        this.entityMetadataService = new DataverseEntityMetadataService(dataverseClient, dataverseEnv);
    }
    public isRendererApplicable(field: IDataverseFormField): boolean {
        return LOOKUP_TYPES.has(field.attributeType);
    }
    public renderField(
        field: IDataverseFormField,
        value: unknown,
        onChange: (value: unknown) => void,
        context: IFormFieldRendererContext
    ): React.ReactElement {
        return (
            <LookupFieldRendererComponent
                field={field}
                value={value}
                onChange={onChange}
                context={context}
                entityMetadataService={this.entityMetadataService}
            />
        );
    }
}

export function LookupFieldRendererComponent(props: {
    field: IDataverseFormField;
    value: unknown;
    onChange: (value: unknown) => void;
    context: IFormFieldRendererContext;
    entityMetadataService: DataverseEntityMetadataService;
}): React.ReactElement {
    const { field, value, onChange, context, entityMetadataService } = props;

    const metadataService = entityMetadataService;
    const targetEntity = field.targets?.[0];
    const currentValue = value as IDataverseLookupValue | undefined;
    return (
        <Field
            key={field.logicalName}
            label={field.displayName}
            required={field.isRequired}
            hint={field.description}
            className={context.className}
        >
            <AbstractGraphEntityPicker<IDataverseLookupValue>
                additionalKey={`dataverse-lookup-${field.logicalName}`}
                value={currentValue ? [currentValue] : []}
                disabled={context.disabled || field.isReadOnly || !targetEntity}
                onDataRequested={async (searchText) => {
                    if (!targetEntity) {
                        return [];
                    }
                    return await metadataService.searchEntitiesByPrimaryName(field.targetLookupInfo, searchText);

                }}
                onEntitySelected={(entities) => onChange(entities?.[0])}
            />
        </Field>
    );
}
