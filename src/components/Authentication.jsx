import { useState } from "react"
import { useAuth } from "../context/authContext"

export default function Authentication(props) {
    const [isRegistration, setIsRegistration] = useState(false) // Signing in or signing up?
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isAuthenticating, setIsAuthenticating] = useState(false)
    const [err, setErr] = useState(null)

    const { signup, login } = useAuth()
    const { handleCloseModal } = props

    async function handleAuthenticate() {
        if (!email || !email.includes('@') || !password || password.length < 6 || isAuthenticating) {
            console.log("Invalid")
            return

        }

        try {
            setIsAuthenticating(true)
            setErr(null)

            if (isRegistration) {
                // register user
                await signup(email, password)
            } else {
                // login user   
                await login(email, password)
            }
            handleCloseModal()

        } catch (err) {
            console.log(err.message)
            setErr(err.message)
        } finally {
            setIsAuthenticating(false)
        }
    }

    return (
        <>
            <h2 className="sign-up-text">{isRegistration ? 'Sign up' : 'Login'}</h2>
            <p>{isRegistration ? 'Create an account' : 'Sign into your account'}</p>
            {err && (
                <p>❌ {err}</p>
            )}
            <input value={email} onChange={(e) => { setEmail(e.target.value) }} placeholder="Email" />
            <input value={password} onChange={(e) => { setPassword(e.target.value) }} placeholder="********" type='password' />
            <button onClick={handleAuthenticate}><p>{isAuthenticating ?
                'Authenticating...' : 'Submit'}</p></button>
            <hr />
            <div className="register-content">
                <p>{isRegistration ? 'Already have an account?' : 'Don\'t have an account?'}</p>
                <button onClick={() => { setIsRegistration(!isRegistration) }}>
                    <p>{isRegistration ? 'Log in' : 'Sign up'}</p>
                </button>
            </div>

        </>
    )
}