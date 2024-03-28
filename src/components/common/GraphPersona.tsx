import { IHttpClient, IUser, PeopleProvider } from "mgwdev-m365-helpers";
import * as React from "react";
import {
    Persona,
    Spinner,
    PersonaProps,
    PresenceBadgeStatus
} from "@fluentui/react-components";
import { PersonaService } from "../../services/PersonaService";
import { useGraph } from "../../context";

export interface IGraphPersonaProps extends PersonaProps {
    id?: string;
    user?: IUser;
    showPresence?: boolean;
    showSecondaryText?: boolean;
    graphClient?: IHttpClient;
}

export function GraphPersona(props: IGraphPersonaProps) {
    const { id } = props;
    let graphClient = props.graphClient;
    if (!graphClient) {
        graphClient = (useGraph()).graphClient;
    }
    const getPresence = (presenceString?: string) => {
        switch (presenceString) {
            case "":
                return "offline";
            case "Available":
                return "available";
            case "Busy":
                return "busy";
            case "Away":
                return "away";
            case "DoNotDisturb":
                return "do-not-disturb";
            case "Offline":
                return "offline";
            case "PresenceUnknown":
                return "unknown";
            case "OutOfOffice":
                return "out-of-office";
            case "Blocked":
                return "blocked";
            case "BeRightBack":
                return "away";
            case "BusyIdle":
                return "busy";
            case "AvailableIdle":
                return "available";
            default:
                return presenceString?.toLowerCase() as PresenceBadgeStatus;
        }
    };
    const personaService = React.useRef(new PersonaService(graphClient, props.showPresence))
    const [loading, setLoading] = React.useState(!props.user);
    const [user, setUser] = React.useState<IUser>(props.user);
    const getUserInfo = async () => {
        const userResult = await personaService.current.getUser(id!);
        setUser({
            ...props.user,
            ...userResult,
        });
        setLoading(false);
    };
    React.useEffect(() => {
        getUserInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (loading) {
        return <Spinner />
    }

    const primaryText = user?.displayName || props.name || props.title || props.id;

    return (
        <Persona
            {...props}
            primaryText={primaryText}
            secondaryText={props.showSecondaryText ? props.secondaryText || user?.jobTitle : undefined}
            avatar={{
                image: { src: user?.photo },
                initials: user?.displayName?.split(" ").map(x => x[0]).join("") || props.name?.split(" ").map(x => x[0]).join(""),
            }}
            presence={
                props.showPresence
                    ? {
                        status: getPresence(user?.presence?.availability),
                        outOfOffice: user?.presence?.outOfOfficeSettings?.isOutOfOffice
                    }
                    : undefined
            }
        />
    );
}
