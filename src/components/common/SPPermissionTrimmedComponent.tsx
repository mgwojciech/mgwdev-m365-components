import * as React from "react";
import { useSP } from "../../context";
import { IHttpClient, PermissionCheckService, permissionKind } from "mgwdev-m365-helpers";
import { ConditionalRenderComponent } from "./ConditionalRenderComponent";

export interface ISPPermissionTrimmedComponentProps extends React.PropsWithChildren {
    role: string;
    placeholder?: JSX.Element | string
}

export function SPPermissionTrimmedComponent(props: ISPPermissionTrimmedComponentProps) {
    const { spClient, siteUrl } = useSP();

    return <SPPermissionTrimmedComponentStandalone {...props} siteUrl={siteUrl} spClient={spClient} />
}

export function SPPermissionTrimmedComponentStandalone(props: ISPPermissionTrimmedComponentProps & { spClient: IHttpClient, siteUrl: string }) {
    return <ConditionalRenderComponent key={`${props.role}-${props.siteUrl}`} placeholder={props.placeholder} permissionCheck={async () => {
        var url = `${props.siteUrl}/_api/web/EffectiveBasePermissions`
        var effectivePermMaskResp = await props.spClient.get(url, {
            headers: {
                accept: "application/json"
            }
        });
        var effectivePermMask = await effectivePermMaskResp.json();
        var permissions = [];
        for (var permLevelName in permissionKind) {
            var hasPermissionLevel = PermissionCheckService.hasPermission(effectivePermMask, permissionKind[permLevelName]);
            if (hasPermissionLevel) {
                permissions.push(permLevelName)
            }
        }
        return permissions.indexOf(props.role) >= 0;
    }} >{props.children}</ConditionalRenderComponent>
}