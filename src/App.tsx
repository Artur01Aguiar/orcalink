import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PrivateRoute } from './components/PrivateRoute'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import FormEditor from './pages/FormEditor'
import Respostas from './pages/Respostas'
import PublicForm from './pages/PublicForm'
import Confirmation from './pages/Confirmation'
import UpgradeSuccess from './pages/UpgradeSuccess'
import ResetPassword from './pages/ResetPassword'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/forms/new" element={
            <PrivateRoute><FormEditor /></PrivateRoute>
          } />
          <Route path="/forms/:id" element={
            <PrivateRoute><FormEditor /></PrivateRoute>
          } />
          <Route path="/respostas" element={
            <PrivateRoute><Respostas /></PrivateRoute>
          } />

          <Route path="/upgrade/sucesso" element={
            <PrivateRoute><UpgradeSuccess /></PrivateRoute>
          } />

          <Route path="/reset-password" element={<ResetPassword />} />

          <Route path="/f/:slug" element={<PublicForm />} />
          <Route path="/f/:slug/obrigado" element={<Confirmation />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
