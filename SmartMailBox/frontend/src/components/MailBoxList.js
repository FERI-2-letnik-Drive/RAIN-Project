import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../userContext";

function MailboxList() {
    const userContext = useContext(UserContext);
    const [mailboxes, setMailboxes] = useState([]);
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

        fetchMailboxes();
    }, []);

    if (!userContext.user) {
        return <Navigate replace to="/login" />;
    }

    return (
        <div className="surface-card mailbox-list-card">
            <h2 className="card-title">My Mailboxes</h2>

            {error && <div className="error-text error-general">{error}</div>}

            {mailboxes.length === 0 ? (
                <p>No mailboxes yet.</p>
            ) : (
                mailboxes.map((mailbox) => (
                    <div key={mailbox._id} className="mailbox-item">
                        <h3 className="mailbox-title">{mailbox.label}</h3>
                        <p>{mailbox.location ? mailbox.location : "No location"}</p>

                        {mailbox.path && (
                            <img
                                src={mailbox.path}
                                alt={mailbox.label}
                                className="mailbox-image"
                            />
                        )}
                    </div>
                ))
            )}
        </div>
    );
}

export default MailboxList;