import { IAuthenticationService } from "mgwdev-m365-helpers";
import * as React from "react";

export interface IAuthenticationContextProps {
    authProvider: IAuthenticationService;
}

export interface IAuthenticationContextProviderProps extends React.PropsWithChildren<object> {
    authProvider?: IAuthenticationService;
}

export const AuthenticationContext = React.createContext<IAuthenticationContextProps>({
    authProvider: {
        getAccessToken: async () => { throw new Error("No auth provider available") }
    }
});

export const useAuthentication = () => React.useContext<IAuthenticationContextProps>(AuthenticationContext);

export const AuthenticationContextProvider = (props: IAuthenticationContextProviderProps) => {

    const contextProps = React.useMemo(() => ({
        authProvider: props.authProvider
    }), [props.authProvider])
    return (<AuthenticationContext.Provider value={contextProps}>
        {props.children}
    </AuthenticationContext.Provider>
    );
}