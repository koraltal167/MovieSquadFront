"use client"

import { useState } from "react"
import AddFriendButton from "./AddFriendButton"

export default function FriendCard({ friend, currentUser, onRemoveFriend, onViewProfile, showActions = true }) {
    const [isRemoving, setIsRemoving] = useState(false)

    const handleRemove = async () => {
        const confirmMessage = `Remove ${friend.username} from your friends?\n\n⚠️ This will remove them from BOTH friends lists (yours and theirs).`
        
        if (window.confirm(confirmMessage)) {
            setIsRemoving(true)
            try {
                // ✅ רק קרא לפונקציה מה-parent, אל תעשה API call כאן
                await onRemoveFriend(friend._id || friend.id)
                // ✅ הסר את alert מכאן - זה יהיה ב-FriendsList
            } catch (error) {
                console.error('Error removing friend:', error)
                alert('Failed to remove friend. Please try again.')
            } finally {
                setIsRemoving(false)
            }
        }
    }

    const handleViewProfile = () => {
        if (onViewProfile) {
            onViewProfile(friend._id || friend.id)
        }
    }

    return (
        <div className="card h-100" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
            <div className="card-body d-flex flex-column">
                {/* Profile Section */}
                <div className="text-center mb-3">
                    <div className="mb-3">
                        <img
                            src={friend.profilePicture || '/images/no-avatar.jpg'}
                            alt={`${friend.username}'s avatar`}
                            className="rounded-circle"
                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                            onError={(e) => {
                                e.target.src = '/images/no-avatar.jpg'
                            }}
                        />
                    </div>
                    
                    <h6 className="card-title text-white mb-1">{friend.username}</h6>
                    <p className="card-text text-muted small mb-0">{friend.email}</p>
                    
                    {friend.bio && (
                        <p className="card-text text-light small mt-2 fst-italic">
                            "{friend.bio}"
                        </p>
                    )}
                </div>

                {/* Stats */}
                <div className="d-flex justify-content-around mb-3 text-center">
                    <div>
                        <div className="text-warning fw-bold">{friend.postsCount || 0}</div>
                        <small className="text-muted">Posts</small>
                    </div>
                    <div>
                        <div className="text-info fw-bold">{friend.friendsCount || 0}</div>
                        <small className="text-muted">Friends</small>
                    </div>
                    <div>
                        <div className="text-success fw-bold">{friend.moviesWatched || 0}</div>
                        <small className="text-muted">Movies</small>
                    </div>
                </div>

                {/* Actions */}
                {showActions && (
                    <div className="mt-auto">
                        <div className="d-grid gap-2">
                            <button
                                className="btn btn-outline-info btn-sm"
                                onClick={handleViewProfile}
                            >
                                👤 View Profile
                            </button>
                            
                            <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={handleRemove}
                                disabled={isRemoving}
                            >
                                {isRemoving ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Removing...
                                    </>
                                ) : (
                                    <>🗑️ Remove Friend</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}