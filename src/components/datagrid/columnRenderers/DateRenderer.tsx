import * as React from "react";
import { IColumnRenderer } from "./IColumnRenderer";
import { DataField } from "../../../model/DataField";

export class DateRenderer implements IColumnRenderer {
    public isRendererApplicable(field: DataField): boolean {
        return field.type === "DateTime";
    }
    public renderField(field: DataField, value: unknown, item: unknown): React.ReactElement {
        if (!value) {
            return <span>-</span>;
        }
        const date = new Date(String(value));
        if (isNaN(date.getTime())) {
            return <span>-</span>;
        }
        return <span>{date.toLocaleDateString()}</span>;
    }
}