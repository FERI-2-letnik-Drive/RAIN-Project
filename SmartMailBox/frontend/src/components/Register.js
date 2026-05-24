import { useState } from 'react';
import { useNavigate } from "react-router-dom";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({});
    const navigate = useNavigate(); 

    async function Register(e){
        e.preventDefault();

        setErrors({});

        const newErrors = {};
        if (!email) newErrors.email = "Email is required";
        if (!username) newErrors.username = "Username is required";
        if (!password) newErrors.password = "Password is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return; // don't even call the server
        }

        const res = await fetch("http://localhost:3001/users/register", {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                username: username,
                password: password
            })
        });
        const data = await res.json();
        if (!res.ok) {
            setErrors({ general: data.message }); 
            
            return;
        }
        navigate("/login");
    }

    return(
        <form onSubmit={Register} className="surface-card">

            <h2 className="card-title">Register</h2>
            
            <div className="input-group">
                <label className="input-label">Email</label>
                <input className="input-field" type="text" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
                {errors.email && <div className="error-text">{errors.email}</div>}
            </div>

            <div className="input-group">
                <label className="input-label">Username</label>
                <input className="input-field" type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
                {errors.username && <div className="error-text">{errors.username}</div>}
            </div>

            <div className="input-group">
                <label className="input-label">Password</label>
                <input className="input-field" type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
                {errors.password && <div className="error-text">{errors.password}</div>}
            </div>

            <div className="input-group">
                <input className="btn-primary" type="submit" value="Register" />
                {errors.general && <div className="error-text error-general">{errors.general}</div>}
            </div>
        </form>
    );
}

export default Register;