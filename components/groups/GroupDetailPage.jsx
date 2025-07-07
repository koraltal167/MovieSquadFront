"use client"
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import GroupMembers from "./GroupMembers"
import JoinGroupButton from "./JoinGroupButton"
import PostList from "../posts/PostList"
import AddPostModal from "../posts/AddPostModal"
import axios from "axios"

export default function GroupDetail({ groupId }) {
    const [group, setGroup] = useState(null)
    const [posts, setPosts] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const [activeTab, setActiveTab] = useState('posts')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isMember, setIsMember] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [showAddPostModal, setShowAddPostModal] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                const token = localStorage.getItem('token')
                const userData = localStorage.getItem('user')
                
                if (!token || !userData) {
                    router.push('/')
                    return
                }

                const parsedUser = JSON.parse(userData)
                setCurrentUser(parsedUser)

                // Fetch group details
                const groupResponse = await axios.get(`http://localhost:3001/api/groups/${groupId}`, {
                    headers: {
                        'x-auth-token': token
                    }
                })

                const groupData = groupResponse.data
                setGroup(groupData)

                // Check if user is member or admin
                const userIsMember = groupData.members.some(member => 
                    (member._id || member.id) === (parsedUser._id || parsedUser.id)
                )
                const userIsAdmin = (groupData.admin._id || groupData.admin.id) === (parsedUser._id || parsedUser.id)
                
                setIsMember(userIsMember)
                setIsAdmin(userIsAdmin)

                // Fetch posts for this group
                if (userIsMember) {
                    try {
                        const postsResponse = await axios.get(`http://localhost:3001/api/groups/${groupId}/posts`, {
                            headers: {
                                'x-auth-token': token
                            }
                        })
                        setPosts(postsResponse.data)
                    } catch (postsError) {
                        console.log('No group-specific posts endpoint, using general posts')
                        // Fallback: fetch all posts and filter
                        const allPostsResponse = await axios.get('http://localhost:3001/api/posts', {
                            headers: {
                                'x-auth-token': token
                            }
                        })
                        const filteredPosts = allPostsResponse.data.filter(post => 
                            post.group && post.group._id === groupId
                        )
                        setPosts(filteredPosts)
                    }
                }
            } catch (error) {
                console.error('Error fetching group data:', error)
                setError('Failed to load group data')
            } finally {
                setIsLoading(false)
            }
        }

        fetchGroupData()
    }, [groupId, router])

    const handleJoinGroup = (groupId) => {
        setIsMember(true)
        // Refresh group data to update member count
        window.location.reload()
    }

    const handleLeaveGroup = (groupId) => {
        setIsMember(false)
        // Refresh group data to update member count
        window.location.reload()
    }

    const handlePostAdded = (newPost) => {
        // Add the new post to the posts list
        setPosts(prevPosts => [newPost, ...prevPosts])
    }

    const renderTabContent = () => {
        if (!isMember && group?.isPrivate) {
            return (
                <div className="text-center py-5">
                    <div className="alert alert-warning" role="alert">
                        <h5 className="alert-heading">🔒 Private Group</h5>
                        <p className="mb-0">This is a private group. You need to join to see the content.</p>
                    </div>
                </div>
            )
        }

        switch (activeTab) {
            case 'posts':
                return (
                    <div>
                        {isMember && (
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="text-white mb-0">📝 Group Posts ({posts.length})</h5>
                                <button
                                    className="btn btn-warning btn-sm"
                                    onClick={() => setShowAddPostModal(true)}
                                >
                                    ➕ Add Post
                                </button>
                            </div>
                        )}
                        
                        <PostList 
                            posts={posts} 
                            currentUser={currentUser}
                            onPostUpdated={(updatedPost) => {
                                setPosts(prevPosts => 
                                    prevPosts.map(post => 
                                        post._id === updatedPost._id ? updatedPost : post
                                    )
                                )
                            }}
                            onPostDeleted={(deletedPostId) => {
                                setPosts(prevPosts => 
                                    prevPosts.filter(post => post._id !== deletedPostId)
                                )
                            }}
                        />
                    </div>
                )

            case 'members':
                return (
                    <div>
                        <h5 className="text-white mb-4">👥 Group Members ({group.members?.length || 0})</h5>
                        <GroupMembers groupId={groupId} />
                    </div>
                )

            case 'about':
                return (
                    <div>
                        <div className="row">
                            <div className="col-md-6">
                                <h5 className="text-white mb-3">📋 Description</h5>
                                <p className="text-muted">{group?.description || 'No description provided'}</p>
                            </div>
                            <div className="col-md-6">
                                <h5 className="text-white mb-3">📊 Group Info</h5>
                                <p className="text-muted">
                                    <strong>Members:</strong> {group?.members?.length || 0}<br />
                                    <strong>Created:</strong> {group?.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'Unknown'}<br />
                                    <strong>Admin:</strong> {group?.admin?.username || 'Unknown'}
                                </p>
                                <h5 className="text-white mb-3">🔐 Privacy</h5>
                                <p className="text-muted">{group?.isPrivate ? '🔒 Private Group' : '🌐 Public Group'}</p>
                            </div>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    if (isLoading) {
        return (
            <div className="container-fluid" style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
                <div className="text-center p-5">
                    <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container-fluid" style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
                <div className="text-center p-5">
                    <div className="alert alert-danger" role="alert">
                        {error}
                    </div>
                </div>
            </div>
        )
    }

    if (!group) {
        return (
            <div className="container-fluid" style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
                <div className="text-center p-5">
                    <div className="alert alert-warning" role="alert">
                        Group not found
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container-fluid" style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
            <div className="container py-4">
                {/* Group Header */}
                <div className="card mb-4" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                            <div>
                                <h1 className="text-white mb-2">{group.name}</h1>
                                <p className="text-muted mb-3">{group.description}</p>
                                <div className="d-flex align-items-center gap-3">
                                    <small className="text-muted">
                                        👥 {group.members?.length || 0} members
                                    </small>
                                    <small className="text-muted">
                                        📅 Created {new Date(group.createdAt).toLocaleDateString()}
                                    </small>
                                    <small className="text-muted">
                                        {group.isPrivate ? '🔒 Private' : '🌐 Public'}
                                    </small>
                                </div>
                            </div>
                            <div>
                                <JoinGroupButton
                                    groupId={group._id}
                                    groupName={group.name}
                                    isPrivate={group.isPrivate}
                                    isMember={isMember}
                                    onJoined={handleJoinGroup}
                                    onLeft={handleLeaveGroup}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="card mb-4" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
                    <div className="card-body">
                        <ul className="nav nav-tabs border-0">
                            {['posts', 'members', 'about'].map(tab => (
                                <button
                                    key={tab}
                                    className={`nav-link ${activeTab === tab ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        backgroundColor: activeTab === tab ? '#8b5cf6' : 'transparent',
                                        color: activeTab === tab ? 'white' : '#6c757d',
                                        border: 'none',
                                        borderRadius: '8px 8px 0 0',
                                        marginRight: '4px'
                                    }}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                    {tab === 'posts' && ` (${posts.length})`}
                                    {tab === 'members' && ` (${group.members?.length || 0})`}
                                </button>
                            ))}
                        </ul>
                        
                        <div className="tab-content mt-3">
                            {renderTabContent()}
                        </div>
                    </div>
                </div>

                {/* Add Post Modal */}
                {showAddPostModal && (
                    <AddPostModal
                        isOpen={showAddPostModal}
                        onClose={() => setShowAddPostModal(false)}
                        onSubmit={handlePostAdded}
                        groupId={groupId}
                    />
                )}
            </div>
        </div>
    )
}