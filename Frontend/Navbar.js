import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/students">Manage Students</Link>
        </li>
        <li>
          <Link to="/drives">Manage Vaccination Drives</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
