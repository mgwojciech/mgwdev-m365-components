import {
  DataverseQueryBuilder,
  IHttpClient,
  IQueryField,
  ODataPagedDataProvider,
} from "mgwdev-m365-helpers";
import { ODataQueryBuilder } from "mgwdev-m365-helpers/lib/utils/queryBuilders/ODataQueryBuilder";
import { DataField } from "../../model/DataField";
import { IDataGridService } from "./DataGridService";
import { IEntityWithIdAndDisplayName } from "../../model/IEntityWithIdAndDisplayName";

export class DataverseTableDataGridService<T> implements IDataGridService<T> {
  protected dataProvider: ODataPagedDataProvider<T>;
  protected dataFields: DataField[] = [];
  constructor(
    protected dataverseClient: IHttpClient,
    protected dataverseEnv: string,
    protected tableName: string
  ) {
    this.dataProvider = new ODataPagedDataProvider<T>(
      dataverseClient,
      `${dataverseEnv}/api/data/v9.0/${tableName}`,
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
    this.dataFields = fields;
  }
  public getData(
    queryFields?: IQueryField[],
    orderBy?: string,
    orderDir?: "ASC" | "DESC"
  ) {
    if (queryFields && queryFields.length > 0) {
      const queryBuilder = new DataverseQueryBuilder();
      for (const fld of queryFields) {
        if (!fld.type) {
          fld.type = "Text";
        }
        queryBuilder.withFieldQuery(fld);
      }

      const query = queryBuilder.build();
      this.dataProvider.setQuery(query);
    } else {
      this.dataProvider.setQuery("");
    }
    if (orderBy) {
      let orderByColumODataName = orderBy;
      let orderByColumn = this.dataFields.find(
        (f) => f.name === orderByColumODataName
      );
      if (orderByColumn && orderByColumn.type === "Lookup") {
        orderByColumODataName = `${orderByColumn.name}/${orderByColumn.expandFields[0]}`;
      } else if (orderByColumn && orderByColumn.type === "User") {
        orderByColumODataName = `${orderByColumn.name}/fullname`;
      }
      this.dataProvider.setOrder(orderByColumODataName, orderDir || "ASC");
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
    if (field.type === "User") {
      let query = `${this.dataverseEnv}/api/data/v9.0/systemusers?`;
      if (existingFilters && existingFilters.length > 0) {
        const queryBuilder = new DataverseQueryBuilder();
        for (const fld of existingFilters) {
          if (!fld.type) {
            fld.type = "Text";
          }
          fld.name = field.expandFields[0];
          queryBuilder.withFieldQuery(fld);
        }
        query += `$filter=${queryBuilder.build()}&`;
      }
      query += `$select=${field.expandFields.join(",")}`;
      const response = await this.dataverseClient.get(query, {
        headers: {
          prefer: "odata.include-annotations=*",
        },
      });
      const results = await response.json();
      return results.value.map((item: any) => ({
        id: item[field.relatedId],
        displayName: item[field.expandFields[0]],
      }));
    }
    let query = `${this.dataverseEnv}/api/data/v9.0/${this.tableName}?`;
    if (existingFilters && existingFilters.length > 0) {
      const queryBuilder = new DataverseQueryBuilder();
      for (const fld of existingFilters) {
        if (!fld.type) {
          fld.type = "Text";
        }
        queryBuilder.withFieldQuery(fld);
      }
      query += `$filter=${queryBuilder.build()}&`;
    }
    if (field.type === "Lookup") {
      query += `$apply=groupby((${field.name}/${
        field.relatedId || field.name + "_id"
      },${field.name}/${field.expandFields[0]}))`;
    } else if (field.type == "User") {
      query += `$apply=groupby((${field.name}/fullname))`;
    } else if (field.type == "DateTime") {
      query += `$apply=aggregate(${field.name} with min as ${field.name})`;
    } else {
      query += `$apply=groupby((${field.name}))`;
    }
    const response = await this.dataverseClient.get(query, {
      headers: {
        prefer: "odata.include-annotations=*",
      },
    });
    const results = await response.json();
    if (field.type === "Lookup" || field.type === "User") {
      if (results.value.length === 0) {
        return [];
      }
      let idFldName = "";
      let displayNameFldName = "";
      const firstItem = results.value[0];
      for (const property in firstItem) {
        if (property.indexOf(field.relatedId) >= 0) {
          idFldName = property;
        }
        if (property.indexOf(field.expandFields[0]) >= 0) {
          displayNameFldName = property;
        }
      }
      return results.value.map((item: any) => ({
        id: item[idFldName],
        displayName: item[displayNameFldName],
      }));
    }
    return results.value.map((item: any) => ({
      id: item[field.name],
      displayName: item[
        `${field.name}@OData.Community.Display.V1.FormattedValue`
      ]
        ? item[`${field.name}@OData.Community.Display.V1.FormattedValue`]
        : item[field.name],
    }));
  };
}
