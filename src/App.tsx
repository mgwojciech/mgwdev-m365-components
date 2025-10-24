import * as React from 'react'
import { AuthenticationContextProvider, GraphContextProvider, SPContextProvider } from './context'
import { M365Search, SPPermissionTrimmedComponent } from './components'
import { DrivePicker, PeoplePicker, TeamPicker } from './components/common/graphEntityPicker'
import { SitePicker } from './components/common/graphEntityPicker/SitePicker'
import { Msal2AuthenticationService } from 'mgwdev-m365-helpers/lib/services/Msal2AuthenticationService'
import { ListPickerPicker } from './components/common/graphEntityPicker/ListPicker'
import { IEntityWithIdAndDisplayName } from './model/IEntityWithIdAndDisplayName'
import { Text, Spinner } from '@fluentui/react-components'
import { GraphGroupMembershipTrimmedComponent } from "./components/common/GraphGroupMembershipTrimmedComponent"
import { M365CopilotSearch } from './components/search/M365CopilotSearch'
import { SearchInputWithSuggestions } from './components/search/SearchInputWithSuggestions'

function App() {
  const clientId = import.meta.env.VITE_FRONTEND_CLIENT_ID
  const tenantId = import.meta.env.VITE_FRONTEND_TENANT_ID || "organizations"
  const authService = new Msal2AuthenticationService({ clientId: clientId, tenantId: tenantId }, false);
  const [site, setSite] = React.useState<IEntityWithIdAndDisplayName>()
  return (
    <AuthenticationContextProvider authProvider={authService} >
      <GraphContextProvider>
        <SPContextProvider siteUrl={import.meta.env.VITE_SITE_URL} >
          <>
            <M365Search dataProviderProps={{
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
            />
            <PeoplePicker key="people-picker" label="People picker" description="Pick some people here" />
            <TeamPicker key="team-picker" label="Team picker" description="Pick a team here" />
            <DrivePicker key="drive-picker" label="Drive picker" description="Pick a drive here" />
            <SitePicker onEntitySelected={(site) => setSite(site[0])} label="Site picker" description="Pick a site " />
            {site && <ListPickerPicker siteId={site.id} label="List picker" description={`Pick a list from ${site.displayName}`} />}
            {/* <GetSiteTemplateContext /> */}
            <SPPermissionTrimmedComponent role={"editListItems"}>
              <Text>Test SP</Text>
            </SPPermissionTrimmedComponent>
            <GraphGroupMembershipTrimmedComponent groupId="71a8d60d-7a8c-4ab2-b27b-00416367cc0d" placeholder={<Spinner />} >
              <Text>Test</Text>
            </GraphGroupMembershipTrimmedComponent>
            <M365CopilotSearch dataProviderProps={{
              queryTemplate: "SiteId:4ab2b7d6-0079-4ef7-92d2-0ee8948fd864"
            }} />
          </>
        </SPContextProvider>
      </GraphContextProvider>
    </AuthenticationContextProvider>
  )
}

export default App
