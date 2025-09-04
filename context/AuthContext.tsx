import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User,
} from "firebase/auth"
import { auth } from "../firebase"

type AuthContextType = {
  user: User | null
  loading: boolean
  signup: (email: string, password: string) => Promise<any>
  login: (email: string, password: string) => Promise<any>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

type AuthProviderProps = {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signup = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password)

  const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password)

  const logout = () => signOut(auth)

  const resetPassword = (email: string) =>
    sendPasswordResetEmail(auth, email)

  const value: AuthContextType = {
    user,
    loading,
    signup,
    login,
    logout,
    resetPassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
