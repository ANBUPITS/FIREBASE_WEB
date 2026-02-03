import { useState } from "react";
import "./Signup.css";
import logo from "../assets/chat.png"
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { toast } from "react-toastify";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export const validateName = (name: string): string | null => {
    if (!name.trim()) {
        return "This field is required";
    }
    if (name.trim().length < 2) {
        return "Must be at least 2 characters";
    }
    return null;
};

export const validatePhone = (phone: string): string | null => {
    if (!phone.trim()) {
        return "Phone number is required";
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
        return "Phone number must be exactly 10 digits";
    }
    return null;
};

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

const Signup = () => {
    const [fname, setfName] = useState<string>("");
    const [lname, setlName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState<string>("");
    
    const [fnameError, setFnameError] = useState<string>("");
    const [lnameError, setLnameError] = useState<string>("");
    const [phoneError, setPhoneError] = useState<string>("");
    const [emailError, setEmailError] = useState<string>("");
    const [passwordError, setPasswordError] = useState<string>("");
    
    const navigate = useNavigate();

    const handleFnameBlur = () => {
        const error = validateName(fname);
        setFnameError(error || "");
    };

    const handleLnameBlur = () => {
        const error = validateName(lname);
        setLnameError(error || "");
    };

    const handlePhoneBlur = () => {
        const error = validatePhone(phone);
        setPhoneError(error || "");
    };

    const handleEmailBlur = () => {
        const error = validateEmail(email);
        setEmailError(error || "");
    };

    const handlePasswordBlur = () => {
        const error = validatePassword(password);
        setPasswordError(error || "");
    };

    const handleSignupbutton = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const fnameValidationError = validateName(fname);
        const lnameValidationError = validateName(lname);
        const phoneValidationError = validatePhone(phone);
        const emailValidationError = validateEmail(email);
        const passwordValidationError = validatePassword(password);

        setFnameError(fnameValidationError || "");
        setLnameError(lnameValidationError || "");
        setPhoneError(phoneValidationError || "");
        setEmailError(emailValidationError || "");
        setPasswordError(passwordValidationError || "");

    
        if (
            fnameValidationError ||
            lnameValidationError ||
            phoneValidationError ||
            emailValidationError ||
            passwordValidationError
        ) {
            toast.error("Please fix the errors before submitting");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                firstName: fname,
                lastName: lname,
                email: email,
                phone: phone,
                createdAt: serverTimestamp(),
            });
            
            toast.success("Account created successfully!");
            navigate("/");
        } catch (error: any) {
            if (error.code === "auth/email-already-in-use") {
                toast.error("Email already registered");
            } else if (error.code === "auth/weak-password") {
                toast.error("Password should be atleast 6 characters");
            } else {
                toast.error("Signup failed");
            }
        }
    };

    return (
        <section className="signup-container">
            <div className="signup-left">
                <div className="logo-text-wrap">
                    <img className="logo" src={logo} alt="Chat Logo" />
                    <div className="logo-text">
                        <h1>Chat App</h1>
                        <p>Connect with your friends instantly</p>
                    </div>
                </div>
            </div>

            <div className="signup-right">
                <h2>Create Account</h2>

                <form className="signup-form" onSubmit={handleSignupbutton}>
                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="First name"
                            value={fname}
                            onChange={(e) => setfName(e.target.value)}
                            onBlur={handleFnameBlur}
                            className={fnameError ? "error" : ""}
                            aria-invalid={!!fnameError}
                        />
                        {fnameError && (
                            <span className="error-message">{fnameError}</span>
                        )}
                    </div>

                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Last name"
                            value={lname}
                            onChange={(e) => setlName(e.target.value)}
                            onBlur={handleLnameBlur}
                            className={lnameError ? "error" : ""}
                            aria-invalid={!!lnameError}
                        />
                        {lnameError && (
                            <span className="error-message">{lnameError}</span>
                        )}
                    </div>

                    <div className="input-group">
                        <input
                            type="tel"
                            placeholder="Phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            onBlur={handlePhoneBlur}
                            className={phoneError ? "error" : ""}
                            aria-invalid={!!phoneError}
                        />
                        {phoneError && (
                            <span className="error-message">{phoneError}</span>
                        )}
                    </div>

                    <div className="input-group">
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onBlur={handleEmailBlur}
                            className={emailError ? "error" : ""}
                            aria-invalid={!!emailError}
                        />
                        {emailError && (
                            <span className="error-message">{emailError}</span>
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
                        />
                        {passwordError && (
                            <span className="error-message">{passwordError}</span>
                        )}
                    </div>

                    <div className="butt-wrap">
                        <button type="submit">Sign up</button>
                    </div>
                </form>

                <p className="signup-message">
                    Already have an account?{" "}
                    <span onClick={() => navigate("/")}>Sign in</span>
                </p>
            </div>
        </section>
    );
};

export default Signup;