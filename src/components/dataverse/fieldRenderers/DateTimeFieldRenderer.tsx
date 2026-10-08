import * as React from "react";
import { Field, Input } from "@fluentui/react-components";
import { IDataverseFormField } from "../../../model/DataverseFormField";
import { IFormFieldRenderer, IFormFieldRendererContext } from "./IFormFieldRenderer";

const pad = (n: number) => String(n).padStart(2, "0");

const toInputValue = (value: unknown): string => {
  if (!value) {
    return "";
  }
  const date = value instanceof Date ? value : new Date(value as string);
  if (isNaN(date.getTime())) {
    return "";
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export class DateTimeFieldRenderer implements IFormFieldRenderer {
  public isRendererApplicable(field: IDataverseFormField): boolean {
    return field.attributeType === "DateTime";
  }
  public renderField(
    field: IDataverseFormField,
    value: unknown,
    onChange: (value: unknown) => void,
    context: IFormFieldRendererContext
  ): React.ReactElement {
    return (
      <Field
        key={field.logicalName}
        label={field.displayName}
        required={field.isRequired}
        hint={field.description}
        className={context.className}
      >
        <Input
          type="date"
          value={toInputValue(value)}
          disabled={context.disabled || field.isReadOnly}
          onChange={(_, data) => onChange(data.value ? new Date(data.value).toISOString() : undefined)}
        />
      </Field>
    );
  }
}
