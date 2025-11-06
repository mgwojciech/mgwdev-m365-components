import { DataField } from "../../../model/DataField";

export interface IColumnRenderer {
  isRendererApplicable(field: DataField): boolean;
  renderField(field: DataField, value: unknown, item: unknown): React.ReactElement;
}
