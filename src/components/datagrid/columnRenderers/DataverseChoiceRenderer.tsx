import React from "react";
import { DataField } from "../../../model/DataField";
import { IColumnRenderer } from "./IColumnRenderer";

export class DataverseChoiceRenderer implements IColumnRenderer {
    public isRendererApplicable(field: DataField): boolean {
        return field.type === "Choice";
    }
    public renderField(field: DataField, value: unknown, item: unknown): React.ReactElement {
        if (!value) {
            return <span>-</span>;
        }
        return <span>{item[field.name + "@OData.Community.Display.V1.FormattedValue"]}</span>;
    }
}