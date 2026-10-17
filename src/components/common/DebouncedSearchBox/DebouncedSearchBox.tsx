import { Body1, SearchBox, Caption1 } from "@fluentui/react-components";
import { DebounceHandler } from "mgwdev-m365-helpers";
import { useState } from "react";
import { useDebouncedSearchBoxStyles } from "./DebouncedSearchBox.styles";
import * as React from "react";

export function DebouncedSearchBox(props: {
    onSearch: (value: string) => void;
    delay?: number;
    label?: string;
    placeholder?: string;
}) {
    const styles = useDebouncedSearchBoxStyles();
    const [searchText, setSearchText] = useState("");
    return <div className={styles.searchGroup}>
        <Body1 className={styles.searchLabel}>{props.label ?? "Find a submission"}</Body1>
        <SearchBox
            aria-label={props.label ?? "Search submissions by title or ID"}
            placeholder={props.placeholder ?? "Search by title or submission ID"}
            value={searchText}
            onChange={(_, data) => {
                setSearchText(data.value);
                DebounceHandler.debounce("submissions-search", async () => props.onSearch(data.value.trim()), props.delay ?? 400);
            }}
        />
        <Caption1 className={styles.searchHint}>Results update as you type.</Caption1>
    </div>;
}
