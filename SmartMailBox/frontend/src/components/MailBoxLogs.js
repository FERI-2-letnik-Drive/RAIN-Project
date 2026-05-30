import { useEffect, useState, useCallback } from "react";

const API = "http://localhost:3001";

function MailBoxLogs({ mailboxId, reloadTrigger }) {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const loadLogs = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API}/mailboxes/${mailboxId}/logs`, {
                credentials: "include"
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.message || "Failed to load logs");
                return;
            }
            setLogs(data);
        } catch (err) {
            console.error(err);
            setError("Server error");
        } finally {
            setLoading(false);
        }
    }, [mailboxId]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs, reloadTrigger]);

    return (
        <div style={{ marginTop: "24px", width: "100%" }}>
            <h3 className="card-title" style={{ fontSize: "28px" }}>Unlock Log</h3>

            {error && <div className="error-text error-general">{error}</div>}

            {logs.length === 0 ? (
                <p>{loading ? "Loading..." : "No unlocks recorded yet."}</p>
            ) : (
                logs.map((log) => (
                    <div key={log._id} className="profile-row" style={{ flexDirection: "column", alignItems: "stretch", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                            <span className="profile-value">
                                {log.userId && log.userId.username ? log.userId.username : "Unknown user"}
                            </span>
                            <span className="profile-value">{log.method}</span>
                        </div>
                        <span className="profile-label" style={{ fontSize: "16px" }}>
                            {new Date(log.openedAt).toLocaleString()} &middot; {log.weightKg} kg
                        </span>
                    </div>
                ))
            )}

            <div className="input-group">
                <input
                    className="btn-primary"
                    type="button"
                    value={loading ? "Refreshing..." : "Refresh Log"}
                    onClick={loadLogs}
                    disabled={loading}
                />
            </div>
        </div>
    );
}

export default MailBoxLogs;
