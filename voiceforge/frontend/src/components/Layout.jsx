import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import ConnectionStatus from './ConnectionStatus';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ConnectionStatus />
      <main className="flex-1 pb-20 px-4 pt-2 max-w-2xl mx-auto w-full">
        <Outlet />
      </main>
      <Navbar />
    </div>
  );
}
