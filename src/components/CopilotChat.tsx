import * as React from "react";
import { useAuthentication, useGraph } from "../context";
import {
    Spinner,
    Text,
    Input,
    Button,
    Avatar,
    makeStyles,
    tokens,
    mergeClasses,
    Subtitle1,
    Caption1,
    Body1,
    Textarea
} from "@fluentui/react-components";
import {
    Send24Regular,
    Bot24Regular,
    Sparkle24Filled,
    ErrorCircle24Regular
} from "@fluentui/react-icons";
import { BatchGraphClient, CopilotChatService, ICopilotConversationResponse, ICopilotResponseMessage } from "mgwdev-m365-helpers";
import { GraphPersona } from "./common";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        maxHeight: "600px",
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusXLarge,
        boxShadow: tokens.shadow16,
        overflow: "hidden",
    },
    header: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalM,
        padding: tokens.spacingVerticalM,
        paddingLeft: tokens.spacingHorizontalL,
        paddingRight: tokens.spacingHorizontalL,
        background: `linear-gradient(135deg, ${tokens.colorBrandBackground} 0%, ${tokens.colorBrandBackground2} 100%)`,
        color: tokens.colorNeutralForegroundOnBrand,
    },
    headerIcon: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        color: tokens.colorNeutralForegroundOnBrand,
        fontWeight: tokens.fontWeightSemibold,
    },
    headerSubtitle: {
        color: tokens.colorNeutralForegroundOnBrand,
        opacity: 0.85,
    },
    messagesContainer: {
        flex: 1,
        overflowY: "auto",
        padding: tokens.spacingVerticalL,
        paddingLeft: tokens.spacingHorizontalL,
        paddingRight: tokens.spacingHorizontalL,
        display: "flex",
        flexDirection: "column",
        gap: tokens.spacingVerticalM,
        backgroundColor: tokens.colorNeutralBackground2,
    },
    messageRow: {
        display: "flex",
        gap: tokens.spacingHorizontalS,
        maxWidth: "85%",
    },
    messageRowUser: {
        alignSelf: "flex-end",
        flexDirection: "row-reverse",
    },
    messageRowCopilot: {
        alignSelf: "flex-start",
    },
    messageBubble: {
        padding: tokens.spacingVerticalS,
        paddingLeft: tokens.spacingHorizontalM,
        paddingRight: tokens.spacingHorizontalM,
        borderRadius: tokens.borderRadiusLarge,
        maxWidth: "100%",
        wordBreak: "break-word",
    },
    messageBubbleUser: {
        backgroundColor: tokens.colorBrandBackground,
        color: tokens.colorNeutralForegroundOnBrand,
        borderBottomRightRadius: tokens.borderRadiusSmall,
    },
    messageBubbleCopilot: {
        backgroundColor: tokens.colorNeutralBackground1,
        color: tokens.colorNeutralForeground1,
        borderBottomLeftRadius: tokens.borderRadiusSmall,
        boxShadow: tokens.shadow4,
    },
    streamingIndicator: {
        display: "inline-flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalXS,
        marginLeft: tokens.spacingHorizontalXS,
    },
    inputContainer: {
        display: "flex",
        gap: tokens.spacingHorizontalS,
        padding: tokens.spacingVerticalM,
        paddingLeft: tokens.spacingHorizontalL,
        paddingRight: tokens.spacingHorizontalL,
        backgroundColor: tokens.colorNeutralBackground1,
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    inputField: {
        flex: 1,
    },
    sendButton: {
        minWidth: "auto",
    },
    errorContainer: {
        display: "flex",
        alignItems: "center",
        gap: tokens.spacingHorizontalS,
        padding: tokens.spacingVerticalS,
        paddingLeft: tokens.spacingHorizontalM,
        paddingRight: tokens.spacingHorizontalM,
        backgroundColor: tokens.colorPaletteRedBackground1,
        color: tokens.colorPaletteRedForeground1,
        borderRadius: tokens.borderRadiusMedium,
        margin: tokens.spacingVerticalS,
        marginLeft: tokens.spacingHorizontalL,
        marginRight: tokens.spacingHorizontalL,
    },
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        gap: tokens.spacingVerticalM,
        color: tokens.colorNeutralForeground3,
        padding: tokens.spacingVerticalXXL,
    },
    emptyStateIcon: {
        fontSize: "48px",
        color: tokens.colorBrandForeground1,
    },
    avatarUser: {
        backgroundColor: tokens.colorBrandBackground,
    },
    avatarCopilot: {
        backgroundColor: tokens.colorNeutralBackground1,
        border: `2px solid ${tokens.colorBrandStroke1}`,
    },
    loadingOverlay: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: tokens.spacingVerticalL,
    },
});

export interface IChatMessage {
    id?: string;
    text: string;
    user: "user" | "copilot";
    timestamp?: Date;
    adaptiveCards?: any[];
}

export interface ICopilotChatProps {
    /** Custom title for the chat header */
    title?: string;
    /** Custom subtitle for the chat header */
    subtitle?: string;
    /** Placeholder text for the input field */
    inputPlaceholder?: string;
    /** Custom empty state message */
    emptyStateMessage?: string;
    /** Custom renderer for user messages */
    onRenderUserMessage?: (message: IChatMessage, index: number) => React.ReactNode;
    /** Custom renderer for copilot messages */
    onRenderCopilotMessage?: (message: IChatMessage, index: number) => React.ReactNode;
    /** Custom renderer for the header */
    onRenderHeader?: () => React.ReactNode;
    /** Custom renderer for the input area */
    onRenderInputArea?: (
        input: string,
        setInput: (value: string) => void,
        sendMessage: () => void,
        isLoading: boolean
    ) => React.ReactNode;
    /** Custom renderer for the empty state */
    onRenderEmptyState?: () => React.ReactNode;
    /** Custom renderer for streaming response */
    onRenderStreamingMessage?: (text: string) => React.ReactNode;
    /** Callback when a message is sent */
    onMessageSent?: (message: string) => void;
    /** Callback when a response is received */
    onResponseReceived?: (response: ICopilotConversationResponse) => void;
    /** Custom class name for the container */
    className?: string;
    /** Custom styles */
    styles?: {
        container?: React.CSSProperties;
        header?: React.CSSProperties;
        messagesContainer?: React.CSSProperties;
        inputContainer?: React.CSSProperties;
    };
    /** Timezone hint for location */
    timeZone?: string;
    /** Maximum height for the chat container */
    maxHeight?: string | number;
}

export function CopilotChat(props: ICopilotChatProps) {
    const {
        title = "Copilot",
        subtitle = "Your AI assistant",
        inputPlaceholder = "Type your message...",
        emptyStateMessage = "Start a conversation with Copilot",
        onRenderUserMessage,
        onRenderCopilotMessage,
        onRenderHeader,
        onRenderInputArea,
        onRenderEmptyState,
        onRenderStreamingMessage,
        onMessageSent,
        onResponseReceived,
        className,
        styles: customStyles,
        timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone,
        maxHeight = "600px",
    } = props;

    const classes = useStyles();
    const { graphClient } = useGraph();
    const copilotChatServiceRef = React.useRef(new CopilotChatService(graphClient));
    const [messages, setMessages] = React.useState<IChatMessage[]>([]);
    const [currentResponse, setCurrentResponse] = React.useState<{ text: string } | null>(null);
    const [input, setInput] = React.useState<string>("");
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [isStreaming, setIsStreaming] = React.useState<boolean>(false);
    const [error, setError] = React.useState<string | null>(null);
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages, currentResponse]);

    React.useEffect(() => {
        if (!copilotChatServiceRef.current) return;
        copilotChatServiceRef.current.initConversation().then(() => {
            setIsLoading(false);
        }).catch((err) => {
            setError("Failed to initialize conversation");
            setIsLoading(false);
        });
    }, [graphClient]);

    const sendMessage = async () => {
        if (!graphClient || !input.trim()) return;

        setIsLoading(true);
        setIsStreaming(true);
        const userMessage = input;
        const newUserMessage: IChatMessage = {
            text: userMessage,
            user: "user",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, newUserMessage]);
        setInput("");
        onMessageSent?.(userMessage);

        try {
            setIsLoading(true);
            copilotChatServiceRef.current?.sendTextMessage(userMessage,
                (response: ICopilotResponseMessage) => {
                    if (response) {
                        setCurrentResponse({ ...response });
                    }
                },
                (finalResponse: ICopilotConversationResponse) => {
                    setMessages((prev) => [
                        ...prev,
                        {
                            ...finalResponse.messages[finalResponse.messages.length - 1],
                            user: "copilot",
                            timestamp: new Date(finalResponse.messages[finalResponse.messages.length - 1].createdDateTime),
                        },
                    ]);
                    setCurrentResponse(null);
                    setIsStreaming(false);
                    onResponseReceived?.(finalResponse);
                },
                (err) => {
                    setError("Failed to get response from Copilot");
                    setIsStreaming(false);
                    console.error(err);
                }
            );
        } catch (err) {
            setError("Failed to send message");
            console.error(err);
        } finally {
            setIsLoading(false);
            setIsStreaming(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const renderDefaultHeader = () => (
        <div className={classes.header} style={customStyles?.header}>
            <div className={classes.headerIcon}>
                <Sparkle24Filled />
            </div>
            <div>
                <Subtitle1 className={classes.headerTitle}>{title}</Subtitle1>
            </div>
            <div>
                <Caption1 className={classes.headerSubtitle}>{subtitle}</Caption1>
            </div>
            {isLoading && !isStreaming && (
                <Spinner size="tiny" style={{ marginLeft: "auto" }} />
            )}
        </div>
    );

    const renderDefaultEmptyState = () => (
        <div className={classes.emptyState}>
            <Sparkle24Filled className={classes.emptyStateIcon} />
            <Text size={400} weight="semibold">
                {emptyStateMessage}
            </Text>
            <Caption1>Ask me anything and I'll do my best to help.</Caption1>
        </div>
    );

    const renderDefaultUserMessage = (message: IChatMessage, index: number) => (
        <div
            key={index}
            className={mergeClasses(classes.messageRow, classes.messageRowUser)}
        >
            <GraphPersona primaryText={""} secondaryText={""} />
            <div
                className={mergeClasses(
                    classes.messageBubble,
                    classes.messageBubbleUser
                )}
            >
                <Body1>{message.text}</Body1>
            </div>
        </div>
    );

    const renderDefaultCopilotMessage = (message: IChatMessage, index: number) => (
        <div
            key={index}
            className={mergeClasses(classes.messageRow, classes.messageRowCopilot)}
        >
            <Avatar
                icon={<Bot24Regular />}
                size={32}
                className={classes.avatarCopilot}
                color="colorful"
            />
            <div
                className={mergeClasses(
                    classes.messageBubble,
                    classes.messageBubbleCopilot
                )}
            >
                <Body1>{message.text}</Body1>
            </div>
        </div>
    );

    const renderDefaultStreamingMessage = (text: string) => (
        <div className={mergeClasses(classes.messageRow, classes.messageRowCopilot)}>
            <Avatar
                icon={<Bot24Regular />}
                size={32}
                className={classes.avatarCopilot}
                color="colorful"
            />
            <div
                className={mergeClasses(
                    classes.messageBubble,
                    classes.messageBubbleCopilot
                )}
            >
                <Body1>{text}</Body1>
            </div>
        </div>
    );

    const renderDefaultInputArea = (
        inputValue: string,
        setInputValue: (value: string) => void,
        onSend: () => void,
        loading: boolean
    ) => (
        <div className={classes.inputContainer} style={customStyles?.inputContainer}>
            <Input
                className={classes.inputField}
                placeholder={inputPlaceholder}
                value={inputValue}
                onChange={(e, data) => setInputValue(data.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                appearance="filled-darker"
                size="large"
            />
            <Button
                className={classes.sendButton}
                appearance="primary"
                icon={loading ? <Spinner size="tiny" /> : <Send24Regular />}
                onClick={onSend}
                disabled={loading || !inputValue.trim()}
                size="large"
            />
        </div>
    );

    return (
        <div
            className={mergeClasses(classes.container, className)}
            style={{ ...customStyles?.container, maxHeight }}
        >
            {onRenderHeader ? onRenderHeader() : renderDefaultHeader()}

            {error && (
                <div className={classes.errorContainer}>
                    <ErrorCircle24Regular />
                    <Text>{error}</Text>
                </div>
            )}

            <div
                className={classes.messagesContainer}
                style={customStyles?.messagesContainer}
            >
                {messages.length === 0 && !currentResponse ? (
                    onRenderEmptyState ? (
                        onRenderEmptyState()
                    ) : (
                        renderDefaultEmptyState()
                    )
                ) : (
                    <>
                        {messages.map((msg, index) =>
                            msg.user === "user"
                                ? onRenderUserMessage
                                    ? onRenderUserMessage(msg, index)
                                    : renderDefaultUserMessage(msg, index)
                                : onRenderCopilotMessage
                                    ? onRenderCopilotMessage(msg, index)
                                    : renderDefaultCopilotMessage(msg, index)
                        )}
                        {currentResponse &&
                            (onRenderStreamingMessage
                                ? onRenderStreamingMessage(currentResponse.text)
                                : renderDefaultStreamingMessage(currentResponse.text))}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            {onRenderInputArea
                ? onRenderInputArea(input, setInput, sendMessage, isLoading)
                : renderDefaultInputArea(input, setInput, sendMessage, isLoading)}
        </div>
    );
}