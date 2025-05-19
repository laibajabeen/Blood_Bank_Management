import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const initialInventory = [
  { type: 'A+', units: 10 },
  { type: 'B+', units: 8 },
  { type: 'O+', units: 15 },
  { type: 'AB+', units: 5 },
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [inventory, setInventory] = useState(initialInventory);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loginData, setLoginData] = useState({ email: '', password: '', role: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const role = localStorage.getItem('role');
      setIsLoggedIn(true);
      setCurrentUser({ role });
      fetchUserData(role);
    }
  }, []);

  const fetchUserData = async (role) => {
    const token = localStorage.getItem('token');
    try {
      if (role === 'donor') {
        const response = await axios.get(`${API_URL}/donors/my-donations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDonations(response.data);
      } else if (role === 'hospital') {
        const response = await axios.get(`${API_URL}/hospitals/my-requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(response.data);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/register`, loginData);
      const { token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      setCurrentUser({ role });
      setIsLoggedIn(true);
      setError('');
      fetchUserData(role);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/login`, loginData);
      const { token, role } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      setCurrentUser({ role });
      setIsLoggedIn(true);
      setError('');
      fetchUserData(role);
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginData({ email: '', password: '', role: '' });
    setDonations([]);
    setRequests([]);
  };

  const AuthForm = () => (
    <div className="auth-container">
      <h2>{isRegistering ? 'Register' : 'Login'}</h2>
      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            placeholder="Enter your email"
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            placeholder="Enter your password"
          />
        </div>
        <div className="form-group">
          <label>Role:</label>
          <select
            value={loginData.role}
            onChange={(e) => setLoginData({ ...loginData, role: e.target.value })}
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="donor">Donor</option>
            <option value="hospital">Hospital</option>
          </select>
        </div>
        {error && <div className="error">{error}</div>}
        <button type="submit" className="btn primary-btn">
          {isRegistering ? 'Register' : 'Login'}
        </button>
        <button
          type="button"
          className="btn secondary-btn"
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
        </button>
      </form>
    </div>
  );

  const AdminDashboard = () => {
    const [allDonors, setAllDonors] = useState([]);
    const [allHospitals, setAllHospitals] = useState([]);

    useEffect(() => {
      const fetchAdminData = async () => {
        const token = localStorage.getItem('token');
        try {
          const [donorsRes, hospitalsRes] = await Promise.all([
            axios.get(`${API_URL}/donors`, {
              headers: { Authorization: `Bearer ${token}` }
            }),
            axios.get(`${API_URL}/hospitals`, {
              headers: { Authorization: `Bearer ${token}` }
            })
          ]);
          setAllDonors(donorsRes.data);
          setAllHospitals(hospitalsRes.data);
        } catch (error) {
          console.error('Error fetching admin data:', error);
        }
      };
      fetchAdminData();
    }, []);

    return (
      <div className="dashboard">
        <h2>Admin Dashboard</h2>
        <div className="card">
          <h3>Blood Inventory</h3>
          <div className="grid">
            {inventory.map((item, index) => (
              <div key={index} className="inventory-item">
                <h4>{item.type}</h4>
                <p>{item.units} units</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>All Donors</h3>
          <div className="list">
            {allDonors.map((donor, index) => (
              <div key={index} className="list-item">
                <p>Email: {donor.userId.email}</p>
                <p>Total Donations: {donor.donations.length}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3>All Hospitals</h3>
          <div className="list">
            {allHospitals.map((hospital, index) => (
              <div key={index} className="list-item">
                <p>Email: {hospital.userId.email}</p>
                <p>Total Requests: {hospital.requests.length}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const DonorDashboard = () => {
    const [newDonation, setNewDonation] = useState({ bloodType: '', units: '' });

    const handleDonation = async (e) => {
      e.preventDefault();
      if (!newDonation.bloodType || !newDonation.units) {
        setError('Please fill in all fields');
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${API_URL}/donors/donate`,
          newDonation,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setDonations(response.data);
        setNewDonation({ bloodType: '', units: '' });
        setError('');
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to submit donation');
      }
    };

    return (
      <div className="dashboard">
        <h2>Donor Dashboard</h2>
        <div className="card">
          <h3>Register New Donation</h3>
          <form onSubmit={handleDonation}>
            <div className="form-group">
              <label>Blood Type:</label>
              <select
                value={newDonation.bloodType}
                onChange={(e) => setNewDonation({ ...newDonation, bloodType: e.target.value })}
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="O+">O+</option>
                <option value="AB+">AB+</option>
              </select>
            </div>
            <div className="form-group">
              <label>Units:</label>
              <input
                type="number"
                value={newDonation.units}
                onChange={(e) => setNewDonation({ ...newDonation, units: e.target.value })}
                min="1"
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="btn primary-btn">Submit Donation</button>
          </form>
        </div>
        <div className="card">
          <h3>My Donation History</h3>
          <div className="list">
            {donations.map((donation, index) => (
              <div key={index} className="list-item">
                <p>Type: {donation.bloodType} - Units: {donation.units}</p>
                <p>Date: {new Date(donation.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const HospitalDashboard = () => {
    const [newRequest, setNewRequest] = useState({ bloodType: '', units: '' });

    const handleRequest = async (e) => {
      e.preventDefault();
      if (!newRequest.bloodType || !newRequest.units) {
        setError('Please fill in all fields');
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${API_URL}/hospitals/request`,
          newRequest,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRequests(response.data);
        setNewRequest({ bloodType: '', units: '' });
        setError('');
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to submit request');
      }
    };

    return (
      <div className="dashboard">
        <h2>Hospital Dashboard</h2>
        <div className="card">
          <h3>Request Blood</h3>
          <form onSubmit={handleRequest}>
            <div className="form-group">
              <label>Blood Type Needed:</label>
              <select
                value={newRequest.bloodType}
                onChange={(e) => setNewRequest({ ...newRequest, bloodType: e.target.value })}
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="O+">O+</option>
                <option value="AB+">AB+</option>
              </select>
            </div>
            <div className="form-group">
              <label>Units Needed:</label>
              <input
                type="number"
                value={newRequest.units}
                onChange={(e) => setNewRequest({ ...newRequest, units: e.target.value })}
                min="1"
              />
            </div>
            {error && <div className="error">{error}</div>}
            <button type="submit" className="btn primary-btn">Submit Request</button>
          </form>
        </div>
        <div className="card">
          <h3>My Requests</h3>
          <div className="list">
            {requests.map((request, index) => (
              <div key={index} className="list-item">
                <p>Type: {request.bloodType} - Units: {request.units}</p>
                <p>Status: {request.status}</p>
                <p>Date: {new Date(request.date).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container">
      {isLoggedIn ? (
        <>
          <div className="header">
            <h1>Blood Bank Management System</h1>
            <button onClick={handleLogout} className="btn logout-btn">
              Logout
            </button>
          </div>
          {currentUser?.role === 'admin' && <AdminDashboard />}
          {currentUser?.role === 'donor' && <DonorDashboard />}
          {currentUser?.role === 'hospital' && <HospitalDashboard />}
        </>
      ) : (
        <AuthForm />
      )}
    </div>
  );
}

export default App;