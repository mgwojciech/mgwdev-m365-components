import { IHttpClient } from "mgwdev-m365-helpers";
import { IDocumentSearchResult } from "../model";

export class ThumbnailUtils {
    public static readonly getThumbnailUrl: (item: IDocumentSearchResult, size: "small" | "medium" | "large") => string = (item: IDocumentSearchResult, size: "small" | "medium" | "large" = "medium") => {
        return `https://graph.microsoft.com/v1.0/sites/${item.identitySiteCollectionId}/sites/${item.identityWebId}/lists/${item.identityListId}/items/${item.listItemId}/microsoft.graph.listitem/driveItem/thumbnails/0/${size}/content`
    }
    public static readonly getThumbnailImageFromGraphApiCall = async (graphClient: IHttpClient, graphApiUrl: string) => {
        const response = await graphClient.get(graphApiUrl,
            // {headers:{prefer:"noredirect"}}
        );
        if (response.headers["content-type"] === "application/json") {
            const binaryData = await response.text()

            return "data:image/png;base64," + binaryData.replace("\"", "").replace("\"", "");
        }
        if (response.status === 302) {
            return response.headers["Location"];
        }
        if (response.status === 404) {
            return "";
        }
        //@ts-expect-error - array buffer may not exists in abstract object but in general it will be there
        const binaryData = await response.arrayBuffer()
        const base64String = Buffer.from(
            new Uint8Array(binaryData)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
        ).toString('base64');

        return `data:image/jpeg;base64,${base64String}`;
    }
    public static readonly getThumbnailImageFromGraph = async (item: IDocumentSearchResult, graphClient: IHttpClient, size: "small" | "medium" | "large" = "medium") => {
        const url = this.getThumbnailUrl(item, size);
        const base64stringImage = await this.getThumbnailImageFromGraphApiCall(graphClient, url);
        return base64stringImage;
    }
}