//@vitest-environment jsdom
import { describe, test, expect, vi } from 'vitest'
import * as React from "react";
import { GraphGroupMembershipTrimmedComponentStandalone } from "../../../src/components/common/GraphGroupMembershipTrimmedComponent";
import { render, configure } from "@testing-library/react";
import '@testing-library/jest-dom/vitest';

const siteUrl = "https://test.sharepoint.com/sites/test"
configure({
    testIdAttribute: "data-testid"
});

describe("<GraphGroupMembershipTrimmedComponentStandalone />", () => {
    test("should not render children", async () => {
        const graphClient = {
            get: (url) => Promise.resolve({
                ok: false,
            })
        }

        const renderResult = await render(<GraphGroupMembershipTrimmedComponentStandalone graphClient={graphClient as any} groupId='test-guid'>
            <div data-testid="test-content" />
        </GraphGroupMembershipTrimmedComponentStandalone>)
        const testDiv = renderResult.queryByTestId("test-content");

        expect(testDiv).not.toBeInTheDocument();
    })
    test("should not render children with placeholder", async () => {
        const graphClient = {
            get: (url) => Promise.resolve({
                ok: false,
            })
        }

        const renderResult = render(<GraphGroupMembershipTrimmedComponentStandalone 
        graphClient={graphClient as any} 
        placeholder={<div data-testid="placeholder" />}
        groupId='test-guid'>
            <div data-testid="test-content" />
        </GraphGroupMembershipTrimmedComponentStandalone>)
        const testDiv = renderResult.queryByTestId("placeholder");

        expect(testDiv).toBeInTheDocument();
    })
    test("should render children", async () => {
        const graphClient = {
            get: (url) => Promise.resolve({
                ok: true
            })
        }

        const renderResult = await render(<GraphGroupMembershipTrimmedComponentStandalone graphClient={graphClient as any} groupId='test-guid'>
            <div data-testid="test-content" />
        </GraphGroupMembershipTrimmedComponentStandalone>)
        const testDiv = await renderResult.findByTestId("test-content");

        expect(testDiv).toBeTruthy();
    })
})