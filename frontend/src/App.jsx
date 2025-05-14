import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import MasterView from './components/MasterView';
import AdminView from './components/AdminView';
import ClubView from './components/ClubView';
import ReservasView from './components/ReservasView';
import ReservasUser from './components/ReservasUser';
import PrivateRoute from './components/PrivateRoute';
import ErrorMessage from './components/ErrorMessage';
import './index.css';


function App() {
  return (
    <Router>
      <div className="App">
        <ErrorMessage />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/master" element={
            <PrivateRoute rolesPermitidos={['Administrador']}>
              <MasterView />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute rolesPermitidos={['Administrador', 'Club']}>
              <AdminView />
            </PrivateRoute>
          } />
          <Route path="/club-view/:id_club" element={<ClubView />} />
          <Route path="/reservas" element={
            <PrivateRoute rolesPermitidos={['Administrador', 'Club']}>
              <ReservasView />
            </PrivateRoute>
          } />
          <Route path="/mis-reservas" element={<ReservasUser />} />
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;