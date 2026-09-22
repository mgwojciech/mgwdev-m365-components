export type DataverseAttributeType =
  | "String"
  | "Memo"
  | "Integer"
  | "BigInt"
  | "Decimal"
  | "Double"
  | "Money"
  | "Boolean"
  | "DateTime"
  | "Picklist"
  | "State"
  | "Status"
  | "MultiSelectPicklist"
  | "Lookup"
  | "Customer"
  | "Owner"
  | "Uniqueidentifier"
  | "Virtual";

export interface IDataverseOptionSetValue {
  value: number;
  label: string;
}

export interface IDataverseFormField {
  logicalName: string;
  displayName: string;
  attributeType: DataverseAttributeType;
  isRequired: boolean;
  isReadOnly: boolean;
  description?: string;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  options?: IDataverseOptionSetValue[];
  targets?: string[];
  schemaName: string;
  targetLookupInfo?: IDataverseEntitySummary;
}

export interface IDataverseEntitySummary {
  logicalName: string;
  entitySetName: string;
  primaryIdAttribute: string;
  primaryNameAttribute: string;
  displayName: string;
}

export interface IDataverseEntityDefinition extends IDataverseEntitySummary {
  fields: IDataverseFormField[];
}

export interface IDataverseLookupValue {
  id: string;
  displayName: string;
  entityLogicalName: string;
}
