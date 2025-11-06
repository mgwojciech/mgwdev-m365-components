import { IQueryFieldType } from "mgwdev-m365-helpers";

export type DataField = {
  name: string;
  label?: string;
  type?: IQueryFieldType;
  expandFields?: string[];
  relatedId?: string;
  disableSorting?: boolean
};
