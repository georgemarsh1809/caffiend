import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import React, { createContext } from 'react'
import { useState, useEffect, useContext } from 'react'
import { auth, db } from '../../firebase'
import { doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext()

export function useAuth() {
    return useContext(AuthContext) // Creates a custom hook
}

export function AuthProvider(props) {
    const { children } = props
    const [globalUser, setGlobalUser] = useState(null)
    const [globalData, setGlobalData] = useState(null)
    const [isLoading, setIsLoading] = useState(false)


    function signup(email, password) {
        return createUserWithEmailAndPassword(auth, email, password)
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password)
    }

    function logout() {
        setGlobalUser(null)
        setGlobalData(null)
        return signOut(auth)
    }

    // function resetPassword(email) {
    //     return sendPasswordResetEmail(auth, email)
    // }

    const value = { globalUser, globalData, setGlobalData, isLoading, signup, login, logout }

    useEffect(() => { // Event listener that listens for Auth events 
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log('CURRENT USER: ', user)
            setGlobalUser(user)

            // If no user, empty user state and return from listener
            if (!user) {
                console.log("No active user")
                return
            }

            // If user, check if user has data in db, and if so, fetch data and update the global state
            try {
                setIsLoading(true)

                // First we create a ref for the document (labelled json object in FB), 
                // then get doc, then snap it to see if not null
                const docRef = doc(db, 'users', user.uid)
                const docSnap = await getDoc(docRef)

                let firebaseData = {}
                if (docSnap.exists()) {
                    firebaseData = docSnap.data()
                    console.log('Found user data', firebaseData)
                }
                setGlobalData(firebaseData)

            } catch (err) {
                console.log(err.message)
            } finally {
                setIsLoading(false)
            }

        })
        return unsubscribe // Cleanup... (no data leaks)

    }, []) // runs on page load as dependency array is empty


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
