"use client"

import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import axios from "axios"
import ProfileHeader from "../../components/profile/ProfileHeader"
import ProfileTabs from "../../components/profile/ProfileTabs"
import AddFriendButton from "../../components/friends/AddFriendButton"

export default function UserProfile() {
    const router = useRouter()
    const { userId } = router.query
    const [user, setUser] = useState(null)
    const [userPosts, setUserPosts] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const [activeTab, setActiveTab] = useState("posts")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [friendStatus, setFriendStatus] = useState("none")

    useEffect(() => {
        if (userId) {
            fetchUserProfile()
            fetchCurrentUser()
        }
    }, [userId])

    const fetchUserProfile = async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            const token = localStorage.getItem('token')
            
            // Fetch user profile
            const userResponse = await axios.get(
                `http://localhost:3001/api/user/profile/${userId}`,
                { headers: { 'x-auth-token': token } }
            )
            
            setUser(userResponse.data)
            setFriendStatus(userResponse.data.friendshipStatus?.isFriend ? "friends" : "none")
            
            // Fetch user's posts - using general posts endpoint for now
            // TODO: Create specific endpoint for user posts in backend
            const postsResponse = await axios.get(
                `http://localhost:3001/api/posts`,
                { headers: { 'x-auth-token': token } }
            )
            
            // Filter posts by user (client-side filtering for now)
            const userPostsFiltered = postsResponse.data.filter(post => 
                post.author._id === userId || post.author === userId
            )
            
            setUserPosts(userPostsFiltered)
            
        } catch (error) {
            console.error('Error fetching user profile:', error)
            setError('Failed to load user profile')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(
                'http://localhost:3001/api/user/me',
                { headers: { 'x-auth-token': token } }
            )
            setCurrentUser(response.data)
        } catch (error) {
            console.error('Error fetching current user:', error)
        }
    }

    const handleFriendStatusChange = (userId, newStatus) => {
        setFriendStatus(newStatus)
        // Update user object if needed
        if (user) {
            setUser(prev => ({
                ...prev,
                friendshipStatus: {
                    ...prev.friendshipStatus,
                    isFriend: newStatus === "friends"
                }
            }))
        }
    }

    if (isLoading) {
        return (
            <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#1a1a1a' }}>
                <div className="text-center">
                    <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-white mt-2">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#1a1a1a' }}>
                <div className="text-center">
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                    <button 
                        className="btn btn-warning me-2"
                        onClick={fetchUserProfile}
                    >
                        Try Again
                    </button>
                    <button 
                        className="btn btn-outline-warning"
                        onClick={() => router.back()}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#1a1a1a' }}>
                <div className="text-center">
                    <h4 className="text-white">User not found</h4>
                    <button 
                        className="btn btn-warning mt-3"
                        onClick={() => router.back()}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-vh-100" style={{ backgroundColor: '#1a1a1a' }}>
            <div className="container py-4">
                {/* Back Button */}
                <div className="mb-3">
                    <button 
                        className="btn btn-outline-warning btn-sm"
                        onClick={() => router.back()}
                    >
                        ← Back
                    </button>
                </div>

                {/* Profile Header */}
                <div className="row mb-4">
                    <div className="col-12">
                        <ProfileHeader user={user} />
                    </div>
                </div>

                {/* Friend Actions */}
                {currentUser && currentUser._id !== user._id && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <h6 className="text-white mb-1">
                                                {user.friendshipStatus?.isFriend 
                                                    ? "You are friends" 
                                                    : "Connect with " + user.username}
                                            </h6>
                                            <small className="text-white">
                                                {user.friendshipStatus?.isFriend 
                                                    ? "You can see all posts and activity" 
                                                    : "Send a friend request to connect"}
                                            </small>
                                        </div>
                                        <AddFriendButton
                                            userId={user._id}
                                            username={user.username}
                                            currentStatus={friendStatus}
                                            onStatusChange={handleFriendStatusChange}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Content */}
                <div className="row">
                    <div className="col-12">
                        <ProfileTabs
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            userPosts={userPosts}
                            currentUser={user}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
