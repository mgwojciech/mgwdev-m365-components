import * as React from "react";
import { Field, Input, Textarea } from "@fluentui/react-components";
import { IDataverseFormField } from "../../../model/DataverseFormField";
import { IFormFieldRenderer, IFormFieldRendererContext } from "./IFormFieldRenderer";

export class TextFieldRenderer implements IFormFieldRenderer {
  public isRendererApplicable(field: IDataverseFormField): boolean {
    return field.attributeType === "String" || field.attributeType === "Memo";
  }
  public renderField(
    field: IDataverseFormField,
    value: unknown,
    onChange: (value: unknown) => void,
    context: IFormFieldRendererContext
  ): React.ReactElement {
    const disabled = context.disabled || field.isReadOnly;
    return (
      <Field
        key={field.logicalName}
        label={field.displayName}
        required={field.isRequired}
        hint={field.description}
        className={context.className}
      >
        {field.attributeType === "Memo" ? (
          <Textarea
            value={(value as string) || ""}
            disabled={disabled}
            maxLength={field.maxLength}
            onChange={(_, data) => onChange(data.value)}
          />
        ) : (
          <Input
            value={(value as string) || ""}
            disabled={disabled}
            maxLength={field.maxLength}
            onChange={(_, data) => onChange(data.value)}
          />
        )}
      </Field>
    );
  }
}
