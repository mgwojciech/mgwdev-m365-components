import * as React from "react";
import { useAuthentication } from "./AuthenticationContext";
import { AuthHttpClient, FetchHttpClient, IHttpClient } from "mgwdev-m365-helpers";

export interface IDataverseContextProps {
    dataverseClient: IHttpClient;
    dataverseResource?: string;
}

export interface IDataverseContextProviderProps extends React.PropsWithChildren<{}> {
    dataverseResource: string;
    dataverseClient?: IHttpClient;
}
export const DataverseContext = React.createContext<IDataverseContextProps>({
    dataverseClient: new FetchHttpClient()
});
export const useDataverse = () => React.useContext<IDataverseContextProps>(DataverseContext);

export const DataverseContextProvider = (props: IDataverseContextProviderProps) => {
    const { authProvider } = useAuthentication();
    const getDataverseClient = () => {
        if (props.dataverseClient) {
            return props.dataverseClient;
        }
        else if (authProvider) {
            let authHttpClient = new AuthHttpClient(authProvider, new FetchHttpClient());
            authHttpClient.resourceUri = props.dataverseResource;
            return authHttpClient;
        }
        return undefined;
    }

    const [dataverseClient, setDataverseClient] = React.useState<IHttpClient | undefined>(getDataverseClient());
  
    React.useEffect(() => {
        setDataverseClient(getDataverseClient());
    }, [props.dataverseClient, authProvider]);

    return (
        dataverseClient && <DataverseContext.Provider value={{
            dataverseClient: dataverseClient,
            dataverseResource: props.dataverseResource
        }}>
            {props.children}
        </DataverseContext.Provider>
    );
}