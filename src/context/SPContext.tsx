import * as React from "react";
import { useAuthentication } from "./AuthenticationContext";
import { AuthHttpClient, FetchHttpClient, IHttpClient } from "mgwdev-m365-helpers";

export interface ISPContextProps {
    spClient: IHttpClient;
    siteUrl: string;
}

export interface ISPContextProviderProps extends React.PropsWithChildren<{}> {
    spClient?: IHttpClient;
    siteUrl: string;
}
export const SPContext = React.createContext<ISPContextProps>({
    spClient: new FetchHttpClient(),
    siteUrl: ""
});
export const useSP = () => React.useContext<ISPContextProps>(SPContext);

export const SPContextProvider = (props: ISPContextProviderProps) => {
    const { authProvider } = useAuthentication();
    const getSPClient = () => {
        if (props.spClient) {
            return props.spClient;
        }
        else if (authProvider) {
            let authClient = new AuthHttpClient(authProvider, new FetchHttpClient());
            authClient.resourceUri = new URL(props.siteUrl).origin;
            return authClient
        }
        return undefined;
    }

    const [spClient, setSPClient] = React.useState<IHttpClient | undefined>(getSPClient());
  
    React.useEffect(() => {
        setSPClient(getSPClient());
    }, [props.spClient, authProvider]);

    return (
        spClient && <SPContext.Provider value={{
            spClient: spClient,
            siteUrl: props.siteUrl
        }}>
            {props.children}
        </SPContext.Provider>
    );
}