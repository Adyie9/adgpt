import { useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import Chat from "./components/Chat"; // Renamed from Dashboard to Chat

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div>
      {isLoggedIn ? (
        <Chat onLogout={() => setIsLoggedIn(false)} />  // Show Chat when logged in
      ) : showRegister ? (
        <Register
          onRegisterSuccess={() => setShowRegister(false)}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      ) : (
        <Login
          onLogin={() => setIsLoggedIn(true)}
          onSwitchToRegister={() => setShowRegister(true)}
        />
      )}
    </div>
  );
}

export default App;
