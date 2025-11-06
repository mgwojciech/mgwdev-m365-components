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
        const suggestionsProvider = new SPListItemCamlPagedDataProvider<T>(this.spHttpClient, this.siteUrl, this.listId, [field.name]);
        suggestionsProvider.pageSize = 10;
        if (existingFilters && existingFilters.length > 0) {
            const queryBuilder = new CamlQueryBuilder();
            existingFilters.forEach(fld => queryBuilder.withFieldQuery(fld));
            this.dataProvider.setQuery(queryBuilder.build());
            suggestionsProvider.setQuery(queryBuilder.build());
        }
        const result = await suggestionsProvider.getData();
        return result.map(r => ({
            id: field.type === "User" ? r[field.name][0]?.id : r[field.name],
            displayName: field.type === "User" ? r[field.name][0]?.title : r[field.name]
        }))
    }

}