import * as React from "react";
import { DataField } from "../../model/DataField";
import { IColumnRenderer } from "./columnRenderers/IColumnRenderer";
import { useSP } from "../../context";
import { IHttpClient, IQueryField } from "mgwdev-m365-helpers";
import { SPListDataGridService } from "../../services/datagrid/SPListDataGridService";
import { DataGridSelectionMode, GenericDataGrid } from "./GenericDataGrid";
import { SPFieldFilterCombobox } from "./filterComponents/SPFieldFilterCombobox";
import { SPUserRenderer } from "./columnRenderers/SPUserRenderer";
import { DateRenderer } from "./columnRenderers/DateRenderer";

export interface ISPListDataGridProps<T> {
    listId: string;
    fieldsToRender: DataField[];
    customRenderers?: IColumnRenderer[];
    selectionMode?: DataGridSelectionMode;
    getRowId?: (item: T) => string;
    onSelectionChange?: (selectedItems: T[]) => void;
}

export function SPListDataGrid<T>(props: ISPListDataGridProps<T>){
    const {spClient, siteUrl} = useSP();

    return <SPListDataGridStandalone<T> {...props} siteUrl={siteUrl} spClient={spClient} />
}

export function SPListDataGridStandalone<T>(props: ISPListDataGridProps<T> & { spClient: IHttpClient, siteUrl: string }) {
  const renderers = React.useMemo(() => {
    let temp = [];
    temp.push(
      new SPUserRenderer(),
      new DateRenderer()
    );
    if (props.customRenderers) {
      temp.push(...props.customRenderers);
    }
    return temp;
  }, [props.customRenderers]);
    const dataGridService = React.useMemo(
        () =>
            new SPListDataGridService<T>(
                props.spClient,
                props.siteUrl,
                props.listId
            ),
        [props.spClient, props.listId, props.siteUrl]
    );
    return <GenericDataGrid<T>
          dataService={dataGridService}
          fieldsToRender={props.fieldsToRender}
          customRenderers={renderers}
          selectionMode={props.selectionMode}
          getRowId={props.getRowId}
          onSelectionChange={props.onSelectionChange}
          renderFilter={(field, onFilterSet, initialQuery) => <SPFieldFilterCombobox additionalFilters={initialQuery} onEntitySelected={(entities) => {
            if (entities) {
              const filters: IQueryField[] = entities.map(en => ({
                name: field.name,
                type: field.type,
                label: field.label,
                value: en.id,
                comparer: "Eq"
              }))
              onFilterSet({
                ...field,
                name: field.name
              }, filters)
            }
          }} listId={props.listId} column={field} getFieldSuggestions={dataGridService.getFieldSuggestions} />}
        />
}