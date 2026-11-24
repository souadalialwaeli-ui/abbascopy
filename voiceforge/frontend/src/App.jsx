import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Home from './pages/Home';
import Inference from './pages/Inference';
import Training from './pages/Training';
import Models from './pages/Models';
import Settings from './pages/Settings';
import { useConnectionStore } from './stores/connectionStore';
import { useEffect } from 'react';

export default function App() {
  const { initFirebaseListener } = useConnectionStore();

  useEffect(() => {
    initFirebaseListener();
  }, []);

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
          duration: 3000,
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="inference" element={<Inference />} />
          <Route path="training" element={<Training />} />
          <Route path="models" element={<Models />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
