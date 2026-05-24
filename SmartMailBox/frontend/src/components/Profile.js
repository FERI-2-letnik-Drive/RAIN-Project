import { useContext, useEffect, useState } from "react";
import { UserContext } from "../userContext";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Profile() {
    const userContext = useContext(UserContext);
    const [profile, setProfile] = useState({});
    const [error, setError] = useState("");
    const navigate = useNavigate(); 

    useEffect(() => {
        async function getProfile() {
            try {
                const res = await fetch("http://localhost:3001/users/profile", {
                    method: "GET",
                    credentials: "include"
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.message || "Failed to load profile");
                    return;
                }

                setProfile(data);
            } catch (err) {
                console.error(err);
                setError("Server error");
            }
        }

        getProfile();
    }, []);

    if (!userContext.user) {
        return <Navigate replace to="/login" />;
    }

    return (
        <div className="surface-card profile-card">
            <h2 className="profile-title">User Profile</h2>

            {error && <div className="error-text error-general">{error}</div>}

            <div className="profile-row">
                <span className="profile-label">Username:</span>
                <span className="profile-value">{profile.username}</span>
            </div>

            <div className="profile-row">
                <span className="profile-label">Email:</span>
                <span className="profile-value">{profile.email}</span>
            </div>
            <div className="input-group">
                <input className="btn-primary" type="button" value="Edit Profile" onClick={() => navigate("/profile/edit")} />
                <input className="btn-primary" type="button" value="Change Password" onClick={() => navigate("/profile/change-password")} />
            </div>
            
        </div>
    );
}

export default Profile;