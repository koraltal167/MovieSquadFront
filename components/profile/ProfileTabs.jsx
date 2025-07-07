import React from "react";
import EmptyState from "../EmptyState";
import PostList from "../posts/PostList";
import TabsWrapper from "../TabsWrapper";
import FriendsList from "../friends/FriendsList";
import FriendRequests from "../friends/FriendRequests";
import UserSearch from "../friends/UserSearch";
import GroupList from "../groups/GroupList";

export default function ProfileTabs({ activeTab, onTabChange, userPosts, currentUser, onViewProfile }) {
  const tabs = [
    { value: "posts", label: `Posts (${userPosts.length})` },
    { value: "friends", label: "Friends" },
    { value: "requests", label: "Friend Requests" },
    { value: "search", label: "Search Users" },
    { value: "groups", label: "Groups" },
    { value: "reviews", label: "Reviews" },
    { value: "watchlist", label: "Watchlist" },
    { value: "favorites", label: "Favorites" },
  ];

  const handleViewProfile = (userId) => {
    if (onViewProfile) {
      onViewProfile(userId);
    } else {
      // Fallback - open in new tab
      window.open(`/profile/${userId}`, '_blank');
    }
  };

  return (
    <TabsWrapper tabs={tabs} activeTab={activeTab} onTabChange={onTabChange}>
      {activeTab === "posts" && (
        userPosts.length > 0 ? <PostList posts={userPosts} /> : <EmptyState text="No posts yet" />
      )}

      {activeTab === "friends" && (
        <FriendsList 
          currentUser={currentUser}
          onViewProfile={handleViewProfile}
        />
      )}

      {activeTab === "requests" && (
        <FriendRequests 
          currentUser={currentUser}
        />
      )}

      {activeTab === "search" && (
        <UserSearch />
      )}

      {activeTab === "groups" && (
        <GroupList 
          currentUser={currentUser}
          onGroupCreated={(newGroup) => {
            console.log('New group created:', newGroup)
            // Optional: Add any additional logic here
          }}
        />
      )}

      {activeTab === "reviews" && (
        <EmptyState text="No reviews yet" />
      )}

      {activeTab === "watchlist" && (
        <EmptyState text="Watchlist is empty" />
      )}

      {activeTab === "favorites" && (
        <EmptyState text="No favorites yet" />
      )}
    </TabsWrapper>
  );
}
