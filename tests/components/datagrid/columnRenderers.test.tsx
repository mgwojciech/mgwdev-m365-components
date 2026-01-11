//@vitest-environment jsdom
import { describe, test, expect } from 'vitest';
import * as React from "react";
import { render } from "@testing-library/react";
import '@testing-library/jest-dom/vitest';
import { SPUserRenderer } from '../../../src/components/datagrid/columnRenderers/SPUserRenderer';
import { DateRenderer } from '../../../src/components/datagrid/columnRenderers/DateRenderer';
import { DataverseLookupRenderer } from '../../../src/components/datagrid/columnRenderers/DataverseLookupRenderer';

describe("SPUserRenderer", () => {
    const renderer = new SPUserRenderer();

    test("should be applicable for User type fields", () => {
        expect(renderer.isRendererApplicable({ name: "Author", type: "User" })).toBe(true);
        expect(renderer.isRendererApplicable({ name: "Title", type: "Text" })).toBe(false);
    });

    test("should render user title", () => {
        const field = { name: "Author", type: "User" as const };
        const value = [{ title: "John Doe", email: "john@test.com" }];
        
        const { container } = render(renderer.renderField(field, value, {}));
        
        expect(container.textContent).toContain("John Doe");
    });

    test("should render multiple users", () => {
        const field = { name: "Author", type: "User" as const };
        const value = [
            { title: "John Doe", email: "john@test.com" },
            { title: "Jane Smith", email: "jane@test.com" }
        ];
        
        const { container } = render(renderer.renderField(field, value, {}));
        
        expect(container.textContent).toContain("John Doe");
        expect(container.textContent).toContain("Jane Smith");
    });

    test("should render dash for null value", () => {
        const field = { name: "Author", type: "User" as const };
        
        const { container } = render(renderer.renderField(field, null, {}));
        
        expect(container.textContent).toBe("-");
    });

    test("should render dash for empty array", () => {
        const field = { name: "Author", type: "User" as const };
        
        const { container } = render(renderer.renderField(field, [], {}));
        
        expect(container.textContent).toBe("-");
    });

    test("should fallback to email if title is missing", () => {
        const field = { name: "Author", type: "User" as const };
        const value = [{ email: "john@test.com" }];
        
        const { container } = render(renderer.renderField(field, value, {}));
        
        expect(container.textContent).toContain("john@test.com");
    });
});

describe("DateRenderer", () => {
    const renderer = new DateRenderer();

    test("should be applicable for DateTime type fields", () => {
        expect(renderer.isRendererApplicable({ name: "Created", type: "DateTime" })).toBe(true);
        expect(renderer.isRendererApplicable({ name: "Title", type: "Text" })).toBe(false);
    });

    test("should render formatted date", () => {
        const field = { name: "Created", type: "DateTime" as const };
        const value = "2024-01-15T10:30:00Z";
        
        const { container } = render(renderer.renderField(field, value, {}));
        
        // The date should be formatted as locale date string
        expect(container.textContent).not.toBe("-");
        expect(container.textContent).toContain("2024");
        expect(container.textContent).toContain("1");
    });

    test("should render dash for null value", () => {
        const field = { name: "Created", type: "DateTime" as const };
        
        const { container } = render(renderer.renderField(field, null, {}));
        
        expect(container.textContent).toBe("-");
    });

    test("should render dash for invalid date", () => {
        const field = { name: "Created", type: "DateTime" as const };
        
        const { container } = render(renderer.renderField(field, "not-a-date", {}));
        
        expect(container.textContent).toBe("-");
    });
});

describe("DataverseLookupRenderer", () => {
    const renderer = new DataverseLookupRenderer();

    test("should be applicable for Lookup type fields", () => {
        expect(renderer.isRendererApplicable({ name: "account", type: "Lookup" })).toBe(true);
        expect(renderer.isRendererApplicable({ name: "name", type: "Text" })).toBe(false);
    });

    test("should render lookup display value", () => {
        const field = { 
            name: "primarycontactid", 
            type: "Lookup" as const,
            expandFields: ["fullname", "contactid"]
        };
        const value = { fullname: "John Doe", contactid: "123" };
        
        const { container } = render(renderer.renderField(field, value, {}));
        
        expect(container.textContent).toBe("John Doe");
    });

    test("should render dash for null value", () => {
        const field = { 
            name: "primarycontactid", 
            type: "Lookup" as const,
            expandFields: ["fullname"]
        };
        
        const { container } = render(renderer.renderField(field, null, {}));
        
        expect(container.textContent).toBe("-");
    });

    test("should render JSON if no expandFields provided", () => {
        const field = { 
            name: "primarycontactid", 
            type: "Lookup" as const
        };
        const value = { fullname: "John Doe" };
        
        const { container } = render(renderer.renderField(field, value, {}));
        
        expect(container.textContent).toContain("fullname");
    });
});
