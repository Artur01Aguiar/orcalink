import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PrivateRoute } from './components/PrivateRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import FormEditor from './pages/FormEditor'
import Respostas from './pages/Respostas'
import PublicForm from './pages/PublicForm'
import Confirmation from './pages/Confirmation'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
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

          <Route path="/f/:slug" element={<PublicForm />} />
          <Route path="/f/:slug/obrigado" element={<Confirmation />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
