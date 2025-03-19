import { IHttpClient } from "mgwdev-m365-helpers";
import * as React from "react";
import { ConditionalRenderComponent } from "./ConditionalRenderComponent";
import { useGraph } from "../../context";

export interface IGraphGroupMembershipTrimmedComponentProps extends React.PropsWithChildren {
    groupId: string;
    placeholder?: JSX.Element | string
}

export function GraphGroupMembershipTrimmedComponentStandalone(props: IGraphGroupMembershipTrimmedComponentProps & { graphClient: IHttpClient }) {

    return <ConditionalRenderComponent key={props.groupId} placeholder={props.placeholder} permissionCheck={async () => {
        const url = `/me/transitiveMemberOf/${props.groupId}?$select=id`;
        const resp = await props.graphClient.get(url);
        return resp.ok;
    }}>{props.children}</ConditionalRenderComponent>
}

export function GraphGroupMembershipTrimmedComponent(props: IGraphGroupMembershipTrimmedComponentProps) {
    const { graphClient } = useGraph();
    return <GraphGroupMembershipTrimmedComponentStandalone {...props} graphClient={graphClient} />
}