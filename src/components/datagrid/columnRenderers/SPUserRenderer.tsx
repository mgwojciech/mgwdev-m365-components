import * as React from "react";
import { IColumnRenderer } from "./IColumnRenderer";
import { DataField } from "../../../model/DataField";

export class SPUserRenderer implements IColumnRenderer {
    public isRendererApplicable(field: DataField): boolean {
        return field.type === "User";
    }
    public renderField(field: DataField, value: unknown, item: unknown): React.ReactElement {
        if (!value || !Array.isArray(value) || value.length === 0) {
            return <span>-</span>;
        }
        const users = value as Array<{ title?: string; email?: string }>;
        return (
            <span>
                {users.map((user, index) => (
                    <span key={index}>
                        {user.title || user.email || "Unknown"}
                        {index < users.length - 1 ? ", " : ""}
                    </span>
                ))}
            </span>
        );
    }
}