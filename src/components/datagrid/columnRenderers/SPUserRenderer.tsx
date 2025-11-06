import * as React from "react";
import { IColumnRenderer } from "./IColumnRenderer";
import { DataField } from "../../../model/DataField";

export class SPUserRenderer implements IColumnRenderer{
    public isRendererApplicable(field: DataField): boolean {
        return field.type === "User"
    }
    public renderField(field: DataField, value: unknown, item: unknown): React.ReactElement {
        if(value[0]){
            return <div>{value[0].title}</div>
        }
    }
}