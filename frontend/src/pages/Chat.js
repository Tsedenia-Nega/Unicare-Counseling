import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import io from "socket.io-client";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiSend,
  FiTrash2,
  FiSmile,
  FiMoreVertical,
  FiX,
  FiUser,
  FiEdit,
  FiClock,
  FiPaperclip,
  FiArrowLeft,
  FiDownload,
  FiFile,
  FiFileText,
  FiImage,
} from "react-icons/fi";
import { BsCheck2All, BsThreeDots, BsPeople } from "react-icons/bs";
import { IoSend } from "react-icons/io5";
import API from "../services/api";

const APP_PORT = process.env.REACT_APP_SOCKET_URL;
const socket = io(`${APP_PORT}`, {
  auth: {
    token: localStorage.getItem("token"),
  },
  reconnectionAttempts: 3,
  reconnectionDelay: 1000,
});

const FileMessage = ({ message }) => {
  const isImage = message.fileType?.startsWith('image/');
  const fileName = message.originalFilename || message.content.split('/').pop();
  
  const getFileIcon = () => {
    if (message.fileType?.startsWith('image/')) return FiImage;
    if (message.fileType?.includes('pdf')) return FiFile;
    return FiFileText;
  };
  
  const FileIcon = getFileIcon();
  
  return (
    <div className="max-w-sm">
      {isImage ? (
        <div className="relative group">
          <img
            src={`${APP_PORT}${message.content}`}
            alt={fileName}
            className="max-w-full rounded-lg shadow-sm hover:shadow-md transition-shadow"
          />
          <a
            href={`${APP_PORT}${message.content}`}
            download={fileName}
            className="absolute top-2 right-2 bg-black bg-opacity-50 p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
            title="Download"
          >
            <FiDownload />
          </a>
        </div>
      ) : (
        <a
          href={`${APP_PORT}${message.content}`}
          download={fileName}
          className="flex items-center space-x-2 p-3 rounded-lg bg-white shadow-sm hover:shadow-md transition-all border border-gray-200"
        >
          <FileIcon className="text-2xl text-gray-500" />
          <div className="flex-1 truncate">
            <p className="text-sm font-medium text-gray-700 truncate">{fileName}</p>
            <p className="text-xs text-gray-500">{message.fileType}</p>
          </div>
          <FiDownload className="text-gray-400 hover:text-gray-600" />
        </a>
      )}
    </div>
  );
};

const ChatApp = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [currentRoom, setCurrentRoom] = useState("general");
  const [rooms, setRooms] = useState([
    { name: "general", unread: 0 },
    { name: "support", unread: 0 },
    { name: "random", unread: 0 },
  ]);
  const [typingStatus, setTypingStatus] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMessage, setEditingMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("connected");
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);

  // Error messages mapping
  const errorMessages = {
    "Failed to fetch":
      "Connection problem. Please check your internet connection.",
    "No authentication token found": "Please login to continue",
    "Session expired": "Your session has expired. Please login again.",
    "Invalid file type":
      "File type not supported. Please upload images, documents, or text files.",
    "File too large":
      "File size exceeds 10MB limit. Please choose a smaller file.",
    "Failed to upload files": "File upload failed. Please try again.",
    "Failed to send message": "Could not send message. Please try again.",
    Unauthorized: "You are not authorized to perform this action",
    default: "Something went wrong. Please try again later.",
  };

  // Handle errors with user-friendly messages
  const handleError = (error) => {
    console.error("Error:", error);
    const message = errorMessages[error.message] || errorMessages["default"];
    setError(message);
    setShowError(true);

    setTimeout(() => setShowError(false), 5000);

    // if (
    //   error.message === "No authentication token found" ||
    //   error.message === "Session expired")
    // // ) {
    //   // logout();
    // //   // navigate("/login");
    // // }
  };

  // Authenticated fetch helper
  const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    if (!token) {
     
      throw new Error("No authentication token found");
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        throw new Error("Session expired");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Request failed");
      }

      return response.json();
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  // File dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 5,
    maxSize: 50 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
    onDropRejected: (rejectedFiles) => {
      const error = rejectedFiles[0]?.errors[0];
      if (error?.code === 'file-too-large') {
        handleError(new Error('File too large - Maximum size is 5MB'));
      } else if (error?.code === 'file-invalid-type') {
        handleError(new Error('Invalid file type - Only images, PDFs, DOC, DOCX and TXT files are allowed'));
      }
    }
  });

  // Remove a file from the upload list
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Upload files to server
  const handleFileUpload = async () => {
    if (!files.length || !user) {
      handleError(new Error("Please select files to upload"));
      return;
    }

    if (!currentRoom) {
      handleError(new Error("No chat room selected"));
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    
    try {
      // Validate file sizes before upload
      const maxSize = 50 * 1024 * 1024; // 25MB
      const oversizedFiles = files.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        throw new Error(`Some files exceed the 25MB limit: ${oversizedFiles.map(f => f.name).join(', ')}`);
      }

      // Add each file to formData
      files.forEach((file) => {
        formData.append("file", file);
      });
      
      formData.append("roomId", currentRoom);

      const response = await API.post(
        `${APP_PORT}/api/messages/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${localStorage.getItem("token")}`
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`Upload Progress: ${percentCompleted}%`);
          }
        }
      );

      if (response.data) {
        setFiles([]);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Failed to upload files";
      handleError(new Error(errorMessage));
    } finally {
      setIsUploading(false);
    }
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load messages from server
  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const data = await authFetch(
        `${APP_PORT}/api/messages/${currentRoom}`
      );
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup socket listeners and fetch initial messages
  useEffect(() => {
   

    fetchMessages();
    socket.emit("joinRoom", { roomId: currentRoom, userId: user._id });

    socket.on("message", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("messageDeleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    });

    socket.on("messageEdited", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    });

    socket.on("typingResponse", (data) => {
      if (data.roomId === currentRoom && data.userId !== user._id) {
        setTypingStatus(`${data.first_name} is typing...`);
        const timer = setTimeout(() => setTypingStatus(""), 2000);
        return () => clearTimeout(timer);
      }
    });

    socket.on("userOnline", (users) => {
      setOnlineUsers(users);
    });

    socket.on("connect_error", (err) => {
      if (err.message === "Authentication error") {
        handleError(new Error("Session expired"));
      } else {
        handleError(new Error("Connection problem. Trying to reconnect..."));
      }
    });

    socket.on("disconnect", (reason) => {
      if (reason === "io server disconnect") {
        handleError(
          new Error("Disconnected from server. Please refresh the page.")
        );
      }
    });

    socket.on("connect", () => setConnectionStatus("connected"));
    socket.on("disconnect", () => setConnectionStatus("disconnected"));
    socket.on("reconnecting", () => setConnectionStatus("reconnecting"));

    return () => {
      socket.off("message");
      socket.off("messageDeleted");
      socket.off("messageEdited");
      socket.off("typingResponse")
      socket.off("userOnline");
      socket.off("connect_error");
      socket.off("disconnect");
      socket.off("connect");
      socket.off("reconnecting");
    };
  }, [currentRoom, user]);

  // Auto-scroll when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!isTyping && user) {
      setIsTyping(true);
      socket.emit("typing", {
        roomId: currentRoom,
        userId: user._id,
        first_name: user.first_name,
      });
      const timer = setTimeout(() => setIsTyping(false), 2000);
      return () => clearTimeout(timer);
    }
  };

  // Handle sending or updating a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() && files.length === 0) return;

    try {
      if (editingMessage) {
        await API.put(
          `${APP_PORT}/api/messages/${editingMessage._id}`,
          {
            content: messageInput,
            senderId: user._id,
            }
        );
        setEditingMessage(null);
      } else if (messageInput.trim()) {
        await API.post(`${APP_PORT}/api/messages/send`, {
          roomId: currentRoom,
          content: messageInput,
          messageType: "group",
            senderId: user._id,
            });
        
      }

      if (files.length > 0) {
        await handleFileUpload();
      }

      setMessageInput("");
      setIsTyping(false);
    } catch (error) {
      handleError(error);
    }
  };

  // Handle editing a message
  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setMessageInput(message.content);
  };

  // Handle deleting a message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?"))
      return;

    try {
      await API.delete(`${APP_PORT}/api/messages/${messageId}`  );
    } catch (error) {
      handleError(error);
    }
  };

  // Handle showing user profile
  const showProfile = (message) => {
    if (!message || !message.senderId || message.senderId._id === user._id)
      return;

    setSelectedUser({
      id: message.senderId._id,
      firstName: message.senderId.first_name || "Unknown",
      email: message.senderId.email || "No email available",
      avatar: message.senderId.avatar || message.senderId.profile_picture || "",
      role: message.senderId.role || "user",
      isOnline: onlineUsers.some((u) => u.userId === message.senderId._id),
    });
    setShowUserProfile(true);
  };

  // Handle room change
  const handleRoomChange = (room) => {
    setCurrentRoom(room);
    setEditingMessage(null);
    setMessageInput("");
    socket.emit("joinRoom", { roomId: room, userId: user._id });
  };

 

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Error Message */}
      {showError && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-lg max-w-xs md:max-w-md flex justify-between items-start">
            <div>
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
            <button
              onClick={() => setShowError(false)}
              className="ml-4 text-red-700 hover:text-red-900"
            >
              <FiX />
            </button>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      {showUserProfile && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
            <button
              onClick={() => setShowUserProfile(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <FiX className="text-xl" />
            </button>

            <div className="flex flex-col items-center mb-6">
              <div className="relative w-24 h-24 mb-4">
                {selectedUser.profile_picture ? (
                  <img
                    src={`${APP_PORT}/uploads/profile_pictures/${selectedUser.profile_picture}`}
                    alt={selectedUser.firstName}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center text-3xl font-bold text-green-800">
                    {selectedUser.firstName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div
                  className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                    selectedUser.isOnline ? "bg-green-500" : "bg-gray-400"
                  }`}
                />
              </div>
              <h3 className="text-xl font-bold text-gray-800">{selectedUser.firstName}</h3>
              <p className="text-gray-500">{selectedUser.email}</p>
              <p className="text-sm text-gray-500 mt-1 capitalize">{selectedUser.role}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Room List */}
        <div className="w-64 bg-gradient-to-b bg-[#3B7962] text-white p-4 flex flex-col shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 rounded-full hover:bg-[#2e5b44] transition-colors"
              >
                <FiArrowLeft className="text-xl text-white" />
              </button>
              <h2 className="text-xl font-bold">Chat Rooms</h2>
            </div>
            <button className="p-1 rounded-full hover:bg-green-600">
              <BsThreeDots className="text-lg" />
            </button>
          </div>

          <ul className="space-y-1 flex-1 overflow-y-auto">
            {rooms.map((room) => (
              <li key={room.name}>
                <button
                  onClick={() => handleRoomChange(room.name)}
                  className={`w-full text-left px-3 py-3 rounded-lg flex justify-between items-center transition-all ${
                                currentRoom === room.name
                      ? "bg-white text-green-800 font-medium shadow-md"
                      : "hover:bg-[#2e5b44]"
                  }`}
                >
                  <span>#{room.name}</span>
                  {room.unread > 0 && (
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {room.unread}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-4 border-t border-green-600">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {user.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    // alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                    {user.first_name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-green-800"></div>
              </div>
              <div>
                <p className="font-medium">{user.first_name}</p>
                <p className="text-xs text-green-200">Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {/* Room Header */}
          <div className="bg-white p-4 border-b flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              {/* <button 
                onClick={() => navigate(-1)} 
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <FiArrowLeft className="text-xl text-gray-600" />
              </button> */}
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold">
                #{currentRoom.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">
                  #{currentRoom}
                </h2>
                <div className="flex items-center space-x-2">
                  <p className="text-xs text-gray-500">
                    {typingStatus || `${messages.length} messages`}
                  </p>
                  <span className="text-xs text-gray-400">•</span>
                  <div className="flex items-center text-xs text-gray-500">
                    <BsPeople className="mr-1" />
                    {onlineUsers.length} online
                  </div>
                  <span className="text-xs text-gray-400">•</span>
                  <div className="flex items-center text-xs">
                    <span
                      className={`w-2 h-2 rounded-full mr-1 ${
                        connectionStatus === "connected"
                          ? "bg-green-500"
                          : connectionStatus === "reconnecting"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                    ></span>
                    {connectionStatus === "connected"
                      ? "Online"
                      : connectionStatus === "reconnecting"
                      ? "Reconnecting..."
                      : "Offline"}
                  </div>
                </div>
              </div>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <FiMoreVertical className="text-gray-500" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-gray-100">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <IoSend className="text-3xl text-green-600" />
                </div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No messages yet
                </h3>
                <p className="text-gray-500 max-w-md">
                  Start the conversation by sending your first message to #
                  {currentRoom}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex group ${
                      message.senderId._id === user._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative ${
                        message.senderId._id === user._id
                          ? "bg-green-600 text-white rounded-tr-none"
                          : "bg-white border border-gray-200 rounded-tl-none shadow-sm cursor-pointer hover:bg-gray-50"
                      }`}
                    >
                      {message.senderId._id !== user._id && (
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="relative">
                            {message.senderId.profile_picture ? (
                              <img
                                src={`${APP_PORT}/uploads/profile_pictures/${message.senderId.profile_picture}`}
                                alt={message.senderId.first_name}
                                className="w-6 h-6 rounded-full object-cover"
                                onClick={() => showProfile(message)}
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-800">
                                {message.senderId.first_name?.charAt(0).toUpperCase() || "U"}
                              </div>
                            )}
                            <div
                              className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-white ${
                                onlineUsers.some((u) => u.userId === message.senderId._id)
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                          </div>
                          <span
                            className="font-bold text-sm text-green-800 hover:underline cursor-pointer"
                            onClick={() => showProfile(message)}
                          >
                            {message.senderId.first_name || "Unknown"}
                          </span>
                        </div>
                      )}

                      <div className="text-sm">
                        {message.isFile ? (
                          <div className="mt-1">
                            {message.fileType?.startsWith("image/") ? (
                              <div className="mt-2">
                                <img
                                  src={`${APP_PORT}${message.content}`}
                                  alt={message.originalFilename || "Uploaded image"}
                                  className="max-w-xs rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                />
                                <a
                                  href={`${APP_PORT}${message.content}`}
                                  download={message.originalFilename}
                                  className="text-xs mt-1 hover:underline inline-flex items-center"
                                >
                                  <FiDownload className="mr-1" />
                                  {message.originalFilename || "Download image"}
                                </a>
                              </div>
                            ) : (
                              <a
                                href={`${APP_PORT}${message.content}`}
                                download={message.originalFilename}
                                className="inline-flex items-center hover:underline"
                              >
                                <FiPaperclip className="mr-1" />
                                {message.originalFilename || "Download file"}
                              </a>
                            )}
                          </div>
                        ) : (
                          message.content
                        )}
                        {message.edited && (
                          <span className="text-xs ml-2 opacity-70">
                            (edited)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-end mt-1 space-x-2">
                        <span
                          className={`text-xs ${
                            message.senderId._id === user._id
                              ? "text-green-200"
                              : "text-gray-400"
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {message.senderId._id === user._id && (
                          <>
                            <BsCheck2All
                              className={`text-xs ${
                                message.read ? "text-blue-300" : "text-gray-300"
                              }`}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditMessage(message);
                              }}
                              className="text-xs hover:text-white"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteMessage(message._id);
                              }}
                              className="text-xs hover:text-white"
                            >
                              <FiTrash2 />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="bg-white p-4 border-t">
            {/* File preview area */}
            {files.length > 0 && (
              <div className="mb-3 p-3 bg-gray-100 rounded-lg">
                <div className="flex flex-wrap gap-2 mb-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-white p-2 rounded border"
                    >
                      <span className="text-sm truncate max-w-xs">
                        {file.name}
                      </span>
                      <button
                        onClick={() => removeFile(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleFileUpload}
                  disabled={isUploading}
                  className={`px-3 py-1 text-sm rounded ${
                    isUploading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {isUploading ? "Uploading..." : "Send Files"}
                </button>
              </div>
            )}

            <form
              onSubmit={handleSendMessage}
              className="flex items-center space-x-2"
            >
              <div {...getRootProps()} className="p-2 cursor-pointer">
                <input {...getInputProps()} />
                {isDragActive ? (
                  <FiPaperclip className="text-xl text-green-600" />
                ) : (
                  <FiPaperclip className="text-xl text-gray-500 hover:text-green-600" />
                )}
              </div>

              <div className="flex-1 bg-gray-100 rounded-full px-4 flex items-center">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                  }}
                  placeholder={`Message #${currentRoom}`}
                  className="flex-1 bg-transparent py-3 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!messageInput.trim() && files.length === 0}
                className={`p-2 rounded-full ${
                  messageInput.trim() || files.length > 0
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                {editingMessage ? <FiEdit /> : <FiSend className="text-xl" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
