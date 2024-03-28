import * as React from "react";
import { useGraph } from "../../context";
import { GraphSearchPagedDataProvider, IAggregationRequest } from "mgwdev-m365-helpers";
import { Input, Spinner, makeStyles, shorthands, tokens } from "@fluentui/react-components";
import { Search20Regular } from "@fluentui/react-icons";
import { IGraphSearchResult } from "../../model";
import { defaultSelectFields } from "./SearchDefaults";
import { DefaultDocumentCard } from "./DefaultDocumentCard";

export interface IM365SearchProps<T> {
    onResultRendering?: (result: IGraphSearchResult<T>) => any;
    dataProviderProps?: {
        pageSize?: number;
        initialQuery?: string;
        entityType?: "message" | "event" | "driveItem" | "listItem" | "person" | "chatMessage" | "externalItem";
        queryTemplate?: string;
        selectFields?: string[];
        aggregations?: IAggregationRequest[]
    },
    searchInputComponent?: (props: { onSearch: (query: string) => void }) => JSX.Element;
}

const useSearchStyles = makeStyles({
    wrapper:{

    },
    searchInput:{

    },
    searchResults:{
        display: "flex",
        flexWrap: "wrap",
        flexDirection: "row",
        ...shorthands.gap(tokens.spacingHorizontalL, tokens.spacingVerticalL)
    },
})

export const M365Search = <T,>(props: IM365SearchProps<T>) => {
    const { graphClient } = useGraph();
    const classNames = useSearchStyles();
    const searchClient = React.useMemo(() => {
        var provider = new GraphSearchPagedDataProvider<IGraphSearchResult<T>>(graphClient,
            [props.dataProviderProps?.entityType ?? "listItem"],
            props.dataProviderProps?.selectFields || defaultSelectFields);
        provider.queryTemplate = props.dataProviderProps?.queryTemplate;
        provider.pageSize = props.dataProviderProps?.pageSize;
        provider.setRefiners(props.dataProviderProps?.aggregations);
        provider.setQuery(props.dataProviderProps?.initialQuery ?? "");
        return provider;
    }, [graphClient, props.dataProviderProps]);

    const [loading, setLoading] = React.useState<boolean>(true);
    const [query, setQuery] = React.useState<string>(props.dataProviderProps?.initialQuery ?? "");
    const [results, setResults] = React.useState<any[]>([]);
    const [error, setError] = React.useState<any>(undefined);

    React.useEffect(()=>{
        searchClient.setQuery(query);
        setLoading(true);
        searchClient.getData().then((data) => {
            setResults(data);
            setError(undefined);
        }).catch((error) => {
            setError(error.message);
        }).finally(() => {
            setLoading(false);
        });
    },[query])

    const renderSearchInput = () => {
        if(props?.searchInputComponent){
            return <props.searchInputComponent onSearch={(query) => { setQuery(query); }} />
        }
        return <Input contentBefore={<Search20Regular />} placeholder="Search" value={query} onChange={(e) => { setQuery(e.target.value); }} />
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
                        {props?.onResultRendering ? props.onResultRendering(result) : <DefaultDocumentCard document={result} />}
                    </div>
                })}
            </div>
        </div>
    );
}