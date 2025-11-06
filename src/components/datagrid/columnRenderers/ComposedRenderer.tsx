import { DataField } from "../../../model/DataField";
import { DateRenderer } from "./DateRenderer";
import { IColumnRenderer } from "./IColumnRenderer";
import * as React from "react";

export class ComposedRenderer implements IColumnRenderer {
  protected renderers: IColumnRenderer[] = [
    new DateRenderer()
  ];
  public registerRenderer(renderer: IColumnRenderer) {
    this.renderers.unshift(renderer);
  }
  public isRendererApplicable(field: DataField): boolean {
    return !!this.renderers.find((r) => r.isRendererApplicable(field));
  }
  public renderField(field: DataField, value: unknown, item: unknown): React.ReactElement {
    const renderer = this.renderers.find((r) => r.isRendererApplicable(field));
    if (!renderer) {
      if(typeof value === "string"){
      return <div>{value}</div>;
      }
      return <div>{JSON.stringify(value)}</div>;
    }
    return renderer.renderField(field, value,item);
  }
}
