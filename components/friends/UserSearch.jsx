"use client"

import { useState } from "react"
import axios from "axios"
import AddFriendButton from "./AddFriendButton"

export default function UserSearch() {
    const [searchTerm, setSearchTerm] = useState("")
    const [searchResults, setSearchResults] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchTerm.trim()) return

        setIsLoading(true)
        setHasSearched(true)
        
        try {
            const token = localStorage.getItem('token')
            
            const response = await axios.get(
                `http://localhost:3001/api/user/search?q=${encodeURIComponent(searchTerm)}`,
                { headers: { 'x-auth-token': token } }
            )
            
            setSearchResults(response.data)
        } catch (error) {
            console.error('Error searching users:', error)
            alert('Failed to search users. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleFriendStatusChange = (userId, newStatus) => {
        // update the friend status in the search results
        setSearchResults(prev => 
            prev.map(user => 
                user._id === userId 
                    ? { ...user, friendStatus: newStatus }
                    : user
            )
        )
    }

    return (
        <div className="user-search p-4" style={{ backgroundColor: '#2c2c2c', borderRadius: '8px' }}>
            <h5 className="text-white mb-3">🔍 Search Users</h5>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-4">
                <div className="input-group">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by username..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            backgroundColor: '#3c3c3c',
                            border: '1px solid #555',
                            color: 'white'
                        }}
                    />
                    <button 
                        type="submit" 
                        className="btn btn-warning"
                        disabled={isLoading || !searchTerm.trim()}
                    >
                        {isLoading ? (
                            <span className="spinner-border spinner-border-sm" role="status"></span>
                        ) : (
                            "Search"
                        )}
                    </button>
                </div>
            </form>

            {/* Search Results */}
            {hasSearched && (
                <div>
                    {isLoading ? (
                        <div className="text-center">
                            <div className="spinner-border text-warning" role="status">
                                <span className="visually-hidden">Searching...</span>
                            </div>
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="text-center text-white">
                            <p>No users found for "{searchTerm}"</p>
                        </div>
                    ) : (
                        <div>
                            <h6 className="text-white mb-3">Search Results ({searchResults.length})</h6>
                            {searchResults.map(user => (
                                <div 
                                    key={user._id}
                                    className="card mb-3" 
                                    style={{ backgroundColor: '#3c3c3c', border: '1px solid #555' }}
                                >
                                    <div className="card-body">
                                        <div className="d-flex align-items-center">
                                            {/* Profile Picture */}
                                            <div className="me-3">
                                                <img
                                                    src={user.profilePicture || "https://via.placeholder.com/50"}
                                                    alt={user.username}
                                                    className="rounded-circle"
                                                    style={{ 
                                                        width: '50px', 
                                                        height: '50px',
                                                        objectFit: 'cover',
                                                        border: '2px solid #ff8c00'
                                                    }}
                                                />
                                            </div>

                                            {/* User Info */}
                                            <div className="flex-grow-1">
                                                <h6 className="card-title mb-1 text-white">
                                                    {user.username}
                                                </h6>
                                                <p className="card-text text-white mb-0" style={{ fontSize: '0.9rem' }}>
                                                    {user.email}
                                                </p>
                                            </div>

                                            {/* Add Friend Button */}
                                            <div>
                                                <AddFriendButton
                                                    userId={user._id}
                                                    username={user.username}
                                                    currentStatus={user.friendStatus || "none"}
                                                    onStatusChange={handleFriendStatusChange}
                                                />
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
