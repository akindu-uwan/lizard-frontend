'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokenAdminApi } from '@/app/lib/adminApi';

interface TokenRequest {
  _id: number;
  tokenName: string;
  tokenSymbol: string;
  status: string;
  submittedAt: string;
  requesterEmail: string;
}

export default function TokenAdminPage() {
  const [requests, setRequests] = useState<TokenRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await tokenAdminApi.getRequests();
      console.log('API response:', response.data);
      setRequests(response.data || []);
    } catch (error) {
      console.error('Failed to fetch token requests:', error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await tokenAdminApi.updateRequest(id, status);
      fetchRequests();
    } catch (error) {
      console.error('Failed to update request:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-sm text-slate-600">Loading token requests...</p>
        </div>
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Token Listing Requests</h1>
        <p className="text-slate-600">Review and manage token listing requests</p>
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Token
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Requester
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Submitted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {requests.map((request) => (
              <tr key={request._id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-slate-900">
                      {request.tokenName}
                    </div>
                    <div className="text-sm text-slate-500">
                      {request.tokenSymbol}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900">
                    {request.requesterEmail}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900">
                    {new Date(request.submittedAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      request.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : request.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(request._id, 'approved')}
                          className="px-3 py-1 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(request._id, 'rejected')}
                          className="px-3 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() =>
                        router.push(`/admin/tokens/${request._id}`)
                      }
                      className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
