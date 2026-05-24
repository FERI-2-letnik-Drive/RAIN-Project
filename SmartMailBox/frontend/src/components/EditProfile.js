import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../userContext";

function EditProfile() {
    const userContext = useContext(UserContext);

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [updated, setUpdated] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        async function getProfile() {
            try {
                const res = await fetch("http://localhost:3001/users/profile", {
                    method: "GET",
                    credentials: "include"
                });

                const data = await res.json();

                if (!res.ok) {
                    setErrors({ general: data.message || "Failed to load profile." });
                    return;
                }

                setUsername(data.username || "");
                setEmail(data.email || "");
            } catch (err) {
                console.error(err);
                setErrors({ general: "Server error." });
            }
        }

        getProfile();
    }, []);

    async function onSubmit(e) {
        e.preventDefault();

        const newErrors = {};

        if (!username.trim()) {
            newErrors.username = "Username is required!";
        }

        if (!email.trim()) {
            newErrors.email = "Email is required!";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        try {
            const res = await fetch("http://localhost:3001/users/profile", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: username.trim(),
                    email: email.trim()
                })
            });

            const data = await res.json();

            if (!res.ok) {
                if (!res.ok) {
                    setErrors({ general: data.message });  
                    return;
                }
            }

            userContext.setUserContext(data);
            setUpdated(true);
        } catch (err) {
            console.error(err);
            setErrors({ general: "Server error" });
        }
    }

    if (!userContext.user) {
        return <Navigate replace to="/login" />;
    }

    return (
        <form onSubmit={onSubmit} className="surface-card profile-card">
            {updated ? <Navigate replace to="/profile" /> : null}

            <h2 className="profile-title">Edit Profile</h2>

            <div className="input-group">
                <input className="input-field" type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                {errors.username && <div className="error-text">{errors.username}</div>}
            </div>

            <div className="input-group">
                <input className="input-field" type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                {errors.email && <div className="error-text">{errors.email}</div>}
            </div>

            <div className="input-group">
                <input className="btn-primary" type="submit" value="Save Changes" />
                {errors.general && <div className="error-text error-general">{errors.general}</div>}
            </div>
        </form>
    );
}

export default EditProfile;