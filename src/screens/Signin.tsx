import { useState } from "react";
import "./Signin.css";
import logo from "../assets/chat.png"
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify"


const Signin = () => {

    const [email, setEmail] = useState<string>("");
    const navigate = useNavigate();
    const [password, setPassword] = useState<string>("");


    const handleSigninbutton = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
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

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
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
