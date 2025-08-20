import { Button, Input, makeStyles, mergeClasses, shorthands, Spinner, tokens } from "@fluentui/react-components";
import * as React from "react";
import { useGraph } from "../../context";
import { DebounceHandler, GraphSearchInputSuggestionServiceBuilder, SearchInputSuggestionService } from "mgwdev-m365-helpers";
import { DismissRegular, SendRegular } from "@fluentui/react-icons"

const useSearchInputWithSuggestionsStyles = makeStyles({
    root: {
        paddingBottom: tokens.spacingVerticalM,
        position: "relative"
    },
    searchInput: {
        minWidth: "800px"
    },
    suggestionsSurface: {

        position: "absolute",
        top: "100%",
        marginTop: "0rem",
        zIndex: 2,
        backgroundColor: tokens.colorNeutralBackgroundAlpha2,
        width: "800px",
        transform: "scaleY(0)",
        transformOrigin: "top",
        transitionProperty: "all",
        transitionTimingFunction: tokens.curveDecelerateMid,
        transitionDuration: tokens.durationSlow
    },
    suggestionsSurfaceVisible: {
        transform: "scaleY(1)",
    },
    suggestionsWrapper: {
        display: "flex",
        flexDirection: "column",
        rowGap: tokens.spacingVerticalM,
        maxHeight: "15rem",
        overflowY: "auto",
        alignItems: "flex-start",
    },
    suggestionsList: {
        listStyleType: "none",
        paddingLeft: "0px"
    },
    suggestionButton: {
        "&:focus": {
            ...shorthands.borderColor(tokens.colorBrandBackground)
        }
    }
})

export function SearchInputWithSuggestions(props: {
    onSearch: (query: string) => void,
    query?: string;
}) {
    const classNames = useSearchInputWithSuggestionsStyles();
    const { graphClient } = useGraph();
    const [openSuggestions, setOpenSuggestions] = React.useState(false);
    const [propertySearchResults, setPropertySearchResults] = React.useState<string[]>([])
    const [searchThroughProperties, setSearchThroughProperties] = React.useState(true);
    const [input, setInput] = React.useState<string>("");
    const [loading, setLoading] = React.useState(true);
    const [inputSuggestionService, setInputSuggestionService] = React.useState<SearchInputSuggestionService>()
    const inputRef = React.useRef<HTMLInputElement>();
    const listRef = React.useRef<HTMLUListElement>();
    const builderRef = React.useRef(new GraphSearchInputSuggestionServiceBuilder(graphClient));

    React.useEffect(() => {
        if (props.query) {
            builderRef.current.withManagedPropertiesRelatedQuery(props.query)
        }
        builderRef.current.build().then(service => {
            setInputSuggestionService(service);
            setLoading(false);
        })
    }, []);


    return <div className={classNames.root}>
        <Input ref={inputRef} className={classNames.searchInput}
            contentAfter={loading ? <Spinner size="tiny" /> : <Button appearance="transparent" title="Search" onClick={() => {
                props.onSearch(input);
            }} icon={<SendRegular />} />}
            value={input} onChange={(e, data) => {
                setInput(data.value);
                DebounceHandler.debounce("search-input", async () => {
                    setLoading(true);
                    const suggestions = await inputSuggestionService.getSuggestions(data.value);
                    setPropertySearchResults(suggestions.value);
                    setSearchThroughProperties(suggestions.areSuggestionsProps);
                    if (suggestions.value && suggestions.value.length > 0)
                        setOpenSuggestions(true);
                    setLoading(false);
                }, 500)
            }} onKeyDown={(e) => {
                if (e.key === "Enter") {
                    props.onSearch(input);
                }
                if (e.key === "ArrowDown") {
                    const firstLiChild = listRef.current?.firstChild;
                    if (firstLiChild) {
                        const firstButton = firstLiChild.firstChild
                        if (firstButton) {
                            (firstButton as HTMLButtonElement).focus();
                            e.preventDefault();
                            return;
                        }
                    }
                }
                if (e.key === "Escape") {
                    setOpenSuggestions(false);
                }
            }} />
        <div className={mergeClasses(classNames.suggestionsSurface, openSuggestions && classNames.suggestionsSurfaceVisible)}

            onBlur={() => {
                //setOpenSuggestions(false);
            }}>
            <div style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
            }}>
                <Button tabIndex={-1} appearance="subtle" onClick={() => {
                    setOpenSuggestions(false);
                }} title={"Close"} icon={<DismissRegular />}></Button>
            </div>
            <div className={classNames.suggestionsWrapper}>
                <ul className={classNames.suggestionsList} ref={listRef} onKeyDown={(e) => {
                    const focusableElements = listRef?.current.querySelectorAll("button");
                    const currentFocus = e.target;
                    let currentFocusIndex = null;
                    focusableElements.forEach((el, key) => {
                        if (el === currentFocus) {
                            currentFocusIndex = key
                        }
                    })
                    if (e.key === "ArrowUp") {
                        if (currentFocusIndex === 0) {
                            inputRef.current?.focus();
                            e.preventDefault();
                            return;
                        }
                        else {
                            focusableElements.item(currentFocusIndex - 1).focus();
                            e.preventDefault();
                            return;
                        }
                    }
                    if (e.key === "ArrowDown") {
                        if (currentFocusIndex === (focusableElements.length - 1)) {
                            focusableElements.item(0).focus();
                            e.preventDefault();
                            return;
                        }
                        else {
                            focusableElements.item(currentFocusIndex + 1).focus();
                            e.preventDefault();
                            return;
                        }
                    }
                }}>
                    {searchThroughProperties && propertySearchResults.map(prop => <li><Button className={classNames.suggestionButton} appearance="transparent"
                        key={prop}
                        onClick={() => {
                            const temp = input.split(searchThroughProperties ? " " : ":");
                            const lastWord = temp[temp.length - 1];
                            const newInput = input.replace(lastWord, prop + ":")
                            setInput(newInput)
                            setOpenSuggestions(false);
                            setSearchThroughProperties(false);
                            inputRef.current?.focus()
                        }}
                    >{prop}</Button></li>)}
                    {
                        !searchThroughProperties && propertySearchResults.map((r, index) => <li><Button className={classNames.suggestionButton} appearance="transparent" key={index}
                            onClick={() => {
                                const temp = input.split(searchThroughProperties ? " " : ":");
                                const lastWord = temp[temp.length - 1];
                                const newInput = input.replace(lastWord, r.replace(" ", "+").replace(" ", "+").replace(" ", "+").replace(" ", "+").replace(" ", "+"))
                                setInput(newInput)
                                setOpenSuggestions(false);
                                setSearchThroughProperties(true);
                                inputRef.current?.focus()
                                props.onSearch(newInput);
                            }}
                        >
                            {r}
                        </Button></li>)
                    }
                </ul>
            </div>
        </div>
    </div>
}