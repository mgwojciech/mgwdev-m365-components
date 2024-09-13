import * as React from 'react'
import { AuthenticationContextProvider, GraphContextProvider, SPContextProvider } from './context'
import { Test } from './components/Test'
import { M365Search } from './components'
import { DrivePicker, PeoplePicker, TeamPicker } from './components/common/graphEntityPicker'
import { SitePicker } from './components/common/graphEntityPicker/SitePicker'
import { Msal2AuthenticationService } from 'mgwdev-m365-helpers/lib/services/Msal2AuthenticationService'
import { ListPickerPicker } from './components/common/graphEntityPicker/ListPicker'
import { IEntityWithIdAndDisplayName } from './model/IEntityWithIdAndDisplayName'
import { GetSiteTemplateContext } from './components/provisioning/GetSiteTemplate'

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
    "selectedLayout": 2,
    "defaultSearchQuery": "",
    "inlineTemplateText": "<content id=\"template\">\n\n    <style>\n        \n        /* Insert your CSS overrides here */\n\n    </style>\n\n    <div class=\"template_root\">\n        <span>Test</span>\n            <div class=\"template_defaultCard\">\n                {{#if showResultsCount}}\n                <div class=\"template_resultCount\">\n                    <label class=\"ms-fontWeight-semibold\">{{getCountMessage @root.paging.totalItemsCount keywords}}</label>\n                </div>\n                {{/if}}\n                <div class=\"document-card-container\">\n                    {{#each items as |item|}}\n                    <div class=\"document-card-item\">\n                        {{#> resultTypes item=item}}\n\n                                <pnp-document-card data-item=\"{{JSONstringify item}}\" data-fields-configuration=\"{{JSONstringify @root.documentCardFields}}\" data-enable-preview=\"{{@root.enablePreview}}\" data-show-file-icon=\"{{@root.showFileIcon}}\" data-is-compact=\"{{@root.isCompact}}\"></pnp-document-card>\n                        {{/resultTypes}}\n                    </div>\n                    {{/each}}\n                </div>\n            </div>\n            {{#if @root.paging.showPaging}}\n                <pnp-pagination \n                    data-total-items=\"{{@root.paging.totalItemsCount}}\" \n                    data-hide-first-last-pages=\"{{@root.paging.hideFirstLastPages}}\"\n                    data-hide-disabled=\"{{@root.paging.hideDisabled}}\"\n                    data-hide-navigation=\"{{@root.paging.hideNavigation}}\"\n                    data-range=\"{{@root.paging.pagingRange}}\" \n                    data-items-count-per-page=\"{{@root.paging.itemsCountPerPage}}\" \n                    data-current-page-number=\"{{@root.paging.currentPageNumber}}\"\n                >\n                </pnp-pagination>\n            {{/if}}\n    </div>\n</content>\n\n<content id=\"placeholder\">   \n    <div class=\"placeholder_root\">\n        <div class=\"template_defaultCard\">\n            {{#if showResultsCount}}\n                <div class=\"template_resultCount\">\n                    <span class=\"shimmer line\" style=\"width: 20%\"></span>\n                </div>\n            {{/if}}\n            <div class=\"document-card-container\"> \n                {{#times @root.paging.totalItemsCount}}\n                    <div class=\"document-card-item\">\n                        <pnp-document-card-shimmers data-is-compact=\"{{@root.isCompact}}\"></pnp-document-card-shimmers>\n                    </div>\n                {{/times}}\n            </div>\n        </div>\n    </div>\n</content>",
    "externalTemplateUrl": "",
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
      "showFileIcon": false,
      "documentCardFields@odata.type": "#Collection(graph.Json)",
      "documentCardFields": [
        {
          "name": "Title",
          "field": "title",
          "value": "Title",
          "useHandlebarsExpr": false,
          "supportHtml": false
        },
        {
          "name": "Location",
          "field": "location",
          "value": "<a style=\"color:{{@themeVariant.palette.themePrimary}}\" href=\"{{SPSiteUrl}}\">{{SiteTitle}}</a>",
          "useHandlebarsExpr": true,
          "supportHtml": true
        },
        {
          "name": "Tags",
          "field": "tags",
          "value": "{{#if owstaxidmetadataalltagsinfo}}<i class='ms-Icon ms-Icon--Tag' aria-hidden='true'></i> {{#each (split owstaxidmetadataalltagsinfo ',') as |tag| }}<a class=\"ms-Link\" href=\"#owstaxidmetadataalltagsinfo:'{{trim tag}}'\">{{tag}}</a>{{/each}}{{/if}}",
          "useHandlebarsExpr": true,
          "supportHtml": true
        },
        {
          "name": "Preview Image",
          "field": "previewImage",
          "value": "{{{getPreviewSrc item}}}",
          "useHandlebarsExpr": true,
          "supportHtml": false
        },
        {
          "name": "Preview URL",
          "field": "previewUrl",
          "value": "{{#eq contentclass 'STS_ListItem_851'}}{{{DefaultEncodingURL}}}{{else}}{{#eq FileType 'pdf'}}{{#contains Path '-my.sharepoint'}}{{{ServerRedirectedEmbedURL}}}{{else}}{{{Path}}}{{/contains}}{{else}}{{{ServerRedirectedEmbedURL}}}{{/eq}}{{/eq}} ",
          "useHandlebarsExpr": true,
          "supportHtml": false
        },
        {
          "name": "Date",
          "field": "date",
          "value": "{{getDate item.Created 'LL'}}",
          "useHandlebarsExpr": true,
          "supportHtml": false
        },
        {
          "name": "URL",
          "field": "href",
          "value": "{{getUrl item}}",
          "useHandlebarsExpr": true,
          "supportHtml": false
        },
        {
          "name": "Author",
          "field": "author",
          "value": "Author",
          "useHandlebarsExpr": false,
          "supportHtml": false
        },
        {
          "name": "Profile Image",
          "field": "profileImage",
          "value": "{{#with (split AuthorOWSUSER '|')}}/_layouts/15/userphoto.aspx?size=L&username={{[0]}}{{/with}}",
          "useHandlebarsExpr": true,
          "supportHtml": false
        },
        {
          "name": "IconSrc",
          "field": "iconSrc",
          "value": "{{IconSrc}}",
          "useHandlebarsExpr": true,
          "supportHtml": false
        },
        {
          "name": "IconExt",
          "field": "iconExt",
          "value": "{{IconExt}}",
          "useHandlebarsExpr": true,
          "supportHtml": false
        },
        {
          "name": "File Extension",
          "field": "fileExtension",
          "value": "FileType",
          "useHandlebarsExpr": false,
          "supportHtml": false
        }
      ],
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
          "isResultItemLink": true,
          "sortIdx": 1
        },
        {
          "name": "Created",
          "value": "{{getDate Created 'LL'}}",
          "useHandlebarsExpr": true,
          "minWidth": "80",
          "maxWidth": "120",
          "enableSorting": false,
          "isMultiline": false,
          "isResizable": false,
          "isResultItemLink": false,
          "sortIdx": 2
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
          "isResultItemLink": false,
          "sortIdx": 3
        },
        {
          "uniqueId": "9c4eb969-17ac-4bf0-928e-7eb916688378",
          "name": "Author",
          "value": "Author",
          "minWidth": "50",
          "maxWidth": "310",
          "enableSorting": true
        }
      ]
    }
  }
  const clientId = import.meta.env.VITE_FRONTEND_CLIENT_ID
  const authService = new Msal2AuthenticationService({ clientId: clientId }, false);
  const [site, setSite] = React.useState<IEntityWithIdAndDisplayName>()
  return (
    <AuthenticationContextProvider authProvider={authService} >
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
            <PeoplePicker key="people-picker" label="People picker" description="Pick some people here" />
            <TeamPicker key="team-picker" label="Team picker" description="Pick a team here" />
            <DrivePicker key="drive-picker" label="Drive picker" description="Pick a drive here" />
            <SitePicker onEntitySelected={(site) => setSite(site[0])} label="Site picker" description="Pick a site " />
            {site && <ListPickerPicker siteId={site.id} label="List picker" description={`Pick a list from ${site.displayName}`} />}
            <GetSiteTemplateContext />
          </>
        </SPContextProvider>
      </GraphContextProvider>
    </AuthenticationContextProvider>
  )
}

export default App
