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
    const [unlockMessage, setUnlockMessage] = useState("");
    const [logsReload, setLogsReload] = useState(0);

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
            } catch (err) {
                console.error(err);
                setError("Server error");
            }
        }

        fetchMailbox();
    }, [id]);

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
                    <div className="profile-row">
                        <span className="profile-label">Label:</span>
                        <span className="profile-value">{mailbox.label}</span>
                    </div>

                    <div className="profile-row">
                        <span className="profile-label">Location:</span>
                        <span className="profile-value">{mailbox.location || "No location"}</span>
                    </div>

                    <div className="profile-row">
                        <span className="profile-label">Status:</span>
                        <span className="profile-value">{mailbox.isLocked ? "🔒 Locked" : "🔓 Unlocked"}</span>
                    </div>

                    <div className="profile-row">
                        <span className="profile-label">Weight:</span>
                        <span className="profile-value">{mailbox.weightKg} kg</span>
                    </div>

                    {mailbox.createdAt && (
                        <div className="profile-row">
                            <span className="profile-label">Created:</span>
                            <span className="profile-value">{new Date(mailbox.createdAt).toLocaleString()}</span>
                        </div>
                    )}

                    {mailbox.path && (
                        <img src={mailbox.path} alt={mailbox.label} className="mailbox-image" />
                    )}

                    {unlockMessage && <div className="profile-row"><span className="profile-value">{unlockMessage}</span></div>}

                    <div className="input-group">
                        <input
                            className="btn-primary"
                            type="button"
                            value={unlocking ? "Unlocking..." : "Unlock Mailbox"}
                            onClick={handleUnlock}
                            disabled={unlocking}
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
