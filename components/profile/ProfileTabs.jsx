"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";
import PostList from "../posts/PostList";
import GroupList from "../groups/GroupList";
import CreateGroupForm from "../groups/CreateGroupForm";
import FriendsList from "../friends/FriendsList";      // הוסף את זה
import FriendRequests from "../friends/FriendRequests"; // הוסף את זה
import UserSearch from "../friends/UserSearch"; 
import WatchlistContent from "./WatchlistContent";
 

export default function ProfileTabs({ 
  activeTab, 
  onTabChange, 
  userPosts = [], 
  onLikePost, 
  currentUser, 
  onViewProfile, 
  onViewGroup,
  onPostDeleted,
  onPostUpdated 
}) {
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [localPosts, setLocalPosts] = useState(userPosts); // הוספת state מקומי לפוסטים
  const [userGroups, setUserGroups] = useState([]);         // ✅ הוסף state לקבוצות


  // Safe arrays
  const safePosts = Array.isArray(localPosts) ? localPosts : [];
  const safeGroups = Array.isArray(userGroups) ? userGroups : [];
  const safeWatchedMovies = Array.isArray(watchedMovies) ? watchedMovies : [];

  // עדכן את הפוסטים המקומיים כשמגיעים פוסטים חדשים
  useEffect(() => {
    setLocalPosts(userPosts);
  }, [userPosts]);

  useEffect(() => {
    if (activeTab === "watched") {
      fetchWatchedMovies();
    
     } else if (activeTab === "groups") {
      fetchUserGroups(); // ✅ הוסף קריאה לפונקציה
    }
  }, [activeTab]);

  const fetchWatchedMovies = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/users/me/watched", {
        headers: { "x-auth-token": token },
      });
      setWatchedMovies(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching watched movies:", error);
      setWatchedMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupJoined = (groupId) => {
    fetchUserGroups(); 
  };

  const handleGroupLeft = (groupId) => {
    setUserGroups(prev => prev.filter(group => group._id !== groupId));
  };
   // ✅ פונקציה חדשה לטעינת הקבוצות של המשתמש
  const fetchUserGroups = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // קבל את כל הקבוצות
      const response = await axios.get("http://localhost:3001/api/groups", {
        headers: { "x-auth-token": token },
      });
      
      console.log("All groups:", response.data);
      
      // סנן רק את הקבוצות שהמשתמש חבר בהן או יוצר שלהן
      const allGroups = response.data;
      const currentUserId = currentUser?.id || currentUser?._id;
      
      const filteredGroups = allGroups.filter(group => {
        // בדוק אם המשתמש הוא יוצר הקבוצה
        const isCreator = (group.admin?._id || group.admin?.id || group.admin) === currentUserId;
        
        // בדוק אם המשתמש חבר בקבוצה
        const isMember = group.members && group.members.some(member => {
          const memberId = member._id || member.id || member;
          return memberId === currentUserId;
        });
        
        return isCreator || isMember;
      });
      
      console.log("User groups:", filteredGroups);
      setUserGroups(filteredGroups);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      setUserGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupCreatedLocal = (newGroup) => {
    setShowCreateGroup(false);
    if (onGroupCreated) {
      onGroupCreated(newGroup);
    }
  };
   const handleGroupCreated = (newGroup) => {
    setUserGroups(prev => [newGroup, ...prev]);
    setShowCreateGroup(false);
    alert('Group created successfully!');
  };
  

  // פונקציה לטיפול במחיקת פוסט
  const handlePostDeleted = (deletedPostId) => {
    console.log('Post deleted:', deletedPostId);
    setLocalPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
  };

  // פונקציה לטיפול בעדכון פוסט
  const handlePostUpdated = (updatedPost) => {
    console.log('Post updated:', updatedPost);
    setLocalPosts(prevPosts => 
      prevPosts.map(post => 
        post._id === updatedPost._id ? updatedPost : post
      )
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-4">
          <div className="spinner-border text-light" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "posts":
        return (
          <div>
            {safePosts.length === 0 ? (
              <div className="text-center py-5">
                <div className="text-muted">
                  <h5>📝</h5>
                  <p>No posts yet</p>
                  <small>Share your thoughts about movies to see them here!</small>
                </div>
              </div>
            ) : (
              <PostList
                posts={safePosts}
                currentUser={currentUser}
                isGroupAdmin={false} // בפרופיל, המשתמש לא admin של קבוצה
                onLikePost={onLikePost}
                onViewProfile={onViewProfile}
                onPostDeleted={onPostDeleted}   // העבר את זה לPostList
                onPostUpdated={onPostUpdated}   // הוספת callback לעדכון
              />
            )}
          </div>
        );
        case "friends":
        return (
          <div>
            <FriendsList 
              currentUser={currentUser}
              onViewProfile={onViewProfile}
            />
          </div>
        );
        case "friend-requests":
        return (
          <div>
            <FriendRequests 
              currentUser={currentUser}
            />
          </div>
        );
        case "search-users":
        return (
          <div>
            <UserSearch />
          </div>
        );


      case "groups":
        return (
          <div>
            {/* כפתור ליצירת קבוצה חדשה */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="text-white mb-0">👥 My Groups ({userGroups.length})</h5>
              <button
                className="btn btn-warning btn-sm"
                onClick={() => setShowCreateGroup(!showCreateGroup)}
              >
                {showCreateGroup ? '❌ Cancel' : '➕ Create Group'}
              </button>
            </div>

            {/* טופס יצירת קבוצה */}
            {showCreateGroup && (
              <div className="card mb-4" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
                <div className="card-body">
                  <h6 className="text-white mb-3">✨ Create New Group</h6>
                  <CreateGroupForm
                    currentUser={currentUser}
                    onGroupCreated={handleGroupCreated}
                    onCancel={() => setShowCreateGroup(false)}
                  />
                </div>
              </div>
            )}

            {/* רשימת הקבוצות */}
            {userGroups.length === 0 ? (
              <div className="text-center py-5">
                <div className="text-muted">
                  <h5>👥</h5>
                  <p>No groups found</p>
                  <small>Create or join some groups to see them here!</small>
                </div>
              </div>
            ) : (
              <GroupList
                groups={userGroups}
                currentUser={currentUser}
                onGroupJoined={handleGroupJoined}
                onGroupLeft={handleGroupLeft}
                onViewGroup={onViewGroup}
              />
            )}
          </div>
        );
      case "watched":
        return (
          <div>
            <WatchlistContent currentUser={currentUser} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Tabs Navigation */}
      <ul className="nav nav-tabs justify-content-center mb-4" style={{ borderBottom: '1px solid #444' }}>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => onTabChange("posts")}
            style={{
              backgroundColor: activeTab === "posts" ? '#8b5cf6' : 'transparent',
              borderColor: activeTab === "posts" ? '#8b5cf6' : '#444',
              color: activeTab === "posts" ? 'white' : '#ccc'
            }}
          >
            Posts ({safePosts.length})
          </button>
        </li>
         <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "friends" ? "active" : ""}`}
            onClick={() => onTabChange("friends")}
            style={{
              backgroundColor: activeTab === "friends" ? '#8b5cf6' : 'transparent',
              borderColor: activeTab === "friends" ? '#8b5cf6' : '#444',
              color: activeTab === "friends" ? 'white' : '#ccc'
            }}
          >
            👥 Friends ({currentUser?.friendsCount || 0})
          </button>
        </li>
        
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "friend-requests" ? "active" : ""}`}
            onClick={() => onTabChange("friend-requests")}
            style={{
              backgroundColor: activeTab === "friend-requests" ? '#8b5cf6' : 'transparent',
              borderColor: activeTab === "friend-requests" ? '#8b5cf6' : '#444',
              color: activeTab === "friend-requests" ? 'white' : '#ccc'
            }}
          >
            📥 Requests
          </button>
        </li>
        
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "search-users" ? "active" : ""}`}
            onClick={() => onTabChange("search-users")}
            style={{
              backgroundColor: activeTab === "search-users" ? '#8b5cf6' : 'transparent',
              borderColor: activeTab === "search-users" ? '#8b5cf6' : '#444',
              color: activeTab === "search-users" ? 'white' : '#ccc'
            }}
          >
            🔍 Find Friends
          </button>
        </li>

        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "groups" ? "active" : ""}`}
            onClick={() => onTabChange("groups")}
            style={{
              backgroundColor: activeTab === "groups" ? '#8b5cf6' : 'transparent',
              borderColor: activeTab === "groups" ? '#8b5cf6' : '#444',
              color: activeTab === "groups" ? 'white' : '#ccc'
            }}
          >
            Groups ({safeGroups.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "watched" ? "active" : ""}`}
            onClick={() => onTabChange("watched")}
            style={{
              backgroundColor: activeTab === "watched" ? '#8b5cf6' : 'transparent',
              borderColor: activeTab === "watched" ? '#8b5cf6' : '#444',
              color: activeTab === "watched" ? 'white' : '#ccc'
            }}
          >
            ❤️ Favorites ({currentUser?.favoriteMovies?.length() || 0})
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
}