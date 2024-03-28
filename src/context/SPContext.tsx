import * as React from "react";
import { useAuthentication } from "./AuthenticationContext";
import { AuthHttpClient, FetchHttpClient, IHttpClient } from "mgwdev-m365-helpers";

export interface ISPContextProps{
    siteUrl: string;
    spClient: IHttpClient;
}

export interface ISPContextProviderProps extends React.PropsWithChildren<{}> {
    siteUrl: string;
    spClient?: IHttpClient;
}

export const SPContext = React.createContext<ISPContextProps | undefined>(undefined);
export const useSP = () => React.useContext<ISPContextProps>(SPContext);

export const SPContextProvider = (props: ISPContextProviderProps) => {
    const { authProvider } = useAuthentication();
    const [spClient, setSPClient] = React.useState<IHttpClient | undefined>(undefined);

    React.useEffect(() => {
        if (props.spClient) {
            setSPClient(props.spClient);
        }
        else{
            var client = new AuthHttpClient(authProvider, new FetchHttpClient());
            client.resourceUri =  (new URL(props.siteUrl)).origin;
            setSPClient(client)
        }
    }, [props.spClient, authProvider]);

    return (
        <SPContext.Provider value={{
            siteUrl: props.siteUrl,
            spClient: spClient
        }}>
            {spClient && props.children}
        </SPContext.Provider>
    );
}