import { IDetailsListColumnConfiguration } from "../../model/IDetailsListColumnConfiguration";

export interface IDetailsListComponentProps {

    /**
     * Current items
     */
    items?: {[key:string]: any}[];

    /**
     * The columns configuration
     */
    columnsConfiguration?: IDetailsListColumnConfiguration[];

    /**
     * Show the file icon or not in the first column
     */
    showFileIcon?: boolean;

    /**
     * The field to use for the file extension ison display
     */
    fileExtensionField?: string;

    /**
     * The field to use to know if the item is a container
     */
    isContainerField?: string;

    /**
     * Enble the filtering on the columns
     */
    enableFiltering?: boolean;

    /**
     * If true, the details list shimers are displayed
     */
    showShimmers?: boolean;

    /**
     * If the details lsit should be compact
     */
    isCompact?: boolean;

    /**
     * The field to group by
     */
    groupBy?: string;

    /**
     * Show groups as collapsed by default if true. Expanded otherwise
     */
    groupsCollapsed?: boolean;

    /**
     * The Handlebars context to inject in columns content (ex: @root)
     */
    context?: any;

    /**
     * The isolated Handlebars namespace 
     */
    handlebars: typeof Handlebars;
    webPartId?: string;
}