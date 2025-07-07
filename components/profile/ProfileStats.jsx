import React from "react";

export default function ProfileStats({ posts, friends, watched }) {
  return (
    <div className="flex">
      <div>{posts} Posts</div>
      <div>{friends} Friends</div>
      <div>{watched} Watched</div>
    </div>
  );
}
