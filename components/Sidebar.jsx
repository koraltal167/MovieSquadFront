"use client"
import { useState } from "react"
import GroupList from "./groups/GroupList"

export default function Sidebar({ currentUser, onNavigate }) {
    const [activeSection, setActiveSection] = useState("home")
    const [showCreateGroup, setShowCreateGroup] = useState(false)

    const handleSectionClick = (section) => {
        setActiveSection(section)
        onNavigate?.(section)
    }

    const handleCreateGroupClick = () => {
        setShowCreateGroup(true)
    }

    const sidebarItems = [
        { id: "home", label: "Home", icon: "🏠" },
        { id: "discover", label: "Discover", icon: "🔍" },
        { id: "new-post", label: "New Post", icon: "📝" },
        { id: "groups", label: "Groups", icon: "👥" },
        { id: "create-group", label: "Create Group", icon: "➕", onClick: handleCreateGroupClick },
        { id: "chat", label: "Chat", icon: "💬" },
        { id: "notifications", label: "Notifications", icon: "🔔" }
    ]

    return (
        <div className="d-flex">
            {/* Sidebar */}
            <div 
                className="bg-dark text-white p-3 vh-100 position-fixed"
                style={{ 
                    width: '250px',
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
                }}
            >
                {/* Logo */}
                <div className="mb-4">
                    <h4 className="text-white fw-bold">
                        <span className="me-2">🎬</span>
                        MovieSquad
                    </h4>
                </div>

                {/* Navigation Items */}
                <div className="list-group list-group-flush">
                    {sidebarItems.map(item => (
                        <button
                            key={item.id}
                            className={`list-group-item list-group-item-action bg-transparent text-white border-0 py-3 px-3 text-start ${
                                activeSection === item.id ? 'active' : ''
                            }`}
                            onClick={() => item.onClick ? item.onClick() : handleSectionClick(item.id)}
                            style={{
                                backgroundColor: activeSection === item.id ? '#8b5cf6' : 'transparent',
                                borderRadius: '8px',
                                marginBottom: '4px',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <span className="me-3">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* User Profile at Bottom */}
                {currentUser && (
                    <div className="position-absolute bottom-0 start-0 p-3" style={{ width: '250px' }}>
                        <div className="d-flex align-items-center p-2 bg-dark rounded">
                            <div 
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center me-3"
                                style={{ width: '40px', height: '40px' }}
                            >
                                <span className="text-white fw-bold">
                                    {currentUser.username ? currentUser.username[0].toUpperCase() : 'U'}
                                </span>
                            </div>
                            <div className="flex-grow-1">
                                <div className="text-white fw-medium">{currentUser.username}</div>
                                <div className="text-muted small">{currentUser.email}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Group Modal */}
            {showCreateGroup && (
                <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content" style={{ backgroundColor: '#2c2c2c', border: 'none' }}>
                            <div className="modal-header border-0">
                                <h5 className="modal-title text-white">
                                    <span className="me-2">👥</span>
                                    Create New Group
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowCreateGroup(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <GroupList
                                    currentUser={currentUser}
                                    showCreateFormOnly={true}
                                    onGroupCreated={(newGroup) => {
                                        setShowCreateGroup(false)
                                        // Optionally refresh the groups page
                                        if (onNavigate) {
                                            onNavigate('groups')
                                        }
                                    }}
                                    onCancel={() => setShowCreateGroup(false)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
