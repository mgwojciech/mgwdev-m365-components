import * as React from "react";
import { IEntityWithIdAndDisplayName } from "../../../model/IEntityWithIdAndDisplayName";
import {
  AbstractGraphEntityPicker,
  IAbstractGraphEntityPickerProps,
} from "../../common/graphEntityPicker/AbstractGraphEntityPicker";
import { IHttpClient, IQueryField } from "mgwdev-m365-helpers";
import { DataField } from "../../../model/DataField";

export interface DataverseColumnFilterComboboxProps
  extends Partial<IAbstractGraphEntityPickerProps<IEntityWithIdAndDisplayName>> {
  column: DataField;
  table: string;
  getFieldSuggestions: (
    field: DataField,
    existingFilters?: IQueryField[]
  ) => Promise<IEntityWithIdAndDisplayName[]>;
  additionalFilters?: IQueryField[];
}

export function DataverseColumnFilterCombobox(props: DataverseColumnFilterComboboxProps) {
  const getColumnValues = async (searchText?: string) => {
    const filters = [];
    if (props.additionalFilters) {
      filters.push(...props.additionalFilters);
    }
    if (searchText) {
      filters.push({
        name: props.column.type === "Lookup" ? `${props.column.name}/${props.column.expandFields[0]}` : props.column.name,
        type: props.column.type,
        value: searchText,
        comparer: "Contains",
      });
    }
    return props.getFieldSuggestions(props.column, filters);
  };

  return (
    <AbstractGraphEntityPicker<IEntityWithIdAndDisplayName>
      additionalKey={`${props.table}-${props.column.name}`}
      {...props}
      onDataRequested={getColumnValues}
    />
  );
}
