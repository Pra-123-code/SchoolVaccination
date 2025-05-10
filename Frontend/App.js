import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './Pages/Dashboard';
import Students from './Pages/Students';
import Drives from './Pages/Drives';
import Login from './Pages/Login';
import Navbar from './Components/Navbar';
import './App.css';

const App = () => {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/DashBoard" element={<Dashboard />} />
          <Route path="/Students" element={<Students />} />
          <Route path="/Drives" element={<Drives />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
