"use client"

import { useState } from "react"
import JoinGroupButton from "./JoinGroupButton"

export default function GroupCard({ group, currentUser, onGroupJoined, onGroupLeft }) {
    const [isExpanded, setIsExpanded] = useState(false)
    
    // Check if user is member or creator
    const isCreator = group.admin === currentUser._id
    const isMember = group.members.includes(currentUser._id)
    
    // Truncate description
    const truncatedDescription = group.description.length > 100 
        ? group.description.substring(0, 100) + "..."
        : group.description

    const handleViewGroup = () => {
        // Create a modal or detailed view of the group
        alert(`Group: ${group.name}\nDescription: ${group.description}\nMembers: ${group.members.length}\nPrivate: ${group.isPrivate ? 'Yes' : 'No'}\nAdmin: ${group.admin?.username || 'Unknown'}`)
    }

    return (
        <div className="card h-100" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
            <div className="card-body d-flex flex-column">
                {/* Group Header */}
                <div className="d-flex align-items-start mb-3">
                    <div className="me-3">
                        <img
                            src={group.image || "https://via.placeholder.com/80"}
                            alt={group.name}
                            className="rounded"
                            style={{ 
                                width: '80px', 
                                height: '80px',
                                objectFit: 'cover',
                                border: '2px solid #ff8c00'
                            }}
                        />
                    </div>
                    <div className="flex-grow-1">
                        <h6 className="card-title text-white mb-1">
                            {group.name}
                            {group.isPrivate && (
                                <span className="badge bg-warning ms-2" style={{ fontSize: '0.7rem' }}>
                                    🔒 Private
                                </span>
                            )}
                        </h6>
                        <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>
                            Created by {group.admin?.username || 'Unknown'}
                        </p>
                        <div className="d-flex gap-2 text-white" style={{ fontSize: '0.7rem' }}>
                            <span>👥 {group.members.length} members</span>
                            <span>📝 {group.postsCount || 0} posts</span>
                        </div>
                    </div>
                </div>

                {/* Group Description */}
                <p className="text-white mb-3" style={{ fontSize: '0.9rem' }}>
                    {isExpanded ? group.description : truncatedDescription}
                    {group.description.length > 100 && (
                        <button
                            className="btn btn-link btn-sm p-0 ms-1"
                            style={{ color: '#ff8c00' }}
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? 'Show less' : 'Show more'}
                        </button>
                    )}
                </p>

                {/* Creator Badge */}
                {isCreator && (
                    <div className="mb-3">
                        <span className="badge bg-success" style={{ fontSize: '0.7rem' }}>
                            👑 Your Group
                        </span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="mt-auto">
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-outline-info btn-sm flex-grow-1"
                            onClick={handleViewGroup}
                        >
                            View Group
                        </button>
                        
                        {!isCreator && (
                            <JoinGroupButton
                                groupId={group._id}
                                groupName={group.name}
                                isPrivate={group.isPrivate}
                                isMember={isMember}
                                onJoined={onGroupJoined}
                                onLeft={onGroupLeft}
                            />
                        )}
                    </div>
                </div>

                {/* Last Activity */}
                <div className="mt-2 text-center">
                    <small className="text-muted">
                        Last active: {group.lastActivity 
                            ? new Date(group.lastActivity).toLocaleDateString()
                            : 'Never'
                        }
                    </small>
                </div>
            </div>
        </div>
    )
}
