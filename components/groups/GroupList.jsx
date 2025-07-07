"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import GroupCard from "./GroupCard"
import CreateGroupForm from "./CreateGroupForm"
import EmptyState from "../EmptyState"

export default function GroupList({ currentUser, onGroupCreated }) {
    const [groups, setGroups] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterType, setFilterType] = useState("all") // all, my-groups, joined
    const [showCreateForm, setShowCreateForm] = useState(false)

    useEffect(() => {
        fetchGroups()
        
        // Debug current user info
        console.log('=== CURRENT USER DEBUG ===')
        console.log('Current user object:', currentUser)
        console.log('Current user ID:', currentUser._id)
        console.log('Current user username:', currentUser.username)
        
        const userData = localStorage.getItem('user')
        if (userData) {
            const parsedUser = JSON.parse(userData)
            console.log('User from localStorage:', parsedUser)
        }
    }, [])

    const fetchGroups = async () => {
        try {
            setIsLoading(true)
            setError(null)
            
            const token = localStorage.getItem('token')
            
            const response = await axios.get(
                'http://localhost:3001/api/groups',
                { headers: { 'x-auth-token': token } }
            )
            
            console.log('Groups response:', response.data)
            setGroups(response.data)
        } catch (error) {
            console.error('Error fetching groups:', error)
            setError('Failed to load groups')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGroupCreated = (newGroup) => {
        console.log('=== GROUP CREATED ===')
        console.log('New group:', newGroup)
        console.log('Current user:', currentUser)
        console.log('Adding to groups list...')
        
        setGroups(prev => [newGroup, ...prev])
        setShowCreateForm(false)
        
        if (onGroupCreated) {
            onGroupCreated(newGroup)
        }
        
        console.log('Group added successfully')
        
        // Refresh the groups list to ensure we have the latest data
        setTimeout(() => {
            fetchGroups()
        }, 1000)
    }

    const handleGroupJoined = (groupId) => {
        setGroups(prev => prev.map(group => 
            group._id === groupId 
                ? { ...group, members: [...group.members, currentUser._id] }
                : group
        ))
    }

    const handleGroupLeft = (groupId) => {
        setGroups(prev => prev.map(group => 
            group._id === groupId 
                ? { ...group, members: group.members.filter(id => id !== currentUser._id) }
                : group
        ))
    }

    // Filter groups based on search and filter type
    const filteredGroups = groups.filter(group => {
        const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            group.description.toLowerCase().includes(searchTerm.toLowerCase())
        
        if (!matchesSearch) return false
        
        console.log('Filtering group:', group.name)
        console.log('Group admin:', group.admin)
        console.log('Current user ID:', currentUser._id)
        console.log('Group members:', group.members)
        
        switch (filterType) {
            case "my-groups":
                const isMyGroup = group.admin === currentUser._id || 
                                  group.admin?._id === currentUser._id ||
                                  group.admin === currentUser.id ||
                                  group.admin?._id === currentUser.id
                console.log('Is my group?', isMyGroup)
                return isMyGroup
            case "joined":
                const isJoined = group.members.includes(currentUser._id) && 
                                group.admin !== currentUser._id
                console.log('Is joined?', isJoined)
                return isJoined
            default:
                return true
        }
    })

    if (isLoading) {
        return (
            <div className="text-center p-4">
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading groups...</span>
                </div>
                <p className="text-white mt-2">Loading groups...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center p-4">
                <div className="alert alert-danger" role="alert">
                    {error}
                </div>
                <button 
                    className="btn btn-warning btn-sm"
                    onClick={fetchGroups}
                >
                    Try Again
                </button>
            </div>
        )
    }

    return (
        <div className="groups-list">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="text-white mb-0">
                    🎬 Movie Groups ({filteredGroups.length})
                </h5>
                
                <button
                    className="btn btn-warning btn-sm"
                    onClick={() => setShowCreateForm(true)}
                >
                    ➕ Create Group
                </button>
            </div>

                    {/* Search and Filter */}
                    <div className="row mb-4">
                        <div className="col-md-8">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search groups..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    backgroundColor: '#3c3c3c',
                                    border: '1px solid #555',
                                    color: 'white'
                                }}
                            />
                        </div>
                        <div className="col-md-4">
                            <select
                                className="form-select"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                style={{
                                    backgroundColor: '#3c3c3c',
                                    border: '1px solid #555',
                                    color: 'white'
                                }}
                            >
                                <option value="all">All Groups</option>
                                <option value="my-groups">My Groups</option>
                                <option value="joined">Joined Groups</option>
                            </select>
                        </div>
                    </div>

                    {/* Create Group Form Modal */}
                    {showCreateForm && (
                        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="modal-dialog">
                                <div className="modal-content" style={{ backgroundColor: '#2c2c2c' }}>
                                    <div className="modal-header">
                                        <h5 className="modal-title text-white">Create New Group</h5>
                                        <button
                                            type="button"
                                            className="btn-close btn-close-white"
                                            onClick={() => setShowCreateForm(false)}
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        <CreateGroupForm
                                            currentUser={currentUser}
                                            onGroupCreated={handleGroupCreated}
                                            onCancel={() => setShowCreateForm(false)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Groups Grid */}
                    {filteredGroups.length === 0 ? (
                        searchTerm || filterType !== "all" ? (
                            <EmptyState 
                                text="No groups found matching your criteria"
                                showButton={false}
                            />
                        ) : (
                            <EmptyState 
                                text="No groups created yet. Be the first to create one!"
                                showButton={false}
                            />
                        )
                    ) : (
                        <div className="row">
                            {filteredGroups.map(group => (
                                <div key={group._id} className="col-md-6 col-lg-4 mb-4">
                                    <GroupCard
                                        group={group}
                                        currentUser={currentUser}
                                        onGroupJoined={handleGroupJoined}
                                        onGroupLeft={handleGroupLeft}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Refresh Button */}
                    <div className="text-center mt-4">
                        <button
                            className="btn btn-outline-warning btn-sm"
                            onClick={fetchGroups}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Refreshing...' : 'Refresh Groups'}
                        </button>
                    </div>
        </div>
    )
}
