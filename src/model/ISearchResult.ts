export interface IGraphSearchResult<T>{
    fields: T;
}

export interface IDocumentSearchResult{
    title: string;
    path: string;
    author: string;
    description: string;
    listItemId: string;
    identityListItemId: string;
    identityListId: string;
    identitySiteCollectionId: string;
    identityWebId: string;
    lastModifiedTime: string;
    viewsLifeTime: string;
    viewsRecent: string;
    owstaxidmetadataalltagsinfo: string;
    driveId: string;
}