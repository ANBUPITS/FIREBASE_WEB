import { useState } from "react";
import "./Signup.css";
import logo from "../assets/chat.png"
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { toast } from "react-toastify";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

const Signup = () => {
    const [fname, setfName] = useState<string>("");
    const [lname, setlName] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();

    const handleSignupbutton = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            const user = userCredential.user;
            await setDoc(doc(db, "users", user.uid), {
                firstName: fname,
                lastName: lname,
                email:email,
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
            }
            else {
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
                    <input
                        type="text"
                        placeholder="First name"
                        value={fname}
                        onChange={(e) => setfName(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Last name"
                        value={lname}
                        onChange={(e) => setlName(e.target.value)}
                        required
                    />
                    <input
                        type="tel"
                        placeholder="Phone"
                        pattern="[0-9]{10}"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
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
