import { IHttpClient } from "mgwdev-m365-helpers";
import { DataField } from "../../../model/DataField";
import { IColumnRenderer } from "./IColumnRenderer";
import { GraphPersonaStandalone } from "../../common/GraphPersona";
import * as React from "react";

export class DataverseUserRenderer implements IColumnRenderer {
  constructor(protected graphClient: IHttpClient) {}
  public isRendererApplicable(field: DataField): boolean {
    return field.type === "User";
  }
  public renderField(field: DataField, value: unknown, item: unknown): React.ReactElement {
    return (
      <GraphPersonaStandalone
        graphClient={this.graphClient}
        id={value["azureactivedirectoryobjectid"]}
      />
    );
  }
}
