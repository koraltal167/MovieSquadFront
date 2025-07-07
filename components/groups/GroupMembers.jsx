"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import EmptyState from "../EmptyState"

export default function GroupMembers({ groupId, currentUser, isCreator }) {
    const [members, setMembers] = useState([])
    const [pendingRequests, setPendingRequests] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [activeTab, setActiveTab] = useState("members") // members, requests
    const [processingIds, setProcessingIds] = useState(new Set())

    useEffect(() => {
        fetchMembers()
        if (isCreator) {
            fetchPendingRequests()
        }
    }, [groupId])

    const fetchMembers = async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            const token = localStorage.getItem('token')
            
            const response = await axios.get(
                `http://localhost:3001/api/groups/${groupId}`,
                { headers: { 'x-auth-token': token } }
            )
            
            console.log('Group details:', response.data)
            // Extract members from the group object
            setMembers(response.data.members || [])
        } catch (error) {
            console.error('Error fetching members:', error)
            setError('Failed to load members')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchPendingRequests = async () => {
        try {
            const token = localStorage.getItem('token')
            
            const response = await axios.get(
                `http://localhost:3001/api/groups/${groupId}/requests`,
                { headers: { 'x-auth-token': token } }
            )
            
            console.log('Pending requests:', response.data)
            setPendingRequests(response.data)
        } catch (error) {
            console.error('Error fetching pending requests:', error)
        }
    }

    const handleApproveRequest = async (userId) => {
        try {
            setProcessingIds(prev => new Set(prev).add(userId))
            
            const token = localStorage.getItem('token')
            
            await axios.put(
                `http://localhost:3001/api/groups/${groupId}/requests/${userId}/approve`,
                {},
                { headers: { 'x-auth-token': token } }
            )
            
            // Remove from pending requests
            setPendingRequests(prev => prev.filter(req => req._id !== userId))
            
            // Refresh members list
            fetchMembers()
            
            alert('Request approved successfully!')
        } catch (error) {
            console.error('Error approving request:', error)
            alert('Failed to approve request. Please try again.')
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(userId)
                return newSet
            })
        }
    }

    const handleRejectRequest = async (userId) => {
        try {
            setProcessingIds(prev => new Set(prev).add(userId))
            
            const token = localStorage.getItem('token')
            
            await axios.put(
                `http://localhost:3001/api/groups/${groupId}/requests/${userId}/reject`,
                {},
                { headers: { 'x-auth-token': token } }
            )
            
            // Remove from pending requests
            setPendingRequests(prev => prev.filter(req => req._id !== userId))
            
            alert('Request rejected.')
        } catch (error) {
            console.error('Error rejecting request:', error)
            alert('Failed to reject request. Please try again.')
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(userId)
                return newSet
            })
        }
    }

    const handleRemoveMember = async (userId, username) => {
        if (!confirm(`Remove ${username} from the group?`)) return
        
        try {
            setProcessingIds(prev => new Set(prev).add(userId))
            
            const token = localStorage.getItem('token')
            
            await axios.delete(
                `http://localhost:3001/api/groups/${groupId}/members/${userId}`,
                { headers: { 'x-auth-token': token } }
            )
            
            // Remove from members list
            setMembers(prev => prev.filter(member => member._id !== userId))
            
            alert(`${username} has been removed from the group.`)
        } catch (error) {
            console.error('Error removing member:', error)
            alert('Failed to remove member. Please try again.')
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(userId)
                return newSet
            })
        }
    }

    const handleMakeAdmin = async (userId, username) => {
        if (!confirm(`Make ${username} an admin of this group?`)) return
        
        try {
            setProcessingIds(prev => new Set(prev).add(userId))
            
            const token = localStorage.getItem('token')
            
            await axios.put(
                `http://localhost:3001/api/groups/${groupId}/members/${userId}/admin`,
                {},
                { headers: { 'x-auth-token': token } }
            )
            
            // Refresh members list
            fetchMembers()
            
            alert(`${username} is now an admin!`)
        } catch (error) {
            console.error('Error making admin:', error)
            alert('Failed to make admin. Please try again.')
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev)
                newSet.delete(userId)
                return newSet
            })
        }
    }

    const filteredMembers = members.filter(member =>
        member.username.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="text-center p-4">
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading members...</span>
                </div>
                <p className="text-white mt-2">Loading members...</p>
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
                    onClick={fetchMembers}
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="group-members">
            {/* Tabs */}
            <div className="mb-4">
                <ul className="nav nav-tabs" style={{ borderBottom: '1px solid #444' }}>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === 'members' ? 'active' : ''}`}
                            onClick={() => setActiveTab('members')}
                            style={{
                                backgroundColor: activeTab === 'members' ? '#ff8c00' : 'transparent',
                                color: activeTab === 'members' ? 'white' : '#ccc',
                                border: '1px solid #444'
                            }}
                        >
                            👥 Members ({members.length})
                        </button>
                    </li>
                    {isCreator && (
                        <li className="nav-item">
                            <button
                                className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
                                onClick={() => setActiveTab('requests')}
                                style={{
                                    backgroundColor: activeTab === 'requests' ? '#ff8c00' : 'transparent',
                                    color: activeTab === 'requests' ? 'white' : '#ccc',
                                    border: '1px solid #444'
                                }}
                            >
                                📋 Requests ({pendingRequests.length})
                            </button>
                        </li>
                    )}
                </ul>
            </div>

            {/* Members Tab */}
            {activeTab === 'members' && (
                <div>
                    {/* Search */}
                    {members.length > 0 && (
                        <div className="mb-4">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    backgroundColor: '#3c3c3c',
                                    border: '1px solid #555',
                                    color: 'white'
                                }}
                            />
                        </div>
                    )}

                    {/* Members List */}
                    {filteredMembers.length === 0 ? (
                        <EmptyState 
                            text={searchTerm ? "No members found matching your search" : "No members in this group"}
                            showButton={false}
                        />
                    ) : (
                        <div className="members-list">
                            {filteredMembers.map((member, index) => (
                                <div 
                                    key={member._id}
                                    className="card mb-3"
                                    style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}
                                >
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            {/* Profile Picture */}
                                            <div className="me-3">
                                                <img
                                                    src={member.profilePicture || "https://via.placeholder.com/50"}
                                                    alt={member.username}
                                                    className="rounded-circle"
                                                    style={{ 
                                                        width: '50px', 
                                                        height: '50px',
                                                        objectFit: 'cover',
                                                        border: '2px solid #ff8c00'
                                                    }}
                                                />
                                            </div>

                                            {/* Member Info */}
                                            <div className="flex-grow-1">
                                                <h6 className="mb-1 text-white">
                                                    {member.username}
                                                    {member.isAdmin && (
                                                        <span className="badge bg-warning ms-2" style={{ fontSize: '0.7rem' }}>
                                                            👑 Admin
                                                        </span>
                                                    )}
                                                    {member.isCreator && (
                                                        <span className="badge bg-success ms-2" style={{ fontSize: '0.7rem' }}>
                                                            🎯 Creator
                                                        </span>
                                                    )}
                                                </h6>
                                                <p className="mb-1 text-white" style={{ fontSize: '0.9rem' }}>
                                                    {member.email}
                                                </p>
                                                <small className="text-muted">
                                                    Joined: {new Date(member.joinedAt || Date.now()).toLocaleDateString()}
                                                </small>
                                            </div>

                                            {/* Actions */}
                                            {isCreator && member._id !== currentUser._id && (
                                                <div className="d-flex gap-2">
                                                    {!member.isAdmin && (
                                                        <button
                                                            className="btn btn-outline-warning btn-sm"
                                                            onClick={() => handleMakeAdmin(member._id, member.username)}
                                                            disabled={processingIds.has(member._id)}
                                                        >
                                                            {processingIds.has(member._id) ? (
                                                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                                            ) : (
                                                                'Make Admin'
                                                            )}
                                                        </button>
                                                    )}
                                                    <button
                                                        className="btn btn-outline-danger btn-sm"
                                                        onClick={() => handleRemoveMember(member._id, member.username)}
                                                        disabled={processingIds.has(member._id)}
                                                    >
                                                        {processingIds.has(member._id) ? (
                                                            <span className="spinner-border spinner-border-sm" role="status"></span>
                                                        ) : (
                                                            'Remove'
                                                        )}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Requests Tab */}
            {activeTab === 'requests' && isCreator && (
                <div>
                    {pendingRequests.length === 0 ? (
                        <EmptyState 
                            text="No pending join requests"
                            showButton={false}
                        />
                    ) : (
                        <div className="requests-list">
                            {pendingRequests.map((request, index) => (
                                <div 
                                    key={request._id}
                                    className="card mb-3"
                                    style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}
                                >
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            {/* Profile Picture */}
                                            <div className="me-3">
                                                <img
                                                    src={request.profilePicture || "https://via.placeholder.com/50"}
                                                    alt={request.username}
                                                    className="rounded-circle"
                                                    style={{ 
                                                        width: '50px', 
                                                        height: '50px',
                                                        objectFit: 'cover',
                                                        border: '2px solid #ff8c00'
                                                    }}
                                                />
                                            </div>

                                            {/* Request Info */}
                                            <div className="flex-grow-1">
                                                <h6 className="mb-1 text-white">
                                                    {request.username}
                                                </h6>
                                                <p className="mb-1 text-white" style={{ fontSize: '0.9rem' }}>
                                                    {request.email}
                                                </p>
                                                <small className="text-muted">
                                                    Requested: {new Date(request.requestedAt || Date.now()).toLocaleDateString()}
                                                </small>
                                            </div>

                                            {/* Actions */}
                                            <div className="d-flex gap-2">
                                                <button
                                                    className="btn btn-success btn-sm"
                                                    onClick={() => handleApproveRequest(request._id)}
                                                    disabled={processingIds.has(request._id)}
                                                >
                                                    {processingIds.has(request._id) ? (
                                                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                                    ) : (
                                                        '✅ Approve'
                                                    )}
                                                </button>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => handleRejectRequest(request._id)}
                                                    disabled={processingIds.has(request._id)}
                                                >
                                                    {processingIds.has(request._id) ? (
                                                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                                    ) : (
                                                        '❌ Reject'
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
