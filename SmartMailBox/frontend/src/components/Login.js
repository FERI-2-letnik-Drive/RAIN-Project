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
        const res = await fetch("http://localhost:3001/users/login", {
            method: "POST",
            credentials: "include",
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        if (!res.ok) {
            setUsername("");
            setPassword("");
            setError(data.error || "Invalid username or password");
            return;
        }
        const data = await res.json();
        userContext.setUserContext(data);
    }

    return (
        <form onSubmit={Login}>
            {userContext.user ? <Navigate replace to="/" /> : ""}
            <input type="text" name="username" placeholder="Username"
             value={username} onChange={(e)=>(setUsername(e.target.value))}/>
             <input type="password" name="password" placeholder="Password"
             value={password} onChange={(e)=>(setPassword(e.target.value))}/>
             <button name="submit-btn" className="btn btn-primary">Submit</button>
             <label>{error}</label>
        </form>
    );
}

export default Login;