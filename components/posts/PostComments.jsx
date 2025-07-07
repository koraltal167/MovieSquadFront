"use client"

import { useEffect, useState } from "react"
import axios from "axios"

export default function PostComments({postId, comments}) {
    const [commentsData, setCommentsData] = useState(comments || [])
    const [newComment, setNewComment] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [showComments, setShowComments] = useState(false)

    const handleAddComment = async (e) => {
        e.preventDefault()
        
        if (!newComment.trim()) {
            alert('Please enter a comment')
            return
        }

        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')
            console.log('Adding comment to postId:', postId)
            console.log('Token:', token)
            
            const response = await axios.post(
                `http://localhost:3001/api/posts/${postId}/comments`,
                { text: newComment.trim() },
                {
                    headers: {
                        'x-auth-token': token
                    }
                }
            )
            console.log('Comment response:', response.data)
            
            // FIX: Backend returns single comment, we need to fetch updated post
            const updatedPostResponse = await axios.get(`http://localhost:3001/api/posts/${postId}`)
            setCommentsData(updatedPostResponse.data.comments)
            setNewComment("")
            
        } catch (error) {
            console.error('Error adding comment:', error)
            console.error('Response:', error.response?.data)
            alert('Failed to add comment. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return
        }

        try {
            const token = localStorage.getItem('token')
            console.log('Deleting comment:', commentId, 'from post:', postId)
            
            const response = await axios.delete(
                `http://localhost:3001/api/posts/${postId}/comments/${commentId}`,
                {
                    headers: {
                        'x-auth-token': token 
                    }
                }
            )

            // Update comments data from response
            setCommentsData(response.data.comments)
            
        } catch (error) {
            console.error('Error deleting comment:', error)
            alert('Failed to delete comment. Please try again.')
        }
    }

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

    return (
        <div className="mt-3">
            {/* Comments Toggle */}
            <button 
                className="btn btn-link p-0 text-decoration-none"
                onClick={() => setShowComments(!showComments)}
            >
                <small>Comments ({commentsData.length})</small>
            </button>

            {showComments && (
                <div className="mt-2">
                    {/* Existing Comments */}
                    <div className="mb-3" style={{maxHeight: '200px', overflowY: 'auto'}}>
                        {commentsData.length === 0 ? (
                            <small className="text-white">No comments yet.</small>
                        ) : (
                            commentsData.map(comment => (
                                <div key={comment._id} className="border-bottom pb-2 mb-2">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div className="flex-grow-1">
                                            {/* FIX: Handle both 'user' and 'author' fields */}
                                            <strong className="small text-white">
                                                {comment.user?.username || comment.user?.name || 
                                                 comment.author?.username || comment.author?.name || 
                                                 'Unknown User'}
                                            </strong>
                                            <p className="mb-1 small text-white">{comment.text}</p>
                                            <small className="text-white">
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </small>
                                        </div>
                                        {/* FIX: Check both user and author fields for delete permission */}
                                        {(currentUser._id === comment.user?._id || 
                                          currentUser._id === comment.author?._id) && (
                                            <button 
                                                className="btn btn-sm btn-outline-danger ms-2"
                                                onClick={() => handleDeleteComment(comment._id)}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Comment Form */}
                    <form onSubmit={handleAddComment} className="d-flex">
                        <input
                            type="text"
                            className="form-control form-control-sm me-2"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            className="btn btn-primary btn-sm"
                            disabled={isLoading || !newComment.trim()}
                        >
                            {isLoading ? (
                                <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                                'Post'
                            )}
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}