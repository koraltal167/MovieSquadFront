"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import EmptyState from "../EmptyState"

export default function FriendRequests({ currentUser }) {
    const [requests, setRequests] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [processingIds, setProcessingIds] = useState(new Set())

    useEffect(() => {
        fetchFriendRequests()
    }, [])

    const fetchFriendRequests = async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            const token = localStorage.getItem('token')
            
            // First, get the current user's profile to access friendRequests array
            const response = await axios.get(
                'http://localhost:3001/api/user/me',
                { headers: { 'x-auth-token': token } }
            )
            
            console.log("User profile response:", response.data) // debug log
            
            const friendRequestIds = response.data.friendRequests || []
            console.log("Friend request IDs:", friendRequestIds) // debug log
            
            if (friendRequestIds.length === 0) {
                setRequests([])
                return
            }
            
            // Fetch user details for each friend request ID
            const requestPromises = friendRequestIds.map(async (requestId) => {
                try {
                    const userResponse = await axios.get(
                        `http://localhost:3001/api/user/profile/${requestId}`,
                        { headers: { 'x-auth-token': token } }
                    )
                    return {
                        _id: requestId,
                        sender: userResponse.data,
                        createdAt: new Date().toISOString() // We don't have the actual request creation date
                    }
                } catch (error) {
                    console.error(`Error fetching user ${requestId}:`, error)
                    return {
                        _id: requestId,
                        sender: {
                            _id: requestId,
                            username: "Unknown User",
                            email: "Unknown Email",
                            profilePicture: "https://via.placeholder.com/60"
                        },
                        createdAt: new Date().toISOString()
                    }
                }
            })
            
            const populatedRequests = await Promise.all(requestPromises)
            console.log("Populated requests:", populatedRequests) // debug log
            
            setRequests(populatedRequests)
        } catch (error) {
            console.error('Error fetching friend requests:', error)
            setError('Failed to load friend requests')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAcceptRequest = async (requestId) => {
        try {
            setProcessingIds(prev => new Set(prev).add(requestId))
            
            const token = localStorage.getItem('token')
            
            await axios.put(
                `http://localhost:3001/api/user/friends/accept`,
                { senderId: requestId },
                { headers: { 'x-auth-token': token } }
            )
            
            // Remove from local state
            setRequests(prev => prev.filter(req => 
                (req._id || req.id) !== requestId
            ))
            
        } catch (error) {
            console.error('Error accepting friend request:', error)
            alert('Failed to accept friend request. Please try again.')
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(requestId)
                return newSet
            })
        }
    }

    const handleRejectRequest = async (requestId) => {
        try {
            setProcessingIds(prev => new Set(prev).add(requestId))
            
            const token = localStorage.getItem('token')
            
            await axios.put(
                `http://localhost:3001/api/user/friends/reject`,
                { senderId: requestId },
                { headers: { 'x-auth-token': token } }
            )
            
            // Remove from local state
            setRequests(prev => prev.filter(req => 
                (req._id || req.id) !== requestId
            ))
            
        } catch (error) {
            console.error('Error rejecting friend request:', error)
            alert('Failed to reject friend request. Please try again.')
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(requestId)
                return newSet
            })
        }
    }

    if (isLoading) {
        return (
            <div className="text-center p-4">
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading friend requests...</span>
                </div>
                <p className="text-white mt-2">Loading friend requests...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center p-4">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
                <button 
                    className="btn btn-warning btn-sm"
                    onClick={fetchFriendRequests}
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="friend-requests">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="text-white mb-0">
                    Friend Requests ({requests.length})
                </h5>
                
                {requests.length > 0 && (
                    <button
                        className="btn btn-outline-warning btn-sm"
                        onClick={fetchFriendRequests}
                        disabled={isLoading}
                    >
                        Refresh
                    </button>
                )}
            </div>

            {/* Friend Requests List */}
            {requests.length === 0 ? (
                <EmptyState 
                    text="No pending friend requests"
                    showButton={false}
                />
            ) : (
                <div className="requests-list">
                    {requests.map((request, index) => {
                        // debug log for each request
                        console.log(`Request ${index}:`, request)
                        
                        return (
                        <div 
                            key={request._id || request.id || index}
                            className="card mb-3" 
                            style={{ backgroundColor: '#1a1a1a', border: '1px solid #333', color: 'white' }}
                        >
                            <div className="card-body">
                                <div className="d-flex align-items-center">
                                    {/* Profile Picture */}
                                    <div className="me-3">
                                        <img
                                            src={request.sender?.profilePicture || 
                                                 request.requester?.profilePicture || 
                                                 request.from?.profilePicture || 
                                                 request.user?.profilePicture || 
                                                 "https://via.placeholder.com/60"}
                                            alt={request.sender?.username || 
                                                 request.requester?.username || 
                                                 request.from?.username || 
                                                 request.user?.username || 
                                                 "User"}
                                            className="rounded-circle"
                                            style={{ 
                                                width: '60px', 
                                                height: '60px',
                                                objectFit: 'cover',
                                                border: '2px solid #ff8c00'
                                            }}
                                        />
                                    </div>

                                    {/* Request Info */}
                                    <div className="flex-grow-1">
                                        <h6 className="card-title mb-1" style={{ color: 'white' }}>
                                            {request.sender?.username || 
                                             request.requester?.username || 
                                             request.from?.username || 
                                             request.user?.username || 
                                             "Unknown User"}
                                        </h6>
                                        <p className="card-text mb-2" style={{ fontSize: '0.9rem', color: '#ccc' }}>
                                            {request.sender?.email || 
                                             request.requester?.email || 
                                             request.from?.email || 
                                             request.user?.email || 
                                             "No email"}
                                        </p>
                                        <small style={{ color: '#999' }}>
                                            Sent {request.createdAt ? new Date(request.createdAt).toLocaleDateString() : "Unknown date"}
                                        </small>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-flex gap-2">
                                        <button
                                            type="button"
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleAcceptRequest(request._id || request.id)}
                                            disabled={processingIds.has(request._id || request.id)}
                                        >
                                            {processingIds.has(request._id || request.id) ? (
                                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                            ) : (
                                                "✅ Accept"
                                            )}
                                        </button>
                                        
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleRejectRequest(request._id || request.id)}
                                            disabled={processingIds.has(request._id || request.id)}
                                        >
                                            {processingIds.has(request._id || request.id) ? (
                                                <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                            ) : (
                                                "❌ Reject"
                                            )}
                                        </button>
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
