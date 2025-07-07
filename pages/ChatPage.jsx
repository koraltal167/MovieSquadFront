"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { io } from "socket.io-client"
import axios from "axios"
import ConversationList from "../components/chat/ConversationList"
import ChatWindow from "../components/chat/ChatWindow"
import NewConversationModal from "../components/chat/NewConversationModal"

export default function ChatPage() {
    const [currentUser, setCurrentUser] = useState(null)
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [showNewConversationModal, setShowNewConversationModal] = useState(false)
    const [socket, setSocket] = useState(null)
    const [conversations, setConversations] = useState([])
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()

    // Load conversations from backend
    const loadConversations = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            console.log('Loading conversations from backend...')
            const response = await axios.get('http://localhost:3001/api/conversations/me', {
                headers: { 'x-auth-token': token }
            })
            
            console.log('Loaded conversations:', response.data)
            setConversations(response.data)
        } catch (error) {
            console.error('Error loading conversations:', error)
            if (error.response?.status === 401) {
                console.log('Token invalid, redirecting to login')
                localStorage.clear()
                router.push('/')
            }
        }
    }

    // Helper function to find user by ID
    const findUserById = (userId) => {
        return {
            _id: userId,
            username: "User " + userId.substring(0, 6),
            email: "user@example.com",
            profilePicture: "/default-avatar.png"
        }
    }

    useEffect(() => {
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        
        console.log('Token exists:', !!token)
        console.log('User data exists:', !!userData)
        
        if (!token || !userData) {
            console.log('No token or user data, redirecting to login')
            router.push('/')
            return
        }

        try {
            const user = JSON.parse(userData)
            setCurrentUser(user)
            console.log('Current user set:', user.username)

            // Load conversations from backend
            loadConversations()

            // Initialize Socket.io connection
            const newSocket = io('http://localhost:3001', {
                auth: {
                    token: token
                }
            })

            setSocket(newSocket)

            // Socket event listeners
            newSocket.on('connect', () => {
                console.log('Connected to server')
                setIsLoading(false)
                // Reload conversations when connected
                loadConversations()
            })

            newSocket.on('connect_error', (error) => {
                console.error('Socket connection error:', error)
                if (error.message.includes('Authentication error')) {
                    console.log('Token invalid, redirecting to login')
                    localStorage.clear()
                    router.push('/')
                }
            })

            newSocket.on('joinedPrivateChat', (data) => {
                console.log('Joined private chat:', data)
            })

            newSocket.on('privateChatHistory', (data) => {
                console.log('Received chat history:', data)
                setMessages(data.messages || [])
            })

            newSocket.on('privateMessage', (message) => {
                console.log('New private message received:', message)
                
                // Add message to current conversation messages
                if (selectedConversation && selectedConversation.chatIdentifier === message.chatIdentifier) {
                    setMessages(prev => [...prev, message])
                }
                
                // Update conversations list
                setConversations(prev => {
                    const existingConvIndex = prev.findIndex(conv => conv.chatIdentifier === message.chatIdentifier)
                    
                    if (existingConvIndex !== -1) {
                        // Update existing conversation
                        const updatedConversations = [...prev]
                        updatedConversations[existingConvIndex] = {
                            ...updatedConversations[existingConvIndex],
                            lastMessage: message
                        }
                        return updatedConversations
                    } else {
                        // Create new conversation
                        const otherParticipant = message.sender._id === user._id 
                            ? message.recipient || findUserById(message.recipientId)
                            : message.sender
                        
                        const newConversation = {
                            chatIdentifier: message.chatIdentifier,
                            otherParticipant,
                            lastMessage: message,
                            participants: [user, otherParticipant]
                        }
                        
                        console.log('Auto-creating conversation:', newConversation)
                        return [newConversation, ...prev]
                    }
                })
            })

            newSocket.on('privateChatError', (error) => {
                console.error('Private chat error:', error)
                alert(error)
            })

            newSocket.on('typing', (data) => {
                console.log('User typing:', data)
            })

            newSocket.on('stopTyping', (data) => {
                console.log('User stopped typing:', data)
            })

            return () => {
                newSocket.disconnect()
            }
        } catch (error) {
            console.error('Error parsing user data:', error)
            localStorage.clear()
            router.push('/')
        }
    }, [router])

    const handleConversationSelect = (conversation) => {
        console.log('Selecting conversation:', conversation)
        setSelectedConversation(conversation)
        setMessages([]) // Clear previous messages
        
        // Join the private chat room
        if (socket && conversation.otherParticipant) {
            console.log('Joining private chat with:', conversation.otherParticipant.username)
            socket.emit('joinPrivateChat', conversation.otherParticipant._id)
        }
    }

    const handleSendMessage = (content) => {
        console.log('Sending message:', content)
        if (socket && selectedConversation && content.trim()) {
            const messageData = {
                recipientId: selectedConversation.otherParticipant._id,
                content: content.trim()
            }
            console.log('Emitting sendPrivateMessage:', messageData)
            socket.emit('sendPrivateMessage', messageData)
        } else {
            console.log('Cannot send message - missing:', {
                socket: !!socket,
                selectedConversation: !!selectedConversation,
                content: !!content?.trim()
            })
        }
    }

    const handleNewConversation = (conversation) => {
        console.log('Creating new conversation:', conversation)
        setConversations(prev => {
            // Check if conversation already exists
            const exists = prev.some(conv => conv.chatIdentifier === conversation.chatIdentifier)
            if (exists) {
                console.log('Conversation already exists')
                return prev
            }
            console.log('Adding new conversation to list')
            return [conversation, ...prev]
        })
        setSelectedConversation(conversation)
        setShowNewConversationModal(false)
        
        // Join the new private chat
        if (socket && conversation.otherParticipant) {
            console.log('Joining new private chat with:', conversation.otherParticipant.username)
            socket.emit('joinPrivateChat', conversation.otherParticipant._id)
        }
    }

    const handleStartTyping = () => {
        if (socket && selectedConversation) {
            socket.emit('typing', {
                recipientId: selectedConversation.otherParticipant._id
            })
        }
    }

    const handleStopTyping = () => {
        if (socket && selectedConversation) {
            socket.emit('stopTyping', {
                recipientId: selectedConversation.otherParticipant._id
            })
        }
    }

    if (isLoading || !currentUser) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Connecting to chat...</p>
            </div>
        )
    }

    return (
        <div className="container-fluid" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <div className="container py-4">
                <h1 className="mb-4 text-center">💬 Chat</h1>
                
                <div className="row">
                    {/* Conversations Sidebar */}
                    <div className="col-md-4">
                        <div className="card shadow-sm">
                            <ConversationList
                                currentUser={currentUser}
                                conversations={conversations}
                                onConversationSelect={handleConversationSelect}
                                selectedConversationId={selectedConversation?.chatIdentifier}
                            />
                            <div className="card-footer text-center">
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setShowNewConversationModal(true)}
                                >
                                    ➕ New Chat
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Chat Window */}
                    <div className="col-md-8">
                        <div className="card shadow-sm">
                            <ChatWindow
                                conversation={selectedConversation}
                                currentUser={currentUser}
                                messages={messages}
                                onSendMessage={handleSendMessage}
                                onStartTyping={handleStartTyping}
                                onStopTyping={handleStopTyping}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* New Conversation Modal */}
            {showNewConversationModal && (
                <NewConversationModal
                    isOpen={showNewConversationModal}
                    onClose={() => setShowNewConversationModal(false)}
                    onConversationCreated={handleNewConversation}
                    currentUser={currentUser}
                />
            )}
        </div>
    )
}