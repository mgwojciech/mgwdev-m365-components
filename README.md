# mgwdev-m365-components

A React library for building Microsoft 365 experiences with SharePoint, Microsoft Graph, and Dataverse using a shared, context-based client model.

This package is designed for apps that need a consistent way to access Microsoft 365 APIs without scattering authentication and HTTP setup through each component. Instead of passing clients manually through dozens of props, the library exposes a small set of React contexts that provide authenticated clients and keep the app wiring tidy.

## Why this library exists

The main goal is simple: give your React app a single pattern for working with common Microsoft 365 services.

- `AuthenticationContext` owns the authentication service
- `GraphContext` exposes a Microsoft Graph client
- `SPContext` exposes a SharePoint client and site URL
- `DataverseContext` exposes a Dataverse client and resource URL

That makes it easier to build components that are already wired for the right endpoint and security model.

## How it works

The library relies on React context providers. You create a root provider layer once in your app, then read the clients from any child component through hooks.

The providers do this for you:

- use your configured `authProvider` when available
- create authenticated HTTP clients with the proper resource URI
- optionally wrap Dataverse calls in a batch client
- expose the final client via context so components can call `useGraph()`, `useSP()`, `useDataverse()`, or `useAuthentication()` without prop drilling

This is intentionally lightweight: the context layer handles the plumbing, while the actual business logic stays in normal React components or service classes.

## Contexts provided by the library

### 1. AuthenticationContext

Provides access to the authentication service used by the app.

```tsx
import {
  AuthenticationContextProvider,
  useAuthentication,
} from "mgwdev-m365-components";

function App() {
  const { authProvider } = useAuthentication();

  return <div>Authenticated: {authProvider ? "yes" : "no"}</div>;
}

export default function Root() {
  return (
    <AuthenticationContextProvider authProvider={myAuthProvider}>
      <App />
    </AuthenticationContextProvider>
  );
}
```

The authentication provider is expected to provide a standard Microsoft 365-style service with methods such as `getAccessToken`, `isAuthenticated`, `logout`, and `clearCache`.

### 2. GraphContext

Exposes a Graph HTTP client for Microsoft Graph requests. If you do not pass a custom client, the provider will automatically create one using the configured auth provider and `BatchGraphClient`.

```tsx
import {
  GraphContextProvider,
  useGraph,
} from "mgwdev-m365-components";

function UserPanel() {
  const { graphClient } = useGraph();

  return <button onClick={() => graphClient.get("/me")}>Load me</button>;
}

export default function Root() {
  return (
    <GraphContextProvider>
      <UserPanel />
    </GraphContextProvider>
  );
}
```

This is useful for components that need Graph calls without manually building auth clients every time.

### 3. SPContext

Provides a SharePoint client and the current `siteUrl`. It resolves the proper resource origin for the site and gives components a consistent way to call SharePoint APIs.

```tsx
import {
  SPContextProvider,
  useSP,
} from "mgwdev-m365-components";

function SiteInfo() {
  const { spClient, siteUrl } = useSP();

  return <div>Site: {siteUrl}</div>;
}

export default function Root() {
  return (
    <SPContextProvider siteUrl="https://contoso.sharepoint.com/sites/Finance">
      <SiteInfo />
    </SPContextProvider>
  );
}
```

### 4. DataverseContext

Provides a Dataverse client and the Dataverse resource URL. This is especially useful when you are working with Dataverse tables, records, and metadata. If `autoBatch` is enabled, the provider can wrap the client with a Dataverse batch client to reduce the number of HTTP calls for related operations.

```tsx
import {
  DataverseContextProvider,
  useDataverse,
} from "mgwdev-m365-components";

function AccountWidget() {
  const { dataverseClient, dataverseResource } = useDataverse();

  return <div>Resource: {dataverseResource}</div>;
}

export default function Root() {
  return (
    <DataverseContextProvider
      dataverseResource="https://contoso.crm.dynamics.com"
      autoBatch={true}
    >
      <AccountWidget />
    </DataverseContextProvider>
  );
}
```

## Typical app setup

A common pattern is to put the providers near the app root:

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

Once this is set up, components can consume any of the exposed clients without manual wiring.

## Recommended usage pattern

Use the contexts when:

- your app needs a Microsoft Graph client in many places
- you need shareable SharePoint access across multiple components
- you are working with Dataverse entities or forms
- you want to avoid manually creating and passing `AuthHttpClient` instances

Use the library’s reusable UI and services when you want standard Microsoft 365 patterns, not custom one-off API calls in every component.

## Installation

```bash
npm install mgwdev-m365-components mgwdev-m365-helpers @fluentui/react-components
```

If you are already providing your own authentication and HTTP client configuration, you can plug those in directly to the providers and keep the rest of the app consistent.

## Component inventory

The `src/components` folder is the main UI surface of the library. It is organized around a few high-level concepts: generic UI primitives, Dataverse and SharePoint data grids, Graph pickers, and M365 search experiences.

### Root export surface

- `src/components/index.tsx` - central export point for the component library. It re-exports the `common`, `datagrid`, `dataverse`, and `search` modules so the package provides one consistent import surface.
- `src/components/Test.tsx` - a lightweight exploratory example that reads Graph and SharePoint data using the supplied contexts. It is useful as a sample pattern, but it is not a polished production component.

### `common`

The common area contains reusable access-control and identity-related components.

- `ConditionalRenderComponent.tsx` - wraps children in an async permission gate. It calls a `permissionCheck` callback and renders the content only when the promise resolves to `true`; it also supports a placeholder while loading.
- `GraphGroupMembershipTrimmedComponent.tsx` - renders children only when the current user is a transitive member of a specified AAD/Graph group.
- `SPPermissionTrimmedComponent.tsx` - checks SharePoint effective permissions using `_api/web/EffectiveBasePermissions` and only renders the child UI when the requested permission is available.
- `GraphPersona.tsx` - resolves a Graph user record and renders a Fluent UI `Persona` with optional presence data.
- `index.tsx` - re-exports the common components and graph entity picker exports.

#### `common/graphEntityPicker`

This folder contains generic Graph-backed selection components built around a common combobox pattern.

- `AbstractGraphEntityPicker.tsx` - generic async lookup component with debounce, loading state, multi-select support, and item selection logic. It is the base implementation for the specialized pickers.
- `PeoplePicker.tsx` - picker for people entities using Graph user data.
- `SitePicker.tsx` - picker for SharePoint sites.
- `TeamPicker.tsx` - picker for Microsoft Teams teams.
- `ChannelPicker.tsx` - picker for team channels.
- `DrivePicker.tsx` - picker for Graph drives.
- `ListPicker.tsx` - picker for SharePoint lists.
- `index.tsx` - exports the picker family.

### `datagrid`

The datagrid area contains the table-building layer used to display and filter data from SharePoint, Dataverse, and generic Graph-backed sources.

- `GenericDataGrid.tsx` - the main reusable table component. It handles sorting, row selection, pagination, loading/error states, and filter application through a reusable `dataService` abstraction.
- `DataGridFilterPanel.tsx` - right-side filter drawer with a filter button, clear filter action, and custom field filter rendering.
- `DataverseTableDataGrid.tsx` - Dataverse-aware grid. It wires in Dataverse-specific renderers and filters and exposes the `DataverseTableGrid` component.
- `SPListDataGrid.tsx` - SharePoint list grid built on top of the SharePoint data service.
- `GraphEntityDataGrid.tsx` - Graph-entity grid wrapper for generic entity resources.
- `index.ts` - exports the public datagrid components.

#### `datagrid/columnRenderers`

These are the field-formatting adapters used by the generic grid.

- `IColumnRenderer.tsx` - common renderer contract.
- `ComposedRenderer.tsx` - ordered list of renderers that finds the first applicable one for a field and falls back to a stringified value if no renderer matches.
- `DateRenderer.tsx` - formats date/time values as locale-friendly dates.
- `DataverseLookupRenderer.tsx` - renders lookup display values from expanded lookup objects.
- `DataverseChoiceRenderer.tsx` - reads the formatted display value exposed by Dataverse choice fields.
- `DataverseUserRenderer.tsx` - converts a Dataverse user object into a `GraphPersonaStandalone` for proper user display.
- `SPUserRenderer.tsx` - handles SharePoint user field rendering.

#### `datagrid/filterComponents`

These components provide field-specific filter UI used by the datagrid when a user adds filters.

- `DataverseColumnFilterCombobox.tsx` - filter combobox for Dataverse columns.
- `SPFieldFilterCombobox.tsx` - filter combobox for SharePoint list columns.

### `dataverse`

The Dataverse section contains form logic and field-type renderers used to create or edit records in Dataverse.

- `DataverseForm.tsx` - metadata-driven form component for creating or updating Dataverse records. It resolves metadata, loads existing values, builds an OData payload, and submits via `DataverseRecordService`.
- `index.ts` - exports the public Dataverse form API and renderer contracts.

#### `dataverse/fieldRenderers`

These are the field renderers used by `DataverseForm`.

- `IFormFieldRenderer.tsx` - contract for form field renderers.
- `ComposedFormFieldRenderer.tsx` - applies renderers in order until one matches the field type.
- `TextFieldRenderer.tsx` - text field editor.
- `NumberFieldRenderer.tsx` - numeric field editor.
- `BooleanFieldRenderer.tsx` - checkbox-based boolean field editor.
- `DateTimeFieldRenderer.tsx` - date/time input renderer.
- `ChoiceFieldRenderer.tsx` - single-choice selection.
- `MultiChoiceFieldRenderer.tsx` - multi-select choice field support.
- `LookupFieldRenderer.tsx` - lookup editor for Dataverse reference fields.

### `search`

The search folder contains M365-focused search experiences built on top of Microsoft Graph and search providers.

- `M365Search.tsx` - generic M365 search panel that queries Graph search data, applies a search input, and renders results as cards or custom result templates.
- `M365CopilotSearch.tsx` - search variant using the Copilot retrieval provider for a different Microsoft 365 search experience.
- `SearchInputWithSuggestions.tsx` - Graph-based query suggestion input that proposes filter properties and values as the user types.
- `DefaultDocumentCard.tsx` - default card UI for search results.
- `SearchDefaults.ts` - default Graph search fields used by the search components.
- `index.ts` - exports the search components.

### `analytics`

- This folder exists in the project structure but is empty at the moment. It is a natural place for future analytics-oriented UI components.

### Overall design intent

The component library is intentionally organized around context-driven access to Microsoft 365 services. The components assume the app is already providing authenticated clients through the library contexts, and then they focus on the UI pattern rather than low-level API setup. In practice, that means:

- `common` contains reusable access and identity primitives
- `datagrid` contains table and filter abstractions
- `dataverse` contains form and field logic
- `search` contains Graph search UIs
- sample/test files such as `Test.tsx` help illustrate usage without being part of the polished public API

## Usage examples

The examples below show the intended pattern for each component family: provide the Microsoft 365 contexts at the app root, then render the relevant component in the tree.

### Common components

#### `GraphPersona`

```tsx
import * as React from "react";
import { GraphPersona } from "mgwdev-m365-components";

export function UserHeader() {
  return (
    <GraphPersona
      id="{user-object-id}"
      showPresence={true}
      size="medium"
    />
  );
}
```

#### `SPPermissionTrimmedComponent`

```tsx
import * as React from "react";
import { SPPermissionTrimmedComponent } from "mgwdev-m365-components";

export function AdminTools() {
  return (
    <SPPermissionTrimmedComponent role="ManagePermissions" placeholder={<span>Checking access...</span>}>
      <button>Manage permissions</button>
    </SPPermissionTrimmedComponent>
  );
}
```

#### `GraphGroupMembershipTrimmedComponent`

```tsx
import * as React from "react";
import { GraphGroupMembershipTrimmedComponent } from "mgwdev-m365-components";

export function FinanceOnlyPanel() {
  return (
    <GraphGroupMembershipTrimmedComponent groupId="finance-group-id" placeholder={<span>Loading team access...</span>}>
      <div>Finance tools</div>
    </GraphGroupMembershipTrimmedComponent>
  );
}
```

### Graph pickers

```tsx
import * as React from "react";
import { PeoplePicker, TeamPicker } from "mgwdev-m365-components";

export function SelectionExamples() {
  return (
    <>
      <PeoplePicker
        label="Assigned to"
        multiSelect={false}
        onEntitySelected={(people) => console.log(people)}
      />

      <TeamPicker
        label="Team"
        onEntitySelected={(teams) => console.log(teams)}
      />
    </>
  );
}
```

### Data grids

#### `GenericDataGrid`

```tsx
import * as React from "react";
import { GenericDataGrid } from "mgwdev-m365-components";

const fields = [
  { name: "id", label: "ID", type: "Text" },
  { name: "title", label: "Title", type: "Text" },
];

export function ExampleGrid() {
  return (
    <GenericDataGrid
      dataService={myGridService}
      fieldsToRender={fields}
      selectionMode="single"
      onSelectionChange={(rows) => console.log(rows)}
    />
  );
}
```

#### `DataverseTableGrid`

```tsx
import * as React from "react";
import { DataverseTableGrid } from "mgwdev-m365-components";

const columns = [
  { name: "name", label: "Name", type: "Text" },
  { name: "createdon", label: "Created", type: "DateTime" },
];

export function AccountsGrid() {
  return (
    <DataverseTableGrid
      tableName="accounts"
      fieldsToRender={columns}
      selectionMode="multiselect"
      initialOrderBy="createdon"
      initialOrderByDir="descending"
    />
  );
}
```

#### `SPListDataGrid`

```tsx
import * as React from "react";
import { SPListDataGrid } from "mgwdev-m365-components";

const fields = [
  { name: "Title", label: "Title", type: "Text" },
  { name: "Modified", label: "Modified", type: "DateTime" },
];

export function TasksGrid() {
  return (
    <SPListDataGrid
      listId="{sharepoint-list-id}"
      fieldsToRender={fields}
      rowLimit={50}
    />
  );
}
```

### Dataverse form

```tsx
import * as React from "react";
import { DataverseForm } from "mgwdev-m365-components";

export function AccountForm() {
  return (
    <DataverseForm
      entityName="account"
      itemId="{account-id}"
      fieldsToRender={["name", "emailaddress1", "telephone1"]}
      submitButtonText="Save account"
      onItemUpdated={(record, isCreate) => {
        console.log("Saved", record, isCreate);
      }}
    />
  );
}
```

### Search components

#### `M365Search`

```tsx
import * as React from "react";
import { M365Search } from "mgwdev-m365-components";

export function SearchExperience() {
  return (
    <M365Search
      dataProviderProps={{
        entityType: "listItem",
        initialQuery: "finance",
        pageSize: 10,
      }}
      onResultRendering={(result) => <div>{result.fields.title}</div>}
    />
  );
}
```

#### `M365CopilotSearch`

```tsx
import * as React from "react";
import { M365CopilotSearch } from "mgwdev-m365-components";

export function CopilotAwareSearch() {
  return (
    <M365CopilotSearch
      dataProviderProps={{
        initialQuery: "project update",
        pageSize: 8,
      }}
    />
  );
}
```

#### `SearchInputWithSuggestions`

```tsx
import * as React from "react";
import { SearchInputWithSuggestions } from "mgwdev-m365-components";

export function SearchBox() {
  return (
    <SearchInputWithSuggestions
      query="author:me"
      onSearch={(query) => console.log("search:", query)}
    />
  );
}
```

## Contributing

This library is meant to be easy to compose into larger M365 apps. If you are extending the toolkit, keep the provider model simple and make sure new components fit the same pattern: authenticated client in context, service logic in reusable modules, and minimal prop drilling.
