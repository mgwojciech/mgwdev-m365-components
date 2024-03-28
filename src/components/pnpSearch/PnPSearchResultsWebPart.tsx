import * as React from "react";
import { IPnPSearchResultProps } from "./model/IPnPSearchResultsProps";
import { SPSearchDataProvider } from "mgwdev-m365-helpers/lib/dal/dataProviders/SPSearchDataProvider";
import { useGraph, useSP } from "../../context";
import { TemplateService } from "./services/TemplateService";
import Handlebars from "handlebars";
import { TableCellLayout, Spinner, Table, TableHeader, TableRow, TableHeaderCell, Button, TableBody, TableCell, makeStyles, shorthands, tokens } from "@fluentui/react-components";
import { TextSortAscending16Filled, TextSortDescending16Filled, TextSortAscending16Regular } from "@fluentui/react-icons";
import { IDetailsListColumnConfiguration } from "./model/IDetailsListColumnConfiguration";
import { DetailsListComponent, DetailsListWebComponent } from "./components/detailsList/DetailsListComponent";
import { DocumentCardWebComponent } from "./components/documentCard/DocumentCardComponent";
import { PnPContext, PnPWebPartContext } from "./PnPContext";

export interface IPnPSearchResultsWebPartProps {
    config: IPnPSearchResultProps;
    id: string;
}

const usePnPSearchStyles = makeStyles({
    root: {
        "& .template--cardContainer": {
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            ...shorthands.gap(tokens.spacingHorizontalM, tokens.spacingVerticalM)
        },
    }
});

export function PnPSearchResultsWebPart(props: IPnPSearchResultsWebPartProps) {
    const { graphClient } = useGraph();
    const { spClient, siteUrl } = useSP();
    const classNames = usePnPSearchStyles();

    const [loading, setIsLoading] = React.useState(true);
    const [items, setItems] = React.useState<any[]>([]);
    const [error, setError] = React.useState<string>("");
    const [sortField, setSortField] = React.useState<string>(props.config.sortList[0].sortField);
    const [sortDir, setSortDir] = React.useState<"ASC" | "DESC">(props.config.sortList[0].sortDirection === 0 ? "ASC" : "DESC");
    const [template, setTemplate] = React.useState<any>();
    const searchClient: SPSearchDataProvider<any> = React.useMemo(() => {
        //for now I assume there is only SP search
        var client = new SPSearchDataProvider(`${siteUrl}/_api/search/postquery`,
            spClient,
            props.config.selectedProperties.split(","),
            props.config.queryTemplate);
        client.pageSize = props.config.paging.itemsCountPerPage;
        client.setQuery(props.config.defaultSearchQuery || "*");
        client.setOrder(props.config.sortList[0].sortField, props.config.sortList[0].sortDirection === 0 ? "ASC" : "DESC");

        return client;
    }, [spClient, graphClient, siteUrl, props.config]);

    const templateService = React.useMemo(() => new TemplateService(), []);

    const loadTemplate = async () => {
        const resultTemplate = await import("./templates/results/cards.html?raw");
        const templateString = resultTemplate.default;

        setTemplate(templateString);
    }

    React.useEffect(() => {
        PnPContext.webPartContext.set(props.id, new PnPWebPartContext(graphClient, searchClient));
        templateService.registerCustomHelpers();
        templateService.registerCustomComponent("pnp-detailslist", DetailsListWebComponent);
        templateService.registerCustomComponent("pnp-documentcard", DocumentCardWebComponent);
        loadTemplate();
        searchClient.getData().then((data) => {
            setItems(data);
            setIsLoading(false);
        }).catch((e) => {
            if (e.message) {
                setError(e.message);
            }
            else {
                setError(e);
            }
            setIsLoading(false);
        });
    }, []);

    const compile = () => {
        const temp = Handlebars.compile(template);
        return temp({
            data: { items: items },
            properties: {
                layoutProperties: props.config.templateParameters
            }
        })
    }

    return <div className={classNames.root} data-webPartId={props.id}>
        <h2>{props.config.webPartTitle}</h2>
        {loading && <Spinner />}
        {error && <div>{error}</div>}
        {!loading && !error && template && <div dangerouslySetInnerHTML={{
            __html: compile()
        }} />}
    </div>
}