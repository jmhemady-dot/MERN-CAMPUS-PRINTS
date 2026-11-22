
import AdminRequests from "./pages/AdminRequests";
import AdminDashboard from "./pages/AdminDashboard";
import TransactionHistory from "./pages/TransactionHistory";
import QueueMonitor from "./pages/QueueMonitor";
import SubmitRequest from "./pages/SubmitRequest";
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Login, Register } from './pages/AuthPages';
import Dashboard from './pages/Dashboard';

export default function App() {
  return <BrowserRouter>
    <Routes><Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} /><Route path="/admin/requests" element={<AdminRequests />} /><Route path="/admin/dashboard" element={<AdminDashboard />} /><Route path="/history" element={<TransactionHistory />} /><Route path="/queue" element={<QueueMonitor />} />
      <Route path="/submit-request" element={<SubmitRequest />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  </BrowserRouter>;
}








