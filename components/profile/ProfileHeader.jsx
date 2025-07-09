import React from "react";
import { useState } from "react"

import EditProfileModal from "./EditProfileModal";
import ProfileSettingsModal from "./ProfileSettingsModal";
import AddPostModal from "../posts/AddPostModal";

export default function ProfileHeader({ user, onUserUpdated, onPostCreated }) {
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const handleCreatePost = () => {
    setShowCreatePost(true);
  };

  const handleCloseCreatePost = () => {
    setShowCreatePost(false);
  };

  const handlePostCreated = (newPost) => {
    setShowCreatePost(false);
    
    if (onPostCreated) {
      onPostCreated(newPost);
    }
  };
  const handleEdit = () => {
    setShowEditProfile(true);
};

const handleSettings = () => {
    setShowSettings(true);
};

const handleUserUpdated = (updatedUser) => {
    if (onUserUpdated) {
        onUserUpdated(updatedUser);
    }
};


  return (
    <>
    <div className="card mb-4" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-auto">
            <img
              src={user.profilePicture}
              alt="Profile"
              className="rounded-circle"
              width="100"
              height="100"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className="col">
            <h2 className="mb-1 text-white">{user.username}</h2>
            <p className="text-white mb-2">{user.email}</p>
            {user.bio && (
              <p className="text-light mb-3 fst-italic">
                "{user.bio}"
              </p>
            )}
            <div className="row text-center">
              <div className="col-4">
                <strong className="text-white">{user.postsCount}</strong>
                <div className="small text-white">Posts</div>
              </div>
              <div className="col-4">
                <strong className="text-white">{user.friendsCount}</strong>
                <div className="small text-white">Friends</div>
              </div>
              <div className="col-4">
                <strong className="text-white">{user.watchedCount}</strong>
                <div className="small text-white">Watched</div>
              </div>
            </div>
          </div>
          <div className="col-auto">
            <div className="d-flex flex-column gap-2">
              {/* Create Post Button */}
              <button 
                className="btn btn-primary"
                onClick={handleCreatePost}
              >
                📝 Create Post
              </button>
              
              {/* Edit Profile Button */}
              <button 
                className="btn btn-outline-primary"
                onClick={handleEdit} 
              >
                ✏️ Edit Profile
              </button>
              
              {/* Settings Button */}
              <button 
                className="btn btn-outline-secondary"
                onClick={handleSettings}
              >
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>
        
        {/* Favorite Genres */}
        <div className="mt-3">
          <h6 className="text-white">Favorite Genres:</h6>
          <div className="d-flex flex-wrap gap-1">
            {user.favoriteGenres.map((genre, index) => (
              <span 
                key={index} 
                className="badge"
                style={{ 
                  backgroundColor: '#ff8c00', 
                  color: 'white',
                  border: '1px solid #ff8c00'
                }}
              >
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
    <EditProfileModal
            isOpen={showEditProfile}
            onClose={() => setShowEditProfile(false)}
            currentUser={user}
            onUserUpdated={handleUserUpdated}
        />
        
        <ProfileSettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            currentUser={user}
        />
      <AddPostModal
      isOpen={showCreatePost}
      onClose={handleCloseCreatePost}
      onPostCreated={handlePostCreated}
      />
      </>    
  );
}