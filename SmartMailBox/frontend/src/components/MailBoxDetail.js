import { useContext, useEffect, useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { UserContext } from "../userContext";
import MailBoxPermissions from "./MailBoxPermissions";
import MailBoxLogs from "./MailBoxLogs";

function MailBoxDetail() {
    const userContext = useContext(UserContext);
    const { id } = useParams();
    const navigate = useNavigate();

    const [mailbox, setMailbox] = useState(null);
    const [error, setError] = useState("");
    const [unlocking, setUnlocking] = useState(false);
    const [locking, setLocking] = useState(false);
    const [unlockMessage, setUnlockMessage] = useState("");
    const [logsReload, setLogsReload] = useState(0);

    // lock result + weight bounds
    const [lockMessage, setLockMessage] = useState("");
    const [lockOk, setLockOk] = useState(true);
    const [minInput, setMinInput] = useState("");
    const [maxInput, setMaxInput] = useState("");
    const [savingBounds, setSavingBounds] = useState(false);
    const [boundsMessage, setBoundsMessage] = useState("");

    useEffect(() => {
        async function fetchMailbox() {
            try {
                const res = await fetch(`http://localhost:3001/mailboxes/${id}`, {
                    method: "GET",
                    credentials: "include"
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.message || "Failed to load mailbox");
                    return;
                }

                setMailbox(data);
                setMinInput(data.minWeightKg !== null && data.minWeightKg !== undefined ? String(data.minWeightKg) : "");
                setMaxInput(data.maxWeightKg !== null && data.maxWeightKg !== undefined ? String(data.maxWeightKg) : "");
            } catch (err) {
                console.error(err);
                setError("Server error");
            }
        }

        fetchMailbox();
    }, [id]);

    function weightStatus(m) {
        if (!m) return null;
        if ((m.minWeightKg === null || m.minWeightKg === undefined) &&
            (m.maxWeightKg === null || m.maxWeightKg === undefined)) {
            return null; // no range defined
        }
        const okMin = m.minWeightKg === null || m.minWeightKg === undefined || m.weightKg >= m.minWeightKg;
        const okMax = m.maxWeightKg === null || m.maxWeightKg === undefined || m.weightKg <= m.maxWeightKg;
        return okMin && okMax;
    }

    async function handleLock() {
        setLocking(true);
        setUnlockMessage("");
        setLockMessage("");
        setError("");
        try {
            const res = await fetch(`http://localhost:3001/mailboxes/${id}/lock`, {
                method: "POST",
                credentials: "include"
            });

            const data = await res.json();

            if (!res.ok) {
                // e.g. non-owner trying to lock an incorrect product
                setLockOk(false);
                setLockMessage(data.message || "Failed to lock mailbox");
                return;
            }

            setMailbox((prev) => ({ ...prev, isLocked: true }));
            setLockOk(data.correct);
            setLockMessage(data.message || "Mailbox locked");
            setLogsReload((n) => n + 1);
        } catch (err) {
            console.error(err);
            setError("Server error");
        } finally {
            setLocking(false);
        }
    }

    async function handleSaveBounds(e) {
        e.preventDefault();
        setSavingBounds(true);
        setBoundsMessage("");
        setError("");

        if (minInput !== "" && maxInput !== "" && Number(minInput) > Number(maxInput)) {
            setBoundsMessage("Min weight must be less than or equal to max weight");
            setSavingBounds(false);
            return;
        }

        try {
            const res = await fetch(`http://localhost:3001/mailboxes/${id}`, {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    minWeightKg: minInput === "" ? null : Number(minInput),
                    maxWeightKg: maxInput === "" ? null : Number(maxInput)
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setBoundsMessage(data.message || "Failed to save weight range");
                return;
            }

            setMailbox(data);
            setBoundsMessage("Weight range saved");
        } catch (err) {
            console.error(err);
            setError("Server error");
        } finally {
            setSavingBounds(false);
        }
    }

    async function handleUnlock() {
        setUnlocking(true);
        setUnlockMessage("");
        setError("");
        try {
            const res = await fetch(`http://localhost:3001/mailboxes/${id}/unlock`, {
                method: "POST",
                credentials: "include"
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to unlock mailbox");
                return;
            }

            setMailbox((prev) => ({ ...prev, isLocked: false, weightKg: data.weightKg }));
            setUnlockMessage(`Unlocked at ${new Date(data.openedAt).toLocaleString()} (${data.method})`);
            setLogsReload((n) => n + 1);
        } catch (err) {
            console.error(err);
            setError("Server error");
        } finally {
            setUnlocking(false);
        }
    }

    if (!userContext.user) {
        return <Navigate replace to="/login" />;
    }

    return (
        <div className="surface-card profile-card">
            <h2 className="card-title">Mailbox Details</h2>

            {error && <div className="error-text error-general">{error}</div>}

            {!mailbox ? (
                !error && <p>Loading...</p>
            ) : (
                <>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "12px",
                        width: "100%"
                    }}>
                        <div className="info-cell">
                            <span className="profile-label info-cell-label">Label</span>
                            <span className="profile-value info-cell-value">{mailbox.label}</span>
                        </div>

                        <div className="info-cell">
                            <span className="profile-label info-cell-label">Location</span>
                            <span className="profile-value info-cell-value">{mailbox.location || "No location"}</span>
                        </div>

                        <div className="info-cell">
                            <span className="profile-label info-cell-label">Status</span>
                            <span className="profile-value info-cell-value">{mailbox.isLocked ? "🔒 Locked" : "🔓 Unlocked"}</span>
                        </div>

                        <div className="info-cell">
                            <span className="profile-label info-cell-label">Weight</span>
                            <span className="profile-value info-cell-value">{mailbox.weightKg} kg</span>
                        </div>

                        <div className="info-cell">
                            <span className="profile-label info-cell-label">Allowed range</span>
                            <span className="profile-value info-cell-value">
                                {(mailbox.minWeightKg === null || mailbox.minWeightKg === undefined) &&
                                 (mailbox.maxWeightKg === null || mailbox.maxWeightKg === undefined)
                                    ? "Not set"
                                    : `${mailbox.minWeightKg ?? "—"} – ${mailbox.maxWeightKg ?? "—"} kg`}
                            </span>
                        </div>

                        {weightStatus(mailbox) !== null && (
                            <div className="info-cell">
                                <span className="profile-label info-cell-label">Weight check</span>
                                <span className="profile-value info-cell-value">
                                    {weightStatus(mailbox) ? "✅ Correct" : "⚠️ Product NOT correct (out of range)"}
                                </span>
                            </div>
                        )}

                        {mailbox.createdAt && (
                            <div className="info-cell">
                                <span className="profile-label info-cell-label">Created</span>
                                <span className="profile-value info-cell-value">{new Date(mailbox.createdAt).toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    {mailbox.path && (
                        <img src={mailbox.path} alt={mailbox.label} className="mailbox-image" />
                    )}

                    {unlockMessage && <div className="profile-row"><span className="profile-value">{unlockMessage}</span></div>}
                    {lockMessage && (
                        lockOk
                            ? <div className="profile-row"><span className="profile-value">{lockMessage}</span></div>
                            : <div className="error-text error-general">{lockMessage}</div>
                    )}

                    <div className="input-group">
                        <input
                            className="btn-primary"
                            type="button"
                            value={unlocking ? "Unlocking..." : "Unlock Mailbox"}
                            onClick={handleUnlock}
                            disabled={unlocking || locking || !mailbox.isLocked}
                        />
                        <input
                            className="btn-primary"
                            type="button"
                            value={locking ? "Locking..." : "Lock Mailbox"}
                            onClick={handleLock}
                            disabled={unlocking || locking || mailbox.isLocked}
                        />
                        <input
                            className="btn-primary"
                            type="button"
                            value="Back to Mailboxes"
                            onClick={() => navigate("/mailbox")}
                        />
                    </div>

                    {userContext.user && String(mailbox.owner) === String(userContext.user._id) && (
                        <>
                            <div style={{ marginTop: "24px", width: "100%" }}>
                                <h3 className="card-title" style={{ fontSize: "28px" }}>Weight Range for Locking</h3>
                                {boundsMessage && <div className="profile-row"><span className="profile-value">{boundsMessage}</span></div>}
                                <form onSubmit={handleSaveBounds} style={{ width: "100%" }}>
                                    <div className="input-group">
                                        <label className="input-label">Min weight (kg)</label>
                                        <input
                                            className="input-field"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="Leave empty for no minimum"
                                            value={minInput}
                                            onChange={(e) => setMinInput(e.target.value)}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Max weight (kg)</label>
                                        <input
                                            className="input-field"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="Leave empty for no maximum"
                                            value={maxInput}
                                            onChange={(e) => setMaxInput(e.target.value)}
                                        />
                                    </div>
                                    <div className="input-group">
                                        <input
                                            className="btn-primary"
                                            type="submit"
                                            value={savingBounds ? "Saving..." : "Save Weight Range"}
                                            disabled={savingBounds}
                                        />
                                    </div>
                                </form>
                            </div>

                            <MailBoxPermissions mailboxId={mailbox._id} ownerId={mailbox.owner} />
                            <MailBoxLogs mailboxId={mailbox._id} reloadTrigger={logsReload} />
                        </>
                    )}
                </>
            )}
        </div>
    );
}

export default MailBoxDetail;
