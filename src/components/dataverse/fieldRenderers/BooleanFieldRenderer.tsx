import * as React from "react";
import { Field, Switch } from "@fluentui/react-components";
import { IDataverseFormField } from "../../../model/DataverseFormField";
import { IFormFieldRenderer, IFormFieldRendererContext } from "./IFormFieldRenderer";

export class BooleanFieldRenderer implements IFormFieldRenderer {
  public isRendererApplicable(field: IDataverseFormField): boolean {
    return field.attributeType === "Boolean";
  }
  public renderField(
    field: IDataverseFormField,
    value: unknown,
    onChange: (value: unknown) => void,
    context: IFormFieldRendererContext
  ): React.ReactElement {
    const trueLabel = field.options?.find((o) => o.value === 1)?.label || "Yes";
    const falseLabel = field.options?.find((o) => o.value === 0)?.label || "No";
    return (
      <Field
        key={field.logicalName}
        label={field.displayName}
        hint={field.description}
        className={context.className}
      >
        <Switch
          checked={!!value}
          disabled={context.disabled || field.isReadOnly}
          label={value ? trueLabel : falseLabel}
          onChange={(_, data) => onChange(data.checked)}
        />
      </Field>
    );
  }
}
