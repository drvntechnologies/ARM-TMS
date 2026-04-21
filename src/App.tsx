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
import Orders from './pages/orders/Orders';
import Customers from './pages/customers/Customers';
import Carriers from './pages/carriers/Carriers';
import AddCarrier from './pages/carriers/AddCarrier';
import MLBTransport from './pages/mlb-transport/MLBTransport';
import MLBOrderLookup from './pages/mlb-transport/MLBOrderLookup';
import D1RelocationLookup from './pages/mlb-transport/D1RelocationLookup';
import ConsumerOrderLookup from './pages/mlb-transport/ConsumerOrderLookup';
import Referrals from './pages/referrals/Referrals';
import Vendors from './pages/vendors/Vendors';
import Reports from './pages/reports/Reports';
import APIAccess from './pages/api-access/APIAccess';
import Settings from './pages/settings/Settings';
import Users from './pages/users/Users';
import Roles from './pages/roles/Roles';
import ACL from './pages/acl/ACL';
import Profile from './pages/profile/Profile';
import PricingEngines from './pages/pricing-engines/PricingEngines';
import EngineEditor from './pages/pricing-engines/EngineEditor';
import APIKeys from './pages/api-keys/APIKeys';
import PricingAnalytics from './pages/pricing-analytics/PricingAnalytics';

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
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="carriers" element={<Carriers />} />
            <Route path="carriers/new" element={<AddCarrier />} />
            <Route path="mlb-transport" element={<MLBTransport />} />
            <Route path="mlb-transport/order-lookup" element={<MLBOrderLookup />} />
            <Route path="d1-relocation/order-lookup" element={<D1RelocationLookup />} />
            <Route path="d1-relocation/consumer-lookup" element={<ConsumerOrderLookup />} />
            <Route path="referrals" element={<Referrals />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="reports" element={<Reports />} />
            <Route path="api-access" element={<APIAccess />} />
            <Route path="settings" element={<Settings />} />
            <Route path="users" element={<Users />} />
            <Route path="roles" element={<Roles />} />
            <Route path="acl" element={<ACL />} />
            <Route path="profile" element={<Profile />} />
            <Route path="pricing-engines" element={<PricingEngines />} />
            <Route path="pricing-engines/:engineId" element={<EngineEditor />} />
            <Route path="api-keys" element={<APIKeys />} />
            <Route path="pricing-analytics" element={<PricingAnalytics />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
