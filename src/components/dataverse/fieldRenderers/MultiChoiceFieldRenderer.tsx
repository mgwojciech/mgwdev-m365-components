import * as React from "react";
import { Dropdown, Field, Option } from "@fluentui/react-components";
import { IDataverseFormField } from "../../../model/DataverseFormField";
import { IFormFieldRenderer, IFormFieldRendererContext } from "./IFormFieldRenderer";

export class MultiChoiceFieldRenderer implements IFormFieldRenderer {
  public isRendererApplicable(field: IDataverseFormField): boolean {
    return field.attributeType === "MultiSelectPicklist";
  }
  public renderField(
    field: IDataverseFormField,
    value: unknown,
    onChange: (value: unknown) => void,
    context: IFormFieldRendererContext
  ): React.ReactElement {
    const values = Array.isArray(value) ? (value as number[]) : [];
    const selectedLabels = (field.options || [])
      .filter((o) => values.includes(o.value))
      .map((o) => o.label);
    return (
      <Field
        key={field.logicalName}
        label={field.displayName}
        required={field.isRequired}
        hint={field.description}
        className={context.className}
      >
        <Dropdown
          multiselect
          value={selectedLabels.join(", ")}
          selectedOptions={values.map(String)}
          disabled={context.disabled || field.isReadOnly}
          onOptionSelect={(_, data) => {
            onChange(data.selectedOptions.map((v) => parseInt(v, 10)).filter((v) => !isNaN(v)));
          }}
        >
          {field.options?.map((o) => (
            <Option key={o.value} value={String(o.value)}>
              {o.label}
            </Option>
          ))}
        </Dropdown>
      </Field>
    );
  }
}
