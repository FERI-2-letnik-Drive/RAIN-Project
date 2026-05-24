import { useContext, useState } from 'react'
import { Navigate } from 'react-router';
import { UserContext } from '../userContext';

function CreateMailBox() {
    const userContext = useContext(UserContext); 
    const[label, setLabel] = useState('');
    const[location, setLocation] = useState('');
    const[file, setFile] = useState(null);
    const[created, setCreated] = useState(false);
    const[errors, setErrors] = useState({});
    const [preview, setPreview] = useState("");

    async function onSubmit(e){
        e.preventDefault();

        const newErrors = {};

        if (!label.trim()) {
            newErrors.label = "Mailbox label is required!";
        }

        /*
        if (!location.trim()) {
            newErrors.location = "Mailbox location is required!";
        }
        */

        if (!file) {
            newErrors.image = "QR code image is required!";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }


        const formData = new FormData();
        formData.append('label', label);
        formData.append('location', location);
        formData.append('image', file);
        const res = await fetch('http://localhost:3001/mailboxes', {
            method: 'POST',
            credentials: 'include',
            body: formData
        });
        const data = await res.json();

        if (!res.ok) {
            setErrors({general: data.message || "Creating mailbox failed!"});
            return;
        }


        setCreated(true);
    }

    return (
        <form onSubmit={onSubmit} className="surface-card">
            {!userContext.user ? <Navigate replace to="/login" /> : null}
            {created ? <Navigate replace to="/mailbox" /> : null}

            <h2 className="card-title">Add MailBox</h2>

            <div className="input-group">
                <label className="input-label">Label</label>
                <input className="input-field" type="text" name="label" placeholder="Enter label" value={label} onChange={(e) => setLabel(e.target.value)} />
                {errors.label && <div className="error-text">{errors.label}</div>}
            </div>

            <div className="input-group">
                <label className="input-label">Location</label>
                <input className="input-field" type="text" name="location" placeholder="Enter location (optional)" value={location} onChange={(e) => setLocation(e.target.value)} />
                { /*errors.location && <div className="error-text">{errors.location}</div> */}
            </div>

            <div className="input-group">
                <div className="file-upload">
                    <label htmlFor="file" className="file-label">Choose QR Code</label>
                    <span className="file-name">{file ? file.name : "No file chosen"}</span>
                    <input type="file" id="file" name="image" accept="image/*" className="file-input" onChange={(e) => {
                        const selectedFile = e.target.files[0];
                        setFile(selectedFile);

                        if (selectedFile) {
                            setPreview(URL.createObjectURL(selectedFile));
                        } else {
                            setPreview("");
                        }
                    }} />
                </div>
                {errors.image && <div className="error-text">{errors.image}</div>}
            </div>

            {preview && <img src={preview} alt="QR Code preview" className="image-preview" />}

            <div className="input-group">
                <input className="btn-primary" type="submit" name="submit" value="Add MailBox" />
                {errors.general && <div className="error-text error-general">{errors.general}</div>}
            </div>
        </form>
    );
}

export default CreateMailBox;