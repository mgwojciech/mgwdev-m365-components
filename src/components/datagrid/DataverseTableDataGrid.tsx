import * as React from "react";
import { DataField } from "../../model/DataField";
import { IColumnRenderer } from "./columnRenderers/IColumnRenderer";
import { useDataverse, useGraph } from "../../context";
import { DataverseTableDataGridService, IQueryFieldWithJoinBy } from "../../services/datagrid/DataverseTableDataGridService";
import { DataGridSelectionMode, GenericDataGrid } from "./GenericDataGrid";
import { DataverseUserRenderer } from "./columnRenderers/DataverseUserRenderer";
import { DataverseLookupRenderer } from "./columnRenderers/DataverseLookupRenderer";
import { DateRenderer } from "./columnRenderers/DateRenderer";
import { DataverseColumnFilterCombobox } from "./filterComponents/DataverseColumnFilterCombobox";
import { IHttpClient, IQueryField } from "mgwdev-m365-helpers";
import { DataverseChoiceRenderer } from "./columnRenderers/DataverseChoiceRenderer";

export interface IDataverseTableDataGridProps<T> {
  tableName: string;
  fieldsToRender: DataField[];
  customRenderers?: IColumnRenderer[];
  selectionMode?: DataGridSelectionMode;
  systemFilter?: IQueryFieldWithJoinBy[];
  filterComponents?: {
    fieldName: string;
    filterComponent: (field: DataField, onFilterSet: (field: DataField, queryFields: IQueryFieldWithJoinBy[]) => void, initialQueryFields?: IQueryFieldWithJoinBy[]) => React.ReactElement;
  }[];
  getRowId?: (item: T) => string;
  onSelectionChange?: (selectedItems: T[]) => void;
  onDataFetched?: (items: T[], count: number) => void;
}

export function DataverseTableGrid<T>(props: IDataverseTableDataGridProps<T>) {
  const { dataverseClient, dataverseResource } = useDataverse();
  const { graphClient } = useGraph();

  const renderers = React.useMemo(() => {
    const temp: IColumnRenderer[] = [
      new DataverseUserRenderer(graphClient),
    ];
    if (props.customRenderers) {
      temp.push(...props.customRenderers);
    }
    return temp;
  }, [graphClient, props.customRenderers]);

  return (
    <DataverseTableGridStandalone
      {...props}
      dataverseClient={dataverseClient}
      dataverseEnv={dataverseResource}
      customRenderers={renderers}
    />
  );
}


export function DataverseTableGridStandalone<T>(props: IDataverseTableDataGridProps<T> & {
  dataverseClient: IHttpClient,
  dataverseEnv: string
}) {
  const renderers = React.useMemo(() => {
    let temp: IColumnRenderer[] = [
      new DataverseLookupRenderer(),
      new DateRenderer(),
      new DataverseChoiceRenderer(),
    ];
    if (props.customRenderers) {
      temp.push(...props.customRenderers);
    }
    return temp;
  }, [props.customRenderers]);
  const dataGridService = React.useMemo(
    () =>
      new DataverseTableDataGridService<T>(
        props.dataverseClient,
        props.dataverseEnv,
        props.tableName
      ),
    [props.dataverseEnv, props.tableName]
  );

  return (
    <GenericDataGrid<T>
      dataService={dataGridService}
      fieldsToRender={props.fieldsToRender}
      customRenderers={renderers}
      selectionMode={props.selectionMode}
      systemFilter={props.systemFilter}
      getRowId={props.getRowId}
      onSelectionChange={props.onSelectionChange}
      onDataFetched={props.onDataFetched}
      renderFilter={(field, onFilterSet, initialQuery) => {
        if(props.filterComponents && props.filterComponents.find(fc => fc.fieldName === field.name)){
          return props.filterComponents.find(fc => fc.fieldName === field.name)!.filterComponent(field, onFilterSet, initialQuery);
        }
        return <DataverseColumnFilterCombobox additionalFilters={initialQuery} onEntitySelected={(entities) => {
          if (entities) {
            const filters: IQueryField[] = entities.map(en => ({
              name: (field.type == "Lookup" || field.type == "User") ? `${field.name}/${field.relatedId}` : field.name,
              type: field.type,
              label: field.label,
              value: en.id,
              comparer: "Eq"
            }))
            onFilterSet({
              ...field,
              name: (field.type == "Lookup" || field.type == "User") ? `${field.name}/${field.relatedId}` : field.name
            }, filters)
          }
        }} table={props.tableName} column={field} getFieldSuggestions={(fld, existingFields) => dataGridService.getFieldSuggestions(fld, props.systemFilter)} />
      }}
    />
  );
}
