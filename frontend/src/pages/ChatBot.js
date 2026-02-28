import React, { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";

const Chatbot = () => {
  const [dfLoaded, setDfLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const existingScript = document.querySelector(
      'script[src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src =
        "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
      script.async = true;
      script.onload = () => setDfLoaded(true);
      document.body.appendChild(script);
    } else {
      setDfLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!dfLoaded) return;

    const styleChatWindow = () => {
      const dfMessenger = document.querySelector("df-messenger");
      if (!dfMessenger) return;

      const shadowRoot = dfMessenger.shadowRoot;
      if (!shadowRoot) return;

      // Style chat window container (optional)
      const chat = shadowRoot.querySelector("df-messenger-chat");
      if (chat) {
        chat.style.position = "fixed";
        chat.style.bottom = "100px";
        chat.style.right = "20px";
        chat.style.width = "300px";
        chat.style.height = "400px";
        chat.style.borderRadius = "12px";
        chat.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
        chat.style.border = "1px solid #e5e7eb";
        // Show/hide based on isOpen
        chat.style.display = isOpen ? "block" : "none";
      }

      // Style title bar (optional)
      const titleBar = shadowRoot.querySelector(".title-bar");
      if (titleBar) {
        titleBar.style.background = "#3B7962";
        titleBar.style.color = "white";
        titleBar.style.padding = "12px 16px";
        titleBar.style.fontSize = "16px";
        titleBar.style.fontWeight = "500";
        titleBar.style.borderRadius = "12px 12px 0 0";
      }

      // Style bot messages
      const botMessages = shadowRoot.querySelectorAll(".chat-bubble.bot");
      botMessages.forEach((msg) => {
        msg.style.background = "#f3f4f6";
        msg.style.color = "#111827";
        msg.style.borderRadius = "8px 8px 8px 0";
      });

      // Style user messages
      const userMessages = shadowRoot.querySelectorAll(".chat-bubble.user");
      userMessages.forEach((msg) => {
        msg.style.background = "#3B7962";
        msg.style.color = "white";
        msg.style.borderRadius = "8px 8px 0 8px";
      });

      // Style input box
      const inputBox = shadowRoot.querySelector(".input-box");
      if (inputBox) {
        inputBox.style.borderTop = "1px solid #e5e7eb";
        inputBox.style.padding = "12px";
        inputBox.style.background = "white";
      }
    };

    const interval = setInterval(styleChatWindow, 300);
    return () => clearInterval(interval);
  }, [dfLoaded, isOpen]);

  return (
    <>
      {/* Conditionally render the chatbot only when loaded and open */}
      {dfLoaded && isOpen && (
        <df-messenger
          intent="WELCOME"
          chat-title="Customer Support"
          agent-id="314198d6-aca8-4413-a00a-5d81868c72e8"
          language-code="en"
          style={{
            position: "fixed",
            zIndex: "40",
            bottom: "100px",
            right: "20px",
            width: "300px",
            height: "400px",
            "--df-messenger-bot-message": "#f3f4f6",
            "--df-messenger-button-titlebar-color": "#3B7962",
            "--df-messenger-chat-background-color": "#ffffff",
            "--df-messenger-font-color": "#111827",
            "--df-messenger-send-icon": "#3B7962",
            "--df-messenger-user-message": "#3B7962",
          }}
        ></df-messenger>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all ${
          isOpen ? "bg-gray-600" : "bg-[#3B7962]"
        } text-white hover:scale-105`}
        title={isOpen ? "Hide Chat" : "Open Chat"}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>
    </>
  );
};

export default Chatbot;
