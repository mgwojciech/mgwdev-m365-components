import * as React from "react";
import { AbstractGraphEntityPicker, IAbstractGraphEntityPickerProps } from "./AbstractGraphEntityPicker";
import { useGraph } from "../../../context";
import { IEntityWithIdAndDisplayName } from "../../../model/IEntityWithIdAndDisplayName";
import { IHttpClient } from "mgwdev-m365-helpers";

export function TeamPicker(props: Partial<IAbstractGraphEntityPickerProps<IEntityWithIdAndDisplayName>>) {
    const { graphClient } = useGraph();

    return <TeamPickerStandalone {...props} graphClient={graphClient} />
}

export function TeamPickerStandalone(props: Partial<IAbstractGraphEntityPickerProps<IEntityWithIdAndDisplayName>> & { graphClient: IHttpClient }) {
    const getData = async (search: string) => {
        let api = `/teams?$select=id,displayName&$top=8`;
        if (search) {
            api += `&$filter=startswith(displayName, '${search}')`;
        }
        const response = await props.graphClient.get(api);
        const result = await response.json();
        return result.value;
    }

    return <AbstractGraphEntityPicker<IEntityWithIdAndDisplayName> additionalKey="team-site-picker" {...props} onDataRequested={getData} />
}