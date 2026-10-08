import { IHttpClient } from "mgwdev-m365-helpers";

const ODATA_VERSION = "v9.2";
const JSON_HEADERS = {
  "OData-MaxVersion": "4.0",
  "OData-Version": "4.0",
  Accept: "application/json",
  "Content-Type": "application/json",
};

export class DataverseRecordService {
  constructor(
    protected dataverseClient: IHttpClient,
    protected dataverseEnv: string,
    protected entitySetName: string
  ) { }

  public async getRecord(id: string, select?: string, expand?: string): Promise<Record<string, unknown>> {
    let url = `${this.dataverseEnv}/api/data/${ODATA_VERSION}/${this.entitySetName}(${id})?`;
    const params: string[] = [];
    if (select) {
      params.push(`$select=${select}`);
    }
    if (expand) {
      params.push(`$expand=${expand}`);
    }
    url += params.join("&");
    const response = await this.dataverseClient.get(url, {
      headers: { ...JSON_HEADERS, prefer: "odata.include-annotations=*" },
    });
    if (!response.ok) {
      throw new Error(`Failed to load record ${id} from ${this.entitySetName}`);
    }
    return response.json();
  }

  public async createRecord(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await this.dataverseClient.post(
      `${this.dataverseEnv}/api/data/${ODATA_VERSION}/${this.entitySetName}`,
      {
        headers: { ...JSON_HEADERS, Prefer: "return=representation" },
        body: JSON.stringify(payload),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to create ${this.entitySetName} record`);
    }
    return response.json();
  }

  public async updateRecord(id: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await this.dataverseClient.patch(
      `${this.dataverseEnv}/api/data/${ODATA_VERSION}/${this.entitySetName}(${id})`,
      {
        headers: { ...JSON_HEADERS, Prefer: "return=representation" },
        body: JSON.stringify(payload),
      }
    );
    if (!response.ok) {
      throw new Error(`Failed to update ${this.entitySetName} record ${id}`);
    }
    return response.json();
  }
}
