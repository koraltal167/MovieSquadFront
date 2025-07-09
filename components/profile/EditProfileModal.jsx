"use client"

import { useState, useEffect } from "react"
import axios from "axios"

export default function EditProfileModal({ isOpen, onClose, currentUser, onUserUpdated }) {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        bio: '',
        
    })
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    // Initialize form with current user data
    useEffect(() => {
        if (isOpen && currentUser) {
            setFormData({
                username: currentUser.username || '',
                email: currentUser.email || '',
                bio: currentUser.bio || ''
                
            })
            setErrors({})
        }
    }, [isOpen, currentUser])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}
        
        if (!formData.username.trim()) {
            newErrors.username = 'Username is required'
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters'
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid'
        }

        if (formData.bio && formData.bio.length > 500) {
            newErrors.bio = 'Bio must be less than 500 characters'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await axios.put(
                'http://localhost:3001/api/user/me',
                formData,
                { headers: { 'x-auth-token': token } }
            )

            // Update localStorage with new user data
            const updatedUser = {
                ...currentUser,
                ...response.data
            }
            localStorage.setItem('user', JSON.stringify(updatedUser))

            // Call parent callback to update UI
            if (onUserUpdated) {
                onUserUpdated(updatedUser)
            }

            alert('Profile updated successfully!')
            onClose()
        } catch (error) {
            console.error('Error updating profile:', error)
            if (error.response?.data?.msg) {
                alert(error.response.data.msg)
            } else {
                alert('Failed to update profile. Please try again.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
                    <div className="modal-header" style={{ borderBottom: '1px solid #444' }}>
                        <h5 className="modal-title text-white">✏️ Edit Profile</h5>
                        <button 
                            type="button" 
                            className="btn-close btn-close-white" 
                            onClick={onClose}
                            disabled={isLoading}
                        ></button>
                    </div>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body">
                            <div className="row">

                                
                                {/* Form Fields */}
                                <div className="col-md-8">
                                    {/* Username */}
                                    <div className="mb-3">
                                        <label htmlFor="username" className="form-label text-white">
                                            Username *
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            style={{ backgroundColor: '#3c3c3c', border: '1px solid #555', color: 'white' }}
                                            disabled={isLoading}
                                        />
                                        {errors.username && (
                                            <div className="invalid-feedback">{errors.username}</div>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label text-white">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            style={{ backgroundColor: '#3c3c3c', border: '1px solid #555', color: 'white' }}
                                            disabled={isLoading}
                                        />
                                        {errors.email && (
                                            <div className="invalid-feedback">{errors.email}</div>
                                        )}
                                    </div>

                                   
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="mb-3">
                                <label htmlFor="bio" className="form-label text-white">
                                    Bio
                                </label>
                                <textarea
                                    className={`form-control ${errors.bio ? 'is-invalid' : ''}`}
                                    id="bio"
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Tell us about yourself..."
                                    style={{ backgroundColor: '#3c3c3c', border: '1px solid #555', color: 'white' }}
                                    disabled={isLoading}
                                />
                                {errors.bio && (
                                    <div className="invalid-feedback">{errors.bio}</div>
                                )}
                                <small className="text-muted">
                                    {formData.bio.length}/500 characters
                                </small>
                            </div>
                        </div>
                        
                        <div className="modal-footer" style={{ borderTop: '1px solid #444' }}>
                            <button 
                                type="button" 
                                className="btn btn-outline-secondary" 
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Saving...
                                    </>
                                ) : (
                                    '💾 Save Changes'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}