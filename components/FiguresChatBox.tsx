"use client";

import { FormEvent, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import styles from "./FiguresChatBox.module.css";
import { MessageCircleIcon, MinusIcon } from "./icons";

export type Message = {
  role: "user" | "assistant";
  content: string;
};

type SpectrumData = {
  name: string;
  spectrum: (number | null)[];
  confidence?: number;
  reasoning?: string;
};

interface FiguresChatBoxProps {
  onSpectrumData?: (data: SpectrumData) => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  isMobile?: boolean;
  messages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
}

export default function FiguresChatBox({ 
  onSpectrumData, 
  isMinimized = false,
  onToggleMinimize,
  isMobile = false,
  messages: externalMessages,
  onMessagesChange
}: FiguresChatBoxProps) {
  const [internalMessages, setInternalMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Use external messages if provided, otherwise use internal state
  const messages = externalMessages !== undefined ? externalMessages : internalMessages;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message immediately
    const updatedMessagesWithUser = [...messages, { role: "user" as const, content: userMessage }];
    if (onMessagesChange) {
      onMessagesChange(updatedMessagesWithUser);
    } else {
      setInternalMessages(updatedMessagesWithUser);
    }
    
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessagesWithUser }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      
      // Add assistant response
      const updatedMessagesWithAssistant = [...updatedMessagesWithUser, { role: "assistant" as const, content: data.reply }];
      if (onMessagesChange) {
        onMessagesChange(updatedMessagesWithAssistant);
      } else {
        setInternalMessages(updatedMessagesWithAssistant);
      }
      
      // If spectrum data is returned, notify parent
      if (data.spectrumData && onSpectrumData) {
        onSpectrumData(data.spectrumData);
      }
    } catch (error) {
      console.error("Chat error:", error);
      
      // Add error message
      const updatedMessagesWithError = [...updatedMessagesWithUser, {
        role: "assistant" as const,
        content: "Sorry, I encountered an error. Please try again.",
      }];
      if (onMessagesChange) {
        onMessagesChange(updatedMessagesWithError);
      } else {
        setInternalMessages(updatedMessagesWithError);
      }
    } finally {
      setLoading(false);
    }
  };

  if (isMinimized) {
    return (
      <button
        className={styles.minimizedButton}
        onClick={onToggleMinimize}
        aria-label="Open chat"
      >
        <MessageCircleIcon />
        <span className={styles.minimizedText}>Chat with Squares</span>
      </button>
    );
  }

  return (
    <div className={`${styles.chatBox} ${isMobile ? styles.mobile : ''}`}>
      {!isMobile && (
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <MessageCircleIcon />
            <span>Chat with Squares</span>
          </div>
          <div className={styles.headerActions}>
            {onToggleMinimize && (
              <button
                className={styles.iconButton}
                onClick={onToggleMinimize}
                aria-label="Minimize chat"
              >
                <MinusIcon />
              </button>
            )}
          </div>
        </div>
      )}
      
      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.placeholder}>
            <p>👋 Ask Squares about any public figure!</p>
            <p className={styles.examples}>
              Try: "Square Bernie Sanders" or "What are Nelson Mandela's Squares?"
            </p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${styles.message} ${
              msg.role === "user" ? styles.userMessage : styles.assistantMessage
            }`}
          >
            <div className={styles.messageContent}>
              {msg.role === "assistant" ? (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Style code blocks
                    code: ({ children, className, ...props }: any) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className={styles.inlineCode} {...props}>
                          {children}
                        </code>
                      ) : (
                        <code className={styles.codeBlock} {...props}>
                          {children}
                        </code>
                      );
                    },
                    // Style links
                    a: ({ children, ...props }: any) => (
                      <a className={styles.markdownLink} target="_blank" rel="noopener noreferrer" {...props}>
                        {children}
                      </a>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            <div className={styles.messageContent}>
              <span className={styles.typing}>●●●</span>
            </div>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type Nelson Mandela..."
          className={styles.input}
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()} 
          className={styles.sendButton}
        >
          Send
        </button>
      </form>
    </div>
  );
}
