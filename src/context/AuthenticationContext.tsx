import { IAuthenticationService, IMsalAuthenticationConfig, Msal2AuthenticationService } from "mgwdev-m365-helpers";
import * as React from "react";

export interface IAuthenticationContextProps {
    authProvider: IAuthenticationService;
}

export interface IAuthenticationContextProviderProps extends React.PropsWithChildren<{}> {
    authProvider?: IAuthenticationService;
    authProviderFactory?: () => Promise<IAuthenticationService>;
    msalAuthConfig?: IMsalAuthenticationConfig;
}

export const AuthenticationContext = React.createContext<IAuthenticationContextProps | undefined>(undefined);

export const useAuthentication = () => React.useContext<IAuthenticationContextProps>(AuthenticationContext);

export const AuthenticationContextProvider = (props: IAuthenticationContextProviderProps) => {
    const [authProvider, setAuthProvider] = React.useState<IAuthenticationService | undefined>(undefined);
    const isProviderAvailable = React.useMemo(()=> authProvider !== undefined, [authProvider]);

    React.useEffect(() => {
        if (props.authProvider) {
            setAuthProvider(props.authProvider);
        } else if (props.authProviderFactory) {
            props.authProviderFactory().then((authProvider) => {
                setAuthProvider(authProvider);
            });
        } else if (props.msalAuthConfig) {
            setAuthProvider(new Msal2AuthenticationService(props.msalAuthConfig));
        }
    }, [props.authProvider, props.authProviderFactory, props.msalAuthConfig]);

    return (
        <AuthenticationContext.Provider value={{
            authProvider: authProvider
        }}>
            {isProviderAvailable && props.children}
        </AuthenticationContext.Provider>
    );
}