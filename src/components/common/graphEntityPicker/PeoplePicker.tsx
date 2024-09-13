import * as React from "react";
import { AbstractGraphEntityPicker, IAbstractGraphEntityPickerProps } from "./AbstractGraphEntityPicker";
import { useGraph } from "../../../context";
import { IEntityWithIdAndDisplayName } from "../../../model/IEntityWithIdAndDisplayName";
import { IHttpClient, IUser, PeopleProvider } from "mgwdev-m365-helpers";
import { GraphPersona } from "../GraphPersona";

export function PeoplePicker(props: Partial<IAbstractGraphEntityPickerProps<IEntityWithIdAndDisplayName>>) {
    const { graphClient } = useGraph();
    return <PeoplePickerStandalone {...props} graphClient={graphClient} />
}

export function PeoplePickerStandalone(props: Partial<IAbstractGraphEntityPickerProps<IEntityWithIdAndDisplayName>> & { graphClient: IHttpClient }) {
    const peopleProvider = new PeopleProvider(props.graphClient, true, true);

    const getData = async (search: string) => {
        peopleProvider.setQuery(search);
        return await peopleProvider.getData();
    }

    return <AbstractGraphEntityPicker<IEntityWithIdAndDisplayName> {...props}
        additionalKey="people-picker"
        onDataRequested={getData}
        onSuggestionRendering={(user: IUser) => {
            if (user.photo) {
                user.photo = `data:image/png;base64,${user.photo.replace('"', "").replace('"', "")}`
            }
            return <GraphPersona showPresence user={user} graphClient={props.graphClient} />
        }}
    />
}
