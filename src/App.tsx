import * as React from 'react'
import { AuthenticationContextProvider, GraphContextProvider, SPContextProvider } from './context'
import { Test } from './components/Test'
import { M365Search } from './components'
import { PnPSearchResultsWebPart } from './components/pnpSearch/PnPSearchResultsWebPart'

function App() {
  const pnpSearchWPConfig = {
    "queryTemplate": "{searchTerms}",
    "selectedProperties": "Title,Path,Created,Filename,SiteLogo,PreviewUrl,PictureThumbnailURL,ServerRedirectedPreviewURL,ServerRedirectedURL,HitHighlightedSummary,FileType,contentclass,ServerRedirectedEmbedURL,ParentLink,DefaultEncodingURL,owstaxidmetadataalltagsinfo,Author,AuthorOWSUSER,SPSiteUrl,SiteTitle,IsContainer,IsListItem,HtmlFileType,SiteId,WebId,UniqueID,OriginalPath,FileExtension,IsDocument,NormSiteID,NormWebID,NormListID,NormUniqueID",
    "enableQueryRules": false,
    "includeOneDriveResults": false,
    "showBlank": true,
    "showResultsCount": true,
    "webPartTitle": "",
    "enableLocalization": true,
    "useDefaultSearchQuery": false,
    "resultTypes@odata.type": "#Collection(String)",
    "resultTypes": [],
    "useExternalRefinersDisplay": false,
    "useExternalPaginationDisplay": false,
    "appliedRefiners@odata.type": "#Collection(String)",
    "appliedRefiners": [],
    "refinersConfiguration@odata.type": "#Collection(String)",
    "refinersConfiguration": [],
    "sortableFields@odata.type": "#Collection(String)",
    "sortableFields": [],
    "synonymList@odata.type": "#Collection(String)",
    "synonymList": [],
    "searchQueryLanguage": -1,
    "queryModifiers@odata.type": "#Collection(String)",
    "queryModifiers": [],
    "refinementFilters": "",
    "selectedLayout": 3,
    "defaultSearchQuery": "",
    "paging": {
      "@odata.type": "#graph.Json",
      "itemsCountPerPage": 10,
      "pagingRange": 5,
      "showPaging": true,
      "hideDisabled": true,
      "hideFirstLastPages": false,
      "hideNavigation": false
    },
    "sortList@odata.type": "#Collection(graph.Json)",
    "sortList": [
      {
        "sortField": "Created",
        "sortDirection": 1
      },
      {
        "sortField": "Size",
        "sortDirection": 2
      }
    ],
    "templateParameters": {
      "@odata.type": "#graph.Json",
      "showFileIcon": true,
      "detailsListColumns@odata.type": "#Collection(graph.Json)",
      "detailsListColumns": [
        {
          "name": "Title",
          "value": "Title",
          "useHandlebarsExpr": false,
          "minWidth": "80",
          "maxWidth": "300",
          "enableSorting": false,
          "isMultiline": false,
          "isResizable": true,
          "isResultItemLink": true
        },
        {
          "name": "Created",
          "value": "{{getDate Created 'LL'}}",
          "useHandlebarsExpr": true,
          "minWidth": "80",
          "maxWidth": "120",
          "enableSorting": true,
          "isMultiline": false,
          "isResizable": false,
          "isResultItemLink": false
        },
        {
          "name": "Summary",
          "value": "{{getSummary HitHighlightedSummary}}",
          "useHandlebarsExpr": true,
          "minWidth": "80",
          "maxWidth": "300",
          "enableSorting": false,
          "isMultiline": true,
          "isResizable": false,
          "isResultItemLink": false
        }
      ]
    }
  }
  return (
    <AuthenticationContextProvider msalAuthConfig={{
      clientId: import.meta.env.VITE_FRONTEND_CLIENT_ID
    }} >
      <GraphContextProvider>
        <SPContextProvider siteUrl={import.meta.env.VITE_SITE_URL} >
          <>
            {/* <M365Search dataProviderProps={{
              queryTemplate: "{searchTerms} AND (contentclass:STS_ListItem OR IsDocument:True) -FileType:aspx",
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
            }} /> */}
            <PnPSearchResultsWebPart id="test-wp-1" config={pnpSearchWPConfig} />
          </>
        </SPContextProvider>
      </GraphContextProvider>
    </AuthenticationContextProvider>
  )
}

export default App
