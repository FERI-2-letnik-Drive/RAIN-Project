import { UserContext } from "../userContext";
import { NavLink } from "react-router-dom";

function Header(props) {
    return (
        <header className="nav-bar">
            <NavLink to="/" className="brand">{props.title}</NavLink>
            <nav className="nav-links">
                <UserContext.Consumer>
                    {context => (
                        context.user ?
                            <>
                                <NavLink to="/" end className="nav-link">Home</NavLink>
                                <NavLink to="/mailbox" className="nav-link">My Mailboxes</NavLink>
                                <NavLink to="/mailbox/create" className="nav-link">Add Mailbox</NavLink>
                                <NavLink to="/profile" className="nav-link">Profile</NavLink>
                                <NavLink to="/logout" className="nav-link nav-link-cta">Logout</NavLink>
                            </>
                        :
                            <>
                                <NavLink to="/" end className="nav-link">Home</NavLink>
                                <NavLink to="/login" className="nav-link">Login</NavLink>
                                <NavLink to="/register" className="nav-link nav-link-cta">Register</NavLink>
                            </>
                    )}
                </UserContext.Consumer>
            </nav>
        </header>
    );
}

export default Header;
