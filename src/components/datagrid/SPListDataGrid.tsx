import * as React from "react";
import { DataField } from "../../model/DataField";
import { IColumnRenderer } from "./columnRenderers/IColumnRenderer";
import { useSP } from "../../context";
import { IHttpClient, IQueryField } from "mgwdev-m365-helpers";
import { SPListDataGridService } from "../../services/datagrid/SPListDataGridService";
import { GenericDataGrid } from "./GenericDataGrid";
import { SPFieldFilterCombobox } from "./filterComponents/SPFieldFilterCombobox";
import { SPUserRenderer } from "./columnRenderers/SPUserRenderer";

export interface ISPListDataGridProps {
    listId: string;
    fieldsToRender: DataField[];
    customRenderers?: IColumnRenderer[];
}

export function SPListDataGrid<T>(props: ISPListDataGridProps){
    const {spClient, siteUrl} = useSP();

    return <SPListDataGridStandalone<T> {...props} siteUrl={siteUrl} spClient={spClient} />
}

export function SPListDataGridStandalone<T>(props: ISPListDataGridProps & { spClient: IHttpClient, siteUrl: string }) {
  const renderers = React.useMemo(() => {
    let temp = [];
    temp.push(
      new SPUserRenderer()
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
        [props.listId, props.siteUrl]
    );
    return <GenericDataGrid<T>
          dataService={dataGridService}
          fieldsToRender={props.fieldsToRender}
          customRenderers={renderers}
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