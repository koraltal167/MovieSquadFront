"use client"

import { useEffect, useState } from "react"
import axios from "axios"

export default function SignUp({onLoginSuccess}){
    const [username, setUsername] = useState("")
    const [email, setEmail]=useState("")
    const [password, setPassword]=useState("")
    const [success, setSuccess] = useState(false)
    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    const validateForm = () => {
        const newErrors = {}
        
        // Username validation
        if (!username.trim()) {
            newErrors.username = "Username is required"
        } else if (username.trim().length < 3) {
            newErrors.username = "Username must be at least 3 characters long"
        }
        
        // Email validation
        if (!email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Please enter a valid email address"
        }
        
        // Password validation
        if (!password) {
            newErrors.password = "Password is required"
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long"
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSignUp = async (e)=>{
        e.preventDefault()
        setErrors({})
        
        // Validate form before submitting
        if (!validateForm()) {
            return
        }
        
        setIsLoading(true)
        
        try {
            // Make API call to your backend
            const response = await axios.post('http://localhost:3001/api/auth/register', {
                username: username.trim(),
                email: email.trim(),
                password: password
            })

            console.log('Registration response:', response.data) // Debug log

            // Handle successful registration - FIX: Get token and user from the correct structure
            const token = response.data.token
            const user = response.data.user
            
            // Store token in localStorage
            localStorage.setItem('token', token)
            
            // Store user data
            localStorage.setItem('user', JSON.stringify(user))
            
            setSuccess(true)
            
            // Clear form after successful registration
            setUsername("")
            setEmail("")
            setPassword("")

            // Call the callback to update parent component
            if (onLoginSuccess) {
                onLoginSuccess(user)
            }
            
        } catch (error) {
            console.log(error)
            if (error.response?.data?.message) {
                setErrors({ general: error.response.data.message })
            } else {
                setErrors({ general: "An error occurred during registration. Please try again." })
            }
        } finally {
            setIsLoading(false)
        }
    }
    
    return(
         <div className="card p-4 shadow-sm"> 
            <h2 className="text-center mb-4"> Sign up </h2>
            
            {/* Success Message */}
            {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <strong>Success!</strong> User created successfully! Welcome to MovieSquad!
                    <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setSuccess(false)}
                        aria-label="Close"
                    ></button>
                </div>
            )}
            
            {/* General Error Message */}
            {errors.general && (
                <div className="alert alert-danger" role="alert">
                    {errors.general}
                </div>
            )}
            
            <form onSubmit={handleSignUp}>
                <div className="form-floating mb-3">
                <input
                    type="text"
                    className={`form-control ${errors.username ? 'is-invalid' : ''}`}
                    id="floatingInput"
                    value={username}
                    onChange={(e)=>setUsername(e.target.value)}
                    placeholder="name@example.com"/>
                <label htmlFor="floatingInput">User Name</label>
                {errors.username && <div className="invalid-feedback">{errors.username}</div>}
            </div>
            <div className="form-floating mb-3">
                <input
                    type="email"
                    className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                    id="signupEmail"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    placeholder="name@example.com"/>
                <label htmlFor="signupEmail">Email address</label>
                {errors.email && <div className="invalid-feedback">{errors.email}</div>}
            </div>
            <div className="form-floating mb-3">
                <input
                    type="password"
                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                    id="signupPassword"
                    placeholder="enter your password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}/>
                <label htmlFor="signupPassword" className="floatingInput">Password</label>
                {errors.password && <div className="invalid-feedback">{errors.password}</div>}
            </div>            
                <button 
                    type="submit" 
                    className="btn btn-dark"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                            Signing Up...
                        </>
                    ) : (
                        'Sign Up'
                    )}
                </button>
            </form>
        </div>
    )
}