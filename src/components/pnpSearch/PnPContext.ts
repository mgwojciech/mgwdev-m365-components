import { IHttpClient } from "mgwdev-m365-helpers";
import { IRefinableDataProvider } from "mgwdev-m365-helpers/lib-commonjs/dal/dataProviders/IRefinableDataProvider";

export class PnPContext{
    public static webPartContext: Map<string, PnPWebPartContext> = new Map<string, PnPWebPartContext>();
}

export class PnPWebPartContext{
    constructor(public graphClient: IHttpClient, public dataProvider: IRefinableDataProvider<any>){
    }
}