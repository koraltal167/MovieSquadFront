"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import FriendCard from "./FriendCard"
import EmptyState from "../EmptyState"

export default function FriendsList({ currentUser, onViewProfile }) {
    const [friends, setFriends] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        fetchFriends()
    }, [])

    const fetchFriends = async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            const token = localStorage.getItem('token')
            
            const response = await axios.get(
                'http://localhost:3001/api/user/me/friends',
                { headers: { 'x-auth-token': token } }
            )
            
            // Remove duplicates based on _id or id
            const uniqueFriends = response.data.filter((friend, index, self) => {
                const friendId = friend._id || friend.id
                return self.findIndex(f => (f._id || f.id) === friendId) === index
            })
            
            console.log('Original friends:', response.data.length)
            console.log('Unique friends:', uniqueFriends.length)
            if (response.data.length !== uniqueFriends.length) {
                console.warn('Found duplicate friends, removed duplicates')
            }
            
            setFriends(uniqueFriends)
        } catch (error) {
            console.error('Error fetching friends:', error)
            setError('Failed to load friends')
        } finally {
            setIsLoading(false)
        }
    }

    const handleRemoveFriend = async (friendId) => {
        try {
            const token = localStorage.getItem('token')
            
            await axios.delete(
                `http://localhost:3001/api/user/me/friends/${friendId}`,
                { headers: { 'x-auth-token': token } }
            )
            
            // Remove from local state
            setFriends(prev => prev.filter(friend => 
                (friend._id || friend.id) !== friendId
            ))
            
            // Show info message
            alert('Friend removed successfully! They have been removed from both friends lists.')
            
        } catch (error) {
            console.error('Error removing friend:', error)
            alert('Failed to remove friend. Please try again.')
        }
    }

    const filteredFriends = friends.filter(friend =>
        friend.username.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (isLoading) {
        return (
            <div className="text-center p-4">
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading friends...</span>
                </div>
                <p className="text-white mt-2">Loading friends...</p>
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
                    onClick={fetchFriends}
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="friends-list">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="text-white mb-0">
                    Friends ({friends.length})
                </h5>
                
                {/* Search */}
                {friends.length > 0 && (
                    <div className="d-flex gap-2">
                        <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Search friends..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                backgroundColor: '#3c3c3c',
                                border: '1px solid #555',
                                color: 'white',
                                maxWidth: '200px'
                            }}
                        />
                        {searchTerm && (
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => setSearchTerm("")}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Friends List */}
            {filteredFriends.length === 0 ? (
                searchTerm ? (
                    <EmptyState 
                        text={`No friends found matching "${searchTerm}"`}
                        showButton={false}
                    />
                ) : (
                    <EmptyState 
                        text="No friends yet. Start connecting with people!"
                        showButton={false}
                    />
                )
            ) : (
                <div className="friends-grid">
                    {filteredFriends.map((friend, index) => (
                        <FriendCard
                            key={`friend-${friend._id || friend.id}-${index}`}
                            friend={friend}
                            currentUser={currentUser}
                            onRemoveFriend={handleRemoveFriend}
                            onViewProfile={onViewProfile}
                        />
                    ))}
                </div>
            )}

            {/* Refresh Button */}
            <div className="text-center mt-4">
                <button
                    className="btn btn-outline-warning btn-sm"
                    onClick={fetchFriends}
                    disabled={isLoading}
                >
                    {isLoading ? 'Refreshing...' : 'Refresh Friends'}
                </button>
            </div>
        </div>
    )
}
