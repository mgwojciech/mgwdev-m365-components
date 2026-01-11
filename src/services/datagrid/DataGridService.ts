import { IQueryField } from "mgwdev-m365-helpers";
import { DataField } from "../../model/DataField";
import { IEntityWithIdAndDisplayName } from "../../model/IEntityWithIdAndDisplayName";

export interface IDataGridService<T> {
  setFields(fields: DataField[]);
  getData(
    queryFields?: IQueryField[],
    orderBy?: string,
    orderDir?: "ASC" | "DESC"
  ): Promise<T[]>;
  getNextPage(): Promise<T[]>;
  isNextPageAvailable(): boolean;
  getPreviousPage(): Promise<T[]>;
  isPreviousPageAvailable(): boolean;
  getFieldSuggestions(field: DataField, existingFilters?: IQueryField[]): Promise<IEntityWithIdAndDisplayName[]>;
}
