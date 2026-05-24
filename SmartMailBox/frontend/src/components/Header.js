//import { useContext } from "react";
import { UserContext } from "../userContext";
import { Link } from "react-router-dom";

function Header(props) {
    return (
        <header className="nav-bar">
            <h1>{props.title}</h1>
            <nav>
                <ul>
                    <li><Link to='/'>Home</Link></li>
                    <UserContext.Consumer>
                        {context => (
                            context.user ?
                                <>
                                    <li><Link to='/mailbox'>My Mailboxes</Link></li> 
                                    <li><Link to='/mailbox/create'>Add Mailbox</Link></li>
                                    <li><Link to='/profile'>Profile</Link></li>
                                    <li><Link to='/logout'>Logout</Link></li>
                                </>
                            :
                                <>
                                    <li><Link className="text-white text-decoration-none" to='/login'>Login</Link></li>
                                    <li><Link className="text-white text-decoration-none" to='/register'>Register</Link></li>
                                </>
                        )}
                    </UserContext.Consumer>
                </ul>
            </nav>
        </header>
    );
}

export default Header;