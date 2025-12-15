"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { partnerAdminApi } from "@/app/lib/adminApi";

interface PartnerApplication {
  _id: string;

  projectName: string;
  companyName?: string;
  serviceType: "DEX" | "Aggregator" | "Bridge" | "Lending" | "Wallet" | "Other";
  primaryChain: string;
  supportedChains?: string;

  website: string;
  apiBaseUrl?: string;
  apiDocsUrl?: string;

  contactName: string;
  contactEmail: string;
  telegram?: string;
  discord?: string;

  estimatedDailyVolume?: string;
  notes?: string;

  status: "pending" | "approved" | "rejected" | string;

  createdAt: string;
  updatedAt: string;
}

export default function PartnerAdminPage() {
  const [apps, setApps] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const response = await partnerAdminApi.getApplications();
      setApps(response.data || []);
    } catch (error) {
      console.error("Failed to fetch partner applications:", error);
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    try {
      await partnerAdminApi.updateApplication(id, status);
      fetchApps();
    } catch (error) {
      console.error("Failed to update partner application:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-sm text-slate-600">
            Loading partner applications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button
        onClick={() => router.push("/admin")}
        className="mb-4 inline-flex items-center text-sm font-medium text-slate-700 hover:text-slate-900"
      >
        ← Back to Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Partner Applications
        </h1>
        <p className="text-slate-600">
          Review and manage partner onboarding applications
        </p>
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Project
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Contact
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
            {apps.map((app) => (
              <tr key={app._id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium text-slate-900">
                      {app.projectName}
                    </div>
                    <div className="text-sm text-slate-500">
                      {app.serviceType} • {app.primaryChain}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900">{app.contactName}</div>
                  <div className="text-xs text-slate-500">{app.contactEmail}</div>
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm text-slate-900">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      app.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : app.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {app.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex space-x-2">
            

                    <button
                      onClick={() => router.push(`/admin/partners/${app._id}`)}
                      className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded hover:bg-slate-200"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {apps.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm text-slate-500"
                >
                  No partner applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
