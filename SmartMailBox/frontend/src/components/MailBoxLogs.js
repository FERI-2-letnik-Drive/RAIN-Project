import { useEffect, useState, useCallback } from "react";

const API = "http://localhost:3001";

function MailBoxLogs({ mailboxId, reloadTrigger }) {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [visibleCount, setVisibleCount] = useState(5);

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
            // don't keep a window larger than the number of entries
            setVisibleCount((prev) => Math.min(Math.max(prev, 1), data.length || 1));
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

    const shownLogs = logs.slice(0, visibleCount);

    return (
        <div className="detail-panel">
            <h3 className="card-title" style={{ fontSize: "28px", margin: "0 0 8px 0" }}>Activity Log</h3>

            {error && <div className="error-text error-general">{error}</div>}

            {logs.length > 1 && (
                <div className="input-group" style={{ marginTop: 0 }}>
                    <label className="input-label">
                        Showing {shownLogs.length} of {logs.length} entries
                    </label>
                    <input
                        type="range"
                        min="1"
                        max={logs.length}
                        value={visibleCount}
                        onChange={(e) => setVisibleCount(Number(e.target.value))}
                        style={{ width: "100%" }}
                    />
                </div>
            )}

            {logs.length === 0 ? (
                <p>{loading ? "Loading..." : "No activity recorded yet."}</p>
            ) : (
                shownLogs.map((log) => (
                    <div key={log._id} className="profile-row" style={{ flexDirection: "column", alignItems: "stretch", gap: "6px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                            <span className="profile-value">
                                {log.userId && log.userId.username ? log.userId.username : "Unknown user"}
                            </span>
                            <span className="profile-value">
                                {log.action === "lock" ? "🔒 Locked" : "🔓 Unlocked"} ({log.method})
                            </span>
                        </div>
                        <span className="profile-label" style={{ fontSize: "16px" }}>
                            {new Date(log.openedAt).toLocaleString()} &middot; {log.weightKg} kg
                            {log.action === "lock" && log.correct === false && " · ⚠️ product not correct"}
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
