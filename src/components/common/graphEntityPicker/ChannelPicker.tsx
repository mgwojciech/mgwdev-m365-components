import * as React from "react";
import { IEntityWithIdAndDisplayName } from "../../../model/IEntityWithIdAndDisplayName";
import { AbstractGraphEntityPicker, IAbstractGraphEntityPickerProps } from "./AbstractGraphEntityPicker";
import { useGraph } from "../../../context";
import { IHttpClient } from "mgwdev-m365-helpers";

export interface IChannelPickerProps extends Partial<IAbstractGraphEntityPickerProps<IEntityWithIdAndDisplayName>> {
    teamId: string;
}

export function ChannelPicker(props: IChannelPickerProps) {
    const { graphClient } = useGraph();
    
    return <ChannelPickerStandalone {...props} graphClient={graphClient} />
}

export function ChannelPickerStandalone(props: IChannelPickerProps & { graphClient: IHttpClient}) {

    const loadChannels = async () => {
        const response = await props.graphClient.get(`/teams/${props.teamId}/channels?$select=id,displayName`);
        const result = await response.json();
        return result.value;
    }
    React.useEffect(() => {
        loadChannels();
    }, [props.teamId]);

    const getData = async (search: string) => {
        return await loadChannels();
    }

    return <AbstractGraphEntityPicker<IEntityWithIdAndDisplayName> additionalKey={`team-${props.teamId}-channels`} {...props} onDataRequested={getData} />
}