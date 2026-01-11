//@vitest-environment jsdom
import { describe, test, expect, vi, afterEach } from 'vitest';
import * as React from "react";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import '@testing-library/jest-dom/vitest';
import { DataGridFilterPanel } from '../../../src/components/datagrid/DataGridFilterPanel';
import { DataField } from '../../../src/model/DataField';
import { FluentProvider, webLightTheme } from '@fluentui/react-components';

const renderWithFluentProvider = (ui: React.ReactElement) => {
    return render(
        <FluentProvider theme={webLightTheme}>
            {ui}
        </FluentProvider>
    );
};

afterEach(() => {
    cleanup();
});

describe("<DataGridFilterPanel />", () => {
    const filterFields: DataField[] = [
        { name: "Title", type: "Text", label: "Title" },
        { name: "Status", type: "Choice", label: "Status" }
    ];

    test("should render filter button", () => {
        renderWithFluentProvider(
            <DataGridFilterPanel
                filterFields={filterFields}
                onFilterSet={vi.fn()}
                renderFilter={(field) => <div>Filter: {field.name}</div>}
            />
        );

        expect(screen.getByLabelText("Open filter pane")).toBeInTheDocument();
    });

    test("should open drawer when filter button clicked", async () => {
        renderWithFluentProvider(
            <DataGridFilterPanel
                filterFields={filterFields}
                onFilterSet={vi.fn()}
                renderFilter={(field) => <div data-testid={`filter-${field.name}`}>Filter: {field.name}</div>}
            />
        );

        fireEvent.click(screen.getByLabelText("Open filter pane"));

        await waitFor(() => {
            expect(screen.getByText("Filter")).toBeInTheDocument();
            expect(screen.getByTestId("filter-Title")).toBeInTheDocument();
            expect(screen.getByTestId("filter-Status")).toBeInTheDocument();
        });
    });

    test("should render field labels in drawer", async () => {
        renderWithFluentProvider(
            <DataGridFilterPanel
                filterFields={filterFields}
                onFilterSet={vi.fn()}
                renderFilter={(field) => <input data-testid={`filter-${field.name}`} />}
            />
        );

        fireEvent.click(screen.getByLabelText("Open filter pane"));

        await waitFor(() => {
            expect(screen.getByText("Title")).toBeInTheDocument();
            expect(screen.getByText("Status")).toBeInTheDocument();
        });
    });

    test("should not show clear filters button when no filters active", () => {
        renderWithFluentProvider(
            <DataGridFilterPanel
                filterFields={filterFields}
                onFilterSet={vi.fn()}
                onClearFilters={vi.fn()}
                renderFilter={(field) => <div>Filter: {field.name}</div>}
            />
        );

        expect(screen.queryByLabelText("Clear all filters")).not.toBeInTheDocument();
    });

    test("should show clear filters button when filters are active", () => {
        const activeFilters = [{ name: "Title", type: "Text" as const, value: "test", comparer: "Eq" as const }];

        renderWithFluentProvider(
            <DataGridFilterPanel
                filterFields={filterFields}
                initialQueryFields={activeFilters}
                onFilterSet={vi.fn()}
                onClearFilters={vi.fn()}
                renderFilter={(field) => <div>Filter: {field.name}</div>}
            />
        );

        expect(screen.getByText("Clear filters")).toBeInTheDocument();
    });

    test("should call onClearFilters when clear button clicked", () => {
        const onClearFilters = vi.fn();
        const activeFilters = [{ name: "Title", type: "Text" as const, value: "test", comparer: "Eq" as const }];

        renderWithFluentProvider(
            <DataGridFilterPanel
                filterFields={filterFields}
                initialQueryFields={activeFilters}
                onFilterSet={vi.fn()}
                onClearFilters={onClearFilters}
                renderFilter={(field) => <div>Filter: {field.name}</div>}
            />
        );

        fireEvent.click(screen.getByText("Clear filters"));

        expect(onClearFilters).toHaveBeenCalled();
    });

    test("should close drawer when close button clicked", async () => {
        renderWithFluentProvider(
            <DataGridFilterPanel
                filterFields={filterFields}
                onFilterSet={vi.fn()}
                renderFilter={(field) => <div data-testid={`filter-${field.name}`}>Filter: {field.name}</div>}
            />
        );

        // Open drawer
        fireEvent.click(screen.getByLabelText("Open filter pane"));

        await waitFor(() => {
            expect(screen.getByTestId("filter-Title")).toBeInTheDocument();
        });

        // Close drawer
        fireEvent.click(screen.getByLabelText("Close"));

        await waitFor(() => {
            expect(screen.queryByTestId("filter-Title")).not.toBeInTheDocument();
        });
    });

    test("should pass initialQueryFields to renderFilter", async () => {
        const activeFilters = [{ name: "Title", type: "Text" as const, value: "test", comparer: "Eq" as const }];
        const renderFilter = vi.fn((field, onFilterSet, initialQuery) => (
            <div data-testid={`filter-${field.name}`}>
                Initial: {initialQuery?.length || 0}
            </div>
        ));

        renderWithFluentProvider(
            <DataGridFilterPanel
                filterFields={filterFields}
                initialQueryFields={activeFilters}
                onFilterSet={vi.fn()}
                renderFilter={renderFilter}
            />
        );

        fireEvent.click(screen.getByLabelText("Open filter pane"));

        await waitFor(() => {
            expect(renderFilter).toHaveBeenCalledWith(
                filterFields[0],
                expect.any(Function),
                activeFilters
            );
        });
    });
});
