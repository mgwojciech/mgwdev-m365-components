import * as React from "react";
import { AbstractGraphEntityPicker, IAbstractGraphEntityPickerProps } from "./AbstractGraphEntityPicker";
import { useGraph } from "../../../context";
import { IEntityWithIdAndDisplayName } from "../../../model/IEntityWithIdAndDisplayName";
import { IHttpClient } from "mgwdev-m365-helpers";

export function ListPickerPicker(props: Partial<IAbstractGraphEntityPickerProps<IEntityWithIdAndDisplayName>> & { siteId: string }) {
    const { graphClient } = useGraph();

    return <ListPickerStandalone {...props} graphClient={graphClient} siteId={props.siteId} />
}

export function ListPickerStandalone(props: Partial<IAbstractGraphEntityPickerProps<IEntityWithIdAndDisplayName>> & { graphClient: IHttpClient, siteId: string }) {
    const getData = async (search: string) => {
        let api = `/sites/${props.siteId}/lists?$select=id,name`
        if (search) {
            api += `&$filter=startswith(name, '${search}')`;
        }
        const response = await props.graphClient.get(api);
        const result = await response.json();
        return result.value.map(x => ({ id: x.id, displayName: x.name }));
    }

    return <AbstractGraphEntityPicker<IEntityWithIdAndDisplayName> additionalKey={`list-picker-${props.siteId}`} {...props} onDataRequested={getData} />
}