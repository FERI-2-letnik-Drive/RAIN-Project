import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserContext } from "./userContext";
import Login from "./components/Login";
import Logout from "./components/Logout"
import Register from "./components/Register"
import Header from "./components/Header"
import Background from "./components/Background"
import Home from "./components/Home"
import CreateMailBox from "./components/CreateMailBox"
import MailBoxList from "./components/MailBoxList";
import MailBoxDetail from "./components/MailBoxDetail";
import Profile from './components/Profile';
import EditProfile from "./components/EditProfile";
import ChangePassword from "./components/ChangePassword";

function App() {

  const [user, setUser] = useState(localStorage.user ? JSON.parse(localStorage.user) : null);
    const updateUserData = (userInfo) => {
      localStorage.setItem("user", JSON.stringify(userInfo));
      setUser(userInfo);
    }

   return (
   <BrowserRouter>
      <UserContext.Provider value={{
        user: user, 
        setUserContext: updateUserData
      }}>
        <div className="App">
          <Background />
          <Header title="Smart MailBox Application"></Header>
          <Routes>
            {/* Start on My Mailboxes if logged in, otherwise on Login */}
            <Route path="/" element={<Navigate replace to={user ? "/mailbox" : "/login"} />}></Route>
            {/* Home is kept here for later use */}
            <Route path="/home" element={<Home/>}></Route>
            <Route path="/register" element={<Register/>}></Route>
            <Route path="/login" element={<Login/>}></Route>
            <Route path="/logout" element={<Logout/>}></Route>
            <Route path="/profile" element={<Profile/>}></Route>
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/change-password" element={<ChangePassword />} />
            <Route path="/mailbox" element={<MailBoxList />} />
            <Route path="/mailbox/create" element={<CreateMailBox/>}></Route>
            <Route path="/mailbox/:id" element={<MailBoxDetail />} />
            
          </Routes>
        </div>
      </UserContext.Provider>
    </BrowserRouter>
   );
}

export default App;
