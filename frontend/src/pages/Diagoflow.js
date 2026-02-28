// chatbot.js
import React, { useState, useEffect, useRef } from "react";

// Helper function to adjust color brightness
const adjustColor = (color, amount) => {
  // Remove # if present
  color = color.replace("#", "");

  // Parse the color
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);

  // Adjust the color
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));

  // Convert back to hex
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

const DialogflowChatbot = ({
  agentId,
  chatTitle = "Support Bot",
  languageCode = "en",
  debug = false,
  position = "right",
  primaryColor = "#0066cc",
  chatWidth = "350px",
  chatHeight = "500px",
  zIndex = 9999,
  buttonIcon,
  closeIcon,
  loadingIcon,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loadingState, setLoadingState] = useState("idle"); // idle, loading, success, error
  const [error, setError] = useState(null);

  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  // Extract project ID from agent ID
  const projectId = agentId?.split("/")[1] || "";

  // Icons with defaults
  const defaultButtonIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      <circle cx="8" cy="10" r="1"></circle>
      <circle cx="12" cy="10" r="1"></circle>
      <circle cx="16" cy="10" r="1"></circle>
    </svg>
  );

  const defaultCloseIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  const defaultLoadingIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="chatbot-loading-icon"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
  );

  // Validate agent ID on mount
  useEffect(() => {
    if (!projectId) {
      setError(
        "Invalid agent ID format. Expected format: projects/PROJECT_ID/agent"
      );
      if (debug) {
        console.error(
          "DialogflowChatbot: Invalid agent ID format. Expected format: projects/PROJECT_ID/agent"
        );
      }
    } else if (debug) {
      console.log("Dialogflow Chatbot initialized with:", {
        agentId,
        projectId,
        chatTitle,
        languageCode,
      });
    }
  }, [agentId, projectId, chatTitle, languageCode, debug]);

  // Create Dialogflow iframe URL
  const createDialogflowIframeUrl = () => {
    // Create a direct URL to the Dialogflow CX messenger
    const baseUrl = "https://dialogflow.cloud.google.com/cx/projects";

    // Construct URL with all necessary parameters
    const url = new URL(
      `${baseUrl}/${projectId}/agent/locations/global/integrations/messenger`
    );

    // Add required parameters
    url.searchParams.append("agent_name", chatTitle);
    url.searchParams.append("language_code", languageCode);
    url.searchParams.append("embed", "true");

    // Add optional debug parameter
    if (debug) {
      url.searchParams.append("debug", "true");
    }

    return url.toString();
  };

  // Open the chat
  const openChat = () => {
    setIsOpen(true);
    setLoadingState("loading");
    setError(null);

    if (debug) {
      console.log("Opening chat with URL:", createDialogflowIframeUrl());
    }
  };

  // Close the chat
  const closeChat = () => {
    setIsOpen(false);
    setLoadingState("idle");
  };

  // Toggle the chat
  const toggleChat = () => {
    if (isOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  // Handle iframe load event
  const handleIframeLoad = () => {
    setLoadingState("success");
    if (debug) {
      console.log("Dialogflow iframe loaded successfully");
    }
  };

  // Handle iframe error event
  const handleIframeError = (e) => {
    setLoadingState("error");
    setError("Failed to load Dialogflow chat. Please try again later.");
    if (debug) {
      console.error("Dialogflow iframe failed to load:", e);
    }
  };

  // Retry loading the iframe
  const retryLoading = () => {
    setLoadingState("loading");
    setError(null);

    if (iframeRef.current) {
      iframeRef.current.src = createDialogflowIframeUrl();
    }
  };

  // CSS styles as objects for React
  const styles = {
    button: {
      position: "fixed",
      bottom: "20px",
      [position]: "20px",
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      backgroundColor: primaryColor,
      color: "white",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      border: "none",
      outline: "none",
      zIndex: zIndex,
      transition: "transform 0.3s ease, background-color 0.3s ease",
    },
    buttonHover: {
      transform: "scale(1.05)",
      backgroundColor: adjustColor(primaryColor, -20),
    },
    container: {
      position: "fixed",
      bottom: "90px",
      [position]: "20px",
      width: chatWidth,
      height: chatHeight,
      backgroundColor: "white",
      borderRadius: "10px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      overflow: "hidden",
      zIndex: zIndex,
      display: isOpen ? "flex" : "none",
      flexDirection: "column",
      opacity: isOpen ? 1 : 0,
      transform: isOpen ? "translateY(0)" : "translateY(20px)",
      transition: "opacity 0.3s ease, transform 0.3s ease",
    },
    header: {
      backgroundColor: primaryColor,
      color: "white",
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    title: {
      fontWeight: 500,
      fontSize: "16px",
      display: "flex",
      alignItems: "center",
    },
    titleIcon: {
      marginRight: "8px",
      width: "20px",
      height: "20px",
    },
    closeButton: {
      background: "transparent",
      border: "none",
      color: "white",
      cursor: "pointer",
      padding: "4px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      width: "28px",
      height: "28px",
      transition: "background-color 0.2s ease",
    },
    closeButtonHover: {
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    iframe: {
      flex: 1,
      border: "none",
      width: "100%",
      height: "100%",
    },
    loadingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      display: loadingState === "loading" ? "flex" : "none",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    loadingIcon: {
      animation: "spin 1.5s linear infinite",
      color: primaryColor,
    },
    errorOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "white",
      display: loadingState === "error" ? "flex" : "none",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
      padding: "20px",
      textAlign: "center",
    },
    errorMessage: {
      color: "#e53e3e",
      marginBottom: "16px",
      fontSize: "14px",
    },
    retryButton: {
      backgroundColor: primaryColor,
      color: "white",
      border: "none",
      padding: "8px 16px",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
      transition: "background-color 0.2s ease",
    },
    retryButtonHover: {
      backgroundColor: adjustColor(primaryColor, -20),
    },
    debugPanel: {
      position: "fixed",
      top: "20px",
      [position]: "20px",
      backgroundColor: "#f1f5f9",
      border: "1px solid #cbd5e1",
      borderRadius: "4px",
      padding: "8px",
      fontSize: "12px",
      zIndex: zIndex + 1,
      maxWidth: "250px",
      display: debug ? "block" : "none",
    },
    debugTitle: {
      fontWeight: "bold",
      marginBottom: "4px",
    },
    debugItem: {
      marginBottom: "2px",
    },
    debugError: {
      color: "#e53e3e",
    },
    "@keyframes spin": {
      "0%": { transform: "rotate(0deg)" },
      "100%": { transform: "rotate(360deg)" },
    },
  };

  // Add keyframes for loading spinner
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      .chatbot-loading-icon {
        animation: spin 1.5s linear infinite;
      }
    `;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <>
      {/* Chat button */}
      {!isOpen && (
        <button onClick={openChat} style={styles.button} aria-label="Open chat">
          {buttonIcon || defaultButtonIcon}
        </button>
      )}

      {/* Chat container */}
      <div ref={containerRef} style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.title}>
            <span style={styles.titleIcon}>
              {buttonIcon || defaultButtonIcon}
            </span>
            {chatTitle}
          </div>
          <button
            onClick={closeChat}
            style={styles.closeButton}
            aria-label="Close chat"
          >
            {closeIcon || defaultCloseIcon}
          </button>
        </div>

        {/* Chat content */}
        <div style={{ position: "relative", flex: 1 }}>
          {/* Loading overlay */}
          <div style={styles.loadingOverlay}>
            {loadingIcon || defaultLoadingIcon}
          </div>

          {/* Error overlay */}
          <div style={styles.errorOverlay}>
            <div style={styles.errorMessage}>
              <strong>Error: </strong>
              <span>
                {error || "Failed to load chat. Please try again later."}
              </span>
            </div>
            <button onClick={retryLoading} style={styles.retryButton}>
              Try Again
            </button>
          </div>

          {/* Iframe */}
          {isOpen && (
            <iframe
              ref={iframeRef}
              src={createDialogflowIframeUrl()}
              style={styles.iframe}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              allow="microphone"
              title={chatTitle}
            />
          )}
        </div>
      </div>

      {/* Debug panel */}
      {debug && (
        <div style={styles.debugPanel}>
          <div style={styles.debugTitle}>Dialogflow Chatbot Debug</div>
          <div style={styles.debugItem}>
            State: {isOpen ? "Open" : "Closed"}
          </div>
          <div style={styles.debugItem}>Loading: {loadingState}</div>
          <div style={styles.debugItem}>Agent ID: {agentId}</div>
          <div style={styles.debugItem}>Project ID: {projectId}</div>
          {error && (
            <div style={{ ...styles.debugItem, ...styles.debugError }}>
              Error: {error}
            </div>
          )}
        </div>
      )}
    </>
  );
};

// Export component and a hook to control it programmatically
export default DialogflowChatbot;

// Export a hook to control the chatbot from other components
export const useChatbotControls = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = () => setIsOpen(true);
  const closeChat = () => setIsOpen(false);
  const toggleChat = () => setIsOpen((prev) => !prev);

  return {
    isOpen,
    openChat,
    closeChat,
    toggleChat,
    setIsOpen,
  };
};
