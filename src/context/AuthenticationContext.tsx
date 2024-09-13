import { IAuthenticationService } from "mgwdev-m365-helpers";
import * as React from "react";

export interface IAuthenticationContextProps {
    authProvider: IAuthenticationService;
}

export interface IAuthenticationContextProviderProps extends React.PropsWithChildren<{}> {
    authProvider?: IAuthenticationService;
}

export const AuthenticationContext = React.createContext<IAuthenticationContextProps>({
    authProvider: {
        getAccessToken: async () => { throw new Error("No auth provider available") }
    }
});

export const useAuthentication = () => React.useContext<IAuthenticationContextProps>(AuthenticationContext);

export const AuthenticationContextProvider = (props: IAuthenticationContextProviderProps) => {
  
    return (<AuthenticationContext.Provider value={{
            authProvider: props.authProvider!
        }}>
            {props.children}
        </AuthenticationContext.Provider>
    );
}