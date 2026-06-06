import { useEffect, useState, useCallback } from "react";

const API = "http://localhost:3001";

function MailBoxPermissions({ mailboxId }) {
    const [permissions, setPermissions] = useState([]);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // Form state
    const [email, setEmail] = useState("");
    const [type, setType] = useState("permanent");
    const [validFrom, setValidFrom] = useState("");
    const [validUntil, setValidUntil] = useState("");

    const loadPermissions = useCallback(async () => {
        try {
            const res = await fetch(`${API}/mailboxes/${mailboxId}/permissions`, {
                credentials: "include"
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Failed to load permissions");
                return;
            }
            setPermissions(data);
        } catch (err) {
            console.error(err);
            setError("Server error");
        }
    }, [mailboxId]);

    useEffect(() => {
        loadPermissions();
    }, [loadPermissions]);

    async function handleAdd(e) {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!email.trim()) {
            setError("Please enter the user's email");
            return;
        }

        const body = { email: email.trim(), type };
        if (type === "temporary") {
            if (!validFrom || !validUntil) {
                setError("Temporary access needs a start and end date");
                return;
            }
            if (new Date(validFrom) >= new Date(validUntil)) {
                setError("Start date must be before end date");
                return;
            }
            // Convert the local datetime-local value to an absolute UTC timestamp,
            // otherwise a UTC server misreads the wall-clock time and the window is offset.
            body.validFrom = new Date(validFrom).toISOString();
            body.validUntil = new Date(validUntil).toISOString();
        }

        try {
            const res = await fetch(`${API}/mailboxes/${mailboxId}/permissions`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Failed to add permission");
                return;
            }
            setMessage("Access granted");
            setEmail("");
            setType("permanent");
            setValidFrom("");
            setValidUntil("");
            loadPermissions();
        } catch (err) {
            console.error(err);
            setError("Server error");
        }
    }

    async function handleRevoke(id) {
        setError("");
        setMessage("");
        try {
            const res = await fetch(`${API}/mailboxes/${mailboxId}/permissions/${id}`, {
                method: "DELETE",
                credentials: "include"
            });
            if (!res.ok && res.status !== 204) {
                const data = await res.json();
                setError(data.message || "Failed to revoke permission");
                return;
            }
            setMessage("Access revoked");
            loadPermissions();
        } catch (err) {
            console.error(err);
            setError("Server error");
        }
    }

    function formatDate(d) {
        return d ? new Date(d).toLocaleString() : "-";
    }

    return (
        <div style={{ marginTop: "24px", width: "100%" }}>
            <h3 className="card-title" style={{ fontSize: "28px" }}>Manage Access</h3>

            {error && <div className="error-text error-general">{error}</div>}
            {message && <div className="profile-row"><span className="profile-value">{message}</span></div>}

            {permissions.length === 0 ? (
                <p>No access granted yet.</p>
            ) : (
                permissions.map((p) => (
                    <div key={p._id} className="profile-row" style={{ flexDirection: "column", alignItems: "stretch", gap: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                            <span className="profile-value">
                                {p.userId && p.userId.username ? p.userId.username : "Unknown user"}
                                {p.userId && p.userId.email ? ` (${p.userId.email})` : ""}
                            </span>
                            <span className="profile-value">{p.type}{p.isActive ? "" : " (inactive)"}</span>
                        </div>
                        {p.type === "temporary" && (
                            <span className="profile-label" style={{ fontSize: "16px" }}>
                                {formatDate(p.validFrom)} → {formatDate(p.validUntil)}
                            </span>
                        )}
                        <button
                            type="button"
                            className="btn-primary"
                            style={{ fontSize: "16px", padding: "10px", marginTop: "4px" }}
                            onClick={() => handleRevoke(p._id)}
                        >
                            Revoke
                        </button>
                    </div>
                ))
            )}

            <form onSubmit={handleAdd} style={{ marginTop: "16px", width: "100%" }}>
                <div className="input-group">
                    <label className="input-label">User email</label>
                    <input
                        className="input-field"
                        type="email"
                        placeholder="Enter the user's email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">Access type</label>
                    <select className="input-field" value={type} onChange={(e) => setType(e.target.value)}>
                        <option value="permanent">Permanent</option>
                        <option value="temporary">Temporary</option>
                    </select>
                </div>

                {type === "temporary" && (
                    <>
                        <div className="input-group">
                            <label className="input-label">Valid from</label>
                            <input className="input-field" type="datetime-local" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Valid until</label>
                            <input className="input-field" type="datetime-local" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
                        </div>
                    </>
                )}

                <div className="input-group">
                    <input className="btn-primary" type="submit" value="Grant Access" />
                </div>
            </form>
        </div>
    );
}

export default MailBoxPermissions;
