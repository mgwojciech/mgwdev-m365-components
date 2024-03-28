import { IComponentFieldsConfiguration } from "../../model/IComponentFieldsConfiguration";

export interface IDocumentCardComponentProps {

    // Item context
    item?: {[key:string]: any};

    // Fields configuration object
    fieldsConfiguration?: IComponentFieldsConfiguration[];

    // Individual content properties (i.e web component attributes)
    title?: string;
    location?: string;
    tags?: string;
    href?: string;
    previewImage?: string;
    date?: string;
    profileImage?: string;
    previewUrl?: string;
    author?: string;
    fileExtension?: string;
    isContainer?: string;

    // Behavior properties
    enablePreview?: boolean;
    showFileIcon?: boolean;
    isCompact?: boolean;

    /**
     * The Handlebars context to inject in slide content (ex: @root)
     */
    context?: string;
    webPartId?: string;
}