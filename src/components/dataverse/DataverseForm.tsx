import * as React from "react";
import {
    Button,
    Field,
    makeStyles,
    mergeClasses,
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    Spinner,
    tokens,
} from "@fluentui/react-components";
import { IHttpClient } from "mgwdev-m365-helpers";
import { useDataverse } from "../../context";
import {
    IDataverseEntityDefinition,
    IDataverseFormField,
    IDataverseLookupValue,
} from "../../model/DataverseFormField";
import { DataverseEntityMetadataService } from "../../services/dataverse/DataverseEntityMetadataService";
import { DataverseRecordService } from "../../services/dataverse/DataverseRecordService";
import { ComposedFormFieldRenderer } from "./fieldRenderers/ComposedFormFieldRenderer";
import { IFormFieldRenderer } from "./fieldRenderers/IFormFieldRenderer";

const LOOKUP_TYPES = new Set(["Lookup", "Customer", "Owner"]);

export interface IDataverseFormProps {
    entityName: string;
    itemId?: string;
    fieldsToRender?: string[];
    customFieldRenderers?: IFormFieldRenderer[];
    definition?: IDataverseEntityDefinition;
    classNames?: {
        root?: string;
        loadingWrapper?: string;
        fieldsContainer?: string;
        fieldWrapper?: string;
        submitButtonWrapper?: string;
        submitButton?: string;
    }
    submitButtonText?: string;
    hideSubmitButton?: boolean;
    disabled?: boolean;
    onItemUpdating?: (
        payload: Record<string, unknown>,
        isCreate: boolean,
        values: Record<string, unknown>
    ) => Record<string, unknown> | Promise<Record<string, unknown>>;
    onItemUpdated?: (item: Record<string, unknown>, isCreate: boolean) => void;
    onError?: (error: Error) => void;
}

const useDataverseFormStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
        justifyContent: "space-between",
    },
    loadingWrapper: {
        display: "flex",
        justifyContent: "center",
        padding: tokens.spacingVerticalL,
    },
    fieldWrapper: {
        display: "flex",
        flexDirection: "column",
    },
    fieldsContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        gap: tokens.spacingVerticalM,
        backgroundColor: tokens.colorNeutralBackground2,
        padding: tokens.spacingVerticalM,

    },
    submitButtonWrapper:{
        display: "flex",
        justifyContent: "flex-end",
    },
    submitButton:{
    }
});

export function DataverseForm(props: IDataverseFormProps) {
    const { dataverseClient, dataverseResource } = useDataverse();
    return (
        <DataverseFormStandalone
            {...props}
            dataverseClient={dataverseClient}
            dataverseEnv={dataverseResource}
        />
    );
}

export function DataverseFormStandalone(
    props: IDataverseFormProps & { dataverseClient: IHttpClient; dataverseEnv: string }
) {
    const classNames = useDataverseFormStyles();
    const metadataService = React.useMemo(
        () => new DataverseEntityMetadataService(props.dataverseClient, props.dataverseEnv),
        [props.dataverseClient, props.dataverseEnv]
    );
    const renderer = React.useMemo(() => {
        const temp = new ComposedFormFieldRenderer(props.dataverseClient, props.dataverseEnv);
        if (props.customFieldRenderers) {
            for (const customRenderer of props.customFieldRenderers) {
                temp.registerRenderer(customRenderer);
            }
        }
        return temp;
    }, [props.dataverseClient, props.dataverseEnv, props.customFieldRenderers]);

    const [entityDefinition, setEntityDefinition] = React.useState<IDataverseEntityDefinition>();
    const [resolvedFields, setResolvedFields] = React.useState<IDataverseFormField[]>([]);
    const [values, setValues] = React.useState<Record<string, unknown>>({});
    const [loading, setLoading] = React.useState(true);
    const [submitting, setSubmitting] = React.useState(false);
    const [error, setError] = React.useState<Error | undefined>();

    const isCreate = React.useMemo(() => !props.itemId, [props.itemId]);

    const loadEntityDefinition = async () => {
        const definition = props.definition ?? await metadataService.getEntityDefinition(props.entityName, props.fieldsToRender);
        console.log(definition);
        const fields = props.fieldsToRender
            ? props.fieldsToRender
                .map((name) => definition.fields.find((f) => f.logicalName === name.toLocaleLowerCase()))
                .filter((f): f is IDataverseFormField => !!f)
            : definition.fields.filter(
                (f) =>
                    f.logicalName !== definition.primaryIdAttribute &&
                    f.attributeType !== "Uniqueidentifier" &&
                    f.attributeType !== "Virtual" &&
                    (f.attributeType === "State" ||
                        f.attributeType === "Status" ||
                        !f.isReadOnly)
            );
        let initialValues: Record<string, unknown> = {};
        if (props.itemId) {
            const selects: string[] = [];
            const expands: string[] = [];
            const lookupSummaries = new Map<string, string>();
            for (const field of fields) {
                if (LOOKUP_TYPES.has(field.attributeType)) {
                    const target = field.targets?.[0];
                    if (target) {
                        lookupSummaries.set(field.logicalName, target);
                        expands.push(`${field.schemaName}($select=${field.targetLookupInfo?.primaryIdAttribute},${field.targetLookupInfo?.primaryNameAttribute})`);
                    }
                } else {
                    selects.push(field.logicalName);
                }
            }
            const recordService = new DataverseRecordService(
                props.dataverseClient,
                props.dataverseEnv,
                definition.entitySetName
            );
            const record = await recordService.getRecord(
                props.itemId,
                selects.join(","),
                expands.join(",")
            );
            for (const field of fields) {
                if (LOOKUP_TYPES.has(field.attributeType)) {
                    const targetEntity = lookupSummaries.get(field.logicalName);
                    const navValue = record[field.schemaName];
                    if (navValue && targetEntity) {
                        const summary = field.targetLookupInfo;
                        const lookupValue: IDataverseLookupValue = {
                            id: navValue[summary.primaryIdAttribute],
                            displayName: navValue[summary.primaryNameAttribute],
                            entityLogicalName: targetEntity,
                        };
                        initialValues[field.logicalName] = lookupValue;
                    }
                } else {
                    initialValues[field.logicalName] = record[field.logicalName];
                }
            }
        }

        setEntityDefinition(definition);
        setResolvedFields(fields);
        setValues(initialValues);
    }


    React.useEffect(() => {
        loadEntityDefinition().catch((e) => setError(e as Error)).finally(() => setLoading(false));
        return () => {
        };
    }, [props.entityName, props.itemId, props.fieldsToRender]);

    const buildPayload = React.useCallback(async () => {
        const payload: Record<string, unknown> = {};
        for (const field of resolvedFields) {
            if (field.isReadOnly) {
                continue;
            }
            const value = values[field.logicalName];
            if (LOOKUP_TYPES.has(field.attributeType)) {
                const lookupValue = value as IDataverseLookupValue | undefined;
                if (lookupValue?.id && lookupValue.entityLogicalName) {
                    const summary = field.targetLookupInfo;
                    payload[`${field.schemaName}@odata.bind`] = `/${summary?.entitySetName}(${lookupValue.id})`;
                }
            } else if (value !== undefined) {
                payload[field.logicalName] = value;
            }
        }
        return payload;
    }, [resolvedFields, values, metadataService]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!entityDefinition) {
            return;
        }
        setSubmitting(true);
        setError(undefined);
        try {
            let payload = await buildPayload();
            if (props.onItemUpdating) {
                payload = await props.onItemUpdating(payload, isCreate, values);
            }
            const recordService = new DataverseRecordService(
                props.dataverseClient,
                props.dataverseEnv,
                entityDefinition.entitySetName
            );
            const result = isCreate
                ? await recordService.createRecord(payload)
                : await recordService.updateRecord(props.itemId!, payload);
            props.onItemUpdated?.(result, isCreate);
        } catch (e) {
            const err = e as Error;
            setError(err);
            props.onError?.(err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form className={mergeClasses(classNames.root, props.classNames?.root)} onSubmit={handleSubmit}>
            {loading && (
                <div className={mergeClasses(classNames.loadingWrapper, props.classNames?.loadingWrapper)}>
                    <Spinner label="Loading form..." />
                </div>
            )}
            {error && (
                <MessageBar intent="error">
                    <MessageBarBody>
                        <MessageBarTitle>Error</MessageBarTitle>
                        {error.message}
                    </MessageBarBody>
                </MessageBar>
            )}
            <div className={mergeClasses(classNames.fieldsContainer, props.classNames?.fieldsContainer)}>
                {!loading &&
                    resolvedFields.map((field) =>
                        renderer.renderField(
                            field,
                            values[field.logicalName],
                            (value) => setValues((prev) => ({ ...prev, [field.logicalName]: value })),
                            {
                                disabled: props.disabled || submitting,
                                className: mergeClasses(classNames.fieldWrapper, props.classNames?.fieldWrapper),
                            }
                        )
                    )}
            </div>
            {!loading && !props.hideSubmitButton && (
                <Field className={mergeClasses(classNames.submitButtonWrapper, props.classNames?.submitButtonWrapper)}>
                    <Button className={mergeClasses(classNames.submitButton, props.classNames?.submitButton)} type="submit" appearance="primary" disabled={props.disabled || submitting}>
                        {submitting ? <Spinner size="tiny" /> : props.submitButtonText || (isCreate ? "Create" : "Save")}
                    </Button>
                </Field>
            )}
        </form>
    );
}
