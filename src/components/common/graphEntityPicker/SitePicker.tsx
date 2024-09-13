import * as React from "react";
import { AbstractGraphEntityPicker, IAbstractGraphEntityPickerProps } from "./AbstractGraphEntityPicker";
import { useGraph } from "../../../context";
import { IEntityWithIdAndDisplayName } from "../../../model/IEntityWithIdAndDisplayName";
import { GraphSearchPagedDataProvider, IHttpClient } from "mgwdev-m365-helpers";

export function SitePicker(props: Partial<IAbstractGraphEntityPickerProps<IEntityWithIdAndDisplayName>>) {
    const { graphClient } = useGraph();

    return <SitePickerStandalone {...props} graphClient={graphClient} />
}

export function SitePickerStandalone(props: Partial<IAbstractGraphEntityPickerProps<IEntityWithIdAndDisplayName>> & { graphClient: IHttpClient }) {
    const dataProvider = React.useRef(new GraphSearchPagedDataProvider<any>(props.graphClient,["site"], ["id", "displayName"]));
    const getData = async (search: string) => {
        dataProvider.current.setQuery(search || "*");
        const results = await dataProvider.current.getData();
        return results;
    }

    return <AbstractGraphEntityPicker<IEntityWithIdAndDisplayName> {...props} onDataRequested={getData} />
}