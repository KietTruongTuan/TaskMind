import React, { useState, useRef, useEffect } from "react";
import { Flex, Text, ScrollArea } from "@radix-ui/themes";
import { SendHorizonal, CornerDownRightIcon } from "lucide-react";
import styles from "./goal-chat.module.scss";
import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { LoadingText } from "@/app/components/loading-text/loading-text";
import { ThreeDotLoading } from "@/app/components/three-dot-loading/three-dot-loading";
import { Textarea } from "@headlessui/react";
import { CustomButton } from "@/app/components/custom-button/custom-button";
import { ButtonType } from "@/app/enum/button-type.enum";
import {
  aiService,
  ChatMessage,
  CreateGoalRequestBody,
  CreateGoalResponseBody,
} from "@/app/constants";
import { useGoalContext } from "@/app/contexts/goal-context/goal-context";
import { ChatRole } from "@/app/enum/chat-role.enum";
import { ApiError } from "@/app/constants";

interface UIChatMessage extends ChatMessage {
  options?: string[];
}

export function GoalChat() {
  const {
    draftGoal,
    createRequest,
    setDraftGoal,
    clearDraftGoal,
    isDraftGoalFromChat,
  } = useGoalContext();
  const [messages, setMessages] = useState<UIChatMessage[]>([]);
  const [historyMessages, setHistoryMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollViewportRef.current) {
      const scrollElement = scrollViewportRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  };

  useEffect(() => {
    if (!draftGoal) {
      setIsTyping(true);
      return;
    }
    if (messages.length > 0 && !isDraftGoalFromChat) {
      return;
    }
    const botMsg: UIChatMessage = {
      role: ChatRole.Assistant,
      content: draftGoal.message,
      options: draftGoal.options,
    };
    setMessages((prev) => [...prev, botMsg]);
    setHistoryMessages((prev) => [
      ...prev,
      { role: ChatRole.Assistant, content: JSON.stringify(draftGoal) },
    ]);
    setIsTyping(false);
  }, [draftGoal]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (value: string) => {
    if (!value.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      role: ChatRole.User,
      content: value.trim(),
    };

    setMessages((prev) => [
      ...prev.map((msg) => ({ ...msg, options: undefined })),
      userMsg,
    ]);
    setHistoryMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);
    if (!createRequest) {
      setIsTyping(false);
      return;
    }
    const oldDraftGoal = draftGoal;
    try {
      clearDraftGoal();
      const chatRequest: CreateGoalRequestBody = {
        ...createRequest,
        message: userMsg.content,
        history: historyMessages,
      };
      const res: CreateGoalResponseBody =
        await aiService.createGoal(chatRequest);

      setDraftGoal(
        {
          ...res,
          tasks: res.tasks?.map((t, index) => ({ ...t, index })),
        },
        true,
      );
    } catch (err) {
      const error = err as ApiError;
      setMessages((prev) => [
        ...prev,
        { role: ChatRole.Assistant, content: error.message },
      ]);
      setHistoryMessages((prev) => [
        ...prev,
        { role: ChatRole.Assistant, content: JSON.stringify(error) },
      ]);
      setDraftGoal(oldDraftGoal, true);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  return (
    <Flex
      height="100%"
      width="100%"
      direction="column"
      justify="end"
      p="3"
      gap="2"
      className={styles.chatContainer}
    >
      <ScrollArea
        scrollbars="vertical"
        type="scroll"
        style={{ flexGrow: 1, maxHeight: "79vh" }}
        ref={scrollViewportRef}
      >
        <Flex
          p="5"
          direction="column"
          gap="4"
          flexGrow="1"
          height="100%"
          justify="end"
          overflowY="auto"
        >
          {messages.map((message, index) => (
            <Flex key={index} direction="column" gap="2" width="100%">
              <CardNoPadding
                height="auto"
                width="auto"
                maxWidth="85%"
                p="3"
                className={`${styles.messageBubble} ${
                  message.role === ChatRole.User
                    ? styles.userMessage
                    : styles.botMessage
                }`}
              >
                {message.content}
              </CardNoPadding>
              {message.options && message.options.length > 0 && (
                <Flex
                  gap="2"
                  direction="column"
                  align={message.role === ChatRole.User ? "end" : "start"}
                  maxWidth="75%"
                >
                  {message.options.map((opt, optIndex) => (
                    <Flex
                      key={optIndex}
                      onClick={() => handleSend(opt)}
                      align="center"
                      gap="2"
                    >
                      <CornerDownRightIcon
                        size={20}
                        style={{ color: "var(--text-secondary)" }}
                      />
                      <CardNoPadding p="2" className={styles.optionCard}>
                        <Text size="1">{opt}</Text>
                      </CardNoPadding>
                    </Flex>
                  ))}
                </Flex>
              )}
            </Flex>
          ))}

          {isTyping && (
            <CardNoPadding
              height="auto"
              width="auto"
              maxWidth="85%"
              p="3"
              className={`${styles.messageBubble} ${styles.botMessage}`}
            >
              <LoadingText
                text="Thinking"
                specialEffectComponent={<ThreeDotLoading />}
              />
            </CardNoPadding>
          )}
        </Flex>
      </ScrollArea>

      <Flex align="start" gap="3" p="3" className={styles.inputWrapper}>
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          rows={3}
          onKeyDown={handleKeyDown}
          placeholder="Chat with your AI assistant to adjust the goal plan..."
          disabled={isTyping}
          className={styles.textInput}
          data-testid="goal-chat-input"
        />
        <CustomButton
          buttonType={ButtonType.Primary}
          onClick={() => handleSend(inputValue)}
          disabled={!inputValue.trim() || isTyping}
          data-testid="goal-chat-send"
        >
          <SendHorizonal size={16} />
        </CustomButton>
      </Flex>
    </Flex>
  );
}
