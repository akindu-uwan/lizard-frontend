'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { serviceAdminApi } from '@/app/lib/adminApi';

interface ServiceRequest {
  _id: string;
  name: string;
  slug: string;
  type: string;
  url: string;
  verificationStatus: 'verified' | 'approved' | 'community';
  createdAt: string;
}

export default function ServicesAdminPage() {
  const [services, setServices] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await serviceAdminApi.getServices();
      setServices(response.data || []);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await serviceAdminApi.updateServices(id, { verificationStatus: status });
      fetchServices();
    } catch (error) {
      console.error('Failed to update service:', error);
    }
  };

  const statusClass = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-emerald-100 text-emerald-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-2 text-sm text-slate-600">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button
          onClick={() => router.push('/admin')}
          className="mb-4 inline-flex items-center text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          ← Back to Dashboard
        </button>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Service Listings</h1>
      <p className="text-slate-600 mb-6">Manage services submitted to your platform</p>

      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {services.map((service) => (
              <tr key={service._id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">{service.name}</td>
                <td className="px-6 py-4 text-sm text-slate-700 capitalize">{service.type}</td>
                <td className="px-6 py-4 text-sm text-slate-700">
                  {new Date(service.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass(service.verificationStatus)}`}>
                    {service.verificationStatus}
                  </span>
                </td>
                <td className="px-6 py-4 flex space-x-2">
                  <button
                    onClick={() => router.push(`/admin/services/${service._id}`)}
                    className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200"
                  >
                    View
                  </button>

                  

                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
