import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import DashboardHome from './pages/dashboard/DashboardHome';
import Quotes from './pages/quotes/Quotes';
import NewQuote from './pages/quotes/NewQuote';
import CustomerQuotes from './pages/quotes/CustomerQuotes';
import Customers from './pages/customers/Customers';
import Carriers from './pages/carriers/Carriers';
import MLBTransport from './pages/mlb-transport/MLBTransport';
import MLBOrderLookup from './pages/mlb-transport/MLBOrderLookup';
import D1RelocationLookup from './pages/mlb-transport/D1RelocationLookup';
import Referrals from './pages/referrals/Referrals';
import Vendors from './pages/vendors/Vendors';
import Reports from './pages/reports/Reports';
import APIAccess from './pages/api-access/APIAccess';
import Settings from './pages/settings/Settings';
import Users from './pages/users/Users';
import Roles from './pages/roles/Roles';
import ACL from './pages/acl/ACL';
import Profile from './pages/profile/Profile';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="quotes/new" element={<NewQuote />} />
            <Route path="customer-quotes" element={<CustomerQuotes />} />
            <Route path="customers" element={<Customers />} />
            <Route path="carriers" element={<Carriers />} />
            <Route path="mlb-transport" element={<MLBTransport />} />
            <Route path="mlb-transport/order-lookup" element={<MLBOrderLookup />} />
            <Route path="d1-relocation/order-lookup" element={<D1RelocationLookup />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="reports" element={<Reports />} />
            <Route path="api-access" element={<APIAccess />} />
            <Route path="settings" element={<Settings />} />
            <Route path="users" element={<Users />} />
            <Route path="roles" element={<Roles />} />
            <Route path="acl" element={<ACL />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
