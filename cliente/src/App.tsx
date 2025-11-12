import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SurveyProvider } from './contexts/SurveyContext';
import { Toaster } from './components/ui/toaster';
import { Toaster as Sonner } from './components/ui/sonner';
import { AuthGuard } from './components/AuthGuard';

// Pages
import { Login } from './pages/Login';
import { AdminHome } from './pages/AdminHome';
import { UserHome } from './pages/UserHome';
import { CreateSurvey } from './pages/CreateSurvey';
import { EditSurvey } from './pages/EditSurvey';
import { SurveyList } from './pages/SurveyList';
import { SurveyDetail } from './pages/SurveyDetail';
import { ThankYou } from './pages/ThankYou';
import { DynamicSurvey } from './pages/DynamicSurvey';
import { Metrics } from './pages/Metrics';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SurveyProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/survey/:id" element={<DynamicSurvey />} />
            <Route path="/survey/:id/thank-you" element={<ThankYou />} />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AuthGuard requireRole="admin">
                  <AdminHome />
                </AuthGuard>
              }
            />
            <Route
              path="/admin/create-survey"
              element={
                <AuthGuard requireRole="admin">
                  <CreateSurvey />
                </AuthGuard>
              }
            />
            <Route
              path="/admin/surveys"
              element={
                <AuthGuard requireRole="admin">
                  <SurveyList />
                </AuthGuard>
              }
            />
            <Route
              path="/admin/surveys/:id"
              element={
                <AuthGuard requireRole="admin">
                  <SurveyDetail />
                </AuthGuard>
              }
            />
            <Route
              path="/admin/edit/:id"
              element={
                <AuthGuard requireRole="admin">
                  <EditSurvey />
                </AuthGuard>
              }
            />
            <Route
              path="/admin/metrics"
              element={
                <AuthGuard requireRole="admin">
                  <Metrics />
                </AuthGuard>
              }
            />

            {/* User Routes */}
            <Route
              path="/user"
              element={
                <AuthGuard requireRole="user">
                  <UserHome />
                </AuthGuard>
              }
            />
            <Route
              path="/user/survey"
              element={
                <AuthGuard requireRole="user">
                  <DynamicSurvey />
                </AuthGuard>
              }
            />
            <Route
              path="/user/thank-you"
              element={
                <AuthGuard requireRole="user">
                  <ThankYou />
                </AuthGuard>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          <Toaster />
          <Sonner />
        </SurveyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;