"use client"

import { useState } from "react"
import AddFriendButton from "./AddFriendButton"

export default function FriendCard({ friend, currentUser, onRemoveFriend, onViewProfile, showActions = true }) {
    const [isRemoving, setIsRemoving] = useState(false)

    const handleRemove = async () => {
        const confirmMessage = `Remove ${friend.username} from your friends?\n\nNote: This will only remove them from YOUR friends list. They will still see you in their friends list until they refresh or remove you as well.`
        
        if (window.confirm(confirmMessage)) {
            setIsRemoving(true)
            await onRemoveFriend(friend._id || friend.id)
            setIsRemoving(false)
        }
    }

    const handleStatusChange = (userId, newStatus) => {
        if (newStatus === "none" && onRemoveFriend) {
            onRemoveFriend(userId)
        }
    }

    return (
        <div className="card mb-3" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
            <div className="card-body">
                <div className="d-flex align-items-center">
                    {/* Profile Picture */}
                    <div className="me-3">
                        <img
                            src={friend.profilePicture || "https://via.placeholder.com/60"}
                            alt={friend.username}
                            className="rounded-circle"
                            style={{ 
                                width: '60px', 
                                height: '60px',
                                objectFit: 'cover',
                                border: '2px solid #ff8c00'
                            }}
                        />
                    </div>

                    {/* Friend Info */}
                    <div className="flex-grow-1">
                        <h6 className="card-title mb-1 text-white">
                            {friend.username}
                        </h6>
                        <p className="card-text text-white mb-2" style={{ fontSize: '0.9rem' }}>
                            {friend.email}
                        </p>
                        
                        {/* Friend Stats */}
                        <div className="d-flex gap-3 text-white" style={{ fontSize: '0.8rem' }}>
                            <span>📝 {friend.postsCount || 0} posts</span>
                            <span>🎬 {friend.watchedCount || 0} watched</span>
                            <span>👥 {friend.friendsCount || 0} friends</span>
                        </div>

                        {/* Favorite Genres */}
                        {friend.favoriteGenres && friend.favoriteGenres.length > 0 && (
                            <div className="mt-2">
                                <small className="text-white">Favorite genres: </small>
                                {friend.favoriteGenres.slice(0, 3).map((genre, index) => (
                                    <span
                                        key={index}
                                        className="badge me-1"
                                        style={{ 
                                            backgroundColor: '#ff8c00', 
                                            color: 'white',
                                            border: '1px solid #ff8c00',
                                            fontSize: '0.7rem'
                                        }}
                                    >
                                        {genre}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {showActions && (
                        <div className="d-flex flex-column gap-2">
                            <button
                                type="button"
                                className="btn btn-outline-info btn-sm"
                                onClick={() => onViewProfile(friend._id || friend.id)}
                            >
                                View Profile
                            </button>
                            
                            <AddFriendButton
                                userId={friend._id || friend.id}
                                username={friend.username}
                                currentStatus="friends"
                                onStatusChange={handleStatusChange}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
