import * as React from "react";
import { Dropdown, Field, Option } from "@fluentui/react-components";
import { IDataverseFormField } from "../../../model/DataverseFormField";
import { IFormFieldRenderer, IFormFieldRendererContext } from "./IFormFieldRenderer";

const CHOICE_TYPES = new Set(["Picklist", "State", "Status"]);

export class ChoiceFieldRenderer implements IFormFieldRenderer {
  public isRendererApplicable(field: IDataverseFormField): boolean {
    return CHOICE_TYPES.has(field.attributeType);
  }
  public renderField(
    field: IDataverseFormField,
    value: unknown,
    onChange: (value: unknown) => void,
    context: IFormFieldRendererContext
  ): React.ReactElement {
    const selectedOption = field.options?.find((o) => o.value === value);
    return (
      <Field
        key={field.logicalName}
        label={field.displayName}
        required={field.isRequired}
        hint={field.description}
        className={context.className}
      >
        <Dropdown
          value={selectedOption?.label || ""}
          selectedOptions={selectedOption ? [String(selectedOption.value)] : []}
          disabled={context.disabled || field.isReadOnly}
          onOptionSelect={(_, data) => {
            const option = field.options?.find((o) => String(o.value) === data.optionValue);
            onChange(option?.value);
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
