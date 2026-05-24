import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserContext } from "./userContext";
import Login from "./components/Login";
import Logout from "./components/Logout"
import Register from "./components/Register"
import Header from "./components/Header"
import Home from "./components/Home"

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
          <Header title="Smart MailBox Application"></Header>
          <Routes>
            <Route path="/" exact element={<Home/>}></Route>
            <Route path="/register" exact element={<Register/>}></Route>
            <Route path="/login" exact element={<Login/>}></Route>
            <Route path="/logout" exact element={<Logout/>}></Route>
            
          </Routes>
        </div>
      </UserContext.Provider>
    </BrowserRouter>
   );
}

export default App;
