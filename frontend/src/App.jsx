import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Verify from './pages/Verify';
import History from './pages/History';
import Settings from './pages/Settings';
import { useVerification } from './hooks/useVerification';
import { useHistory } from './hooks/useHistory';

export default function App() {
  const verifyHook = useVerification();
  const historyHook = useHistory();

  function handleResult(result, file) {
    historyHook.addRecord(result, file);
  }

  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Dashboard history={historyHook.records} />} />
          <Route path="/verify" element={<Verify hook={verifyHook} onResult={handleResult} />} />
          <Route path="/history" element={<History history={historyHook.records} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}
