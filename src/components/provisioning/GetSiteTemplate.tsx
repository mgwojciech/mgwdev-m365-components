import { Button } from "@fluentui/react-components";
import * as React from "react";
import { useSP } from "../../context";
import { TemplateProvider } from "mgwdev-m365-helpers/lib/services/provisioning/TemplateProvider";

export interface IGetSiteTemplateProps {
    siteUrl: string;
}

export function GetSiteTemplate(props: IGetSiteTemplateProps) {
    const [template, setTemplate] = React.useState<any>(undefined);
    const [progress, setProgress] = React.useState<number>(0);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [stage, setStage] = React.useState<string>("");
    const { spClient, siteUrl } = useSP();
    const provider = React.useRef(new TemplateProvider(spClient, siteUrl));
    provider.current.onProgress = (message: string, percent: number) => {
        setProgress(percent);
        setStage(message);
    }

    return (
        <div>
            <Button appearance="primary" onClick={() => {
                setLoading(true);
                setProgress(0);
                setStage("Lists");
                provider.current.getSiteTemplate().then((template) => {
                    setTemplate(template);
                    setLoading(false);;
                });
            }} >Get template</Button>
            <Button disabled={!template} appearance="primary" onClick={() => {
                var blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = "template.json";
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);

            }} >Download Template</Button>
        </div>
    );
}

export function GetSiteTemplateContext() {
    const { siteUrl } = useSP();
    return <GetSiteTemplate siteUrl={siteUrl} />
}