import { IQueryField } from "mgwdev-m365-helpers";
import { DataField } from "../../../model";
import * as  React from "react";
import { Field, makeStyles, tokens } from "@fluentui/react-components";

const useDateRangeStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
    },
});

export function DateRangeColumnFilter(props: {
    fieldName: string;
    onFilterSet: (field: DataField, queryFields: IQueryField[]) => void;
    onClearFilters?: () => void;
}) {
    const classes = useDateRangeStyles();
    const [startDate, setStartDate] = React.useState<Date | null>(null);
    const [endDate, setEndDate] = React.useState<Date | null>(null);

    return <div className={classes.root}>
        <Field
            label="Start Date"
        >
            <input
                type="date"
                value={startDate ? startDate.toISOString().split("T")[0] : ""}
                onChange={(e) => {
                    setStartDate(e.target.value ? new Date(e.target.value) : null);
                    let queryFields: IQueryField[] = []
                    if (startDate) {
                        queryFields.push({
                            name: props.fieldName,
                            comparer: "Gt",
                            value: startDate.toISOString()
                        });
                    }
                    if (endDate) {
                        queryFields.push({
                            name: props.fieldName,
                            comparer: "Lt",
                            value: endDate.toISOString()
                        });
                    }
                    props.onFilterSet(
                        {
                            name: props.fieldName,
                            type: "DateTime"
                        },
                        queryFields
                    );
                }}
            />
        </Field>
        <Field
            label="End Date"
        >
            <input
                type="date"
                value={endDate ? endDate.toISOString().split("T")[0] : ""}
                onChange={(e) => {
                    setEndDate(e.target.value ? new Date(e.target.value) : null);
                    let queryFields: IQueryField[] = []
                    if (startDate) {
                        queryFields.push({
                            name: props.fieldName,
                            comparer: "Gt",
                            value: startDate.toISOString()
                        });
                    }
                    if (endDate) {
                        queryFields.push({
                            name: props.fieldName,
                            comparer: "Lt",
                            value: endDate.toISOString()
                        });
                    }
                    props.onFilterSet(
                        {
                            name: props.fieldName,
                            type: "DateTime"
                        },
                        queryFields
                    );
                }}
            />
        </Field>
    </div >
}