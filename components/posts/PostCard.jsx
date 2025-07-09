"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import PostForm from "./PostForm"
import PostLikes from "./PostLikes"
import PostComments from "./PostComments"

export default function PostCard({ post, currentUser, isGroupAdmin, onPostDeleted, onPostUpdated }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [isLoading, setIsLoading] = useState(false);
    const [localCurrentUser, setLocalCurrentUser] = useState(null);

    // If currentUser is not passed, get it from localStorage
    useEffect(() => {
        if (currentUser) {
            setLocalCurrentUser(currentUser);
        } else {
            try {
                const userData = localStorage.getItem('user');
                if (userData) {
                    const parsedUser = JSON.parse(userData);
                    setLocalCurrentUser(parsedUser);
                }
            } catch (error) {
                console.error('Error parsing user from localStorage:', error);
            }
        }
    }, [currentUser]);

    // Check if user can delete this post
    const canDeletePost = () => {
        if (!localCurrentUser) return false;

        const userId = localCurrentUser.id || localCurrentUser._id;
        const authorId = post.author?._id || post.author?.id;
        
        // User can delete if they are the post author
         if (userId && authorId && userId === authorId) {
            return true;
        }
        
        // Or if they are admin/creator of the group (if it's a group post)
        if (post.groupId && isGroupAdmin) {
            return true;
        }
        
        // Or if they are website admin
        if (localCurrentUser.role === 'admin') {
            return true;
        }
        
        return false;
    };

    // Check if user can edit this post
    const canEditPost = () => {
        if (!localCurrentUser) return false;

        const userId = localCurrentUser.id || localCurrentUser._id;
        const authorId = post.author?._id || post.author?.id;
        
        // Only the post author can edit
        if (userId && authorId && userId === authorId) {
           return true;
      }
        
        return false;
    };

    const handleDeletePost = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }
        
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3001/api/posts/${post._id}`, {
                headers: {
                    'x-auth-token': token
                }
            });
            
            // Call the parent component to update the posts list
            if (onPostDeleted) {
                onPostDeleted(post._id);
            }
            
            alert('Post deleted successfully!');
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditPost = async () => {
        if (!editContent.trim()) {
            alert('Post content cannot be empty');
            return;
        }
        
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`http://localhost:3001/api/posts/${post._id}`, {
                content: editContent.trim()
            }, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            });
            
            // Update the post in the parent component
            if (onPostUpdated) {
                onPostUpdated(response.data);
            }
            
            setIsEditing(false);
            alert('Post updated successfully!');
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Failed to update post. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
     console.log('PostCard Debug:', {
        postId: post._id,
        postAuthor: post.author,
        currentUser: localCurrentUser,
        canEdit: canEditPost(),
        canDelete: canDeletePost(),
        isGroupAdmin
    });


    return (
        
        <div className="card mb-3 shadow-sm">
            <div className="card-body">
                {/* Action Buttons */}
                {(canEditPost() || canDeletePost()) && (
                    <div className="d-flex justify-content-end mb-2">
                        {canEditPost() && (
                            <button
                                className="btn btn-outline-primary btn-sm me-2"
                                onClick={() => setIsEditing(!isEditing)}
                                title={isEditing ? "Cancel Edit" : "Edit Post"}
                                disabled={isLoading}
                            >
                                {isEditing ? '❌ Cancel' : '✏️ Edit'}
                            </button>
                        )}
                        
                        {canDeletePost() && (
                            <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={handleDeletePost}
                                title="Delete Post"
                                disabled={isLoading}
                            >
                                {isLoading ? '⏳ Deleting...' : '🗑️ Delete'}
                            </button>
                        )}
                    </div>
                )}

                {/* Post Content */}
                {isEditing ? (
                    <div className="mb-3">
                        <textarea
                            className="form-control"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows="3"
                            style={{ backgroundColor: '#3c3c3c', border: '1px solid #555', color: 'white' }}
                            disabled={isLoading}
                        />
                        <div className="mt-2">
                            <button
                                className="btn btn-primary btn-sm me-2"
                                onClick={handleEditPost}
                                disabled={isLoading}
                            >
                                {isLoading ? '⏳ Saving...' : '💾 Save Changes'}
                            </button>
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditContent(post.content);
                                }}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <PostForm post={post} />
                )}

                <hr />
                <PostLikes postId={post._id} likes={post.likes} />
                <PostComments postId={post._id} comments={post.comments} />
            </div>
        </div>
    );
}