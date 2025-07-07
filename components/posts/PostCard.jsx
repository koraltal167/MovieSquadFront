"use client"

import { useEffect, useState } from "react"
import PostForm from "./PostForm"
import PostLikes from "./PostLikes"
import PostComments from "./PostComments"

export default function PostCard({post}) {
    return(
        <div className="card mb-3 shadow-sm">
            <div className="card-body">
                <PostForm post={post} />
                <hr />
                <PostLikes postId={post._id} likes={post.likes} />
                <PostComments postId={post._id} comments={post.comments} />
            </div>
        </div>
    )
}