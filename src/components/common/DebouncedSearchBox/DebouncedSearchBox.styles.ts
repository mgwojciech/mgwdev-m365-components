import { makeStyles } from "@fluentui/react-components";

export const useDebouncedSearchBoxStyles = makeStyles({
    searchGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        marginBottom: "16px",
    },
    searchLabel: {
        fontWeight: "bold",
    },
    searchHint: {
        fontStyle: "italic",
        color: "#666",
    },
});