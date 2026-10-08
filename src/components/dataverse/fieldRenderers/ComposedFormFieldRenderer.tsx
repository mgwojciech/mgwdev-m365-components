import * as React from "react";
import { IHttpClient } from "mgwdev-m365-helpers";
import { IDataverseFormField } from "../../../model/DataverseFormField";
import { IFormFieldRenderer, IFormFieldRendererContext } from "./IFormFieldRenderer";
import { TextFieldRenderer } from "./TextFieldRenderer";
import { NumberFieldRenderer } from "./NumberFieldRenderer";
import { BooleanFieldRenderer } from "./BooleanFieldRenderer";
import { DateTimeFieldRenderer } from "./DateTimeFieldRenderer";
import { ChoiceFieldRenderer } from "./ChoiceFieldRenderer";
import { MultiChoiceFieldRenderer } from "./MultiChoiceFieldRenderer";
import { LookupFieldRenderer } from "./LookupFieldRenderer";

export class ComposedFormFieldRenderer implements IFormFieldRenderer {
  protected renderers: IFormFieldRenderer[];
  constructor(dataverseClient: IHttpClient, dataverseEnv: string) {
    this.renderers = [
      new LookupFieldRenderer(dataverseClient, dataverseEnv),
      new MultiChoiceFieldRenderer(),
      new ChoiceFieldRenderer(),
      new BooleanFieldRenderer(),
      new DateTimeFieldRenderer(),
      new NumberFieldRenderer(),
      new TextFieldRenderer(),
    ];
  }
  public registerRenderer(renderer: IFormFieldRenderer) {
    this.renderers.unshift(renderer);
  }
  public isRendererApplicable(field: IDataverseFormField): boolean {
    return !!this.renderers.find((r) => r.isRendererApplicable(field));
  }
  public renderField(
    field: IDataverseFormField,
    value: unknown,
    onChange: (value: unknown) => void,
    context: IFormFieldRendererContext
  ): React.ReactElement {
    const renderer = this.renderers.find((r) => r.isRendererApplicable(field));
    if (!renderer) {
      return <div key={field.logicalName}>{field.displayName}: unsupported field type ({field.attributeType})</div>;
    }
    return renderer.renderField(field, value, onChange, context);
  }
}
