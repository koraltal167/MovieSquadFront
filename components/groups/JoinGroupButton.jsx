"use client"

import { useState } from "react"
import axios from "axios"

export default function JoinGroupButton({ groupId, groupName, isPrivate, isMember, isCreator, onJoined, onLeft }) {
    const [isLoading, setIsLoading] = useState(false)
    const [hasRequestedJoin, setHasRequestedJoin] = useState(false)

    // Don't show button if user is creator
    if (isCreator) {
        return (
            <div className="d-flex flex-column align-items-center">
                <span className="badge bg-success mb-1" style={{ fontSize: '0.7rem' }}>
                    👑 Creator
                </span>
                <small className="text-muted" style={{ fontSize: '0.65rem' }}>
                    Your Group
                </small>
            </div>
        )
    }

    const handleJoinGroup = async () => {
        if (!groupId || isLoading) return
        
        setIsLoading(true)
        
        try {
            const token = localStorage.getItem('token')
            
            if (isMember) {
                // Leave group
                console.log('Leaving group:', groupId)
                await axios.put(
                    `http://localhost:3001/api/groups/${groupId}/leave`,
                    {},
                    { headers: { 'x-auth-token': token } }
                )
                
                onLeft?.(groupId)
                alert(`You have left "${groupName}"`)
                
            } else {
                // Join group
                console.log('Joining group:', groupId)
                
                if (isPrivate) {
                    // Request to join private group
                    await axios.post(
                        `http://localhost:3001/api/groups/${groupId}/request-join`,
                        {},
                        { headers: { 'x-auth-token': token } }
                    )
                    
                    setHasRequestedJoin(true)
                    alert(`Join request sent to "${groupName}". You'll be notified when approved.`)
                } else {
                    // Join public group immediately
                    await axios.put(
                        `http://localhost:3001/api/groups/${groupId}/join`,
                        {},
                        { headers: { 'x-auth-token': token } }
                    )
                    
                    onJoined?.(groupId)
                    alert(`You have joined "${groupName}"!`)
                }
            }
            
        } catch (error) {
            console.error('Error with group action:', error)
            console.error('Error status:', error.response?.status)
            console.error('Error data:', error.response?.data)
            
            // Show user-friendly error message
            let errorMessage = 'Failed to perform action. Please try again.'
            
            if (error.response?.status === 400) {
                const message = error.response.data?.message || error.response.data?.msg || ''
                if (message.includes('already member')) {
                    errorMessage = 'You are already a member of this group.'
                } else if (message.includes('already requested')) {
                    errorMessage = 'You have already requested to join this group.'
                } else if (message.includes('not found')) {
                    errorMessage = 'Group not found. It may have been deleted.'
                } else {
                    errorMessage = message || errorMessage
                }
            } else if (error.response?.status === 403) {
                errorMessage = 'You don\'t have permission to perform this action.'
            }
            
            alert(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    // Get button configuration based on current state
    const getButtonConfig = () => {
        if (isMember) {
            return {
                text: "Leave Group",
                icon: "🚪",
                className: "btn-danger",
                disabled: false
            }
        } else if (hasRequestedJoin) {
            return {
                text: "Request Sent",
                icon: "📤",
                className: "btn-secondary",
                disabled: true
            }
        } else if (isPrivate) {
            return {
                text: "Request Join",
                icon: "🔒",
                className: "btn-warning",
                disabled: false
            }
        } else {
            return {
                text: "Join Group",
                icon: "➕",
                className: "btn-success",
                disabled: false
            }
        }
    }

    const buttonConfig = getButtonConfig()

    return (
        <button
            type="button"
            className={`btn ${buttonConfig.className} btn-sm d-flex align-items-center gap-1`}
            onClick={handleJoinGroup}
            disabled={isLoading || buttonConfig.disabled}
            style={{
                minWidth: '100px',
                fontSize: '0.8rem'
            }}
        >
            {isLoading ? (
                <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Loading...
                </>
            ) : (
                <>
                    <span>{buttonConfig.icon}</span>
                    {buttonConfig.text}
                </>
            )}
        </button>
    )
}