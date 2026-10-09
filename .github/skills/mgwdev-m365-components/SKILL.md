---
name: mgwdev-m365-components
user-invocable: true
description: "Use when: building Microsoft 365 React apps with SharePoint, Microsoft Graph, and Dataverse; wiring provider context; using DataverseForm, DataverseTableGrid, SPListDataGrid, GraphPersona, M365Search; or working in this library repo."
---

# mgwdev-m365-components usage guide

This project is a React component library for Microsoft 365 experiences. It is designed around a shared context-based model instead of manually passing authenticated clients through every component.

## Core pattern

Use the library by creating an app-level provider layer once, then consuming the clients and components throughout the app.

```tsx
import * as React from "react";
import {
  AuthenticationContextProvider,
  GraphContextProvider,
  SPContextProvider,
  DataverseContextProvider,
} from "mgwdev-m365-components";

export function AppShell() {
  return (
    <AuthenticationContextProvider authProvider={myAuthProvider}>
      <GraphContextProvider>
        <SPContextProvider siteUrl="https://contoso.sharepoint.com/sites/Finance">
          <DataverseContextProvider
            dataverseResource="https://contoso.crm.dynamics.com"
            autoBatch={true}
          >
            <YourApplication />
          </DataverseContextProvider>
        </SPContextProvider>
      </GraphContextProvider>
    </AuthenticationContextProvider>
  );
}
```

## Required concepts

### 1. AuthenticationContext
Use this to supply the app auth service. It provides access to `authProvider` and related auth helpers.

### 2. GraphContext
Use this when a component needs a Microsoft Graph client. Common use cases include people, groups, drives, teams, and search.

### 3. SPContext
Use this for SharePoint pages, lists, permissions, and list-based grids.

### 4. DataverseContext
Use this for Dataverse entities, metadata, lookup fields, forms, and table grids.

## Typical component choices

### Graph identity and access
- `GraphPersona` for a person card or display name with optional presence
- `GraphGroupMembershipTrimmedComponent` for group-based visibility rules
- `ConditionalRenderComponent` for custom permission gating

### SharePoint
- `SPPermissionTrimmedComponent` for SharePoint permission-based rendering
- `SPListDataGrid` for SharePoint list tables
- `SitePicker`, `ListPicker`, `DrivePicker` for selection UIs

### Dataverse
- `DataverseForm` for create/update entity forms
- `DataverseTableGrid` for table-style Dataverse data views
- `LookupFieldRenderer` / `MultiChoiceFieldRenderer` / `ChoiceFieldRenderer` for custom form fields

### Search and discovery
- `M365Search` for generic Graph-backed search results
- `M365CopilotSearch` for Copilot retrieval patterns
- `SearchInputWithSuggestions` for search query suggestions

## Common usage examples

### Rendering a person persona

```tsx
import { GraphPersona } from "mgwdev-m365-components";

export function UserHeader() {
  return <GraphPersona id="{user-object-id}" showPresence={true} size="medium" />;
}
```

### Showing content only when the user has a SharePoint permission

```tsx
import { SPPermissionTrimmedComponent } from "mgwdev-m365-components";

export function AdminPanel() {
  return (
    <SPPermissionTrimmedComponent role="ManagePermissions" placeholder={<span>Checking access...</span>}>
      <button>Manage permissions</button>
    </SPPermissionTrimmedComponent>
  );
}
```

### Displaying a Dataverse form

```tsx
import { DataverseForm } from "mgwdev-m365-components";

export function AccountForm() {
  return (
    <DataverseForm
      entityName="account"
      itemId="{account-id}"
      fieldsToRender={["name", "emailaddress1", "telephone1"]}
      submitButtonText="Save account"
    />
  );
}
```

### Displaying a table from Dataverse

```tsx
import { DataverseTableGrid } from "mgwdev-m365-components";

const fields = [
  { name: "name", label: "Name", type: "Text" },
  { name: "createdon", label: "Created", type: "DateTime" },
];

export function AccountsGrid() {
  return (
    <DataverseTableGrid
      tableName="accounts"
      fieldsToRender={fields}
      selectionMode="multiselect"
    />
  );
}
```

## Rules of thumb

- Do not try to use these components without their expected providers.
- Prefer the library’s context-based workflow over manually creating `AuthHttpClient` instances in each component.
- Keep provider setup near the app root and do not spread auth logic throughout the tree.
- Use `Dataverse*` components for Dataverse scenarios, `SP*` components for SharePoint scenarios, and `Graph*` components for Graph-driven experiences.
- Use `GenericDataGrid` when building custom grid behavior from a data service.

## When not to use this library

This package is a good fit for Microsoft 365 apps that use SharePoint, Graph, and Dataverse together. It is less useful for completely unrelated UI or backend-only logic.

## Best practices for AI and humans

For the most reliable usage, keep examples in this pattern:
1. provide the auth and resource contexts
2. render the M365 component
3. pass only domain-specific props and callbacks
4. use the library’s exported root entry point for imports

This keeps the model straightforward and consistent with the library’s design.
