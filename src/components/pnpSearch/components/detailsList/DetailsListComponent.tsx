import * as React from "react";
import * as ReactDOM from "react-dom";
import { IDetailsListComponentProps } from "./IDetailsListComponentProps";
import { BaseWebComponent } from "./BaseWebComponent";
import { TableCellLayout, Spinner, Table, TableHeader, TableRow, TableHeaderCell, Button, TableBody, TableCell } from "@fluentui/react-components";
import { TextSortAscending16Filled, TextSortDescending16Filled, TextSortAscending16Regular } from "@fluentui/react-icons";
import Handlebars from "handlebars";
import { IDetailsListColumnConfiguration } from "../../model/IDetailsListColumnConfiguration";

export function DetailsListComponent(props: IDetailsListComponentProps) {
    const [sortField, setSortField] = React.useState<string>("");
    const [sortDir, setSortDir] = React.useState<"ASC" | "DESC">("ASC");
    const getHeaderIcon = (fieldName: any) => {
        if (sortField === fieldName) {
            if (sortDir === "ASC") {
                return <TextSortAscending16Filled />
            }
            return <TextSortDescending16Filled />
        }
        return <TextSortAscending16Regular />
    }
    const renderCell = (item: any, field: IDetailsListColumnConfiguration) => {
        //{{getSummary HitHighlightedSummary}}
        let exprValue: string = item[field.name];
        if (field.useHandlebarsExpr) {
            // Create a temp context with the current so we can use global registered helper on the current item
            const tempTemplateContent = `{{#with item as |item|}}${field.value}{{/with}}`;
            let template = Handlebars.compile(tempTemplateContent);

            // Pass the current item as context
            exprValue = template(
                {
                    item: item
                },
                {
                    data: {
                        root: {
                        }
                    }
                }
            );
            exprValue = exprValue ? exprValue.trim() : null;
        }
        return <TableCellLayout>
            <div dangerouslySetInnerHTML={{
                __html: exprValue
            }}></div>
        </TableCellLayout>
    }
    return <div>
        <Table as="div">
            <TableHeader>
                <TableRow>
                    {props.columnsConfiguration.map(field => {
                        return <TableHeaderCell>{field.name} {field.enableSorting && <Button appearance="transparent"
                            title="Sort"
                            onClick={() => {
                                let newSort = sortDir;
                                if (sortField === field.name) {
                                    if (sortDir === "ASC") {
                                        newSort = "DESC";
                                    } else {
                                        newSort = "ASC";
                                    }
                                } else {
                                    newSort = "ASC";
                                }
                                setSortField(field.name);
                                setSortDir(newSort);
                                // searchClient.setOrder(field.name, sortDir);
                                // searchClient.getData().then((data) => {
                                //     setItems(data);
                                //     setIsLoading(false);
                                // }).catch((e) => {
                                //     if (e.message) {
                                //         setError(e.message);
                                //     }
                                //     else {
                                //         setError(e);
                                //     }
                                //     setIsLoading(false);
                                // });
                            }}
                            icon={getHeaderIcon(field.name)} />}</TableHeaderCell>
                    })}
                </TableRow>
            </TableHeader>
            <TableBody>
                {props.items.map((item, index) => {
                    return <TableRow key={index}>
                        {props.columnsConfiguration.map(field => {
                            return <TableCell
                                width={field.name === "DocIcon" ? "40px" : undefined}
                            >{renderCell(item, field)}</TableCell>;
                        })}
                    </TableRow>
                })}
            </TableBody>
        </Table>
        {/* <ListPagination currentPage={searchClient.getCurrentPage()} onPageChanged={(page => {
    searchClient.jumpToAPage(page).then((data) => {
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
})} totalPages={searchClient.allItemsCount} /> */}
    </div>
}

export class DetailsListWebComponent extends BaseWebComponent {

    public constructor() {
        super();
    }

    public connectedCallback() {

        let props = this.resolveAttributes();

        const detailsListComponent = <DetailsListComponent {...props} handlebars={Handlebars} />;
        ReactDOM.render(detailsListComponent, this);
    }
}