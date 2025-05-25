import React, { useState, useEffect } from 'react';
import axios from './axiosConfig.js';

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
  const [users, setUsers] = useState([]);
  const [inventory, setInventory] = useState(initialInventory);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loginData, setLoginData] = useState({ email: '', password: '', role: '' });
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/register', loginData);
      setIsRegistering(false);
      setError('');
      setLoginData({ email: '', password: '', role: '' });
      alert('Registration successful!');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/auth/login', loginData);
      setCurrentUser({ ...loginData, id: response.data.userId });
      setIsLoggedIn(true);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setLoginData({ email: '', password: '', role: '' });
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
    const [users, setUsers] = useState([]);
    const [donations, setDonations] = useState([]);
    const [editingUser, setEditingUser] = useState(null);
    const [editingDonation, setEditingDonation] = useState(null);
    const [newUser, setNewUser] = useState({ email: '', password: '', role: '' });
    const [searchId, setSearchId] = useState('');

    useEffect(() => {
      fetchUsers();
      fetchDonations();
    }, []);

    const fetchUsers = async () => {
      try {
        const response = await axios.get('/auth/users');
        setUsers(response.data);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    const fetchDonations = async () => {
      try {
        const response = await axios.get('/donors');
        setDonations(response.data);
      } catch (err) {
        console.error('Error fetching donations:', err);
      }
    };

    const handleUpdateUser = async (userId) => {
      try {
        await axios.put(`/auth/users/${userId}`, editingUser);
        setEditingUser(null);
        fetchUsers();
      } catch (err) {
        console.error('Error updating user:', err);
      }
    };

    const handleDeleteUser = async (userId) => {
      try {
        await axios.delete(`/auth/users/${userId}`);
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    };

    const handleUpdateDonation = async (donationId) => {
      try {
        await axios.put(`/donors/donate`, editingDonation);
        setEditingDonation(null);
        fetchDonations();
      } catch (err) {
        console.error('Error updating donation:', err);
      }
    };

    const handleDeleteDonation = async (donationId) => {
      try {
        await axios.delete(`/donors/donate/${donationId}`);
        fetchDonations();
      } catch (err) {
        console.error('Error deleting donation:', err);
      }
    };

    return (
      <div className="dashboard" style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
        <h2>Admin Dashboard</h2>

        {/* Users Management */}
        <div className="card">
          <h3>Users Management</h3>
          <div className="list">
            {users.map((user) => (
              <div key={user._id} className="list-item">
                {editingUser && editingUser._id === user._id ? (
                  <div>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    />
                    <select
                      value={editingUser.role}
                      onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                    >
                      <option value="admin">Admin</option>
                      <option value="donor">Donor</option>
                      <option value="hospital">Hospital</option>
                    </select>
                    <button onClick={() => handleUpdateUser(user._id)}>Save</button>
                    <button onClick={() => setEditingUser(null)}>Cancel</button>
                  </div>
                ) : (
                  <div>
                    <p>Email: {user.email}</p>
                    <p>Role: {user.role}</p>
                    <button onClick={() => setEditingUser(user)}>Edit</button>
                    <button onClick={() => handleDeleteUser(user._id)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Donations Management */}
        <div className="card">
          <h3>Donations Management</h3>
          <div className="list">
            {donations.map((donation) => (
              <div key={donation._id} className="list-item">
                {editingDonation && editingDonation._id === donation._id ? (
                  <div>
                    <input
                      type="text"
                      value={editingDonation.name}
                      onChange={(e) => setEditingDonation({ ...editingDonation, name: e.target.value })}
                    />
                    <input
                      type="text"
                      value={editingDonation.bloodType}
                      onChange={(e) => setEditingDonation({ ...editingDonation, bloodType: e.target.value })}
                    />
                    <input
                      type="number"
                      value={editingDonation.units}
                      onChange={(e) => setEditingDonation({ ...editingDonation, units: e.target.value })}
                    />
                    <button onClick={() => handleUpdateDonation(donation._id)}>Save</button>
                    <button onClick={() => setEditingDonation(null)}>Cancel</button>
                  </div>
                ) : (
                  <div>
                    <p>Name: {donation.name}</p>
                    <p>Blood Type: {donation.bloodType}</p>
                    <p>Units: {donation.units}</p>
                    <button onClick={() => setEditingDonation(donation)}>Edit</button>
                    <button onClick={() => handleDeleteDonation(donation._id)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const DonorDashboard = () => {
    const [newDonation, setNewDonation] = useState({ name: '', cnic: '', bloodType: '', units: '' });
    const [error, setError] = useState('');
    const [donations, setDonations] = useState([]);

    useEffect(() => {
      fetchDonations();
    }, []);

    const fetchDonations = async () => {
      try {
        const response = await axios.get(`/donors/my-donations?userId=${currentUser.id}`);
        setDonations(response.data);
      } catch (err) {
        console.error('Error fetching donations:', err);
      }
    };

    const handleDonation = async (e) => {
      e.preventDefault();
      if (!newDonation.name || !newDonation.cnic || !newDonation.bloodType || !newDonation.units) {
        setError('Please fill in all fields');
        return;
      }

      try {
        await axios.post('/donors/donate', {
          ...newDonation,
          userId: currentUser.id
        });
        setNewDonation({ name: '', cnic: '', bloodType: '', units: '' });
        setError('');
        fetchDonations();
      } catch (err) {
        setError(err.response?.data?.message || 'Error submitting donation');
      }
    };

    return (
      <div className="dashboard">
        <h2>Donor Dashboard</h2>
        <div className="card">
          <h3>Register New Donation</h3>
          <form onSubmit={handleDonation}>
            <div className="form-group">
              <label>Name:</label>
              <input
                type="text"
                value={newDonation.name}
                onChange={(e) => setNewDonation({ ...newDonation, name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>CNIC:</label>
              <input
                type="text"
                value={newDonation.cnic}
                onChange={(e) => setNewDonation({ ...newDonation, cnic: e.target.value })}
                maxLength={15}
                placeholder="12345-1234567-1"
              />
            </div>
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
                <option value="A-">A-</option>
                <option value="B-">B-</option>
                <option value="O-">O-</option>
                <option value="AB-">AB-</option>
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
                <p>Name: {donation.name} - CNIC: {donation.cnic}</p>
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
    const [requests, setRequests] = useState([]);

    useEffect(() => {
      fetchRequests();
    }, []);

    const fetchRequests = async () => {
      try {
        const response = await axios.get(`/hospitals/my-requests?userId=${currentUser.id}`);
        setRequests(response.data);
      } catch (err) {
        console.error('Error fetching requests:', err);
      }
    };

    const handleRequest = async (e) => {
      e.preventDefault();
      if (!newRequest.bloodType || !newRequest.units) {
        setError('Please fill in all fields');
        return;
      }

      try {
        await axios.post('/hospitals/request', {
          ...newRequest,
          userId: currentUser.id
        });
        setNewRequest({ bloodType: '', units: '' });
        setError('');
        fetchRequests();
      } catch (err) {
        setError(err.response?.data?.message || 'Error submitting request');
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
                <option value="A-">A-</option>
                <option value="B-">B-</option>
                <option value="O-">O-</option>
                <option value="AB-">AB-</option>
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