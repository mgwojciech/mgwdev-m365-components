import React from "react";
import { StringUtilities } from "mgwdev-m365-helpers/lib/utils/StringUtilities";
import { IHttpClient, DataverseUserService, UserAssignmentKind } from "mgwdev-m365-helpers";
import {
    Avatar, Badge, Button, Card, CardHeader, 
    MessageBar, MessageBarBody, Spinner, Text, 
    mergeClasses,
} from "@fluentui/react-components";
import { useDataverse } from "../../../context/DataverseContext";
import { DataverseItemPickerStandalone } from "../../common/DataverseItemPicker";
import { IEntityWithIdAndDisplayName } from "../../../model/IEntityWithIdAndDisplayName";
import { AssignmentDialog } from "./AssignmentDialog";

export interface UserManagementProps {
    allowBusinessUnitSelection?: boolean;
    allowTeamSelection?: boolean;
    allowRoleSelection?: boolean;
    teamsFilter?: string;
    rolesFilter?: string;
    businessUnitsFilter?: string;
    styles?: {
        root?: string;
        header?: string;
        cards?: string;
        card?: string;
        list?: string;
        row?: string;
        name?: string;
        muted?: string;
        results?: string;
    },
    labels?:{
        businessUnit?: string;
        businessUnitDescription?: string;
        team?: string;
        teamDescription?: string;
        role?: string;
        roleDescription?: string;
    }
}

import { useStyles } from "./UserManagement.styles";
import { Assignments, defaultLabels, emptyAssignments } from "./UserManagement.types";

export function UserManagement(props: UserManagementProps) {
    const { dataverseClient, dataverseResource } = useDataverse();
    return <UserManagementStandalone {...props} dataverseClient={dataverseClient} dataverseResource={dataverseResource} />;
}

export function UserManagementStandalone(props: UserManagementProps & { dataverseClient: IHttpClient; dataverseResource: string }) {
    const styles = useStyles();
    const service = React.useMemo(() => new DataverseUserService(props.dataverseClient, props.dataverseResource), [props.dataverseClient, props.dataverseResource]);
    const [selectedUser, setSelectedUser] = React.useState<IEntityWithIdAndDisplayName | null>(null);
    const [assignments, setAssignments] = React.useState<Assignments>(emptyAssignments);
    const [loading, setLoading] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [loaded, setLoaded] = React.useState(false);
    const [error, setError] = React.useState("");
    const [notice, setNotice] = React.useState("");
    const [dialog, setDialog] = React.useState<UserAssignmentKind | null>(null);
    const [reload, setReload] = React.useState(0);
    const request = React.useRef(0);

    const loadAssignments = React.useCallback(async (userId: string): Promise<Assignments> => {
        const [teams, roles, units] = await Promise.all([
            service.getUserTeamMembership(userId), service.getUserRoles(userId), service.getUserBusinessUnits(userId),
        ]);
        return {
            teams: teams.map(team => ({ id: team.teamid, displayName: team.name })),
            roles: roles.map(role => ({ id: role.roleid, displayName: role.name })),
            businessunits: units.map(unit => ({ id: unit.businessunitid, displayName: unit.name })),
        };
    }, [service]);

    React.useEffect(() => {
        const version = ++request.current;
        setAssignments(emptyAssignments());
        setLoaded(false);
        setError("");
        setNotice("");
        setDialog(null);
        setLoading(!!selectedUser);
        if (selectedUser) {
            loadAssignments(selectedUser.id).then(data => {
                if (version === request.current) {
                    setAssignments(data);
                    setLoaded(true);
                }
            }).catch(reason => {
                if (version === request.current) setError(`Could not load assignments. ${StringUtilities.getErrorText(reason)}`);
            }).finally(() => {
                if (version === request.current) setLoading(false);
            });
        }
        return () => { ++request.current; };
    }, [selectedUser, loadAssignments, reload]);

    const changeAssignments = async (kind: UserAssignmentKind, entities: IEntityWithIdAndDisplayName[], add: boolean) => {
        if (!selectedUser || saving) return;
        const version = request.current;
        setSaving(true);
        setError("");
        setNotice("");
        setDialog(null);
        let failure = "";
        try {
            if (kind === "businessunits") {
                await service.updateUserBusinessUnits(selectedUser.id, entities.map(entity => ({ businessunitid: entity.id, name: entity.displayName })));
            } else {
                for (const entity of entities) await service.setAssignment(selectedUser.id, kind, entity.id, add);
            }
        } catch (reason) {
            failure = `Could not complete the change. Some assignments may have changed. ${StringUtilities.getErrorText(reason)}`;
        }
        // Reload even after a partial failure; a business-unit move can also change roles.
        try {
            const data = await loadAssignments(selectedUser.id);
            if (version === request.current) {
                setAssignments(data);
                setLoaded(true);
            }
        } catch (reason) {
            failure += ` Could not refresh assignments. Reload before making further changes. ${StringUtilities.getErrorText(reason)}`;
            if (version === request.current) setLoaded(false);
        }
        setSaving(false);
        if (version === request.current) {
            setError(failure);
            if (!failure) setNotice("Assignments updated.");
        }
    };

    const editable = {
        teams: props.allowTeamSelection !== false,
        roles: props.allowRoleSelection !== false,
        businessunits: props.allowBusinessUnitSelection !== false,
    };
    const filters = { teams: props.teamsFilter, roles: props.rolesFilter, businessunits: props.businessUnitsFilter };
    const busy = loading || saving;

    return <div className={mergeClasses(styles.root, props.styles?.root)}>
        <DataverseItemPickerStandalone
            dataverseClient={props.dataverseClient}
            dataverseResource={props.dataverseResource}
            label="User"
            tableName="systemusers"
            idColumnName="systemuserid"
            displayNameColumnName="fullname"
            disabled={saving}
            onEntitySelected={entities => setSelectedUser(entities[0] || null)}
        />
        {!selectedUser && <Text className={mergeClasses(styles.muted, props.styles?.muted)}>Select a user to view and manage their assignments.</Text>}
        {selectedUser && <>
            <div className={mergeClasses(styles.header, props.styles?.header)}>
                <Avatar name={mergeClasses(styles.name, props.styles?.name)} size={48} />
                <div><Text as="h2" size={500} weight="semibold">{selectedUser.displayName}</Text><div className={styles.muted}>User access and organization</div></div>
            </div>
            {busy && <Spinner size="small" label={saving ? "Saving assignments..." : "Loading assignments..."} />}
            {error && <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar>}
            {error && !busy && <Button onClick={() => setReload(value => value + 1)}>Reload assignments</Button>}
            {notice && <MessageBar intent="success"><MessageBarBody>{notice}</MessageBarBody></MessageBar>}
            {loaded && <div className={styles.cards}>
                {(["teams", "roles", "businessunits"] as UserAssignmentKind[]).map(kind => <Card key={kind} className={mergeClasses(styles.card, props.styles?.card)}>
                    <CardHeader header={<Text weight="semibold">{props.labels?.[kind] ? props.labels[kind] : defaultLabels[kind]} <Badge appearance="tint">{assignments[kind].length}</Badge></Text>}
                        description={kind === "roles" ? "Direct assignments; team-inherited roles are managed through teams." : kind === "businessunits" ? "Primary organizational unit" : "Current team memberships"}
                        action={editable[kind] && <Button size="small" appearance="subtle" disabled={busy} onClick={() => setDialog(kind)}>
                            {kind === "businessunits" ? "Change" : "Add"}
                        </Button>} />
                    {assignments[kind].length ? <ul className={mergeClasses(styles.list, props.styles?.list)}>
                        {assignments[kind].map(entity => <li key={entity.id} className={mergeClasses(styles.row, props.styles?.row)}>
                            <Text className={mergeClasses(styles.name, props.styles?.name)}>{entity.displayName}</Text>
                            {kind !== "businessunits" && editable[kind] && <Button size="small" appearance="subtle" disabled={busy}
                                aria-label={`Remove ${entity.displayName} from ${props.labels?.[kind] ? props.labels[kind].toLowerCase() : defaultLabels[kind].toLowerCase()}`}
                                onClick={() => changeAssignments(kind, [entity], false)}>Remove</Button>}
                        </li>)}
                    </ul> : <Text className={styles.muted}>No {props.labels?.[kind] ? props.labels[kind].toLowerCase() : defaultLabels[kind].toLowerCase()} assigned.</Text>}
                </Card>)}
            </div>}
            {dialog && <AssignmentDialog key={dialog} kind={dialog} service={service} filter={filters[dialog]}
                assigned={assignments[dialog]} onClose={() => setDialog(null)}
                onApply={entities => changeAssignments(dialog, entities, true)} />}
        </>}
    </div>;
}

