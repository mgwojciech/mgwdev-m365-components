import { DataField } from "../../../model/DataField";
import { IColumnRenderer } from "./IColumnRenderer";
import * as React from "react";

export class DataverseLookupRenderer implements IColumnRenderer {
  public isRendererApplicable(field: DataField): boolean {
    return field.type === "Lookup";
  }
  public renderField(field: DataField, value: unknown, item: unknown): React.ReactElement {
    if (!value || typeof value !== "object") {
      return <span>-</span>;
    }
    const lookupValue = value as Record<string, unknown>;
    if (field.expandFields && field.expandFields[0]) {
      const displayValue = lookupValue[field.expandFields[0]];
      return <span>{displayValue != null ? String(displayValue) : "-"}</span>;
    }
    return <span>{JSON.stringify(value)}</span>;
  }
}
