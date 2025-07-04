import React from 'react';
import Header from './components/Header'; // ✅ correct
import { Routes, Route } from 'react-router-dom';
import AuthSignin from './components/Auth/AuthSignin';
import AuthLogin from './components/Auth/AuthLogin';
import Profile from './pages/profile';
import Home from './pages/Home';
import Chat from './components/Chat/Chat';
import ChatList from './components/Chat/ChatList';



function App() {
  return (
    <>
      <Header />
      <main className="py-3">
        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Signin" element={<AuthSignin />} />
            <Route path="/login" element={<AuthLogin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/chats" element ={<ChatList/>} />
          <Route path="/chat/:chatId" element ={<Chat/>} />
          </Routes>
        </div>
      </main>
    </>
  );
}

export default App;
