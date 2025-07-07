"use client"
import { useEffect, useState } from "react"
import SignIn from "./SignIn"
import SignUp from "./SignUp"
import Profile from "../pages/Profile"

export default function Dashboard() {
    const [user, setUser] = useState(null)

    useEffect(() => {
        // Check if user is logged in by checking localStorage
        const token = localStorage.getItem('token')
        const userData = localStorage.getItem('user')
        
        if (token && userData) {
            setUser(JSON.parse(userData))
        }
    }, [])

    const handleSignOut = () => {
        // Clear localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
        alert("User signed out!")
    }

    const handleLoginSuccess = (userData) => {
        setUser(userData)
    }

    return(
        <div className="dashboard-container" style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
            {user ? (
                <div className="container mt-5">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="text-white">Welcome back, {user.username}!</h1>
                        <button className="btn btn-outline-danger" onClick={handleSignOut}>
                            Sign Out
                        </button>
                    </div>
                    <Profile />
                </div>
            ) : (
                <div className="container mt-5">
                    <div className="text-center">
                        <h2 className="mb-4 text-white">Welcome to MovieSquad</h2>
                        <div className="row justify-content-center">
                            <div className="col-md-6 col-lg-4 mb-3">
                                <SignIn onLoginSuccess={handleLoginSuccess}/>
                            </div>
                            <div className="col-md-6 col-lg-4 mb-3">
                                <SignUp onLoginSuccess={handleLoginSuccess}/>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}