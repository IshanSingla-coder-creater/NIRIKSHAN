import { Routes, Route } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Inspections } from './pages/Inspections';
import { NewInspection } from './pages/NewInspection';
import { Processing } from './pages/Processing';
import { InspectionDetail } from './pages/InspectionDetail';
import { Reviews } from './pages/Reviews';
import { Evidence } from './pages/Evidence';
import { Analytics } from './pages/Analytics';
import { Products } from './pages/Products';
import { Regulatory } from './pages/Regulatory';
import { Users } from './pages/Users';
import { AuditLog } from './pages/AuditLog';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { Capture } from './pages/Capture';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/capture/:sessionId" element={<Capture />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/inspections" element={<Inspections />} />
      <Route path="/inspections/new" element={<NewInspection />} />
      <Route path="/inspections/:id" element={<InspectionDetail />} />
      <Route path="/inspections/:id/evidence" element={<Evidence />} />
      <Route path="/reviews" element={<Reviews />} />
      <Route path="/products" element={<Products />} />
      <Route path="/evidence" element={<Evidence />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/regulatory" element={<Regulatory />} />
      <Route path="/admin/users" element={<Users />} />
      <Route path="/admin/audit-log" element={<AuditLog />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/processing/:id" element={<Processing />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
}
