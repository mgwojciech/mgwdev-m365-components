import * as React from "react";
import { useGraph } from "../../context";
import { DebounceHandler } from "mgwdev-m365-helpers";
import { CopilotRetrievalDataProvider } from "mgwdev-m365-helpers/lib/dal/dataProviders/CopilotRetrievalDataProvider"
import { Input, Spinner, makeStyles, shorthands, tokens } from "@fluentui/react-components";
import { Search20Regular } from "@fluentui/react-icons";
import { IGraphSearchResult } from "../../model";
import { defaultSelectFields } from "./SearchDefaults";
import { DefaultDocumentCard } from "./DefaultDocumentCard";

export interface IM365CopilotSearchProps<T> {
    onResultRendering?: (result: IGraphSearchResult<T>) => any;
    dataProviderProps?: {
        pageSize?: number;
        initialQuery?: string;
        queryTemplate?: string;
        selectFields?: string[];
    },
    searchInputComponent?: (props: { onSearch: (query: string) => void }) => JSX.Element;
}

const useSearchStyles = makeStyles({
    wrapper: {

    },
    searchInput: {

    },
    searchResults: {
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "row",
        ...shorthands.gap(tokens.spacingHorizontalL, tokens.spacingVerticalL)
    },
})

export const M365CopilotSearch = <T,>(props: IM365CopilotSearchProps<T>) => {
    const { graphClient } = useGraph();
    const classNames = useSearchStyles();
    const searchClient = React.useMemo(() => {
        var provider = new CopilotRetrievalDataProvider<T>(graphClient,
            "sharePoint",
            props.dataProviderProps?.selectFields || defaultSelectFields,
            props.dataProviderProps?.queryTemplate
        );
        return provider;
    }, [graphClient, props.dataProviderProps]);

    const [loading, setLoading] = React.useState<boolean>(true);
    const [query, setQuery] = React.useState<string>(props.dataProviderProps?.initialQuery ?? "");
    const [results, setResults] = React.useState<any[]>([]);
    const [error, setError] = React.useState<any>(undefined);

    React.useEffect(() => {
        DebounceHandler.debounce("copilot-search", async () => {
            setLoading(true);
            searchClient.getData(query).then((data) => {
                setResults(data);
                setError(undefined);
            }).catch((error) => {
                setError(error.message);
            }).finally(() => {
                setLoading(false);
            });
        }, 1000);
    }, [query])

    const renderSearchInput = () => {
        if (props?.searchInputComponent) {
            return <props.searchInputComponent onSearch={(query) => { setQuery(query); }} />
        }
        return <Input style={{
            width: "500px"
        }} contentBefore={<Search20Regular />} placeholder="Search" value={query} onChange={(e) => { setQuery(e.target.value); }} />
    }

    return (
        <div>
            <div>
                {renderSearchInput()}
            </div>
            <div>
                {loading && <Spinner label="Loading..." />}
                {!loading && error && <div>Error: {error}</div>}
            </div>
            <div className={classNames.searchResults}>
                {results.map((result, index) => {
                    return <div key={index}>
                        {props?.onResultRendering ? props.onResultRendering(result) : <DefaultDocumentCard document={{
                            fields: result.resourceMetadata,
                            ...result
                        }} />}
                    </div>
                })}
            </div>
        </div>
    );
}