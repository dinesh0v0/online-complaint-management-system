import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from './components/AppShell'
import { AuthRoute, RouteGuard } from './components/RouteGuard'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminUpdationPage } from './pages/AdminUpdationPage'
import { AuthPage } from './pages/AuthPage'
import { CitizenDashboardPage } from './pages/CitizenDashboardPage'
import { HomePage } from './pages/HomePage'
import { NewComplaintPage } from './pages/NewComplaintPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PublicTrackingPage } from './pages/PublicTrackingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/track" element={<PublicTrackingPage />} />
        <Route
          path="/auth"
          element={
            <AuthRoute>
              <AuthPage />
            </AuthRoute>
          }
        />

        <Route
          path="/portal"
          element={
            <RouteGuard allowedRole="citizen">
              <AppShell portal="citizen" />
            </RouteGuard>
          }
        >
          <Route index element={<CitizenDashboardPage />} />
          <Route path="new" element={<NewComplaintPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RouteGuard allowedRole="admin">
              <AppShell portal="admin" />
            </RouteGuard>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="update" element={<AdminUpdationPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
        <Route path="/dashboard" element={<Navigate to="/portal" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
