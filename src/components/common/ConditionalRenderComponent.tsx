import * as React from "react";

export interface IConditionalRenderComponentProps extends React.PropsWithChildren {
    permissionCheck: () => Promise<boolean>
    initialRender?: boolean;
    placeholder?: JSX.Element | string;
}

export function ConditionalRenderComponent(props: IConditionalRenderComponentProps){
    const [shouldRender, setShouldRender] = React.useState(props.initialRender);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(()=>{
        props.permissionCheck().then((result)=>{
            setShouldRender(result);
        }).finally(()=>setLoading(false))
    },[])

    if(loading && props.placeholder){
        return <>{props.placeholder}</>;
    }
    return shouldRender ? <>{props.children}</> : <></>
}