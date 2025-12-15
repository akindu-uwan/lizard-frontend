'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { serviceAdminApi } from '@/app/lib/adminApi';

type VerificationStatus = 'verified' | 'approved' | 'community';

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

interface ServiceConfirmed {
  _id: string;
  slug: string;
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

  // -----------------------------
  // Fetch service by ID
  // -----------------------------
  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await serviceAdminApi.getServiceById(id);
        setService(res?.data ?? null);
      } catch (err) {
        console.error('Failed to fetch service:', err);
        setService(null);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // -----------------------------
  // Verify & Publish
  // -----------------------------
  const verifyAndPublish = async () => {
    if (!service) return;

    try {
      setUpdating(true);

      // 1) Mark request as verified
      const verifiedRes = await serviceAdminApi.updateServices(service._id, {
        verificationStatus: 'verified',
      });

      const verifiedService: ServiceRequest =
        verifiedRes?.data ?? { ...service, verificationStatus: 'verified' };

      // 2) Prepare publish payload
      const payload = {
        name: verifiedService.name,
        slug: verifiedService.slug,
        type: verifiedService.type,
        url: verifiedService.url,
        description: verifiedService.description || '',
        privacyScore: verifiedService.privacyScore ?? 0,
        trustScore: verifiedService.trustScore ?? 0,
        kycLevel: verifiedService.kycLevel ?? 0,
        verificationStatus: 'verified',
        currencies: verifiedService.currencies ?? [],
        networks: verifiedService.networks ?? [],
        attributes: verifiedService.attributes ?? [],
      };

      // 3) Try to publish
      try {
        await serviceAdminApi.createConfirmedService(payload);
      } catch (err: any) {
        // Axios errors usually store details on err.response.data
        const msg = String(
          err?.response?.data?.message ??
            err?.response?.data?.error ??
            err?.message ??
            ''
        ).toLowerCase();

        const isDuplicate =
          msg.includes('duplicate') ||
          msg.includes('exists') ||
          msg.includes('unique') ||
          msg.includes('11000');

        if (!isDuplicate) throw err;

        // 4) Fallback: update existing confirmed service (match by slug)
        const allConfirmed = await serviceAdminApi.getConfirmedServices();
        const existing = allConfirmed?.data?.find(
          (s: ServiceConfirmed) => String(s.slug) === String(payload.slug)
        );

        if (!existing?._id) throw err;

        await serviceAdminApi.updateConfirmedService(existing._id, payload);
      }

      // 5) Update local state
      setService(verifiedService);
    } catch (err) {
      console.error('Verify & publish failed:', err);
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
          <p className="text-slate-600">
            {service.type} • {service.url}
          </p>
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
              {service.currencies?.length ? service.currencies.map((c) => <li key={c}>{c}</li>) : <li className="text-slate-400">None</li>}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Networks</h2>
            <ul className="text-sm text-slate-700 list-disc ml-4">
              {service.networks?.length ? service.networks.map((n) => <li key={n}>{n}</li>) : <li className="text-slate-400">None</li>}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase mb-2">Attributes</h2>
            <ul className="text-sm text-slate-700 list-disc ml-4">
              {service.attributes?.length ? service.attributes.map((a) => <li key={a}>{a}</li>) : <li className="text-slate-400">None</li>}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center border-t pt-4">
          <p className="text-xs text-slate-500">Update verification status for this service.</p>

          <div className="flex space-x-2">
            {service.verificationStatus !== 'verified' && (
              <button
                onClick={verifyAndPublish}
                disabled={updating}
                className="px-4 py-2 bg-emerald-600 text-white text-xs rounded hover:bg-emerald-700 disabled:opacity-60"
              >
                {updating ? 'Updating...' : 'Verify'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}