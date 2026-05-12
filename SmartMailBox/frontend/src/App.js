import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserContext } from "./userContext";
import Login from "./components/Login";
import Register from "./components/Register"

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
          <header className="App-header">
            <p>Smart MailBox</p>
          </header>
          <Register/>
          <Routes>
            <Route path="/login" exact element={<Login/>}></Route>
            <Route path="/login" exact element={<Register/>}></Route>
          </Routes>
        </div>
      </UserContext.Provider>
    </BrowserRouter>
   );
}

export default App;
