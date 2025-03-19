//@vitest-environment jsdom
import { describe, test, expect, vi } from 'vitest'
import * as React from "react";
import { SPPermissionTrimmedComponentStandalone } from "../../../src/components/common/SPPermissionTrimmedComponent";
import { render, configure } from "@testing-library/react";
import '@testing-library/jest-dom/vitest';

const readerMask = {
    High: 176,
    Low: 138612833
}

const siteUrl = "https://test.sharepoint.com/sites/test"
configure({
    testIdAttribute: "data-testid"
});

describe("<SPPermissionTrimmedComponentStandalone />", () => {
    test("should not render children", async () => {
        const spClient = {
            get: (url) => Promise.resolve({
                ok: true,
                json: () => Promise.resolve(readerMask)
            })
        }

        const renderResult = await render(<SPPermissionTrimmedComponentStandalone spClient={spClient as any} siteUrl={siteUrl} role={"fullMask"}>
            <div data-testid="test-content" />
        </SPPermissionTrimmedComponentStandalone>)
        const testDiv = renderResult.queryByTestId("test-content");

        expect(testDiv).not.toBeInTheDocument();
    })
    test("should not render children with placeholder", async () => {
        const spClient = {
            get: (url) => Promise.resolve({
                ok: true,
                json: () => Promise.resolve(readerMask)
            })
        }

        const renderResult = render(<SPPermissionTrimmedComponentStandalone 
        spClient={spClient as any} 
        placeholder={<div data-testid="placeholder" />}
        siteUrl={siteUrl} role={"fullMask"}>
            <div data-testid="test-content" />
        </SPPermissionTrimmedComponentStandalone>)
        const testDiv = renderResult.queryByTestId("placeholder");

        expect(testDiv).toBeInTheDocument();
    })
    test("should render children", async () => {
        const spClient = {
            get: (url) => Promise.resolve({
                ok: true,
                json: () => Promise.resolve(readerMask)
            })
        }

        const renderResult = await render(<SPPermissionTrimmedComponentStandalone spClient={spClient as any} siteUrl={siteUrl} role={"viewFormPages"}>
            <div data-testid="test-content" />
        </SPPermissionTrimmedComponentStandalone>)
        const testDiv = await renderResult.findByTestId("test-content");

        expect(testDiv).toBeTruthy();
    })
})