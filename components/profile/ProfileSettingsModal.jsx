"use client"

import { useState, useEffect } from "react"
import axios from "axios"

export default function ProfileSettingsModal({ isOpen, onClose, currentUser }) {
    const [settings, setSettings] = useState({
        isPublic: true,
        showWatchedContent: true,
        showFavorites: true
    })
    const [isLoading, setIsLoading] = useState(false)

    // Load current settings when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchCurrentSettings()
        }
    }, [isOpen])

    const fetchCurrentSettings = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(
                'http://localhost:3001/api/user/me',
                { headers: { 'x-auth-token': token } }
            )
            
            if (response.data.profileSettings) {
                setSettings(response.data.profileSettings)
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
        }
    }

    const handleToggle = (settingName) => {
        setSettings(prev => ({
            ...prev,
            [settingName]: !prev[settingName]
        }))
    }

    const handleSave = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem('token')
            await axios.put(
                'http://localhost:3001/api/user/me/settings',
                settings,
                { headers: { 'x-auth-token': token } }
            )

            alert('Settings updated successfully!')
            onClose()
        } catch (error) {
            console.error('Error updating settings:', error)
            alert('Failed to update settings. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
                    <div className="modal-header" style={{ borderBottom: '1px solid #444' }}>
                        <h5 className="modal-title text-white">⚙️ Profile Settings</h5>
                        <button 
                            type="button" 
                            className="btn-close btn-close-white" 
                            onClick={onClose}
                            disabled={isLoading}
                        ></button>
                    </div>
                    
                    <div className="modal-body">
                        <div className="mb-4">
                            <h6 className="text-white mb-3">🔒 Privacy Settings</h6>
                            
                            {/* Public Profile */}
                            <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded" 
                                 style={{ backgroundColor: '#3c3c3c' }}>
                                <div>
                                    <strong className="text-white">Public Profile</strong>
                                    <div className="text-muted small">
                                        Allow other users to view your profile
                                    </div>
                                </div>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="isPublic"
                                        checked={settings.isPublic}
                                        onChange={() => handleToggle('isPublic')}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Show Watched Content */}
                            <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded" 
                                 style={{ backgroundColor: '#3c3c3c' }}>
                                <div>
                                    <strong className="text-white">Show Watched Movies</strong>
                                    <div className="text-muted small">
                                        Display your watched movies list to others
                                    </div>
                                </div>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="showWatchedContent"
                                        checked={settings.showWatchedContent}
                                        onChange={() => handleToggle('showWatchedContent')}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Show Favorites */}
                            <div className="d-flex justify-content-between align-items-center mb-3 p-3 rounded" 
                                 style={{ backgroundColor: '#3c3c3c' }}>
                                <div>
                                    <strong className="text-white">Show Favorite Genres</strong>
                                    <div className="text-muted small">
                                        Display your favorite genres to others
                                    </div>
                                </div>
                                <div className="form-check form-switch">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id="showFavorites"
                                        checked={settings.showFavorites}
                                        onChange={() => handleToggle('showFavorites')}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="alert alert-info">
                            <strong>💡 Preview:</strong><br/>
                            {settings.isPublic ? 
                                "Your profile is visible to all users" : 
                                "Your profile is private (only you can see it)"
                            }
                            <br/>
                            {settings.showWatchedContent ? 
                                "✅ Watched movies are visible" : 
                                "❌ Watched movies are hidden"
                            }
                            <br/>
                            {settings.showFavorites ? 
                                "✅ Favorite genres are visible" : 
                                "❌ Favorite genres are hidden"
                            }
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
                            type="button" 
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Saving...
                                </>
                            ) : (
                                '💾 Save Settings'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}