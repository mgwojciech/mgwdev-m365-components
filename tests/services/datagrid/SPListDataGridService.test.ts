//@vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { SPListDataGridService } from '../../../src/services/datagrid/SPListDataGridService';

describe("SPListDataGridService", () => {
    const siteUrl = "https://test.sharepoint.com/sites/test";
    const listId = "test-list-id";

    let mockSpClient: any;
    let service: SPListDataGridService<any>;

    beforeEach(() => {
        mockSpClient = {
            get: vi.fn(),
            post: vi.fn()
        };
        service = new SPListDataGridService(mockSpClient, siteUrl, listId);
    });

    test("should set fields correctly", () => {
        const fields = [
            { name: "Title", type: "Text" as const },
            { name: "Created", type: "DateTime" as const }
        ];

        service.setFields(fields);

        // The service should store fields for later use
        expect(service["dataProvider"].selectedFields).toEqual(["Title", "Created"]);
    });

    test("should call getData and return results", async () => {
        const mockData = [
            { Title: "Item 1", ID: 1 },
            { Title: "Item 2", ID: 2 }
        ];

        // Mock the internal dataProvider's getData method
        service["dataProvider"].getData = vi.fn().mockResolvedValue(mockData);

        const fields = [{ name: "Title", type: "Text" as const }];
        service.setFields(fields);

        const result = await service.getData();

        expect(result).toEqual(mockData);
    });

    test("should handle ordering", async () => {
        const mockData = [{ Title: "Item 1", ID: 1 }];
        service["dataProvider"].getData = vi.fn().mockResolvedValue(mockData);
        service["dataProvider"].setOrder = vi.fn();

        await service.getData([], "Title", "ASC");

        expect(service["dataProvider"].setOrder).toHaveBeenCalledWith("Title", "ASC");
    });

    test("should return pagination availability", () => {
        service["dataProvider"].isNextPageAvailable = vi.fn().mockReturnValue(true);
        service["dataProvider"].isPreviousPageAvailable = vi.fn().mockReturnValue(false);

        expect(service.isNextPageAvailable()).toBe(true);
        expect(service.isPreviousPageAvailable()).toBe(false);
    });

    test("should get field suggestions", async () => {
        const mockResponse = {
            text: vi.fn().mockResolvedValue(`<SELECT>
                <OPTION Value="value1">Display 1</OPTION>
                <OPTION Value="value2">Display 2</OPTION>
                </SELECT>
            `)
        };
        mockSpClient.post.mockResolvedValue(mockResponse);

        const field = { name: "Status", type: "Choice" as const };
        const result = await service.getFieldSuggestions(field);

        expect(mockSpClient.post).toHaveBeenCalled();
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ id: "value1", displayName: "Display 1" });
        expect(result[1]).toEqual({ id: "value2", displayName: "Display 2" });
    });

    test("should include existing filters in field suggestions request", async () => {
        const mockResponse = {
            text: vi.fn().mockResolvedValue(`
                <OPTION Value="value1">Display 1</OPTION>
            `)
        };
        mockSpClient.post.mockResolvedValue(mockResponse);

        const field = { name: "Status", type: "Choice" as const };
        const existingFilters = [
            {
                name: "Category",
                type: "Text" as const,
                value: "TestCategory", 
                comparer: "Eq" as const
            }
        ];

        await service.getFieldSuggestions(field, existingFilters);

        expect(mockSpClient.post).toHaveBeenCalledWith(
            expect.stringContaining("FilterField1=Category"),
            expect.any(Object)
        );
    });
});
