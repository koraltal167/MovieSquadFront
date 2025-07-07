"use client"

import { useEffect, useState } from "react"

export default function PostForm({post}) {
    const [expanded, setExpanded] = useState(false)
    const maxLength = 200

    const shouldTruncate = post.content.length > maxLength
    const displayContent = shouldTruncate && !expanded 
        ? post.content.substring(0, maxLength) + '...'
        : post.content

    const getCategoryIcon = (category) => {
        const categoryMap = {
            'review': '⭐',
            'recommendation': '👍',
            'discussion': '💬',
            'question': '❓',
            'news': '📰',
            'general': '📝'
        }
        return categoryMap[category] || '📝'
    }

    const getCategoryColor = (category) => {
        const colorMap = {
            'review': '#ffc107',
            'recommendation': '#28a745',
            'discussion': '#17a2b8',
            'question': '#fd7e14',
            'news': '#dc3545',
            'general': '#6c757d'
        }
        return colorMap[category] || '#6c757d'
    }

    return (
        <div>
            {/* Movie/TV Show Info - if selected */}
            {post.tmdbId && post.tmdbId !== -1 && (
                <div className="mb-3">
                    <div className="d-flex align-items-center p-3 rounded" style={{ backgroundColor: '#3a3a3a', border: '1px solid #555' }}>
                        {post.tmdbPosterPath && (
                            <img 
                                src={`https://image.tmdb.org/t/p/w92${post.tmdbPosterPath}`}
                                alt={post.tmdbTitle}
                                className="rounded me-3"
                                style={{ width: '60px', height: '90px', objectFit: 'cover' }}
                            />
                        )}
                        <div>
                            <h6 className="text-white mb-1">
                                🎬 {post.tmdbTitle}
                            </h6>
                            <small className="text-muted">
                                {post.tmdbType === 'movie' ? '🎥 Movie' : '📺 TV Show'}
                            </small>
                        </div>
                    </div>
                </div>
            )}

            {/* Post Header - User info and date */}
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div className="d-flex align-items-center">
                    <strong className="me-2 text-white">{post?.author?.name || post?.author?.username}</strong>
                    <small className="text-muted">
                        {new Date(post?.createdAt).toLocaleString()}
                    </small>
                </div>
                
                {/* Category Badge */}
                {post.categories && post.categories.length > 0 && (
                    <div className="d-flex flex-wrap gap-1">
                        {post.categories.map(category => (
                            <span 
                                key={category}
                                className="badge"
                                style={{ 
                                    backgroundColor: getCategoryColor(category),
                                    color: 'white',
                                    fontSize: '0.75rem'
                                }}
                            >
                                {getCategoryIcon(category)} {category.charAt(0).toUpperCase() + category.slice(1)}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Post Content */}
            <div className="mb-3">
                <p className="text-white mb-2" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {displayContent}
                </p>
                
                {shouldTruncate && (
                    <button 
                        className="btn btn-link text-info p-0 text-decoration-none"
                        onClick={() => setExpanded(!expanded)}
                    >
                        {expanded ? 'Show less' : 'Show more'}
                    </button>
                )}
            </div>

            {/* Tags/Keywords */}
            {post.tmdbTitle && post.tmdbTitle !== 'General Discussion' && (
                <div className="mb-2">
                    <div className="d-flex flex-wrap gap-1">
                        <span className="badge bg-secondary">
                            #{post.tmdbTitle.replace(/\s+/g, '').toLowerCase()}
                        </span>
                        <span className="badge bg-secondary">
                            #{post.tmdbType}
                        </span>
                        {post.categories && post.categories.map(category => (
                            <span key={category} className="badge bg-secondary">
                                #{category}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Keep support for old movieTitle field */}
            {post?.movieTitle && !post.tmdbTitle && (
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