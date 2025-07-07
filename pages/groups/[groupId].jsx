"use client"

import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import GroupDetail from "../../components/groups/GroupDetailPage"

export default function GroupPage() {
    const router = useRouter()
    const { groupId } = router.query
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        // Wait for router to be ready
        if (router.isReady) {
            setIsReady(true)
        }
    }, [router.isReady])

    if (!isReady) {
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

    if (!groupId) {
        return (
            <div className="container-fluid" style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
                <div className="text-center p-5">
                    <div className="alert alert-danger" role="alert">
                        Group ID not found
                    </div>
                </div>
            </div>
        )
    }

    return <GroupDetail groupId={groupId} />
}