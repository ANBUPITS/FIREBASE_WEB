import { useState } from "react";
import "./Signin.css";
import logo from "../assets/chat.png"
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify"

type SigninProps = { onSubmit?: (email: string, password: string) => void; };


export const validateEmail = (email: string): string | null => {
    if (!email.trim()) {
        return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return "Please enter a valid email address";
    }
    return null;
};

export const validatePassword = (password: string): string | null => {
    if (!password) {
        return "Password is required";
    }
    if (password.length < 6) {
        return "Password must be at least 6 characters";
    }
    return null;
};

const Signin: React.FC<SigninProps> = ({ onSubmit }) => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [emailError, setEmailError] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");
    const navigate = useNavigate();

    const handleEmailBlur = () => {
        const error = validateEmail(email);
        setEmailError(error || "");
    };

    const handlePasswordBlur = () => {
        const error = validatePassword(password);
        setPasswordError(error || "");
    };

    const handleSigninbutton = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const emailValidationError = validateEmail(email);
        const passwordValidationError = validatePassword(password);

        setEmailError(emailValidationError || "");
        setPasswordError(passwordValidationError || "");

        if (emailValidationError || passwordValidationError) {
            toast.error("Please fix the errors before submitting");
            return;
        }

        try {
            if (onSubmit) {
                onSubmit(email, password);
                return;
            }
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            console.log("Signed in", user);
            toast.success("Signed in successfully...")
            navigate("/Chat")

        } catch (error: any) {
            switch (error.code) {
                case "auth/user-not-found":
                    toast.error("User not found.");
                    break;
                case "auth/wrong-password":
                    toast.error("Incorrect Password.");
                    break;
                case "auth/invalid-email":
                    toast.error("Invalid Email.");
                    break;
                case "auth/invalid-credential":
                    toast.error("Invalid credentials. Please check your email and password.");
                    break;
                default:
                    toast.error("Login failed. Please try again")
            }
        }
    }

    return (
        <section className="signin-container">
            <div className="signin-left">
                <div className="logo-text-wrap">
                    <img className="logo" src={logo} alt="Chat Logo" />
                    <div className="logo-text">
                        <h1>Chat App</h1>
                        <p>Connect with your friends instantly</p>
                    </div>
                </div>
            </div>

            <div className="signin-right">
                <h2>Login</h2>

                <form className="signin-form" onSubmit={handleSigninbutton}>
                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={handleEmailBlur}
                            className={emailError ? "error" : ""}
                            aria-invalid={!!emailError}
                            aria-describedby={emailError ? "email-error" : undefined}
                        />
                        {emailError && (
                            <span id="email-error" className="error-message">
                                {emailError}
                            </span>
                        )}
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onBlur={handlePasswordBlur}
                            className={passwordError ? "error" : ""}
                            aria-invalid={!!passwordError}
                            aria-describedby={passwordError ? "password-error" : undefined}
                        />
                        {passwordError && (
                            <span id="password-error" className="error-message">
                                {passwordError}
                            </span>
                        )}
                    </div>

                    <div className="butt-wrap">
                        <button type="submit">Sign in</button>
                    </div>
                </form>

                <p className="signin-message">
                    Don't have an account?{" "}
                    <span onClick={() => navigate("/Signup")}>Sign up</span>
                </p>
            </div>
        </section>
    );
};

export default Signin;