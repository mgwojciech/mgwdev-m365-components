import { IHttpClient } from "mgwdev-m365-helpers";
import * as React from "react";
import { AbstractGraphEntityPicker, IAbstractGraphEntityPickerProps, IEntityWithIdAndDisplayName } from "../..";
import { useDataverse } from "../../context/DataverseContext"


export interface DataverseItemPickerProps extends Partial<IAbstractGraphEntityPickerProps<IEntityWithIdAndDisplayName>> {
    tableName: string;
    idColumnName: string;
    displayNameColumnName: string;
}

export function DataverseItemPicker(props: DataverseItemPickerProps) {
    const { dataverseClient, dataverseResource } = useDataverse();

    return <DataverseItemPickerStandalone
        {...props}
        dataverseClient={dataverseClient}
        dataverseResource={dataverseResource}
    />;
}

export function DataverseItemPickerStandalone(props: DataverseItemPickerProps & { dataverseClient: IHttpClient, dataverseResource: string }) {
    const getData = async (search: string) => {
        let api = `${props.dataverseResource}/api/data/v9.1/${props.tableName}?$select=${props.idColumnName},${props.displayNameColumnName}`;
        if (search) {
            api += `&$filter=contains(${props.displayNameColumnName},'${search}')`;
        }
        const response = await props.dataverseClient.get(api);
        const result = await response.json();
        return result.value.map((x: any) => ({ id: x[props.idColumnName], displayName: x[props.displayNameColumnName] }));
    }
    return <AbstractGraphEntityPicker
        additionalKey={`dataverse-${props.tableName}`}
        {...props}
        onDataRequested={getData}
    />;
}