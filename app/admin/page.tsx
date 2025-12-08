'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/app/api/api';

interface AdminStatus {
  isAuthenticated: boolean;
  email?: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authApi.checkStatus();
      setAdminStatus(response.data);
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-sm text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-emerald-50/30">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Lizard Admin</h1>
              {adminStatus?.email && (
                <p className="text-sm text-slate-600">{adminStatus.email}</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Admin Dashboard</h2>
          <p className="text-slate-600">
            Manage token listings, partner applications, and platform settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Token Management Card */}
          <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Token Requests</h3>
              <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                12 pending
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Review and approve token listing requests submitted by users.
            </p>
            <button
              onClick={() => router.push('/admin/tokens')}
              className="w-full px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Manage Tokens
            </button>
          </div>

          {/* Partner Management Card */}
          <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">Partner Applications</h3>
              <span className="px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                8 pending
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Review and process partner integration requests.
            </p>
            <button
              onClick={() => router.push('/admin/partners')}
              className="w-full px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Manage Partners
            </button>
          </div>

          {/* System Settings Card */}
          <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900">System Settings</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Configure platform settings, maintenance modes, and admin users.
            </p>
            <button
              className="w-full px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors"
              disabled
            >
              Coming Soon
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}