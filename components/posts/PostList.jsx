"use client"

import { useEffect, useState } from "react"
import PostCard from "./PostCard";

export default function PostList({posts}) {
      return (
    <div>
      {posts.map(post => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
};
