import { useContext, useState } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';

function Login(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const userContext = useContext(UserContext); 

    async function Login(e){
        e.preventDefault();

        setError("")
        if (!username || !password) {
            setError("Please fill in all the fields!");
            return;
        }

        const res = await fetch("http://localhost:3001/users/login", {
            method: "POST",
            credentials: "include",
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await res.json();
        if (!res.ok) {
            //setUsername("");
            //setPassword("");
            setError(data.message || "Login failed!");
            return;
        }
        userContext.setUserContext(data);
    }

    return (
        <form onSubmit={Login} className="surface-card">
        {userContext.user ? <Navigate replace to="/" /> : null}
        <div className="input-group">
            <input className="input-field" type="text" name="username" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="input-group">
            <input className="input-field" type="password" name="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="input-group">
            <input className="btn-primary" type="submit" value="Submit" />
            {error && <div className="error-text error-general">{error}</div>}
        </div>
    </form>
    );
}

export default Login;