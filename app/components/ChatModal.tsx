"use client";

import { useEffect, useState } from "react";
import ChatBox from "./ChatBox";
import styles from "./ChatModal.module.css";

export default function ChatModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <button
        className={styles.floatingButton}
        onClick={() => setIsOpen(true)}
        aria-label="Open chat with Squares"
        title="Ask Squares"
      >
        💬
      </button>

      {isOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Ask Squares</h2>
                <p className={styles.modalSubtitle}>
                  Questions about TAME-R or request typings for public figures
                </p>
              </div>
              <button
                className={styles.closeButton}
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <ChatBox />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
