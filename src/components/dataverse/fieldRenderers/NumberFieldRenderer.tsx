import * as React from "react";
import { Field, SpinButton } from "@fluentui/react-components";
import { IDataverseFormField } from "../../../model/DataverseFormField";
import { IFormFieldRenderer, IFormFieldRendererContext } from "./IFormFieldRenderer";

const NUMERIC_TYPES = new Set(["Integer", "BigInt", "Decimal", "Double", "Money"]);

export class NumberFieldRenderer implements IFormFieldRenderer {
  public isRendererApplicable(field: IDataverseFormField): boolean {
    return NUMERIC_TYPES.has(field.attributeType);
  }
  public renderField(
    field: IDataverseFormField,
    value: unknown,
    onChange: (value: unknown) => void,
    context: IFormFieldRendererContext
  ): React.ReactElement {
    const isWholeNumber = field.attributeType === "Integer" || field.attributeType === "BigInt";
    const numericValue = typeof value === "number" ? value : undefined;
    return (
      <Field
        key={field.logicalName}
        label={field.displayName}
        required={field.isRequired}
        hint={field.description}
        className={context.className}
      >
        <SpinButton
          value={numericValue}
          displayValue={numericValue !== undefined ? String(numericValue) : ""}
          min={field.minValue}
          max={field.maxValue}
          step={isWholeNumber ? 1 : 0.01}
          disabled={context.disabled || field.isReadOnly}
          onChange={(_, data) => {
            if (data.value !== undefined && data.value !== null) {
              onChange(data.value);
            } else if (data.displayValue) {
              const parsed = parseFloat(data.displayValue);
              onChange(isNaN(parsed) ? undefined : parsed);
            } else {
              onChange(undefined);
            }
          }}
        />
      </Field>
    );
  }
}
