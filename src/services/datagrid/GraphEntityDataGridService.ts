import { ODataQueryBuilder } from "mgwdev-m365-helpers/lib/utils/queryBuilders/ODataQueryBuilder";
import { IDataGridService } from "./DataGridService";
import {
  ODataPagedDataProvider,
  IHttpClient,
  IQueryField,
} from "mgwdev-m365-helpers";
import { DataField } from "../../model/DataField";
import { IEntityWithIdAndDisplayName } from "../../model/IEntityWithIdAndDisplayName";

export class GraphEntityDataGridService<T> implements IDataGridService<T> {
  protected dataProvider: ODataPagedDataProvider<T>;
  constructor(
    protected graphClient: IHttpClient,
    protected entityEndpoint: string
  ) {
    this.dataProvider = new ODataPagedDataProvider<T>(
      graphClient,
      entityEndpoint,
      true
    );
  }

  private mapToExpand(field: DataField): string {
    if (!field.expandFields) {
      return field.name;
    }
    return `${field.name}($select=${field.expandFields.join(",")})`;
  }

  public setFields(fields: DataField[]) {
    this.dataProvider.selectQuery = fields
      .filter((f) => f.type !== "Lookup")
      .map((f) => f.name)
      .join(",");
    this.dataProvider.expandQuery = fields
      .filter((f) => f.type === "Lookup" || f.type === "User")
      .map((f) => this.mapToExpand(f))
      .join(",");
  }
  public getData(
    queryFields?: IQueryField[],
    orderBy?: string,
    orderDir?: "ASC" | "DESC"
  ) {
    if (queryFields) {
      const queryBuilder = new ODataQueryBuilder();
      for (const fld of queryFields) {
        queryBuilder.withFieldQuery(fld);
      }

      const query = queryBuilder.build();
      this.dataProvider.setQuery(query);
    }
    if (orderBy) {
      this.dataProvider.setOrder(orderBy, orderDir || "ASC");
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
  public async getFieldSuggestions(
    field: DataField,
    existingFilters?: IQueryField[]
  ): Promise<IEntityWithIdAndDisplayName[]> {
    return [];
  }
}
