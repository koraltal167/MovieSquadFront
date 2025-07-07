"use client"

import { useState } from "react"
import axios from "axios"

export default function AddFriendButton({ userId, username, currentStatus = "none", onStatusChange }) {
    // button state - none, sent, friends, pending
    const [status, setStatus] = useState(currentStatus) 
    const [isLoading, setIsLoading] = useState(false)

    const handleFriendAction = async () => {
        if (!userId || isLoading) return
        
        setIsLoading(true)
        
        try {
            const token = localStorage.getItem('token')
            
            if (status === "none") {
                // send friend request
                console.log('Sending friend request to userId:', userId)
                const response = await axios.post(
                    `http://localhost:3001/api/user/friends/request`,
                    { recipientId: userId },
                    { headers: { 'x-auth-token': token } }
                )
                console.log('Friend request sent successfully:', response.data)
                setStatus("sent")
                onStatusChange?.(userId, "sent")
                
            } else if (status === "friends") {
                // remove friend
                console.log('Removing friend with userId:', userId)
                await axios.delete(
                    `http://localhost:3001/api/user/me/friends/${userId}`,
                    { headers: { 'x-auth-token': token } }
                )
                setStatus("none")
                onStatusChange?.(userId, "none")
                
            } else if (status === "pending") {
                // accept friend request
                console.log('Accepting friend request from userId:', userId)
                await axios.put(
                    `http://localhost:3001/api/user/friends/accept`,
                    { senderId: userId },
                    { headers: { 'x-auth-token': token } }
                )
                setStatus("friends")
                onStatusChange?.(userId, "friends")
            }
            
        } catch (error) {
            console.error('Error handling friend action:', error)
            console.error('Error status:', error.response?.status)
            console.error('Error data:', error.response?.data)
            console.error('Current status:', status)
            console.error('User ID:', userId)
            
            // Show user-friendly error message
            let errorMessage = 'Failed to perform action. Please try again.'
            
            if (error.response?.status === 400) {
                const message = error.response.data?.message || error.response.data?.msg || ''
                if (message.includes('already friends')) {
                    errorMessage = 'You are already friends with this user. Try refreshing the page.'
                } else if (message.includes('already sent')) {
                    errorMessage = 'Friend request already sent. Please wait for their response.'
                } else if (message.includes('yourself')) {
                    errorMessage = 'You cannot send a friend request to yourself.'
                } else {
                    errorMessage = message || errorMessage
                }
            }
            
            alert(errorMessage)
        } finally {
            setIsLoading(false)
        }
    }

    // returns the correct button configuration
    const getButtonConfig = () => {
        switch (status) {
            case "friends":
                return {
                    text: "Friends",
                    icon: "✅",
                    className: "btn-success",
                    disabled: false
                }
            case "sent":
                return {
                    text: "Request Sent",
                    icon: "📤",
                    className: "btn-secondary",
                    disabled: true
                }
            case "pending":
                return {
                    text: "Accept Request",
                    icon: "👋",
                    className: "btn-warning",
                    disabled: false
                }
            default: // "none"
                return {
                    text: "Add Friend",
                    icon: "➕",
                    className: "btn-primary",
                    disabled: false
                }
        }
    }

    const buttonConfig = getButtonConfig()

    return (
        <button
            type="button"
            className={`btn ${buttonConfig.className} btn-sm d-flex align-items-center gap-1`}
            onClick={handleFriendAction}
            disabled={isLoading || buttonConfig.disabled}
            style={{
                minWidth: '110px',
                fontSize: '0.875rem'
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
