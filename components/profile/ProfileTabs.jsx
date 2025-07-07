"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";
import PostList from "../posts/PostList";
import GroupList from "../groups/GroupList";
import CreateGroupForm from "../groups/CreateGroupForm";

export default function ProfileTabs({ 
  activeTab, 
  onTabChange, 
  userPosts, 
  onLikePost, 
  currentUser, 
  onViewProfile, 
  onViewGroup 
}) {
  const [userGroups, setUserGroups] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    if (activeTab === "groups") {
      fetchUserGroups();
    } else if (activeTab === "watched") {
      fetchWatchedMovies();
    }
  }, [activeTab]);

  const fetchUserGroups = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/groups", {
        headers: { "x-auth-token": token },
      });
      
      // Filter groups where user is a member or admin
      const filteredGroups = response.data.filter(group => {
        const userId = currentUser.id || currentUser._id;
        return group.members.some(member => 
          (member._id || member.id || member) === userId
        ) || (group.admin._id || group.admin.id || group.admin) === userId;
      });
      
      setUserGroups(filteredGroups);
    } catch (error) {
      console.error("Error fetching user groups:", error);
      setUserGroups([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWatchedMovies = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/user/me", {
        headers: { "x-auth-token": token },
      });
      setWatchedMovies(response.data.watchedMovies || []);
    } catch (error) {
      console.error("Error fetching watched movies:", error);
      setWatchedMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupJoined = (groupId) => {
    // Refresh groups after joining
    fetchUserGroups();
  };

  const handleGroupLeft = (groupId) => {
    // Remove group from list after leaving
    setUserGroups(prev => prev.filter(group => group._id !== groupId));
  };

  const handleGroupCreated = (newGroup) => {
    // Add new group to list and close form
    setUserGroups(prev => [newGroup, ...prev]);
    setShowCreateGroup(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "posts":
        return (
          <PostList
            posts={userPosts}
            currentUser={currentUser}
            onLikePost={onLikePost}
            onViewProfile={onViewProfile}
          />
        );

      case "groups":
        return (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5>My Groups</h5>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCreateGroup(!showCreateGroup)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                {showCreateGroup ? 'Cancel' : 'Create Group'}
              </button>
            </div>
            
            {showCreateGroup && (
              <div className="mb-4">
                <CreateGroupForm
                  currentUser={currentUser}
                  onGroupCreated={handleGroupCreated}
                  onCancel={() => setShowCreateGroup(false)}
                />
              </div>
            )}
            
            {userGroups.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No groups found. Create or join some groups to see them here!</p>
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
            {watchedMovies.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No watched movies yet.</p>
              </div>
            ) : (
              <div className="row">
                {watchedMovies.map((movie) => (
                  <div key={movie.id} className="col-md-4 mb-3">
                    <div className="card">
                      <img
                        src={movie.poster || "https://via.placeholder.com/300x450"}
                        alt={movie.title}
                        className="card-img-top"
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                      <div className="card-body">
                        <h6 className="card-title">{movie.title}</h6>
                        <p className="card-text text-muted">{movie.year}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      {/* Tabs Navigation */}
      <ul className="nav nav-tabs justify-content-center mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => onTabChange("posts")}
          >
            Posts ({userPosts.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "groups" ? "active" : ""}`}
            onClick={() => onTabChange("groups")}
          >
            Groups ({userGroups.length})
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "watched" ? "active" : ""}`}
            onClick={() => onTabChange("watched")}
          >
            Watched ({watchedMovies.length})
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