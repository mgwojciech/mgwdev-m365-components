import * as React from "react";
import { useGraph, useSP } from "../context";

export interface ITestProps {

}

export function Test(props: ITestProps) {
    const { graphClient } = useGraph();
    const { spClient, siteUrl } = useSP();
    const [loading, setLoading] = React.useState<boolean>(true);
    const [user, setUser] = React.useState<any>(undefined);
    const [web, setWeb] = React.useState<any>(undefined);

    React.useEffect(() => {
        if (graphClient) {
            graphClient.get("https://graph.microsoft.com/v1.0/me").then((resp) => {
                resp.json().then((response) => {
                    setUser(response);
                    setLoading(false);
                });
            });
        }
        if (spClient) {
            spClient.get(`${siteUrl}/_api/web`,{
                headers: {
                    "Accept": "application/json;odata=nometadata"
                }
            
            }).then((resp) => {
                resp.json().then((response) => {
                    setWeb(response);
                    setLoading(false);
                });
            });

        }
    }, [graphClient]);

    if (loading) {
        return <div>Loading...</div>;
    }

    return <div>
        <div>{user?.displayName}</div>
        <div>{web?.Title}</div>
    </div>
}