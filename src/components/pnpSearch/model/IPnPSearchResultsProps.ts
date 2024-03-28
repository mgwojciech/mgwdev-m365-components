import { IDetailsListColumnConfiguration } from "./IDetailsListColumnConfiguration";

export interface IPnPSearchResultProps {
    queryTemplate: string;
    selectedProperties: string;
    enableQueryRules: boolean;
    includeOneDriveResults: boolean;
    showBlank: boolean;
    showResultsCount: boolean;
    webPartTitle: string;
    enableLocalization: boolean;
    useDefaultSearchQuery: boolean;
    'resultTypes@odata.type': string;
    resultTypes: any[];
    useExternalRefinersDisplay: boolean;
    useExternalPaginationDisplay: boolean;
    'appliedRefiners@odata.type': string;
    appliedRefiners: any[];
    'refinersConfiguration@odata.type': string;
    refinersConfiguration: any[];
    'sortableFields@odata.type': string;
    sortableFields: any[];
    'synonymList@odata.type': string;
    synonymList: any[];
    searchQueryLanguage: number;
    'queryModifiers@odata.type': string;
    queryModifiers: any[];
    refinementFilters: string;
    selectedLayout: number;
    defaultSearchQuery: string;
    paging: Paging;
    'sortList@odata.type': string;
    sortList: SortList[];
    templateParameters: TemplateParameters;
    inlineTemplateText?: string;
  }
  
  export interface TemplateParameters {
    '@odata.type': string;
    showFileIcon: boolean;
    'detailsListColumns@odata.type': string;
    detailsListColumns: IDetailsListColumnConfiguration[];
  }

  
  export interface SortList {
    sortField: string;
    sortDirection: number;
  }
  
  export interface Paging {
    '@odata.type': string;
    itemsCountPerPage: number;
    pagingRange: number;
    showPaging: boolean;
    hideDisabled: boolean;
    hideFirstLastPages: boolean;
    hideNavigation: boolean;
  }