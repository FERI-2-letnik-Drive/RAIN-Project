import { useContext, useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { UserContext } from "../userContext";

function MailboxList() {
    const userContext = useContext(UserContext);
    const [mailboxes, setMailboxes] = useState([]);
    const [shared, setShared] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchMailboxes() {
            try {
                const res = await fetch("http://localhost:3001/mailboxes", {
                    method: "GET",
                    credentials: "include"
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.message || "Failed to load mailboxes");
                    return;
                }

                setMailboxes(data);
            } catch (err) {
                console.error(err);
                setError("Server error");
            }
        }

        async function fetchShared() {
            try {
                const res = await fetch("http://localhost:3001/mailboxes/shared", {
                    method: "GET",
                    credentials: "include"
                });

                const data = await res.json();

                if (res.ok) {
                    setShared(data);
                }
            } catch (err) {
                console.error(err);
            }
        }

        fetchMailboxes();
        fetchShared();
    }, []);

    if (!userContext.user) {
        return <Navigate replace to="/login" />;
    }

    return (
        <div className="surface-card mailbox-list-card">
            {error && <div className="error-text error-general">{error}</div>}

            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "24px",
                width: "100%",
                alignItems: "start"
            }}>
                <div className="detail-panel">
                    <h2 className="card-title" style={{ margin: "0 0 8px 0" }}>My Mailboxes</h2>

                    {mailboxes.length === 0 ? (
                        <p>No mailboxes yet.</p>
                    ) : (
                        mailboxes.map((mailbox) => (
                            <Link
                                key={mailbox._id}
                                to={`/mailbox/${mailbox._id}`}
                                className="mailbox-item"
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <h3 className="mailbox-title">{mailbox.label}</h3>
                                <p>{mailbox.location ? mailbox.location : "No location"}</p>

                                {mailbox.path && (
                                    <img
                                        src={mailbox.path}
                                        alt={mailbox.label}
                                        className="mailbox-image"
                                    />
                                )}
                            </Link>
                        ))
                    )}
                </div>

                <div className="detail-panel">
                    <h2 className="card-title" style={{ margin: "0 0 8px 0" }}>Shared with me</h2>

                    {shared.length === 0 ? (
                        <p>No mailboxes shared with you.</p>
                    ) : (
                        shared.map((mailbox) => (
                            <Link
                                key={mailbox._id}
                                to={`/mailbox/${mailbox._id}`}
                                className="mailbox-item"
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <h3 className="mailbox-title">{mailbox.label}</h3>
                                <p>{mailbox.location ? mailbox.location : "No location"}</p>
                                {mailbox.accessType && (
                                    <p className="profile-label" style={{ fontSize: "16px" }}>
                                        Access: {mailbox.accessType}
                                    </p>
                                )}

                                {mailbox.path && (
                                    <img
                                        src={mailbox.path}
                                        alt={mailbox.label}
                                        className="mailbox-image"
                                    />
                                )}
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default MailboxList;