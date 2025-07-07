"use client"

import { useState, useEffect } from "react"
import GroupMembers from "../../components/groups/GroupMembers"
import PostList from "../../components/posts/PostList"
import EmptyState from "../../components/EmptyState"
import axios from "axios"

// Change this to a real group ID you created for testing
const TEST_GROUP_ID = "YOUR_TEST_GROUP_ID_HERE"

export default function TestAdminGroupPage() {
    const [group, setGroup] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    const [groupPosts, setGroupPosts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        // Simulate current user as group creator
        const userData = localStorage.getItem('user')
        if (userData) {
            setCurrentUser(JSON.parse(userData))
        }
    }, [])

    useEffect(() => {
        if (TEST_GROUP_ID) {
            fetchGroupDetails()
            fetchGroupPosts()
        }
    }, [TEST_GROUP_ID])

    const fetchGroupDetails = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const token = localStorage.getItem('token')
            const response = await axios.get(
                `http://localhost:3001/api/groups/${TEST_GROUP_ID}`,
                { headers: { 'x-auth-token': token } }
            )
            setGroup(response.data)
        } catch (error) {
            setError('Failed to load group details')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchGroupPosts = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await axios.get(
                `http://localhost:3001/api/groups/${TEST_GROUP_ID}/posts`,
                { headers: { 'x-auth-token': token } }
            )
            setGroupPosts(response.data)
        } catch (error) {}
    }

    if (isLoading) {
        return <div className="text-center p-4 text-white">Loading group...</div>
    }
    if (error || !group) {
        return <div className="text-center p-4 text-danger">{error || 'Group not found'}</div>
    }

    // Simulate current user as creator/admin for demo
    const isCreator = true

    return (
        <div className="container mx-auto p-4" style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
            <h2 className="text-white mb-4">Test Group Admin Page</h2>
            <div className="card mb-4" style={{ backgroundColor: '#2c2c2c', border: '1px solid #444' }}>
                <div className="card-body">
                    <h3 className="text-white">{group.name}</h3>
                    <p className="text-white">{group.description}</p>
                    <span className="badge bg-success">You are the group creator (admin)</span>
                </div>
            </div>
            <div className="mb-4">
                <h4 className="text-white">Members Management</h4>
                <GroupMembers groupId={group._id} currentUser={currentUser} isCreator={isCreator} />
            </div>
            <div>
                <h4 className="text-white">Group Posts</h4>
                {groupPosts.length === 0 ? (
                    <EmptyState text="No posts in this group yet" showButton={false} />
                ) : (
                    <PostList posts={groupPosts} />
                )}
            </div>
            <div className="mt-4 text-white">
                <strong>Instructions:</strong>
                <ul>
                    <li>You can remove members, promote to admin, and (if implemented) remove posts.</li>
                    <li>To test, set <code>TEST_GROUP_ID</code> to a group you created.</li>
                </ul>
            </div>
        </div>
    )
}
