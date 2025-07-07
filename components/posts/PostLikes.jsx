"use client"

import { useEffect, useState } from "react"
import axios from "axios"

export default function PostLikes({ postId, likes }) {
    const [likesData, setLikesData] = useState(likes || [])
    const [isLiked, setIsLiked] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        // Check if current user has liked this post
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
        const userLiked = likesData.some(like => like === currentUser._id || like._id === currentUser._id)
        setIsLiked(userLiked)
    }, [likesData])

    const handleLike = async () => {
    setIsLoading(true)
    try {
        const token = localStorage.getItem('token')
            
            console.log('PostId:', postId)
            console.log('Token:', token)
        
        const response = await axios.put(
                `http://localhost:3001/api/posts/${postId}/like`,
                {},
                {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    }
                }
            )
            console.log('Like response:', response.data)
            const updatedPostResponse = await axios.get(`http://localhost:3001/api/posts/${postId}`)
            setLikesData(updatedPostResponse.data.likes)
           
    } catch (error) {
        console.error('Error liking/unliking post:', error)
        console.error('Error response:', error.response)
        console.error('Error status:', error.response?.status)
        console.error('Error data:', error.response?.data)
        alert('Failed to update like. Please try again.')
    } finally {
        setIsLoading(false)
    }
}

    return (
        <div className="d-flex align-items-center mb-2">
            <button 
                className={`btn ${isLiked ? 'btn-primary' : 'btn-outline-primary'} btn-sm me-2`}
                onClick={handleLike}
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="spinner-border spinner-border-sm me-1"></span>
                ) : (
                    <span className="me-1">👍</span>
                )}
                {isLiked ? 'Liked' : 'Like'} ({likesData.length})
            </button>
        </div>
    )
}