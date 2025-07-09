"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import axios from "axios";
import ProfileHeader from "../components/profile/ProfileHeader";
import ProfileTabs from "../components/profile/ProfileTabs";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("posts");
  const [user, setUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter(); // הוספתי את זה

  useEffect(() => {
    console.clear(); // Clear console when component loads
    const fetchUserAndPosts = async () => {
      try {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        console.log("User data:", userData);
        console.log("Token:", token);

        if (userData && token) {
          const parsedUser = JSON.parse(userData);

          // Fetch posts and count
          const fetchedPosts = await fetchUserPosts(parsedUser);
          const postCount = fetchedPosts.length;

          console.log("Posts count:", postCount);

          // Fetch friends and watched count
          const friendsCount = await fetchFriendsCount(token);
          const watchedCount = await fetchWatchedCount(token);

          console.log("Friends count:", friendsCount);
          console.log("Watched count:", watchedCount);

          // Set full user object with all dynamic counts
          setUser({
            id: parsedUser._id || parsedUser.id,
            username: parsedUser.username,
            email: parsedUser.email,
            bio: parsedUser.bio || '',
            profilePicture: parsedUser.profilePicture || "https://via.placeholder.com/100",
            postsCount: postCount,
            friendsCount,
            watchedCount,
            favoriteGenres: parsedUser.favoriteGenres || ["Drama", "Comedy", "Action"],
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndPosts();
  }, []);

  //  Fetch posts for current user and return them
  const fetchUserPosts = async (parsedUser) => {
    try {
      const response = await axios.get("http://localhost:3001/api/posts");
      const currentUserId = parsedUser._id || parsedUser.id;
      const filteredPosts = response.data.filter(
        (post) =>
          post.author._id === currentUserId || post.author.id === currentUserId
      );
      setUserPosts(filteredPosts);
      return filteredPosts; // Return to calculate count
    } catch (error) {
      console.error("Error fetching user posts:", error);
      return [];
    }
  };

  const handlePostCreated = async (newPost) => {
    setUserPosts((prev) => [newPost, ...prev]);

    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      const fetchedPosts = await fetchUserPosts(parsedUser);

      // Optional: update postsCount in user object after creating new post
      setUser((prevUser) => ({
        ...prevUser,
        postsCount: fetchedPosts.length,
      }));
    }
  };



  const handleLikePost = (postId) => {
    alert(`Liked post ${postId}`);
  };

  const handleViewProfile = (userId) => {
    // Open user profile in new tab
    window.open(`/profile/${userId}`, '_blank');
  };

  // הוספתי פונקציה חדשה לטיפול בצפייה בקבוצה
  const handleViewGroup = (groupId) => {
    router.push(`/groups/${groupId}`);
  };
  const handleUserUpdated = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };


  //  Get number of friends from backend
  const fetchFriendsCount = async (token) => {
  try {
    console.log("Fetching friends with token:", token);
    const res = await axios.get(`http://localhost:3001/api/user/me/friends`, {
      headers: {'x-auth-token': token },
    });
    console.log("Friends response:", res.data);
    const friendsCount = Array.isArray(res.data) ? res.data.length : 0;

    // ✅ עדכן את המשתמש עם friendsCount
    setUser(prevUser => ({
      ...prevUser,
      friendsCount: friendsCount
    }));
   
    return friendsCount;
  } catch (error) {
    console.error("Failed to fetch friends:", error);
    console.error("Error status:", error.response?.status);
    console.error("Error data:", error.response?.data);
    
    // גם במקרה של שגיאה, עדכן עם 0
    setUser(prevUser => ({
      ...prevUser,
      friendsCount: 0
    }));
    
    return 0;
  }
};
  const handlePostDeleted = (deletedPostId) => {
  console.log('Post deleted from profile:', deletedPostId);
  setUserPosts(prevPosts => prevPosts.filter(post => post._id !== deletedPostId));
  
  // עדכן גם את מספר הפוסטים במשתמש
  setUser(prevUser => ({
    ...prevUser,
    postsCount: Math.max(0, (prevUser.postsCount || 0) - 1)
  }));
};
const handlePostUpdated = (updatedPost) => {
  console.log('Post updated in profile:', updatedPost);
  setUserPosts(prevPosts => 
    prevPosts.map(post => 
      post._id === updatedPost._id ? updatedPost : post
    )
  );
};

  //  Get number of watched items from backend
  const fetchWatchedCount = async (token) => {
    try {
      console.log("Fetching watched with token:", token);
      const res = await axios.get(`http://localhost:3001/api/user/me`, {
        headers: { 'x-auth-token': token },
      });
      console.log("User response:", res.data);
      return res.data.watchedMovies ? res.data.watchedMovies.length : 0;
    } catch (error) {
      console.error("Failed to fetch watched items:", error);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);
      return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center mt-5">
        <p>User not found.</p>
      </div>
    );
  }

  return (
    <div className="profile-content">
      <ProfileHeader
        user={user}
        onPostCreated={handlePostCreated}
        onUserUpdated={handleUserUpdated}
      />
      <div className="mt-4">
        <ProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          userPosts={userPosts}
          onLikePost={handleLikePost}
          currentUser={user}
          onViewProfile={handleViewProfile}
          onViewGroup={handleViewGroup}
          onPostDeleted={handlePostDeleted} 
          onPostUpdated={handlePostUpdated}
        />
      </div>
    </div>
  );
}