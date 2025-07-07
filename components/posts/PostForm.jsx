"use client"

import { useEffect, useState } from "react"

export default function PostForm({post}) {
     return (
        <div>
            <div className="d-flex align-items-center mb-2">
                <strong className="me-2 text-white">{post?.author?.name || post?.author?.username}</strong>
                <small className="text-white">
                    {new Date(post?.createdAt).toLocaleString()}
                </small>
            </div>
            <p className="mb-2 text-white">{post?.content}</p>
            {post?.movieTitle && (
                <div 
                  className="badge mb-2"
                  style={{ 
                    backgroundColor: '#ff8c00', 
                    color: 'white',
                    border: '1px solid #ff8c00'
                  }}
                >
                    🎬 {post.movieTitle}
                </div>
            )}
        </div>
    )
}