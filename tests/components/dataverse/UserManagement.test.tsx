// @vitest-environment jsdom
import * as React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { IHttpClient, DataverseUserService } from "mgwdev-m365-helpers";
import { UserManagementStandalone } from "../../../src/components/dataverse/userManagement/UserManagement";


vi.mock("../../../src/components/common/DataverseItemPicker", () => ({
    DataverseItemPickerStandalone: (props: { disabled: boolean; onEntitySelected: (entities: { id: string; displayName: string }[]) => void }) =>
        <div>
            <button disabled={props.disabled} onClick={() => props.onEntitySelected([{ id: "user", displayName: "Ada Lovelace" }])}>Select Ada</button>
            <button disabled={props.disabled} onClick={() => props.onEntitySelected([{ id: "other", displayName: "Grace Hopper" }])}>Select Grace</button>
        </div>,
}));

const client: IHttpClient = { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() };
const renderControl = (props = {}) => render(
    <FluentProvider theme={webLightTheme}>
        <UserManagementStandalone dataverseClient={client} dataverseResource="https://contoso.crm.dynamics.com" {...props} />
    </FluentProvider>
);
const selectUser = async () => {
    fireEvent.click(screen.getByText("Select Ada"));
    await screen.findByText("Engineering");
};

describe("UserManagement assignment cards", () => {
    beforeEach(() => {
        vi.stubGlobal("ResizeObserver", class {
            observe() {}
            unobserve() {}
            disconnect() {}
        });
        // JSDOM has no layout; Tabster uses offsetParent to detect hidden dialog content.
        vi.spyOn(HTMLElement.prototype, "offsetParent", "get").mockImplementation(function (this: HTMLElement) {
            return this.ownerDocument.defaultView?.getComputedStyle(this).display === "none" ? null : this.parentElement;
        });
        vi.spyOn(document.body, "getBoundingClientRect").mockReturnValue({
            x: 0, y: 0, top: 0, left: 0, right: 1024, bottom: 768, width: 1024, height: 768,
            toJSON: () => ({}),
        });
        vi.spyOn(DataverseUserService.prototype, "getUserTeamMembership").mockResolvedValue([{ teamid: "team", name: "Engineering" }]);
        vi.spyOn(DataverseUserService.prototype, "getUserRoles").mockResolvedValue([{ roleid: "role", name: "Reader" }]);
        vi.spyOn(DataverseUserService.prototype, "getUserBusinessUnits").mockResolvedValue([{ businessunitid: "unit", name: "Head office" }]);
        vi.spyOn(DataverseUserService.prototype, "searchAssignments").mockResolvedValue([{ id: "new", displayName: "New assignment" }]);
        vi.spyOn(DataverseUserService.prototype, "setAssignment").mockResolvedValue(undefined);
        vi.spyOn(DataverseUserService.prototype, "updateUserBusinessUnits").mockResolvedValue(undefined);
    });
    afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

    test("shows the empty state then current memberships with edit actions enabled by default", async () => {
        renderControl();
        expect(screen.getByText(/Select a user to view/)).toBeInTheDocument();
        expect(screen.queryByText("Engineering")).not.toBeInTheDocument();
        await selectUser();
        expect(screen.getByText("Reader")).toBeInTheDocument();
        expect(screen.getByText("Head office")).toBeInTheDocument();
        expect(screen.getAllByRole("button", { name: "Add" })).toHaveLength(2);
        expect(screen.queryByRole("button", { name: /Remove Head office/ })).not.toBeInTheDocument();
    });

    test("shows read-only cards when editing is disabled", async () => {
        renderControl({ allowTeamSelection: false, allowRoleSelection: false, allowBusinessUnitSelection: false });
        await selectUser();
        expect(screen.getByText("Reader")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Add" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Remove|Change/ })).not.toBeInTheDocument();
    });

    test("removes a membership and refreshes persisted assignments", async () => {
        renderControl();
        await selectUser();
        vi.mocked(DataverseUserService.prototype.getUserTeamMembership).mockResolvedValue([]);
        fireEvent.click(screen.getByRole("button", { name: "Remove Engineering from teams" }));
        await screen.findByText("Assignments updated.");
        expect(DataverseUserService.prototype.setAssignment).toHaveBeenCalledWith("user", "teams", "team", false);
        expect(screen.queryByText("Engineering")).not.toBeInTheDocument();
        expect(screen.getByText("No teams assigned.")).toBeInTheDocument();
    });

    test("adds checked search results with the configured filter", async () => {
        renderControl({ teamsFilter: "teamtype eq 0" });
        await selectUser();
        fireEvent.click(screen.getAllByRole("button", { name: "Add" })[0]);
        const dialog = await screen.findByRole("dialog");
        fireEvent.click(await within(dialog).findByRole("checkbox", { name: "New assignment" }));
        fireEvent.click(within(dialog).getByRole("button", { name: "Add selected (1)" }));
        await screen.findByText("Assignments updated.");
        expect(DataverseUserService.prototype.searchAssignments).toHaveBeenCalledWith("teams", "", "teamtype eq 0");
        expect(DataverseUserService.prototype.setAssignment).toHaveBeenCalledWith("user", "teams", "new", true);
    });

    test("changes business unit with a warning and refreshes roles", async () => {
        renderControl();
        await selectUser();
        fireEvent.click(screen.getByRole("button", { name: "Change" }));
        const dialog = await screen.findByRole("dialog");
        expect(within(dialog).getByText(/Moving a user/)).toBeInTheDocument();
        fireEvent.click(await within(dialog).findByRole("radio", { name: "New assignment" }));
        fireEvent.click(within(dialog).getByRole("button", { name: "Change business unit" }));
        await screen.findByText("Assignments updated.");
        expect(DataverseUserService.prototype.updateUserBusinessUnits).toHaveBeenCalledWith("user", [{ businessunitid: "new", name: "New assignment" }]);
        expect(DataverseUserService.prototype.getUserRoles).toHaveBeenCalledTimes(2);
    });

    test("reports write errors and reloads after partial failure", async () => {
        vi.mocked(DataverseUserService.prototype.setAssignment).mockRejectedValue(new Error("Permission denied"));
        renderControl();
        await selectUser();
        fireEvent.click(screen.getByRole("button", { name: "Remove Reader from roles" }));
        await screen.findByText(/Could not complete the change.*Permission denied/);
        expect(screen.queryByText("Assignments updated.")).not.toBeInTheDocument();
        expect(DataverseUserService.prototype.getUserRoles).toHaveBeenCalledTimes(2);
    });

    test("does not enable edits when initial loading fails and allows retry", async () => {
        vi.mocked(DataverseUserService.prototype.getUserRoles).mockRejectedValueOnce(new Error("Unavailable"));
        renderControl();
        fireEvent.click(screen.getByText("Select Ada"));
        await screen.findByText(/Could not load assignments.*Unavailable/);
        expect(screen.queryByRole("button", { name: "Add" })).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: "Reload assignments" }));
        await screen.findByText("Reader");
    });

    test("ignores late assignment responses from the previous user", async () => {
        let resolveOld: ((roles: { roleid: string; name: string }[]) => void) | undefined;
        const oldRoles = new Promise<{ roleid: string; name: string }[]>(resolve => { resolveOld = resolve; });
        vi.mocked(DataverseUserService.prototype.getUserRoles)
            .mockReturnValueOnce(oldRoles)
            .mockResolvedValueOnce([{ roleid: "other-role", name: "Administrator" }]);
        renderControl();
        fireEvent.click(screen.getByText("Select Ada"));
        fireEvent.click(screen.getByText("Select Grace"));
        await screen.findByText("Administrator");
        if (!resolveOld) throw new Error("Deferred roles request was not initialized.");
        const completeOldRequest = resolveOld;
        await act(async () => {
            completeOldRequest([{ roleid: "old", name: "Stale role" }]);
            await oldRoles;
        });
        expect(screen.queryByText("Stale role")).not.toBeInTheDocument();
        expect(screen.getByText("Administrator")).toBeInTheDocument();
    });
});
