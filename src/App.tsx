import * as React from "react";
import {
  AuthenticationContextProvider,
  DataverseContextProvider,
  GraphContextProvider,
  SPContextProvider,
} from "./context";
import { GraphPersona } from "./components";
import { Msal2AuthenticationService } from "mgwdev-m365-helpers/lib/services/Msal2AuthenticationService";
import { IEntityWithIdAndDisplayName } from "./model/IEntityWithIdAndDisplayName";
import { Link } from "@fluentui/react-components";
import { DataverseTableGrid } from "./components/datagrid/DataverseTableDataGrid";
import { UserManagement } from "./components/dataverse/userManagement/UserManagement";

function App() {
  const clientId = import.meta.env.VITE_FRONTEND_CLIENT_ID;
  const tenantId = import.meta.env.VITE_FRONTEND_TENANT_ID || "organizations";
  const dataverseEnv = import.meta.env.VITE_FRONTEND_DATAVERSE_ENV;

  const authService = new Msal2AuthenticationService(
    { clientId: clientId, tenantId: tenantId, redirectUri: `${window.location.origin}/redirect` },
    false
  );
  const [site, setSite] = React.useState<IEntityWithIdAndDisplayName>();

  return (
    <AuthenticationContextProvider authProvider={authService}>
      <GraphContextProvider>
        <SPContextProvider siteUrl={import.meta.env.VITE_FRONTEND_SITE_URL}>
          <GraphPersona />
          <>
            {/* <M365Search dataProviderProps={{
              queryTemplate: "{searchTerms} ", //AND (contentclass:STS_ListItem OR IsDocument:True) -FileType:aspx
              aggregations: [{
                field: "FileType",
                size: 10,
                bucketDefinition: {
                  sortBy: "count",
                  isDescending: true,
                  minimumCount: 0
                }
              },
              {
                field: "Size",
                bucketDefinition: {
                  sortBy: "count",
                  isDescending: true,
                  minimumCount: 0
                }
              }]
            }}
              searchInputComponent={(props) => <SearchInputWithSuggestions onSearch={props.onSearch} query="" />}
            /> */}
            {/* <PeoplePicker key="people-picker" label="People picker" description="Pick some people here" />
            <TeamPicker key="team-picker" label="Team picker" description="Pick a team here" />
            <DrivePicker key="drive-picker" label="Drive picker" description="Pick a drive here" />
            <SitePicker onEntitySelected={(site) => setSite(site[0])} label="Site picker" description="Pick a site " /> */}
            {/* {site && <ListPickerPicker siteId={site.id} label="List picker" description={`Pick a list from ${site.displayName}`} />} */}
            {/* <GetSiteTemplateContext /> */}
            {/* <SPPermissionTrimmedComponent role={"editListItems"}>
              <Text>Test SP</Text>
            </SPPermissionTrimmedComponent>
            <GraphGroupMembershipTrimmedComponent groupId="71a8d60d-7a8c-4ab2-b27b-00416367cc0d" placeholder={<Spinner />} >
              <Text>Test</Text>
            </GraphGroupMembershipTrimmedComponent>
            <M365CopilotSearch dataProviderProps={{
              queryTemplate: "SiteId:4ab2b7d6-0079-4ef7-92d2-0ee8948fd864"
            }} /> */}
          </>
          {/* <SPListDataGrid
            selectionMode="single"
            getRowId={(item) => item["ID"]}
            listId="a8dd0add-5556-4a96-8dae-51d56fa374d6"
            fieldsToRender={[{
              name: "ID",
              type: "Number"
            }, {
              name: "Title",
              type: "Text"
            }, {
              name: "Created",
              type: "DateTime"
            }, {
              name: "Author",
              type: "User"
            }]}
            onSelectionChange={(items) => {
              console.log(items);
            }}
          /> */}
          {/* <GraphEntityDataGrid
            entityEndpoint="https://graph.microsoft.com/beta/applications"
            fieldsToRender={[
              {
                name: "id",
                label: "Identifier",
                disableSorting: true
              },
              {
                name: "displayName",
                label: "Full name",
                disableSorting: true
              },
              {
                name: "description",
                label: "Description",
                disableSorting: true
              },
              {
                name: "identifierUris",
                label: "App Id Uri",
                disableSorting: true
              },
            ]}
            customRenderers={[{
              isRendererApplicable: (field) => field.name === "identifierUris",
              renderField: (field, value, item) => <Text >{value ? value[0] : ""}</Text>
            }]}
          /> */}
          <DataverseContextProvider dataverseResource={dataverseEnv} >
            <DataverseTableGrid
              tableName="accounts"
              fieldsToRender={[
                {
                  name: "address1_city",
                  label: "City"
                },
                {
                  name: "name",
                  label: "Name"
                },
                {
                  name: "primarycontactid",
                  label: "Primary Contact",
                },
                {
                  name: "telephone1",
                  label: "Telephone"
                },
                {
                  name: "aging30",
                  label: "Aging 30"
                },
                // {
                //   name: "crc82_contact_table_0id",
                //   type: "Lookup",
                //   expandFields: [
                //     "crc82_contactname",
                //     "crc82_contactid",
                //     "crc82_email"
                //   ],
                //   relatedId: "crc82_contactid",
                //   label: "Contact"
                // },
                // {
                //   name: "createdby",
                //   type: "User",
                //   expandFields: [
                //     "fullname",
                //     "systemuserid",
                //     "azureactivedirectoryobjectid",
                //   ],
                //   relatedId: "systemuserid",
                //   label: "Created By"
                // },
                // {
                //   name: "createdon",
                //   type: "DateTime",
                //   label: "Created date"
                //},
              ]}
              customRenderers={[{
                isRendererApplicable: (field) => field.name === "crc82_contact_table_0id",
                renderField: (field, value, item) => <Link href={`mailto:${value["crc82_email"]}`}>{value["crc82_contactname"]}</Link>
              }]}
            />
            <UserManagement />
          </DataverseContextProvider>
        </SPContextProvider>
      </GraphContextProvider>
    </AuthenticationContextProvider>
  );
}

export default App;
