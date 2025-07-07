"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export default function AddPostModal({ isOpen, onClose, onPostCreated, groupId = null }) {
    const [formData, setFormData] = useState({
        content: '',
        tmdbId: '',
        tmdbType: 'movie',
        tmdbTitle: '',
        tmdbPosterPath: '',
        categories: ['general']
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // Fetch TMDB results on query
    useEffect(() => {
        if (!searchQuery) return;
        const fetchResults = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/tmdb/search?query=${encodeURIComponent(searchQuery)}`);
                setSearchResults(response.data.results || []);
            } catch (err) {
                console.error("TMDB Search Error:", err);
                setSearchResults([]);
            }
        };
        fetchResults();
    }, [searchQuery]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleCategoryClick = (category) => {
        setFormData(prev => ({ ...prev, categories: [category] }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.content.trim()) newErrors.content = 'Post content is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSelectResult = (result) => {
        setFormData(prev => ({
            ...prev,
            tmdbId: result.id,
            tmdbTitle: result.title || result.name,
            tmdbPosterPath: result.poster_path ? `https://image.tmdb.org/t/p/w500${result.poster_path}` : '',
            tmdbType: result.media_type || 'movie'
        }));
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const postData = {
                content: formData.content.trim(),
                tmdbId: formData.tmdbId ? parseInt(formData.tmdbId) : null,
                tmdbType: formData.tmdbType,
                tmdbTitle: formData.tmdbTitle.trim() || null,
                tmdbPosterPath: formData.tmdbPosterPath || null,
                categories: formData.categories
            };
            if (groupId) postData.groupId = groupId;
            const response = await axios.post('http://localhost:3001/api/posts', postData, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            });
            setFormData({ content: '', tmdbId: '', tmdbType: 'movie', tmdbTitle: '', tmdbPosterPath: '', categories: ['general'] });
            onClose();
            if (onPostCreated) onPostCreated(response.data);
            alert('Post created successfully!');
        } catch (error) {
            console.error('Error creating post:', error);
            alert(error.response?.data?.msg || 'Failed to create post.');
        } finally {
            setIsLoading(false);
        }
    };

    const categories = [
        { id: 'review', label: 'Review', icon: '⭐' },
        { id: 'recommendation', label: 'Recommendation', icon: '👍' },
        { id: 'discussion', label: 'Discussion', icon: '💬' },
        { id: 'question', label: 'Question', icon: '❓' },
        { id: 'news', label: 'News', icon: '📰' },
        { id: 'general', label: 'General', icon: '📝' }
    ];

    if (!isOpen) return null;

    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content" style={{ backgroundColor: '#2c2c2c', color: 'white' }}>
                    <div className="modal-header border-0">
                        <h5 className="modal-title">Create New Post</h5>
                        <button className="btn-close btn-close-white" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="mb-4">
                                <label className="form-label">What's on your mind?</label>
                                <textarea
                                    className={`form-control ${errors.content ? 'is-invalid' : ''}`}
                                    name="content"
                                    rows="4"
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    style={{ backgroundColor: '#3c3c3c', border: '1px solid #555', color: 'white' }}
                                />
                                {errors.content && <div className="invalid-feedback">{errors.content}</div>}
                            </div>

                            <div className="mb-4">
                                <label className="form-label">Link to Movie/TV Show (optional)</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Search for a movie or TV show..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    disabled={isLoading}
                                    style={{ backgroundColor: '#3c3c3c', border: '1px solid #555', color: 'white' }}
                                />
                                {searchResults.length > 0 && (
                                    <ul className="list-group mt-2">
                                        {searchResults.map(result => (
                                            <li
                                                key={result.id}
                                                className="list-group-item list-group-item-action"
                                                onClick={() => handleSelectResult(result)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {result.title || result.name} ({result.media_type})
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="form-label">Categories (select one)</label>
                                <div className="d-flex flex-wrap gap-2">
                                    {categories.map(category => (
                                        <button
                                            key={category.id}
                                            type="button"
                                            className={`btn ${formData.categories.includes(category.id) ? 'btn-warning' : 'btn-outline-warning'}`}
                                            onClick={() => handleCategoryClick(category.id)}
                                            disabled={isLoading}
                                        >
                                            {category.icon} {category.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer border-0">
                            <button className="btn btn-outline-secondary" onClick={onClose} disabled={isLoading}>Cancel</button>
                            <button type="submit" className="btn" style={{ backgroundColor: '#ff8c00', color: 'white' }} disabled={isLoading}>
                                {isLoading ? <span className="spinner-border spinner-border-sm me-2"></span> : 'Publish Post'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
