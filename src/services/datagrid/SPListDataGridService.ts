import { CamlQueryBuilder, IHttpClient, IQueryField, SPListItemCamlPagedDataProvider } from "mgwdev-m365-helpers";
import { DataField } from "../../model/DataField";
import { IEntityWithIdAndDisplayName } from "../../model/IEntityWithIdAndDisplayName";
import { IDataGridService } from "./DataGridService";

export class SPListDataGridService<T> implements IDataGridService<T> {
    protected dataProvider: SPListItemCamlPagedDataProvider<T>;
    constructor(protected spHttpClient: IHttpClient, protected siteUrl: string, protected listId: string) {
        this.dataProvider = new SPListItemCamlPagedDataProvider<T>(spHttpClient, siteUrl, listId);
    }
    public setFields(fields: DataField[]) {
        this.dataProvider.selectedFields = fields.map(fld => fld.name);
    }
    public async getData(queryFields?: IQueryField[], orderBy?: string, orderDir?: "ASC" | "DESC"): Promise<T[]> {
        const queryBuilder = new CamlQueryBuilder();
        if (queryFields && queryFields.length > 0) {
            queryFields.forEach(fld => queryBuilder.withFieldQuery(fld));
            this.dataProvider.setQuery(queryBuilder.build());
        }
        if (orderBy) {
            this.dataProvider.setOrder(orderBy, orderDir);
        }
        return this.dataProvider.getData();
    }
    public getNextPage(): Promise<T[]> {
        return this.dataProvider.getNextPage();
    }
    public isNextPageAvailable(): boolean {
        return this.dataProvider.isNextPageAvailable();
    }
    public getPreviousPage(): Promise<T[]> {
        return this.dataProvider.getPreviousPage();
    }
    public isPreviousPageAvailable(): boolean {
        return this.dataProvider.isPreviousPageAvailable();
    }
    public getFieldSuggestions = async (
        field: DataField,
        existingFilters?: IQueryField[]
    ): Promise<IEntityWithIdAndDisplayName[]> => {
        let apiUri = `${this.siteUrl}/_api/web/lists('${this.listId}')/RenderListFilterData?FieldInternalName='${field.name}'`;
        if (existingFilters && existingFilters.length > 0) {
            let filterQuery = "";
            for (let i = 0; i < existingFilters.length; i++) {
                const fld = existingFilters[i];
                const fldNumber = i + 1;
                filterQuery += `&FilterField${fldNumber}=${fld.name}&FilterValue${fldNumber}=${encodeURIComponent(fld.value)}&FilterType${fldNumber}=${fld.type || "Text"}`
            }
            apiUri += filterQuery;
        }
        const suggestionsResponse = await this.spHttpClient.post(apiUri, {
            headers: {
                accept: "application/json"
            }
        });
        //whatever You do the response is always in xml....soo
        const parser = new DOMParser();
        const text = await suggestionsResponse.text();
        //sanitaze SELECTED attribute
        const xmlDoc = parser.parseFromString(text?.replace("SELECTED", ""), "application/xml")

        const options = xmlDoc.getElementsByTagName("OPTION");
        const result = [];
        for (let i = 0; i < options.length; i++) {
            const option = options.item(i);
            result.push({
                id: option.getAttribute("Value"),
                displayName: option.innerHTML
            })
        }
        return result;
    }

}