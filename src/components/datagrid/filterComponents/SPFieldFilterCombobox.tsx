import { IQueryField } from "mgwdev-m365-helpers";
import * as React from "react";
import { DataField } from "../../../model/DataField";
import { IEntityWithIdAndDisplayName } from "../../../model/IEntityWithIdAndDisplayName";
import { AbstractGraphEntityPicker, IAbstractGraphEntityPickerProps } from "../../common";

export interface ISPFieldFilterComboboxProps
    extends Partial<IAbstractGraphEntityPickerProps<IEntityWithIdAndDisplayName>> {
    column: DataField;
    listId: string;
    getFieldSuggestions: (
        field: DataField,
        existingFilters?: IQueryField[]
    ) => Promise<IEntityWithIdAndDisplayName[]>;
    additionalFilters?: IQueryField[];
}

export function SPFieldFilterCombobox(props: ISPFieldFilterComboboxProps) {
    const getColumnValues = async (searchText?: string) => {
        const filters = [];
        if (props.additionalFilters) {
            filters.push(...props.additionalFilters);
        }
        if (searchText) {
            filters.push({
                name: props.column.name,
                type: props.column.type,
                value: searchText,
                comparer: "Contains",
            });
        }
        return props.getFieldSuggestions(props.column, filters);
    };

    return (
        <AbstractGraphEntityPicker<IEntityWithIdAndDisplayName>
            additionalKey={`${props.listId}-${props.column.name}`}
            {...props}
            onDataRequested={getColumnValues}
        />
    );
}