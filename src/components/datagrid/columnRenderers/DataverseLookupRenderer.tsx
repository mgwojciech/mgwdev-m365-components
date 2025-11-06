import { DataField } from "../../../model/DataField";
import { IColumnRenderer } from "./IColumnRenderer";
import * as React from "react";

export class DataverseLookupRenderer implements IColumnRenderer {
  public isRendererApplicable(field: DataField): boolean {
    return field.type === "Lookup";
  }
  public renderField(field: DataField, value: unknown, item: unknown): React.ReactElement {
    let tempValue = JSON.stringify(value);
    if (field.expandFields && field.expandFields[0]) {
      tempValue = value[field.expandFields[0]];
    }
    return <span>{tempValue}</span>;
  }
}
