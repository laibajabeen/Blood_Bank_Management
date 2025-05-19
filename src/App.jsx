import React, { useState } from 'react';

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

  const handleRegister = (e) => {
    e.preventDefault();
    if (!loginData.email || !loginData.password || !loginData.role) {
      setError('Please fill in all fields');
      return;
    }
    const userExists = users.find(user => user.email === loginData.email);
    if (userExists) {
      setError('User already exists');
      return;
    }
    setUsers([...users, loginData]);
    setIsRegistering(false);
    setError('');
    setLoginData({ email: '', password: '', role: '' });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const user = users.find(
      u =>
        u.email === loginData.email &&
        u.password === loginData.password &&
        u.role === loginData.role
    );
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('Invalid credentials');
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

  const AdminDashboard = () => (
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
        <h3>Donation Records</h3>
        <div className="list">
          {donations.map((donation, index) => (
            <div key={index} className="list-item">
              <p>Donor: {donation.donorEmail}</p>
              <p>Type: {donation.bloodType} - Units: {donation.units}</p>
              <p>Date: {donation.date}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3>Blood Requests</h3>
        <div className="list">
          {requests.map((request, index) => (
            <div key={index} className="list-item">
              <p>Hospital: {request.hospitalEmail}</p>
              <p>Type: {request.bloodType} - Units: {request.units}</p>
              <p>Status: {request.status}</p>
              <p>Date: {request.date}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

 const DonorDashboard = () => {
  const [newDonation, setNewDonation] = useState({ name: '', cnic: '', bloodType: '', units: '' });
  const [error, setError] = useState('');
  const [donations, setDonations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const currentUser = { email: 'example@example.com' }; // Just an example, replace with your auth

  const handleDonation = (e) => {
    e.preventDefault();
    // Validate all fields including name and cnic
    if (!newDonation.name || !newDonation.cnic || !newDonation.bloodType || !newDonation.units) {
      setError('Please fill in all fields');
      return;
    }
    // Optionally validate CNIC format here (like length or pattern)

    const donation = {
      ...newDonation,
      donorEmail: currentUser?.email || '',
      date: new Date().toLocaleDateString(),
    };
    setDonations([...donations, donation]);
    setInventory(inventory.map(item =>
      item.type === newDonation.bloodType
        ? { ...item, units: item.units + Number(newDonation.units) }
        : item
    ));
    setNewDonation({ name: '', cnic: '', bloodType: '', units: '' });
    setError('');
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
              maxLength={15} // Optional: limit length for CNIC
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
          {donations
            .filter(donation => donation.donorEmail === currentUser?.email)
            .map((donation, index) => (
              <div key={index} className="list-item">
                <p>Name: {donation.name} - CNIC: {donation.cnic}</p>
                <p>Type: {donation.bloodType} - Units: {donation.units}</p>
                <p>Date: {donation.date}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

//donor class end
  const HospitalDashboard = () => {
    const [newRequest, setNewRequest] = useState({ bloodType: '', units: '' });

    const handleRequest = (e) => {
      e.preventDefault();
      if (!newRequest.bloodType || !newRequest.units) {
        setError('Please fill in all fields');
        return;
      }
      const request = {
        ...newRequest,
        hospitalEmail: currentUser?.email || '',
        status: 'Pending',
        date: new Date().toLocaleDateString(),
      };
      setRequests([...requests, request]);
      setNewRequest({ bloodType: '', units: '' });
      setError('');
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
            {requests
              .filter(request => request.hospitalEmail === currentUser?.email)
              .map((request, index) => (
                <div key={index} className="list-item">
                  <p>Type: {request.bloodType} - Units: {request.units}</p>
                  <p>Status: {request.status}</p>
                  <p>Date: {request.date}</p>
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
