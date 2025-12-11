'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { serviceAdminApi } from '@/app/api/admin/route';

type VerificationStatus = 'verified' | 'approved' | 'community' | 'scam';

interface ServiceRequest {
  _id: string;
  name: string;
  slug: string;
  type: string;
  url: string;
  description: string;
  privacyScore: number;
  trustScore: number;
  kycLevel: number;
  verificationStatus: VerificationStatus;
  currencies: string[];
  networks: string[];
  attributes: string[];
  createdAt: string;
  updatedAt: string;
}

interface DetailProps {
  params: Promise<{ id: string }>;
}

export default function ServiceDetailPage({ params }: DetailProps) {
  const { id } = use(params);
  const router = useRouter();

  const [service, setService] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await serviceAdminApi.getServiceById(id);
        setService(res.data);
      } catch (err) {
        console.error('Error loading service:', err);
        setService(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const updateStatus = async (status: VerificationStatus) => {
    if (!service) return;
    try {
      setUpdating(true);
      await serviceAdminApi.updateService(service._id, { verificationStatus: status });
      setService({ ...service, verificationStatus: status });
    } catch (err) {
      console.error('Failed to update service:', err);
    } finally {
      setUpdating(false);
    }
  };

  const statusClass = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-emerald-100 text-emerald-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'scam':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-2 text-sm text-slate-600">Loading service...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="p-8">
        <button onClick={() => router.push('/admin/services')} className="text-slate-700 hover:text-slate-900">
          ← Back
        </button>
        <div className="bg-white p-6 rounded-xl shadow mt-4">
          <h1 className="text-xl font-semibold">Service not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button
        onClick={() => router.push('/admin/services')}
        className="mb-4 inline-flex items-center text-sm font-medium text-slate-700 hover:text-slate-900"
      >
        ← Back to services
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{service.name}</h1>
          <p className="text-slate-600">{service.type} • {service.url}</p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusClass(service.verificationStatus)}`}>
          {service.verificationStatus}
        </span>
      </div>

      <div className="bg-white p-6 rounded-xl shadow space-y-6 border border-slate-200">
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Basic Info</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-slate-500">Name</dt>
                <dd className="text-sm font-medium">{service.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Slug</dt>
                <dd className="text-sm font-medium">{service.slug}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Type</dt>
                <dd className="text-sm font-medium capitalize">{service.type}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">URL</dt>
                <dd className="text-sm font-medium text-emerald-700">
                  <a href={service.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {service.url}
                  </a>
                </dd>
              </div>
            </dl>
          </div>

          {/* Scores */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Scores & Levels</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-slate-500">Privacy Score</dt>
                <dd className="text-sm font-medium">{service.privacyScore}/10</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Trust Score</dt>
                <dd className="text-sm font-medium">{service.trustScore}/10</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">KYC Level</dt>
                <dd className="text-sm font-medium">{service.kycLevel}/4</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Description</h2>
          <div className="text-sm text-slate-700 border rounded-lg p-4 bg-slate-50 whitespace-pre-wrap">
            {service.description || 'No description provided.'}
          </div>
        </div>

        {/* Lists */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Currencies</h2>
            <ul className="text-sm text-slate-700 list-disc ml-4">
              {service.currencies.length ? service.currencies.map((c) => <li key={c}>{c}</li>)
              : <li className="text-slate-400">None</li>}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Networks</h2>
            <ul className="text-sm text-slate-700 list-disc ml-4">
              {service.networks.length ? service.networks.map((n) => <li key={n}>{n}</li>)
              : <li className="text-slate-400">None</li>}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Attributes</h2>
            <ul className="text-sm text-slate-700 list-disc ml-4">
              {service.attributes.length ? service.attributes.map((a) => <li key={a}>{a}</li>)
              : <li className="text-slate-400">None</li>}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center border-t pt-4">
          <p className="text-xs text-slate-500">Update verification status for this service.</p>

          <div className="flex space-x-2">
            {service.verificationStatus !== 'verified' && (
              <button
                onClick={() => updateStatus('verified')}
                disabled={updating}
                className="px-4 py-2 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 disabled:opacity-60"
              >
                {updating ? 'Updating...' : 'Verify'}
              </button>
            )}

            {service.verificationStatus !== 'scam' && (
              <button
                onClick={() => updateStatus('scam')}
                disabled={updating}
                className="px-4 py-2 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-60"
              >
                {updating ? 'Updating...' : 'Mark Scam'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
