import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../userContext";

function ChangePassword() {
    const userContext = useContext(UserContext);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changed, setChanged] = useState(false);
    const [errors, setErrors] = useState({});

    async function onSubmit(e) {
        e.preventDefault();

        const newErrors = {};

        if (!currentPassword) {
            newErrors.currentPassword = "Current password is required!";
        }

        if (!newPassword) {
            newErrors.newPassword = "New password is required!";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required!";
        }

        if (newPassword && confirmPassword && (newPassword !== confirmPassword)) {
            newErrors.confirmPassword = "Passwords do not match!";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        try {
            const res = await fetch("http://localhost:3001/users/password", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setErrors({ general: data.message || "Failed to change password" });
                return;
            }

            setChanged(true);
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
            {changed ? <Navigate replace to="/profile" /> : null}

            <h2 className="profile-title">Change Password</h2>

            <div className="input-group">
                <input className="input-field" type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                {errors.currentPassword && <div className="error-text">{errors.currentPassword}</div>}
            </div>

            <div className="input-group">
                <input className="input-field" type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                {errors.newPassword && <div className="error-text">{errors.newPassword}</div>}
            </div>

            <div className="input-group">
                <input className="input-field" type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
            </div>

            <div className="input-group">
                <input className="btn-primary" type="submit" value="Change Password" />
                {errors.general && <div className="error-text error-general">{errors.general}</div>}
            </div>
        </form>
    );
}

export default ChangePassword;