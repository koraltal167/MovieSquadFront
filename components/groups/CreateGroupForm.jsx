"use client"

import { useState } from "react"
import axios from "axios"

export default function CreateGroupForm({ currentUser, onGroupCreated, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPrivate: false
    })
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors = {}
        
        if (!formData.name.trim()) {
            newErrors.name = 'Group name is required'
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Group name must be at least 3 characters'
        }
        
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required'
        } else if (formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters'
        }
        
        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        console.log('=== CREATE GROUP FORM DEBUG ===')
        console.log('Form data:', formData)
        console.log('Current user:', currentUser)
        
        const validationErrors = validateForm()
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors)
            return
        }

        setIsLoading(true)
        setErrors({})

        try {
            const token = localStorage.getItem('token')
            const userData = localStorage.getItem('user')
            
            console.log('Token exists:', !!token)
            console.log('Token value:', token)
            console.log('User data exists:', !!userData)
            console.log('Current user:', currentUser)
            
            if (!token) {
                alert('Please log in to create a group. No token found.')
                return
            }

            // Parse user data to get the correct user ID
            let userId = currentUser.id || currentUser._id
            if (userData) {
                try {
                    const parsedUser = JSON.parse(userData)
                    userId = parsedUser.id || parsedUser._id
                    console.log('Parsed user from localStorage:', parsedUser)
                } catch (e) {
                    console.error('Error parsing user data:', e)
                }
            }

            console.log('Using user ID:', userId)

            const requestData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                isPrivate: formData.isPrivate,
                createdBy: userId
            }

            console.log('Creating group with data:', requestData)
            console.log('Request headers:', {
                'x-auth-token': token,
                'Content-Type': 'application/json'
            })
            console.log('Request URL:', 'http://localhost:3001/api/groups')

            // Test if we can reach the backend first
            console.log('Testing backend connection...')
            const testResponse = await axios.get('http://localhost:3001/api/groups')
            console.log('Backend test successful:', testResponse.status)

            // Test if token is valid by making an authenticated request
            console.log('Testing token validity...')
            try {
                // Use a different endpoint to test token validity
                const tokenTestResponse = await axios.get('http://localhost:3001/api/groups', {
                    headers: {
                        'x-auth-token': token
                    }
                })
                console.log('Token test successful - can access protected routes')
            } catch (tokenError) {
                console.error('Token test failed:', tokenError.response?.data)
                if (tokenError.response?.status === 401) {
                    alert('Your session has expired. Please log in again.')
                    localStorage.removeItem('token')
                    localStorage.removeItem('user')
                    window.location.reload()
                    return
                }
            }

            const response = await axios.post(
                'http://localhost:3001/api/groups',
                requestData,
                {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'application/json'
                    }
                }
            )

            console.log('Response from server:', response.data)

            if (response.data && response.data._id) {
                alert('Group created successfully!')
                
                // Call the callback to update the parent component
                if (onGroupCreated) {
                    onGroupCreated(response.data)
                }
                
                // Reset form
                setFormData({ name: '', description: '', isPrivate: false })
            } else {
                alert('Error creating group: ' + (response.data.message || 'Unknown error'))
            }
        } catch (error) {
            console.error('=== ERROR CREATING GROUP ===')
            console.error('Full error object:', error)
            console.error('Error message:', error.message)
            console.error('Error response:', error.response)
            console.error('Error response data:', error.response?.data)
            console.error('Error response status:', error.response?.status)
            console.error('Error response headers:', error.response?.headers)
            
            let errorMessage = 'An error occurred while creating the group'
            
            if (error.response?.status === 401) {
                errorMessage = 'Authentication failed. Please log in again.'
                // Clear invalid token
                localStorage.removeItem('token')
                localStorage.removeItem('user')
                window.location.reload()
            } else if (error.response?.status === 403) {
                errorMessage = 'You do not have permission to create groups.'
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message
            } else if (error.response?.data?.msg) {
                errorMessage = error.response.data.msg
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error
            } else if (error.code === 'ERR_NETWORK') {
                errorMessage = 'Network error. Please check if the backend server is running.'
            }
            
            console.error('Final error message:', errorMessage)
            alert(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="create-group-form">
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label text-white">
                        Group Name <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter group name..."
                        style={{
                            backgroundColor: '#2a2a2a',
                            border: '1px solid #444',
                            color: 'white'
                        }}
                    />
                    {errors.name && (
                        <div className="invalid-feedback">{errors.name}</div>
                    )}
                </div>

                <div className="mb-3">
                    <label className="form-label text-white">
                        Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                        className={`form-control ${errors.description ? 'is-invalid' : ''}`}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter group description..."
                        rows={4}
                        style={{
                            backgroundColor: '#2a2a2a',
                            border: '1px solid #444',
                            color: 'white'
                        }}
                    />
                    {errors.description && (
                        <div className="invalid-feedback">{errors.description}</div>
                    )}
                </div>

                <div className="mb-3">
                    <div className="form-check">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            name="isPrivate"
                            id="isPrivate"
                            checked={formData.isPrivate}
                            onChange={handleInputChange}
                            style={{
                                backgroundColor: formData.isPrivate ? '#ffc107' : '#2a2a2a',
                                borderColor: '#444'
                            }}
                        />
                        <label className="form-check-label text-white" htmlFor="isPrivate">
                            🔒 Make this group private
                        </label>
                    </div>
                    <small className="text-muted">
                        Private groups require admin approval to join. Public groups allow anyone to join.
                    </small>
                </div>

                <div className="d-flex justify-content-end gap-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-warning"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating...' : 'Create Group'}
                    </button>
                </div>
            </form>
        </div>
    )
}
