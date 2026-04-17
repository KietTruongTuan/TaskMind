import React, { useState, useRef, useEffect } from "react";
import { Flex, Text, ScrollArea, Box } from "@radix-ui/themes";
import { SendHorizonal, Bot } from "lucide-react";
import styles from "./goal-chat.module.scss";
import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { LoadingText } from "@/app/components/loading-text/loading-text";
import { ThreeDotLoading } from "@/app/components/three-dot-loading/three-dot-loading";
import { Textarea } from "@headlessui/react";
import { CustomButton } from "@/app/components/custom-button/custom-button";
import { ButtonType } from "@/app/enum/button-type.enum";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
};

export function GoalChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "bot",
      content:
        "Hi! I'm your AI assistant. How would you like to adjust or expand on this goal plan?",
    },
  ]);
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
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputValue.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        content: `Got it! I understand you want to "${userMsg.content}". I've recorded this preference. Is there anything else you'd like to tweak?`,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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
        style={{ flexGrow: 1, maxHeight: "84vh" }}
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
          {messages.map((message) => (
            <CardNoPadding
              key={message.id}
              height="auto"
              width="auto"
              maxWidth="85%"
              p="3"
              className={`${styles.messageBubble} ${
                message.role === "user" ? styles.userMessage : styles.botMessage
              }`}
            >
              {message.content}
            </CardNoPadding>
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
        />
        <CustomButton
          buttonType={ButtonType.Primary}
          onClick={handleSend}
          disabled={!inputValue.trim() || isTyping}
        >
          <SendHorizonal size={16} />
        </CustomButton>
      </Flex>
    </Flex>
  );
}
