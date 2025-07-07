"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import GroupCard from "./GroupCard"

export default function GroupList({ groups = [], currentUser, onGroupJoined, onGroupLeft, onViewGroup }) {
    const router = useRouter()

    const handleViewGroup = (groupId) => {
        if (onViewGroup) {
            onViewGroup(groupId)
        } else {
            router.push(`/groups/${groupId}`)
        }
    }

    // Handle case where groups is undefined or not an array
    if (!Array.isArray(groups)) {
        return (
            <div className="text-center py-4">
                <p className="text-muted">No groups available.</p>
            </div>
        )
    }

    if (groups.length === 0) {
        return (
            <div className="text-center py-4">
                <p className="text-muted">No groups found.</p>
            </div>
        )
    }

    return (
        <div className="row g-4">
            {groups.map(group => (
                <div key={group._id} className="col-md-6 col-lg-4">
                    <GroupCard
                        group={group}
                        currentUser={currentUser}
                        onGroupJoined={onGroupJoined}
                        onGroupLeft={onGroupLeft}
                        onViewGroup={handleViewGroup}
                    />
                </div>
            ))}
        </div>
    )
}