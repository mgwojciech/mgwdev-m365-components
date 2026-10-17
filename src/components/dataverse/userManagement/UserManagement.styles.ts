import { makeStyles, tokens } from "@fluentui/react-components";

export const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalL
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalM
    },
    cards: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
        gap: tokens.spacingHorizontalL
    },
    card: {
        alignSelf: "start"
    },
    list: {
        listStyleType: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS
    },
    row: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: tokens.spacingHorizontalS,
        padding: tokens.spacingVerticalS,
        backgroundColor: tokens.colorNeutralBackground2,
        borderRadius: tokens.borderRadiusMedium
    },
    name: {
        overflowWrap: "anywhere"
    },
    muted: {
        color: tokens.colorNeutralForeground3
    },
    results: {
        maxHeight: "320px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalS,
        marginTop: tokens.spacingVerticalM
    },
});