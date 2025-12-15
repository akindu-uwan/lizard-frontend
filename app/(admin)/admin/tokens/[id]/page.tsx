'use client';

import React, { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { tokenAdminApi } from '@/app/api/admin/route';

type TokenStatus = 'pending' | 'approved' | 'rejected';
type TokenType = 'ERC20' | 'BEP20' | 'SPL' | 'Other';

interface TokenRequest {
  _id: string | number;
  tokenName: string;
  tokenSymbol: string;
  chain: string;
  contractAddress: string;
  tokenType: TokenType;
  tokenLogoUrl?: string | null;
  website?: string | null;
  description?: string | null;
  status: TokenStatus;
  createdAt: string;
  updatedAt: string;
  requesterEmail?: string;
}

interface TokenRequestDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function TokenRequestDetailPage({
  params,
}: TokenRequestDetailPageProps) {
  const router = useRouter();

  const { id } = use(params);

  const [request, setRequest] = useState<TokenRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await tokenAdminApi.getRequests();
        const all: TokenRequest[] = response.data || [];
        const item = all.find((r) => String(r._id) === String(id)) || null;
        setRequest(item);
      } catch (error) {
        console.error('Failed to fetch token request:', error);
        setRequest(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [id]);

  const updateStatus = async (status: TokenStatus) => {
    if (!request) return;
    try {
      setUpdating(true);
      await tokenAdminApi.updateRequest(request._id, status);
      setRequest((prev) => (prev ? { ...prev, status } : prev));
    } catch (error) {
      console.error('Failed to update request:', error);
    } finally {
      setUpdating(false);
    }
  };

  const statusBadgeClasses =
    request?.status === 'approved'
      ? 'bg-emerald-100 text-emerald-800'
      : request?.status === 'rejected'
      ? 'bg-red-100 text-red-800'
      : 'bg-amber-100 text-amber-800';

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-sm text-slate-600">
            Loading token request...
          </p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.push('/admin/tokens')}
          className="mb-4 inline-flex items-center text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          ← Back to tokens
        </button>
        <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900">
            Token request not found
          </h1>
          <p className="mt-2 text-slate-600">
            The requested token listing could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Back button */}
      <button
        onClick={() => router.push('/admin/tokens')}
        className="mb-4 inline-flex items-center text-sm font-medium text-slate-700 hover:text-slate-900"
      >
        ← Back to tokens
      </button>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {request.tokenLogoUrl && (
            <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={request.tokenLogoUrl}
                alt={request.tokenName}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {request.tokenName}
            </h1>
            <p className="text-slate-600">
              {request.tokenSymbol} • {request.chain}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${statusBadgeClasses}`}
        >
          {request.status}
        </span>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl shadow border border-slate-200 p-6 space-y-6">
        {/* Top grid: token info + meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Token Information */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Token Information
            </h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-slate-500">Token Name</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {request.tokenName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Token Symbol</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {request.tokenSymbol}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Token Type</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {request.tokenType}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Chain</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {request.chain}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Contract Address</dt>
                <dd className="text-xs font-mono text-slate-900 break-all">
                  {request.contractAddress}
                </dd>
              </div>
            </dl>
          </div>

          {/* Meta Information */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Request Details
            </h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-slate-500">Request ID</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {request._id}
                </dd>
              </div>
              {request.requesterEmail && (
                <div>
                  <dt className="text-xs text-slate-500">Requester Email</dt>
                  <dd className="text-sm font-medium text-slate-900">
                    {request.requesterEmail}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-xs text-slate-500">Submitted At</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {new Date(request.createdAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Last Updated</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {new Date(request.updatedAt).toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Website</dt>
                <dd className="text-sm font-medium text-emerald-700">
                  {request.website ? (
                    <a
                      href={
                        request.website.startsWith('http')
                          ? request.website
                          : `https://${request.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {request.website}
                    </a>
                  ) : (
                    <span className="text-slate-400">No website provided</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Description */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Description
          </h2>
          <div className="text-sm text-slate-700 whitespace-pre-wrap border border-slate-100 rounded-lg p-4 bg-slate-50">
            {request.description
              ? request.description
              : 'No description provided for this token.'}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Review the token details and approve or reject this listing
            request.
          </p>
          <div className="flex space-x-2">
            {request.status !== 'approved' && (
              <button
                onClick={() => updateStatus('approved')}
                disabled={updating}
                className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {updating && request.status !== 'approved'
                  ? 'Updating...'
                  : 'Approve'}
              </button>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}