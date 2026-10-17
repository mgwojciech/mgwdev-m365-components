import { useState } from "react";
import { Button, Drawer, DrawerBody, DrawerHeader, DrawerHeaderTitle } from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
import * as React from "react";

export type ButtonDrivenDrawerControls = {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    open: () => void;
    close: () => void;
};

export function ButtonDrivenDrawer(props: {
    buttonLabel: string;
    headerText?: string;
    buttonIcon?: any;
    styles?: {
        button?: string;
    };
    children: React.ReactNode | ((controls: ButtonDrivenDrawerControls) => React.ReactNode);
    onOpenChange?: (open: boolean) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const setOpen = (open: boolean) => {
        setIsOpen(open);
        props.onOpenChange?.(open);
    };
    const open = () => setOpen(true);
    const close = () => setOpen(false);

    return <div>
            <Button
                className={props.styles?.button}
                onClick={() => setOpen(!isOpen)}
                icon={props.buttonIcon}
            >
                {props.buttonLabel}
            </Button>
            <Drawer
                separator
                open={isOpen}
                onOpenChange={(_, { open }) => setOpen(open)}
                size="large"
            >
                <DrawerHeader>
                    <DrawerHeaderTitle
                        action={
                            <Button
                                appearance="subtle"
                                aria-label="Close"
                                icon={<Dismiss24Regular />}
                                onClick={close}
                            />
                        }
                    >

                        {props.headerText || props.buttonLabel || "No Title"}
                    </DrawerHeaderTitle>
                </DrawerHeader>

                <DrawerBody>
                    {typeof props.children === "function"
                        ? props.children({ isOpen, setIsOpen: setOpen, open, close })
                        : props.children}
                </DrawerBody>
            </Drawer>
        </div>
}