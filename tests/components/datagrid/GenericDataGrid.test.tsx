//@vitest-environment jsdom
import { describe, test, expect, vi, beforeAll, afterEach } from 'vitest';
import * as React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import '@testing-library/jest-dom/vitest';
import { GenericDataGrid } from '../../../src/components/datagrid/GenericDataGrid';
import { IDataGridService } from '../../../src/services/datagrid/DataGridService';
import { DataField } from '../../../src/model/DataField';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

beforeAll(() => {
    global.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
});

afterEach(() => {
    cleanup();
});

const renderWithFluentProvider = (ui: React.ReactElement) => {
    return render(
        <FluentProvider theme={webLightTheme}>
            {ui}
        </FluentProvider>
    );
};

const createMockDataService = <T,>(items: T[] = []): IDataGridService<T> => ({
    setFields: vi.fn(),
    getData: vi.fn().mockResolvedValue(items),
    getNextPage: vi.fn().mockResolvedValue([]),
    isNextPageAvailable: vi.fn().mockReturnValue(false),
    getPreviousPage: vi.fn().mockResolvedValue([]),
    isPreviousPageAvailable: vi.fn().mockReturnValue(false),
    getFieldSuggestions: vi.fn().mockResolvedValue([])
});

describe("<GenericDataGrid />", () => {
    const fields: DataField[] = [
        { name: "ID", type: "Number" },
        { name: "Title", type: "Text" }
    ];

    test("should render loading spinner initially", async () => {
        const mockService = createMockDataService();
        // Make getData hang to keep loading state
        mockService.getData = vi.fn().mockImplementation(() => new Promise(() => {}));

        renderWithFluentProvider(
            <GenericDataGrid
                dataService={mockService}
                fieldsToRender={fields}
            />
        );

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test("should render data when loaded", async () => {
        const mockData = [
            { ID: 1, Title: "Item 1" },
            { ID: 2, Title: "Item 2" }
        ];
        const mockService = createMockDataService(mockData);

        renderWithFluentProvider(
            <GenericDataGrid
                dataService={mockService}
                fieldsToRender={fields}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Item 1")).toBeInTheDocument();
            expect(screen.getByText("Item 2")).toBeInTheDocument();
        });
    });

    test("should call setFields on the data service", async () => {
        const mockService = createMockDataService();

        renderWithFluentProvider(
            <GenericDataGrid
                dataService={mockService}
                fieldsToRender={fields}
            />
        );

        await waitFor(() => {
            expect(mockService.setFields).toHaveBeenCalledWith(fields);
        });
    });

    test("should render column headers", async () => {
        const mockService = createMockDataService([{ ID: 1, Title: "Test" }]);
        const fieldsWithLabels: DataField[] = [
            { name: "ID", type: "Number", label: "Identifier" },
            { name: "Title", type: "Text", label: "Name" }
        ];

        renderWithFluentProvider(
            <GenericDataGrid
                dataService={mockService}
                fieldsToRender={fieldsWithLabels}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Identifier")).toBeInTheDocument();
            expect(screen.getByText("Name")).toBeInTheDocument();
        });
    });

    test("should show error message on data fetch failure", async () => {
        const mockService = createMockDataService();
        mockService.getData = vi.fn().mockRejectedValue(new Error("Network error"));

        renderWithFluentProvider(
            <GenericDataGrid
                dataService={mockService}
                fieldsToRender={fields}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Error")).toBeInTheDocument();
            expect(screen.getByText("Network error")).toBeInTheDocument();
        });
    });

    test("should disable pagination buttons when not available", async () => {
        const mockService = createMockDataService([{ ID: 1, Title: "Test" }]);
        mockService.isNextPageAvailable = vi.fn().mockReturnValue(false);
        mockService.isPreviousPageAvailable = vi.fn().mockReturnValue(false);

        renderWithFluentProvider(
            <GenericDataGrid
                dataService={mockService}
                fieldsToRender={fields}
            />
        );

        await waitFor(() => {
            const prevButton = screen.getByTestId("datagrid-prev-page");
            const nextButton = screen.getByTestId("datagrid-next-page");
            expect(prevButton).toBeDisabled();
            expect(nextButton).toBeDisabled();
        });
    });

    test("should enable next page button when available", async () => {
        const mockService = createMockDataService([{ ID: 1, Title: "Test" }]);
        mockService.isNextPageAvailable = vi.fn().mockReturnValue(true);

        renderWithFluentProvider(
            <GenericDataGrid
                dataService={mockService}
                fieldsToRender={fields}
            />
        );

        await waitFor(() => {
            const nextButton = screen.getByLabelText("Next page");
            expect(nextButton).not.toBeDisabled();
        });
    });

    test("should call getNextPage when next button clicked", async () => {
        const mockService = createMockDataService([{ ID: 1, Title: "Test" }]);
        mockService.isNextPageAvailable = vi.fn().mockReturnValue(true);
        mockService.getNextPage = vi.fn().mockResolvedValue([{ ID: 2, Title: "Page 2" }]);

        renderWithFluentProvider(
            <GenericDataGrid
                dataService={mockService}
                fieldsToRender={fields}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Test")).toBeInTheDocument();
        });

        const nextButton = screen.getByLabelText("Next page");
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(mockService.getNextPage).toHaveBeenCalled();
        });
    });

    test("should call onSelectionChange when row is selected", async () => {
        const mockData = [
            { ID: 1, Title: "Item 1" },
            { ID: 2, Title: "Item 2" }
        ];
        const mockService = createMockDataService(mockData);
        const onSelectionChange = vi.fn();

        renderWithFluentProvider(
            <GenericDataGrid
                dataService={mockService}
                fieldsToRender={fields}
                selectionMode="multiselect"
                getRowId={(item) => String(item.ID)}
                onSelectionChange={onSelectionChange}
            />
        );

        await waitFor(() => {
            expect(screen.getByText("Item 1")).toBeInTheDocument();
        });

        // Find and click a checkbox
        const checkboxes = screen.getAllByRole('checkbox');
        // First checkbox is "select all", second is first row
        if (checkboxes.length > 1) {
            fireEvent.click(checkboxes[1]);
            
            await waitFor(() => {
                expect(onSelectionChange).toHaveBeenCalled();
            });
        }
    });

    test("should render filter button when renderFilter provided", async () => {
        const mockService = createMockDataService([{ ID: 1, Title: "Test" }]);

        renderWithFluentProvider(
            <GenericDataGrid
                dataService={mockService}
                fieldsToRender={fields}
                renderFilter={(field, onFilterSet) => <div>Filter for {field.name}</div>}
            />
        );

        await waitFor(() => {
            expect(screen.getByLabelText("Open filter pane")).toBeInTheDocument();
        });
    });

    test("should respect disableFiltering on fields", async () => {
        const mockService = createMockDataService([{ ID: 1, Title: "Test" }]);
        const fieldsWithDisabledFilter: DataField[] = [
            { name: "ID", type: "Number", disableFiltering: true },
            { name: "Title", type: "Text" }
        ];

        renderWithFluentProvider(
            <GenericDataGrid
                dataService={mockService}
                fieldsToRender={fieldsWithDisabledFilter}
                renderFilter={(field, onFilterSet) => <div data-testid={`filter-${field.name}`}>Filter for {field.name}</div>}
            />
        );

        await waitFor(() => {
            expect(screen.getByLabelText("Open filter pane")).toBeInTheDocument();
        });

        // Open filter panel
        fireEvent.click(screen.getByLabelText("Open filter pane"));

        await waitFor(() => {
            // Title filter should be present, ID filter should not (disableFiltering: true)
            expect(screen.getByTestId("filter-Title")).toBeInTheDocument();
            expect(screen.queryByTestId("filter-ID")).not.toBeInTheDocument();
        });
    });
});
