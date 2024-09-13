import { vi, describe, test, expect } from "vitest";
import { ThumbnailUtils } from "./../../src/utils";


function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
    }
    return buf;
}
describe("ThumbnailUtils", () => {
    test("should return a valid thumbnail url", () => {
        const item = {
            identitySiteCollectionId: "siteCollectionId",
            identityWebId: "webId",
            identityListId: "listId",
            listItemId: "itemId"
        };
        const url = ThumbnailUtils.getThumbnailUrl(item as any, "small");
        expect(url).toBe("https://graph.microsoft.com/v1.0/sites/siteCollectionId/sites/webId/lists/listId/items/itemId/microsoft.graph.listitem/driveItem/thumbnails/0/small/content");
    });
    test("should return a valid thumbnail image from graph api call", async () => {
        const graphClient = {
            get: async (url: string) => {
                return {
                    headers: {
                        "content-type": "image/png"
                    },
                    arrayBuffer: ()=>Promise.resolve(str2ab("base64string"))
                };
            }
        } as any;
        const url = "https://graph.microsoft.com/v1.0/sites/siteCollectionId/sites/webId/lists/listId/items/itemId/microsoft.graph.listitem/driveItem/thumbnails/0/small/content";
        const base64stringImage = await ThumbnailUtils.getThumbnailImageFromGraphApiCall(graphClient, url);
        expect(base64stringImage).toBe("data:image/jpeg;base64,YgBhAHMAZQA2ADQAcwB0AHIAaQBuAGcA");
    });
    test("should return a valid thumbnail image from graph (response in application/json)", async () => {
        const graphClient = {
            get: async (url: string) => {
                return {
                    headers: {
                        "content-type": "application/json"
                    },
                    text: ()=>Promise.resolve("base64string")
                };
            }
        } as any;
        const item = {
            identitySiteCollectionId: "siteCollectionId",
            identityWebId: "webId",
            identityListId: "listId",
            listItemId: "itemId"
        };
        const base64stringImage = await ThumbnailUtils.getThumbnailImageFromGraph(item as any, graphClient, "small");
        expect(base64stringImage).toBe("data:image/png;base64,base64string");
    });
    test("should return a valid thumbnail image from graph (response in 302)", async () => {
        const graphClient = {
            get: async (url: string) => {
                return {
                    status: 302,
                    headers: {
                        "Location": "https://test.com/images/image.png"
                    }
                };
            }
        } as any;
        const item = {
            identitySiteCollectionId: "siteCollectionId",
            identityWebId: "webId",
            identityListId: "listId",
            listItemId: "itemId"
        };
        const base64stringImage = await ThumbnailUtils.getThumbnailImageFromGraph(item as any, graphClient, "small");
        expect(base64stringImage).toBe("https://test.com/images/image.png");
    });
    test("should return a valid thumbnail image from graph (response in 404)", async () => {
        const graphClient = {
            get: async (url: string) => {
                return {
                    headers:{
                        "content-type": "application/text"
                    },
                    status: 404
                };
            }
        } as any;
        const item = {
            identitySiteCollectionId: "siteCollectionId",
            identityWebId: "webId",
            identityListId: "listId",
            listItemId: "itemId"
        };
        const base64stringImage = await ThumbnailUtils.getThumbnailImageFromGraph(item as any, graphClient, "small");
        expect(base64stringImage).toBe("");
    });
});
