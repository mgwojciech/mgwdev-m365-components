//@vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { DataverseTableDataGridService } from '../../../src/services/datagrid/DataverseTableDataGridService';

describe("DataverseTableDataGridService", () => {
    const dataverseEnv = "https://test.crm.dynamics.com";
    const tableName = "accounts";

    let mockDataverseClient: any;
    let service: DataverseTableDataGridService<any>;

    beforeEach(() => {
        mockDataverseClient = {
            get: vi.fn(),
            post: vi.fn()
        };
        service = new DataverseTableDataGridService(mockDataverseClient, dataverseEnv, tableName);
    });

    test("should set fields correctly for simple fields", () => {
        const fields = [
            { name: "name", type: "Text" as const },
            { name: "revenue", type: "Number" as const }
        ];

        service.setFields(fields);

        expect(service["dataProvider"].selectQuery).toBe("name,revenue");
    });

    test("should set expand query for lookup fields", () => {
        const fields = [
            { name: "name", type: "Text" as const },
            { 
                name: "primarycontactid", 
                type: "Lookup" as const, 
                expandFields: ["fullname", "contactid"],
                relatedId: "contactid"
            }
        ];

        service.setFields(fields);

        expect(service["dataProvider"].selectQuery).toBe("name");
        expect(service["dataProvider"].expandQuery).toBe("primarycontactid($select=fullname,contactid)");
    });

    test("should set expand query for user fields", () => {
        const fields = [
            { name: "name", type: "Text" as const },
            { 
                name: "ownerid", 
                type: "User" as const, 
                expandFields: ["fullname", "systemuserid"],
                relatedId: "systemuserid"
            }
        ];

        service.setFields(fields);

        expect(service["dataProvider"].expandQuery).toBe("ownerid($select=fullname,systemuserid)");
    });

    test("should call getData and return results", async () => {
        const mockData = [
            { name: "Account 1", accountid: "1" },
            { name: "Account 2", accountid: "2" }
        ];

        service["dataProvider"].getData = vi.fn().mockResolvedValue(mockData);

        const result = await service.getData();

        expect(result).toEqual(mockData);
    });

    test("should handle ordering for simple fields", async () => {
        service["dataProvider"].getData = vi.fn().mockResolvedValue([]);
        service["dataProvider"].setOrder = vi.fn();
        service.setFields([{ name: "name", type: "Text" as const }]);

        await service.getData([], "name", "DESC");

        expect(service["dataProvider"].setOrder).toHaveBeenCalledWith("name", "DESC");
    });

    test("should handle ordering for lookup fields", async () => {
        const fields = [
            { 
                name: "primarycontactid", 
                type: "Lookup" as const, 
                expandFields: ["fullname", "contactid"],
                relatedId: "contactid"
            }
        ];
        service.setFields(fields);
        service["dataProvider"].getData = vi.fn().mockResolvedValue([]);
        service["dataProvider"].setOrder = vi.fn();

        await service.getData([], "primarycontactid", "ASC");

        expect(service["dataProvider"].setOrder).toHaveBeenCalledWith("primarycontactid/contactid", "ASC");
    });

    test("should return pagination availability", () => {
        service["dataProvider"].isNextPageAvailable = vi.fn().mockReturnValue(true);
        service["dataProvider"].isPreviousPageAvailable = vi.fn().mockReturnValue(false);

        expect(service.isNextPageAvailable()).toBe(true);
        expect(service.isPreviousPageAvailable()).toBe(false);
    });

    test("should get field suggestions for text fields", async () => {
        const mockResponse = {
            json: vi.fn().mockResolvedValue({
                value: [
                    { name: "Account 1" },
                    { name: "Account 2" }
                ]
            })
        };
        mockDataverseClient.get.mockResolvedValue(mockResponse);

        const field = { name: "name", type: "Text" as const };
        const result = await service.getFieldSuggestions(field);

        expect(mockDataverseClient.get).toHaveBeenCalledWith(
            expect.stringContaining("$apply=groupby((name))"),
            expect.any(Object)
        );
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ id: "Account 1", displayName: "Account 1" });
    });

    test("should get field suggestions for User fields from systemusers", async () => {
        const mockResponse = {
            json: vi.fn().mockResolvedValue({
                value: [
                    { fullname: "User 1", systemuserid: "user-1" },
                    { fullname: "User 2", systemuserid: "user-2" }
                ]
            })
        };
        mockDataverseClient.get.mockResolvedValue(mockResponse);

        const field = { 
            name: "ownerid", 
            type: "User" as const, 
            expandFields: ["fullname", "systemuserid"],
            relatedId: "systemuserid"
        };
        const result = await service.getFieldSuggestions(field);

        expect(mockDataverseClient.get).toHaveBeenCalledWith(
            expect.stringContaining("systemusers"),
            expect.any(Object)
        );
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ id: "user-1", displayName: "User 1" });
    });

    test("should get field suggestions for Lookup fields", async () => {
        const mockResponse = {
            json: vi.fn().mockResolvedValue({
                value: [
                    { "primarycontactid/contactid": "contact-1", "primarycontactid/fullname": "Contact 1" },
                    { "primarycontactid/contactid": "contact-2", "primarycontactid/fullname": "Contact 2" }
                ]
            })
        };
        mockDataverseClient.get.mockResolvedValue(mockResponse);

        const field = { 
            name: "primarycontactid", 
            type: "Lookup" as const, 
            expandFields: ["fullname", "contactid"],
            relatedId: "contactid"
        };
        const result = await service.getFieldSuggestions(field);

        expect(mockDataverseClient.get).toHaveBeenCalledWith(
            expect.stringContaining("$apply=groupby((primarycontactid/contactid,primarycontactid/fullname))"),
            expect.any(Object)
        );
        expect(result).toHaveLength(2);
    });
});
