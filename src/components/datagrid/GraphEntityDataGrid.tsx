import * as React from "react";
import { DataField } from "../../model/DataField";
import { IColumnRenderer } from "./columnRenderers/IColumnRenderer";
import { useGraph } from "../../context";
import { GenericDataGrid } from "./GenericDataGrid";
import { GraphEntityDataGridService } from "../../services/datagrid/GraphEntityDataGridService";

export interface IGraphEntityDataGridProps<T> {
  entityEndpoint: string;
  fieldsToRender: DataField[];
  customRenderers?: IColumnRenderer[];
}

export function GraphEntityDataGrid<T>(props: IGraphEntityDataGridProps<T>) {
  const { graphClient } = useGraph();
  const renderers = React.useMemo(() => {
    let temp = [];
    if (props.customRenderers) {
      temp.push(...props.customRenderers);
    }
    return temp;
  }, [props.customRenderers]);
  const dataGridService = React.useMemo(
    () =>
      new GraphEntityDataGridService<T>(
        graphClient,
        props.entityEndpoint
      ),
    [props.entityEndpoint]
  );

  return (
    <GenericDataGrid<T>
      dataService={dataGridService}
      fieldsToRender={props.fieldsToRender}
      customRenderers={renderers}
    />
  );
}
