import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserContext } from "./userContext";

function App() {

  const [user, setUser] = useState(localStorage.user ? JSON.parse(localStorage.user) : null);
    const updateUserData = (userInfo) => {
      localStorage.setItem("user", JSON.stringify(userInfo));
      setUser(userInfo);
    }

  return (
    <div className="App">
      <header className="App-header">
        <p>Smart MailBox</p>
      </header>
    </div>
  );
}

export default App;
