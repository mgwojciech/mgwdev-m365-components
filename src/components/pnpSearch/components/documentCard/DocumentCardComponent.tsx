import * as React from "react";
import * as ReactDOM from "react-dom";
import { IDocumentCardComponentProps } from "./IDocumentCardComponentProps";
import { BaseWebComponent } from "../detailsList/BaseWebComponent";
import { Card, CardFooter, CardHeader, CardPreview, Image, Link, Text, tokens } from "@fluentui/react-components";
import { ImageHelper } from "mgwdev-m365-helpers/lib/utils/ImageHelper";
import { useGraph } from "../../../../context";
import { PnPContext } from "../../PnPContext";
import FileUtils from "../../../../utils/FileUtils";
import { GraphPersona } from "../../../common/GraphPersona";
import { TimeZoneService } from "../../services/TimeZoneService";

export function DocumentCardComponent(props: IDocumentCardComponentProps) {
    const graphClient = PnPContext.webPartContext.get(props.webPartId)?.graphClient;
    const [imageUrl, setImageUrl] = React.useState<string>("");
    React.useEffect(() => {
        ImageHelper.getThumbnailImageFromPreviewUrlWithGraph(graphClient, props.item["PictureThumbnailURL"], "medium").then((url) => {
            setImageUrl(url);
        }).catch((e) => {
            setImageUrl(props.item["SiteLogoUrl"])
            console.error(e);
        });
    }, []);

    return <Card style={{
        width: "320px"
    }} >
        <CardPreview
            logo={<Image src={FileUtils.getFileImageUrl(props.item["Path"])} alt="logo" />}
        >
            {imageUrl ? <Image style={{
                height: "196px"
            }} src={imageUrl} alt={props.item["Title"]} />
                : <div style={{
                    height: "196px",
                    backgroundColor: tokens.colorNeutralBackground2
                }}></div>}
        </CardPreview>
        <CardHeader
            header={<Link href={props.item["Path"]}>{props.item["Filename"]}</Link>}
            description={<Link href={props.item["SPSiteUrl"]}>{props.item["SiteTitle"]}</Link>}
        >
        </CardHeader>
        <CardFooter>
            <GraphPersona size="small" showSecondaryText graphClient={graphClient} id={props.item["EditorOWSUSER"]?.split("|")[0]} secondaryText={TimeZoneService.converToLocalZone(props.item["Created"]).toLocaleDateString()} />
        </CardFooter>
    </Card>
}

export class DocumentCardWebComponent extends BaseWebComponent {
    constructor() {
        super();
    }
    public connectedCallback() {
        const props = this.resolveAttributes();
        const element = <DocumentCardComponent {...props} />;
        ReactDOM.render(element, this);
    }
}