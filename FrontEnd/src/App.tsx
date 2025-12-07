import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/LoginPage'
import { useAuth } from './auth/AuthContext'
import Activities from './pages/Activities'
import Sessions from './pages/Sessions'
import Instructors from './pages/Instructors'
import Studios from './pages/Studios'
import Memberships from './pages/Memberships'
import Equipments from './pages/Equipments'
import Bookings from './pages/Bookings'
import Subscriptions from './pages/Subscriptions'
import Users from './pages/Users'

function Protected({ children }: { children: JSX.Element }) {
  const { token } = useAuth()
  if (!token) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <div id="wrapper">
      <Sidebar />
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content" className="container-fluid py-3">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Protected><Activities /></Protected>} />
            <Route path="/activities" element={<Protected><Activities /></Protected>} />
            <Route path="/sessions" element={<Protected><Sessions /></Protected>} />
            <Route path="/instructors" element={<Protected><Instructors /></Protected>} />
            <Route path="/studios" element={<Protected><Studios /></Protected>} />
            <Route path="/memberships" element={<Protected><Memberships /></Protected>} />
            <Route path="/equipments" element={<Protected><Equipments /></Protected>} />
            <Route path="/bookings" element={<Protected><Bookings /></Protected>} />
            <Route path="/subscriptions" element={<Protected><Subscriptions /></Protected>} />
            <Route path="/users" element={<Protected><Users /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
