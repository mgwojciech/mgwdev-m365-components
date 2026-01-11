import * as React from "react";
import { DataField } from "../../model/DataField";
import { IColumnRenderer } from "./columnRenderers/IColumnRenderer";
import { useDataverse, useGraph } from "../../context";
import { DataverseTableDataGridService } from "../../services/datagrid/DataverseTableDataGridService";
import { DataGridSelectionMode, GenericDataGrid } from "./GenericDataGrid";
import { DataverseUserRenderer } from "./columnRenderers/DataverseUserRenderer";
import { DataverseLookupRenderer } from "./columnRenderers/DataverseLookupRenderer";
import { DateRenderer } from "./columnRenderers/DateRenderer";
import { DataverseColumnFilterCombobox } from "./filterComponents/DataverseColumnFilterCombobox";
import { IHttpClient, IQueryField } from "mgwdev-m365-helpers";

export interface IDataverseTableDataGridProps<T> {
  tableName: string;
  fieldsToRender: DataField[];
  customRenderers?: IColumnRenderer[];
  selectionMode?: DataGridSelectionMode;
  getRowId?: (item: T) => string;
  onSelectionChange?: (selectedItems: T[]) => void;
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
    [props.dataverseClient, props.dataverseEnv, props.tableName]
  );

  return (
    <GenericDataGrid<T>
      dataService={dataGridService}
      fieldsToRender={props.fieldsToRender}
      customRenderers={renderers}
      selectionMode={props.selectionMode}
      getRowId={props.getRowId}
      onSelectionChange={props.onSelectionChange}
      renderFilter={(field, onFilterSet, initialQuery) => <DataverseColumnFilterCombobox additionalFilters={initialQuery} onEntitySelected={(entities) => {
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
      }} table={props.tableName} column={field} getFieldSuggestions={dataGridService.getFieldSuggestions} />}
    />
  );
}
