"use client"

import { useState, useEffect, useRef } from "react"
import MessageBubble from "./MessageBubble"

export default function ChatWindow({ 
    conversation, 
    currentUser, 
    messages, 
    onSendMessage, 
    onStartTyping, 
    onStopTyping 
}) {
    const [newMessage, setNewMessage] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef(null)
    const typingTimeoutRef = useRef(null)

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const handleInputChange = (e) => {
        setNewMessage(e.target.value)
        
        // Handle typing indicator
        if (e.target.value.trim() && !isTyping) {
            setIsTyping(true)
            onStartTyping()
        }

        // Clear existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current)
        }

        // Set new timeout to stop typing
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false)
            onStopTyping()
        }, 1000)
    }

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !conversation || isSending) return

        setIsSending(true)
        
        try {
            // Send message via Socket.io
            onSendMessage(newMessage.trim())
            setNewMessage('')
            
            // Stop typing indicator
            if (isTyping) {
                setIsTyping(false)
                onStopTyping()
            }
            
        } catch (error) {
            console.error('Error sending message:', error)
            alert('Failed to send message. Please try again.')
        } finally {
            setIsSending(false)
        }
    }

    if (!conversation) {
        return (
            <div className="chat-window d-flex align-items-center justify-content-center" style={{ height: '500px' }}>
                <div className="text-center text-muted">
                    <h5>💬 Select a conversation</h5>
                    <p>Choose a conversation from the list to start messaging</p>
                </div>
            </div>
        )
    }

    return (
        <div className="chat-window d-flex flex-column" style={{ height: '500px' }}>
            {/* Chat Header */}
            <div className="chat-header p-3 border-bottom bg-light">
                <div className="d-flex align-items-center">
                    <img
                        src={conversation.otherParticipant?.profilePicture || '/default-avatar.png'}
                        alt={conversation.otherParticipant?.username || 'User'}
                        className="rounded-circle me-3"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                    />
                    <div>
                        <h6 className="mb-0">{conversation.otherParticipant?.username || 'Unknown User'}</h6>
                        <small className="text-muted">
                            {conversation.otherParticipant?.isOnline ? '🟢 Online' : '⚫ Offline'}
                        </small>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="messages-area flex-grow-1 overflow-auto p-3" style={{ backgroundColor: '#f8f9fa' }}>
                {messages.length === 0 ? (
                    <div className="text-center p-4 text-muted">
                        <p>No messages yet</p>
                        <small>Start the conversation!</small>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <MessageBubble
                                key={message._id}
                                message={message}
                                isOwn={message.sender._id === currentUser._id}
                                showAvatar={index === 0 || messages[index - 1].sender._id !== message.sender._id}
                            />
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Message Input */}
            <div className="message-input p-3 border-top">
                <form onSubmit={sendMessage} className="d-flex gap-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={handleInputChange}
                        disabled={isSending}
                    />
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={!newMessage.trim() || isSending}
                    >
                        {isSending ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                            '📤'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}