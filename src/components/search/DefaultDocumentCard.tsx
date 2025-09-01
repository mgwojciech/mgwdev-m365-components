import * as React from "react";
import { IDocumentSearchResult, IGraphSearchResult } from "../../model";
import { useGraph } from "../../context";
import { ThumbnailUtils } from "../../utils";
import { Body1, Button, Caption1, Card, CardFooter, CardHeader, CardPreview, makeStyles, shorthands, tokens } from "@fluentui/react-components";
import { Open16Regular } from "@fluentui/react-icons"
import FileUtils from "../../utils/FileUtils";

export interface IDefaultDocumentCardProps {
    document: IGraphSearchResult<IDocumentSearchResult>
    onClick?: (document: IGraphSearchResult<IDocumentSearchResult>) => void;
}
const useStyles = makeStyles({
    title: {
        margin: "0,0, 12px",
    },

    description: {
        margin: "0,0, 12px",
    },

    card: {
        width: "20rem",
        maxWidth: "100%",
        height: "fit-content",
    },
    image: {
        width: "20rem!important",
        height: "7rem!important",
    },
    text: {
        margin: "0",
        lineBreak: "strict",
        whiteSpace: "nowrap",
        height: "1.5rem",
    },
    imageIconWrapper: {
        width: "20rem!important",
        height: "7rem!important",
        display: "flex!important",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: tokens.colorNeutralBackground3,
    },
    cardHeader: {

    }
});
export const DefaultDocumentCard = (props: IDefaultDocumentCardProps) => {
    const { graphClient } = useGraph();
    const styles = useStyles();
    const [thumbnail, setThumbnail] = React.useState<string | undefined>(undefined);

    React.useEffect(() => {
        ThumbnailUtils.getThumbnailImageFromGraph(props.document.fields, graphClient).then((thumbnail) => {
            setThumbnail(thumbnail);
        }).catch((error) => {
            console.error(error);
        });
    }, []);

    return <Card className={styles.card}>
        <CardPreview>
            {thumbnail ? <img
                src={thumbnail}
                alt={props.document.fields.title}
                className={styles.image}
            /> :
                <div className={styles.imageIconWrapper}>
                    <div><img
                        src={FileUtils.getFileImageUrl(props.document.fields.path)}
                        width="32px"
                        height="32px"
                        alt={props.document.fields.title}
                    />
                    </div>
                </div>}
        </CardPreview>

        <CardHeader
            className={styles.cardHeader}
            image={
                <img
                    src={FileUtils.getFileImageUrl(props.document.fields.path)}
                    width="32px"
                    height="32px"
                    alt={props.document.fields.title}
                />
            }
            header={
                <Body1>
                    <b style={{
                        lineBreak: "strict",
                        whiteSpace: "nowrap"
                    }}>{props.document.fields.title}</b>
                </Body1>
            }
            description={<Caption1 style={{
                lineBreak: "strict",
                whiteSpace: "nowrap"
            }}>{props.document.fields.author}</Caption1>}
            action={
                <Button
                    appearance="transparent"
                    // icon={<MoreHorizontal20Regular />}
                    aria-label="More options"
                />
            }
        />

        <p className={styles.text}>
            {props.document.fields.description}
        </p>

        <CardFooter>
            <Button as="a" href={props.document.fields.path} appearance="primary" icon={<Open16Regular />}>
                Open
            </Button>
            {/* <Button icon={<Share16Regular />}>Share</Button> */}
        </CardFooter>
    </Card>
}