import { UserAssignmentKind, IEntityWithIdAndDisplayName } from "mgwdev-m365-helpers";


export type Assignments = Record<UserAssignmentKind, IEntityWithIdAndDisplayName[]>;
export const emptyAssignments = (): Assignments => ({ teams: [], roles: [], businessunits: [] });
export const defaultLabels = {
    teams: "Teams",
    roles: "Roles",
    businessunits: "Business Units",
};