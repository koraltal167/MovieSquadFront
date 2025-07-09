"use client"

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function WatchlistContent({ currentUser }) {
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavoriteMovies();
  }, []);

  const loadFavoriteMovies = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:3001/api/user/me", {
        headers: { "x-auth-token": token },
      });
      
      console.log("User data:", response.data);
      
      // ✅ קח רק את favorite movies
      const favoriteMovies = response.data.favoriteMovies || [];
      setFavoriteMovies(favoriteMovies);
    } catch (error) {
      console.error("Error loading favorite movies:", error);
      setFavoriteMovies([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (tmdbId) => {
    if (!confirm("Remove this movie from your favorites?")) return;
    
    try {
      const token = localStorage.getItem("token");
      
      // ✅ השתמש ב-endpoint הקיים להסרת favorite movie
      await axios.delete(
        `http://localhost:3001/api/user/me/favorite-movies/${tmdbId}`,
        { headers: { "x-auth-token": token } }
      );
      
      // רענן את הרשימה
      loadFavoriteMovies();
      alert("Movie removed from favorites successfully");
    } catch (error) {
      console.error("Error removing favorite movie:", error);
      alert("Failed to remove movie from favorites");
    }
  };

  const FavoriteMovieCard = ({ movie }) => (
    <div className="card mb-3" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
      <div className="card-body">
        <div className="row">
          {/* Movie Icon */}
          <div className="col-auto">
            <div 
              className="d-flex align-items-center justify-content-center rounded"
              style={{ 
                width: '80px', 
                height: '120px', 
                backgroundColor: '#3c3c3c',
                border: '1px solid #555'
              }}
            >
              <div className="text-center">
                <div style={{ fontSize: '3rem' }}>🎬</div>
                <small className="text-muted">
                  #{movie.tmdbId}
                </small>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="col">
            <div className="d-flex justify-content-between align-items-start">
              <div className="flex-grow-1">
                <h5 className="card-title text-white mb-2">{movie.title}</h5>
                
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <span className="badge bg-danger">
                    ❤️ FAVORITE
                  </span>
                  <span className="badge bg-info">
                    TMDB ID: {movie.tmdbId}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="d-flex gap-2 flex-wrap">
              <button 
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleRemoveFavorite(movie.tmdbId)}
              >
                💔 Remove from Favorites
              </button>
              
              <button 
                className="btn btn-outline-info btn-sm"
                onClick={() => window.open(`https://www.themoviedb.org/movie/${movie.tmdbId}`, '_blank')}
              >
                🔗 View on TMDB
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-light mb-3" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted">Loading your favorite movies...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="text-white mb-1">
            ❤️ My Favorite Movies
          </h4>
          <p className="text-muted mb-0">Your collection of favorite movies</p>
        </div>
        
        <span className="badge bg-danger fs-6">
          {favoriteMovies.length} Favorites
        </span>
      </div>

      {/* Empty State */}
      {favoriteMovies.length === 0 ? (
        <div className="text-center py-5">
          <div className="text-muted">
            <h5>💔</h5>
            <p>No favorite movies yet</p>
            <small>Start adding movies to your favorites!</small>
          </div>
        </div>
      ) : (
        <>
          {/* Movies List */}
          <div>
            {favoriteMovies.map((movie) => (
              <FavoriteMovieCard key={movie.tmdbId} movie={movie} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}