import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import MasterView from './components/MasterView';
import AdminView from './components/AdminView';
import ClubView from './components/ClubView';
import './index.css';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/master" element={<MasterView />} />
          <Route path="/admin" element={<AdminView />} />
          <Route path="/club-view/:id_club" element={<ClubView />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;