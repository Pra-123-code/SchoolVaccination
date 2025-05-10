import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    vaccinatedStudents: 0,
    vaccinationPercentage: 0,
    upcomingDrives: [],
  });

  useEffect(() => {
    axios.get('http://localhost:3000/api/dashboard')
      .then((response) => {
        setStats(response.data);
      })
      .catch((error) => {
        console.error('Error fetching dashboard data:', error);
      });
  }, []);

  return (
    <div>
      <h2>Dashboard Overview</h2>
      <div className="overview">
        <div>Total Students: {stats.totalStudents}</div>
        <div>
          Vaccinated Students: {stats.vaccinatedStudents} (
          {stats.vaccinationPercentage}%)
        </div>
        <div>
          Upcoming Vaccination Drives:{' '}
          {stats.upcomingDrives.length > 0 ? (
            stats.upcomingDrives.map((drive, index) => (
              <div key={index}>{new Date(drive.date).toLocaleDateString()}</div>
            ))
          ) : (
            <p>No upcoming drives</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
