"use client"

import { useEffect, useState } from "react"
import PostCard from "./PostCard";

export default function PostList({ posts, currentUser, isGroupAdmin, onPostDeleted, onPostUpdated }) {
    const [localPosts, setLocalPosts] = useState(posts || []);

    useEffect(() => {
        setLocalPosts(posts || []);
    }, [posts]);

    const handlePostDeleted = (deletedPostId) => {
        // Update local state
        setLocalPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
        
        // Call parent callback if provided
        if (onPostDeleted) {
            onPostDeleted(deletedPostId);
        }
    };

    const handlePostUpdated = (updatedPost) => {
        // Update local state
        setLocalPosts(prevPosts => 
            prevPosts.map(post => 
                post._id === updatedPost._id ? updatedPost : post
            )
        );
        
        // Call parent callback if provided
        if (onPostUpdated) {
            onPostUpdated(updatedPost);
        }
    };

    console.log('PostList props:', { currentUser, isGroupAdmin, postsCount: localPosts.length });

    return (
        <div>
            {localPosts.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted">No posts yet. Be the first to share something!</p>
                </div>
            ) : (
                localPosts.map(post => (
                    <PostCard 
                        key={post._id} 
                        post={post} 
                        currentUser={currentUser}
                        isGroupAdmin={isGroupAdmin}
                        onPostDeleted={handlePostDeleted}
                        onPostUpdated={handlePostUpdated}
                    />
                ))
            )}
        </div>
    );
}