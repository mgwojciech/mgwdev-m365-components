import { Text, Dialog, DialogSurface, DialogBody, DialogTitle, DialogContent, MessageBar, MessageBarBody, Field, Input, Spinner, RadioGroup, Radio, Checkbox, DialogActions, Button } from "@fluentui/react-components";
import React from "react";
import { IEntityWithIdAndDisplayName } from "../../../model";
import { useStyles } from "./UserManagement.styles";
import { StringUtilities } from "mgwdev-m365-helpers/lib/utils/StringUtilities";
import { DataverseUserService, UserAssignmentKind } from "mgwdev-m365-helpers";
import { defaultLabels } from "./UserManagement.types";

export function AssignmentDialog(props: {
    kind: UserAssignmentKind;
    service: DataverseUserService;
    filter?: string;
    assigned: IEntityWithIdAndDisplayName[];
    onClose: () => void;
    onApply: (entities: IEntityWithIdAndDisplayName[]) => void;
    labels?: {
        teams?: string;
        roles?: string;
        businessunits?: string;
    }

}) {
    const styles = useStyles();
    const [search, setSearch] = React.useState("");
    const [results, setResults] = React.useState<IEntityWithIdAndDisplayName[]>([]);
    const [selected, setSelected] = React.useState<IEntityWithIdAndDisplayName[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState("");
    const single = props.kind === "businessunits";
    React.useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");
        const timer = setTimeout(() => {
            props.service.searchAssignments(props.kind, search, props.filter).then(data => {
                if (active) setResults(data.filter(entity => !props.assigned.some(current => current.id === entity.id)));
            }).catch(reason => {
                if (active) setError(`Could not search assignments. ${StringUtilities.getErrorText(reason)}`);
            }).finally(() => { if (active) setLoading(false); });
        }, 250);
        return () => { active = false; clearTimeout(timer); };
    }, [props.service, props.kind, props.filter, props.assigned, search]);

    return <Dialog open onOpenChange={(_, data) => { if (!data.open) props.onClose(); }}>
        <DialogSurface>
            <DialogBody>
                <DialogTitle>{single ? "Change business unit" : `Add ${props.labels?.[props.kind] ? props.labels[props.kind].toLowerCase() : defaultLabels[props.kind].toLowerCase()}`}</DialogTitle>
                <DialogContent>
                    {single && <MessageBar intent="warning"><MessageBarBody>Moving a user to another business unit can affect security roles and record access. Review their assignments after the change.</MessageBarBody></MessageBar>}
                    <Field label={`Search ${props.labels?.[props.kind] ? props.labels[props.kind].toLowerCase() : defaultLabels[props.kind].toLowerCase()}`} hint="Showing up to 50 matches. Refine your search to find more.">
                        <Input value={search} onChange={(_, data) => setSearch(data.value)} />
                    </Field>
                    {selected.length > 0 && <Text>{selected.length} selected</Text>}
                    <div className={styles.results}>
                        {loading ? <Spinner size="small" label="Searching..." /> : error
                            ? <MessageBar intent="error"><MessageBarBody>{error}</MessageBarBody></MessageBar>
                            : results.length === 0 ? <Text>No available matches.</Text>
                                : single ? <RadioGroup value={selected[0]?.id || ""} onChange={(_, data) => setSelected(results.filter(entity => entity.id === data.value))}>
                                    {results.map(entity => <Radio key={entity.id} value={entity.id} label={entity.displayName} />)}
                                </RadioGroup>
                                    : results.map(entity => <Checkbox key={entity.id} label={entity.displayName}
                                        checked={selected.some(item => item.id === entity.id)}
                                        onChange={(_, data) => setSelected(current => data.checked ? [...current, entity] : current.filter(item => item.id !== entity.id))} />)}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button appearance="secondary" onClick={props.onClose}>Cancel</Button>
                    <Button appearance="primary" disabled={loading || !!error || !selected.length} onClick={() => props.onApply(selected)}>
                        {single ? "Change business unit" : `Add selected (${selected.length})`}
                    </Button>
                </DialogActions>
            </DialogBody>
        </DialogSurface>
    </Dialog>;
}
