import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// PhoneSoftware Pages
import PSLogin from './pages/phonesoftware/PSLogin';
import PSAdmin from './pages/phonesoftware/PSAdmin';
import PSLayout from './pages/phonesoftware/PSLayout';
import PSDashboard from './pages/phonesoftware/PSDashboard';
import PSRepairs from './pages/phonesoftware/PSRepairs';
import PSCustomers from './pages/phonesoftware/PSCustomers';
import PSInventory from './pages/phonesoftware/PSInventory';
import PSStaff from './pages/phonesoftware/PSStaff';
import PSReports from './pages/phonesoftware/PSReports';
import PSRepairStatus from './pages/phonesoftware/PSRepairStatus';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

function App() {
  return (
    <HashRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Redirect nga root direkt te PhoneSoftware login */}
        <Route path="/" element={<Navigate to="/phonesoftware/login" replace />} />

        {/* PhoneSoftware Routes */}
        <Route path="/phonesoftware/login" element={<PSLogin />} />
        <Route path="/phonesoftware/admin" element={<PSAdmin />} />
        <Route path="/phonesoftware/repair-status/:ticketNumber" element={<PSRepairStatus />} />

        <Route path="/phonesoftware" element={<PSLayout />}>
          <Route index element={<Navigate to="/phonesoftware/dashboard" replace />} />
          <Route path="dashboard" element={<PSDashboard />} />
          <Route path="repairs" element={<PSRepairs />} />
          <Route path="customers" element={<PSCustomers />} />
          <Route path="inventory" element={<PSInventory />} />
          <Route path="staff" element={<PSStaff />} />
          <Route path="reports" element={<PSReports />} />
        </Route>

        {/* Çdo rrugë tjetër shkon te login */}
        <Route path="*" element={<Navigate to="/phonesoftware/login" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;

