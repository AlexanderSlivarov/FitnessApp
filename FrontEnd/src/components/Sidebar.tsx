import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export default function Sidebar() {
  const { token, username, logout } = useAuth()
  return (
    <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
      <a className="sidebar-brand d-flex align-items-center justify-content-center" href="#">
        <div className="sidebar-brand-icon rotate-n-15">
          <i className="fas fa-dumbbell"></i>
        </div>
        <div className="sidebar-brand-text mx-3">FitnessApp</div>
      </a>

      <hr className="sidebar-divider my-0" />

      {token ? (
        <>
          <li className="nav-item">
            <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/users">
              <i className="fas fa-users"></i>
              <span>Users</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/instructors">
              <i className="fas fa-user-tie"></i>
              <span>Instructors</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/activities">
              <i className="fas fa-list"></i>
              <span>Activities</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/studios">
              <i className="fas fa-building"></i>
              <span>Studios</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/memberships">
              <i className="fas fa-id-card"></i>
              <span>Memberships</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/equipments">
              <i className="fas fa-tools"></i>
              <span>Equipments</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/sessions">
              <i className="fas fa-clock"></i>
              <span>Sessions</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/bookings">
              <i className="fas fa-calendar-check"></i>
              <span>Bookings</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/subscriptions">
              <i className="fas fa-file-signature"></i>
              <span>Subscriptions</span>
            </NavLink>
          </li>

          <hr className="sidebar-divider" />
          <div className="px-3 text-white-50 small">Logged in as {username}</div>
          <button className="btn btn-sm btn-danger m-3" onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <li className="nav-item">
            <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/register">
              <i className="fas fa-user-plus"></i>
              <span>Register</span>
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`} to="/login">
              <i className="fas fa-sign-in-alt"></i>
              <span>Login</span>
            </NavLink>
          </li>
        </>
      )}
    </ul>
  )
}
