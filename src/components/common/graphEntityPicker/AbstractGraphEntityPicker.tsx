import { Combobox, Field, ProgressBar, Option } from "@fluentui/react-components";
import { DebounceHandler } from "mgwdev-m365-helpers/lib/utils/DebounceHandler";
import * as React from "react";
import { IEntityWithIdAndDisplayName } from "../../../model/IEntityWithIdAndDisplayName";

export interface IAbstractGraphEntityPickerProps<T> {
    onDataRequested: (searchText: string) => Promise<T[]>;
    value?: T[];
    label?: string;
    description?: string;
    multiSelect?: boolean;
    disabled?: boolean;
    additionalKey?: string;
    onEntitySelected?: (entities: T[]) => void;
    size?: "small" | "medium" | "large",
    onSuggestionRendering?: (entity: T) => React.ReactNode;
    renderOverride?: (entities: T[], isLoading: boolean, loadData: (query?: string) => Promise<void>) => React.ReactNode;
}


export function AbstractGraphEntityPicker<T extends IEntityWithIdAndDisplayName>(props: IAbstractGraphEntityPickerProps<T>) {
    const [entities, setEntities] = React.useState<T[]>(props.value || []);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [inputValue, setInputValue] = React.useState<string>("");
    const [selectedEntities, setSelectedEntities] = React.useState<T[]>(props.value || []);


    const loadEntities = (searchText?: string) => {
        return DebounceHandler.debounce(`entityPicker-${props.additionalKey}`, async () => {
            setIsLoading(true);
            try {
                const queriedEntities = await props.onDataRequested(searchText);
                //get distinct entities
                setEntities([...queriedEntities, ...selectedEntities].reduce((acc, current) => {
                    const x = acc.find(item => item.id === current.id);
                    if (!x) {
                        return acc.concat([current]);
                    } else {
                        return acc;
                    }
                }, []));
                setIsLoading(false);
            }
            catch (e) {
                console.error(e);
                setIsLoading(false);
            }
        }, 500);
    }

    React.useEffect(() => {
        loadEntities(inputValue);
    }, [inputValue])
    
    if (props.renderOverride) {
        return props.renderOverride(entities, isLoading, loadEntities);
    }

    return <Field label={props.label} hint={props.description}>
        <Combobox value={inputValue}
            multiselect={props.multiSelect}
            freeform
            onChange={(e) => {
                setInputValue(e.target.value);
            }}
            size={props.size}
            disabled={props.disabled}
            onOptionSelect={(e, data) => {
                let newSelected = [];
                const selectedEntity = entities.find(x => x.id === data.optionValue);
                if (selectedEntities.some((x) => x.id === data.optionValue)) {
                    newSelected = selectedEntities.filter((x) => x.id !== data.optionValue);
                }
                else if (props.multiSelect) {
                    newSelected = [...selectedEntities, selectedEntity];
                }
                else {
                    newSelected = [selectedEntity];
                }
                newSelected = newSelected.filter((x) => !!x);
                props.onEntitySelected && props.onEntitySelected(newSelected);
                setSelectedEntities(newSelected);
                setInputValue(newSelected.map((x) => x.displayName).join(", "))
            }}
            defaultSelectedOptions={selectedEntities.map((x) => x.id)}
        >
            {entities.map((x) => <Option
                key={encodeURIComponent(x.id)}
                text={x.displayName}
                value={x.id}>{props.onSuggestionRendering ? props.onSuggestionRendering(x) : x.displayName}</Option>)}
        </Combobox>
        {isLoading && <ProgressBar />}
    </Field>
}