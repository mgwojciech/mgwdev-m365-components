import { IDataverseFormField } from "../../../model/DataverseFormField";

export interface IFormFieldRendererContext {
  disabled?: boolean;
  className?: string;
}

export interface IFormFieldRenderer {
  isRendererApplicable(field: IDataverseFormField): boolean;
  renderField(
    field: IDataverseFormField,
    value: unknown,
    onChange: (value: unknown) => void,
    context: IFormFieldRendererContext
  ): React.ReactElement;
}
