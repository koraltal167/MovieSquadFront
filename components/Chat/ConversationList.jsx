"use client"

import { useState, useEffect } from "react"
import axios from "axios"

export default function ConversationList({ 
    currentUser, 
    conversations, 
    onConversationSelect, 
    selectedConversationId 
}) {
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchConversations()
    }, [])

    const fetchConversations = async () => {
        try {
            const token = localStorage.getItem('token')
            
            // Debug: Check if token exists
            console.log('Token exists:', !!token)
            
            if (!token) {
                console.log('No token found, skipping API call')
                setIsLoading(false)
                return
            }

            console.log('Making API call to fetch conversations...')
            const response = await axios.get('http://localhost:3001/api/conversations/me', {
                headers: { 
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            })
            
            console.log('Conversations fetched successfully:', response.data)
            
        } catch (error) {
            console.error('Error fetching conversations:', error)
            
            if (error.response?.status === 401) {
                console.log('Token invalid, user might need to login again')
                // Don't set error for 401, just skip
            } else {
                setError('Failed to load conversations')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const formatLastMessage = (message) => {
        if (!message) return 'No messages yet'
        return message.content.length > 30 
            ? message.content.substring(0, 30) + '...'
            : message.content
    }

    const formatTime = (timestamp) => {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now - date
        
        if (diff < 60000) return 'Just now'
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
        return date.toLocaleDateString()
    }

    if (isLoading) {
        return (
            <div className="text-center p-4">
                <div className="spinner-border spinner-border-sm" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="alert alert-danger m-3" role="alert">
                {error}
            </div>
        )
    }

    return (
        <div className="conversation-list">
            <div className="p-3 border-bottom">
                <h6 className="mb-0">💬 Messages</h6>
            </div>
            
            {conversations.length === 0 ? (
                <div className="text-center p-4 text-muted">
                    <p>No conversations yet</p>
                    <small>Start a new conversation!</small>
                </div>
            ) : (
                <div className="list-group list-group-flush">
                    {conversations.map(conversation => {
                        const isSelected = conversation.chatIdentifier === selectedConversationId
                        
                        return (
                            <div
                                key={conversation.chatIdentifier}
                                className={`list-group-item list-group-item-action ${isSelected ? 'active' : ''}`}
                                onClick={() => onConversationSelect(conversation)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="d-flex justify-content-between">
                                    <div className="d-flex align-items-center flex-grow-1">
                                        <img
                                            src={conversation.otherParticipant?.profilePicture || '/default-avatar.png'}
                                            alt={conversation.otherParticipant?.username || 'User'}
                                            className="rounded-circle me-3"
                                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                        />
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between">
                                                <h6 className="mb-1">{conversation.otherParticipant?.username || 'Unknown User'}</h6>
                                                <small className="text-muted">
                                                    {formatTime(conversation.lastMessage?.createdAt)}
                                                </small>
                                            </div>
                                            <p className="mb-1 text-muted">
                                                {formatLastMessage(conversation.lastMessage)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}