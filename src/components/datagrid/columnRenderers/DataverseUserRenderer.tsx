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
    if (!value || typeof value !== "object") {
      return <span>-</span>;
    }
    const userValue = value as Record<string, unknown>;
    const userId = userValue["azureactivedirectoryobjectid"];
    if (!userId) {
      // Fallback to fullname if no AAD object ID
      const fullname = userValue["fullname"];
      return <span>{fullname ? String(fullname) : "-"}</span>;
    }
    return (
      <GraphPersonaStandalone
        graphClient={this.graphClient}
        id={String(userId)}
      />
    );
  }
}
