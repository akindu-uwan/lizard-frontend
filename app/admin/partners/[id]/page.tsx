"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { partnerAdminApi } from "@/app/api/admin/route";

type PartnerStatus = "pending" | "approved" | "rejected";
type ServiceType = "DEX" | "Aggregator" | "Bridge" | "Lending" | "Wallet" | "Other";

interface PartnerApplication {
  _id: string;

  projectName: string;
  companyName?: string;
  serviceType: ServiceType;

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

  status: PartnerStatus;
  createdAt: string;
  updatedAt: string;
}

interface PartnerConfirmed {
  _id: string;
  projectName: string;
  website: string;
  status?: PartnerStatus;
}

interface PartnerDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PartnerApplicationDetailPage({ params }: PartnerDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [app, setApp] = useState<PartnerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // -----------------------------
  // Helpers (avoid 400 validation)
  // -----------------------------
  const normalizeUrl = (v?: string) => {
    const s = (v ?? "").trim();
    if (!s) return "";
    return s.startsWith("http://") || s.startsWith("https://") ? s : `https://${s}`;
  };

  // -----------------------------
  // Fetch application by ID
  // -----------------------------
  useEffect(() => {
    const fetchApp = async () => {
      try {
        const response = await partnerAdminApi.getApplications();
        const all: PartnerApplication[] = response.data || [];
        const item = all.find((r) => String(r._id) === String(id)) || null;
        setApp(item);
      } catch (error) {
        console.error("Failed to fetch partner application:", error);
        setApp(null);
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [id]);

  // ----------------------------------------
  // Approve & Publish (FIXED)
  // ----------------------------------------
  const verifyAndPublish = async () => {
    if (!app) return;

    try {
      setUpdating(true);

      // 1) Approve the REQUEST (partnerrequests collection)
      const approvedRes = await partnerAdminApi.updateApplication(app._id, "approved");

      // IMPORTANT: backend returns { message, partner }
      const approvedApp: PartnerApplication =
        approvedRes?.data?.partner ?? { ...app, status: "approved" };

      // 2) Build payload for CONFIRMED create (partners collection)
      // Your backend validator allows "" for optional URL fields via NullableUrl
      // website MUST be a valid URL -> ensure it has http(s)
      const payload = {
        projectName: approvedApp.projectName,
        companyName: approvedApp.companyName || "",

        serviceType: approvedApp.serviceType,

        primaryChain: approvedApp.primaryChain,
        supportedChains: approvedApp.supportedChains || "",

        website: normalizeUrl(approvedApp.website),

        apiBaseUrl: approvedApp.apiBaseUrl ? normalizeUrl(approvedApp.apiBaseUrl) : "",
        apiDocsUrl: approvedApp.apiDocsUrl ? normalizeUrl(approvedApp.apiDocsUrl) : "",

        contactName: approvedApp.contactName,
        contactEmail: approvedApp.contactEmail,

        telegram: approvedApp.telegram || "",
        discord: approvedApp.discord || "",
        estimatedDailyVolume: approvedApp.estimatedDailyVolume || "",
        notes: approvedApp.notes || "",

        // optional, backend accepts it (z.boolean().optional())
        // acceptTerms: true,
      };

      // 3) Create confirmed partner (POST /api/partners/apply)
      // BUT your confirmed controller hard-sets status: "pending"
      // so we must follow-up with PUT /api/partners/:id {status:"approved"}
      try {
        const created = await partnerAdminApi.createConfirmedPartner(payload);

        // IMPORTANT: backend returns { message, partner }
        const createdPartner: PartnerConfirmed | undefined = created?.data?.partner;

        if (createdPartner?._id) {
          await partnerAdminApi.updateConfirmedPartner(createdPartner._id, {
            status: "approved",
          });
        }
      } catch (err: any) {
        console.log("Create confirmed partner failed:", err?.response?.data);

        const msg = String(
          err?.response?.data?.message ??
            err?.response?.data?.error ??
            err?.message ??
            ""
        ).toLowerCase();

        const isDuplicate =
          msg.includes("duplicate") ||
          msg.includes("exists") ||
          msg.includes("unique") ||
          msg.includes("11000");

        if (!isDuplicate) throw err;

        // 4) Duplicate fallback:
        // Find existing confirmed record (by website/projectName) and just approve it
        // NOTE: your PUT /api/partners/:id only accepts {status}
        const allConfirmedRes = await partnerAdminApi.getConfirmedPartners();
        const allConfirmed: PartnerConfirmed[] = allConfirmedRes?.data || [];

        const targetWebsite = String(normalizeUrl(payload.website || "")).toLowerCase();
        const targetName = String(payload.projectName || "").toLowerCase();

        const existing = allConfirmed.find((p) => {
          const w = String(normalizeUrl(p.website || "")).toLowerCase();
          const n = String(p.projectName || "").toLowerCase();
          return (targetWebsite && w === targetWebsite) || (targetName && n === targetName);
        });

        if (!existing?._id) throw err;

        await partnerAdminApi.updateConfirmedPartner(existing._id, { status: "approved" });
      }

      // 5) Update local UI state (request becomes approved)
      setApp({ ...approvedApp, status: "approved" });
    } catch (error) {
      console.error("Approve & publish failed:", error);
    } finally {
      setUpdating(false);
    }
  };

  const updateStatus = async (status: PartnerStatus) => {
    if (!app) return;
    try {
      setUpdating(true);
      const res = await partnerAdminApi.updateApplication(app._id, status);
      const updated: PartnerApplication = res?.data?.partner ?? { ...app, status };
      setApp(updated);
    } catch (error) {
      console.error("Failed to update partner application:", error);
    } finally {
      setUpdating(false);
    }
  };

  const statusBadgeClasses =
    app?.status === "approved"
      ? "bg-emerald-100 text-emerald-800"
      : app?.status === "rejected"
      ? "bg-red-100 text-red-800"
      : "bg-amber-100 text-amber-800";

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-2 text-sm text-slate-600">Loading partner application...</p>
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.push("/admin/partners")}
          className="mb-4 inline-flex items-center text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          ← Back to partners
        </button>

        <div className="bg-white rounded-xl shadow border border-slate-200 p-6">
          <h1 className="text-xl font-semibold text-slate-900">
            Partner application not found
          </h1>
          <p className="mt-2 text-slate-600">
            The requested partner application could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button
        onClick={() => router.push("/admin/partners")}
        className="mb-4 inline-flex items-center text-sm font-medium text-slate-700 hover:text-slate-900"
      >
        ← Back to partners
      </button>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{app.projectName}</h1>
          <p className="text-slate-600">
            {app.serviceType} • {app.primaryChain}
            {app.companyName ? ` • ${app.companyName}` : ""}
          </p>
        </div>

        <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusBadgeClasses}`}>
          {app.status}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow border border-slate-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Partner Info */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Partner Information
            </h2>

            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-slate-500">Project Name</dt>
                <dd className="text-sm font-medium text-slate-900">{app.projectName}</dd>
              </div>

              {app.companyName && (
                <div>
                  <dt className="text-xs text-slate-500">Company Name</dt>
                  <dd className="text-sm font-medium text-slate-900">{app.companyName}</dd>
                </div>
              )}

              <div>
                <dt className="text-xs text-slate-500">Service Type</dt>
                <dd className="text-sm font-medium text-slate-900">{app.serviceType}</dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">Primary Chain</dt>
                <dd className="text-sm font-medium text-slate-900">{app.primaryChain}</dd>
              </div>

              {app.supportedChains && (
                <div>
                  <dt className="text-xs text-slate-500">Supported Chains</dt>
                  <dd className="text-sm font-medium text-slate-900">{app.supportedChains}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Contact + Links */}
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Contact & Links
            </h2>

            <dl className="space-y-2">
              <div>
                <dt className="text-xs text-slate-500">Contact Name</dt>
                <dd className="text-sm font-medium text-slate-900">{app.contactName}</dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">Contact Email</dt>
                <dd className="text-sm font-medium text-slate-900">{app.contactEmail}</dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">Website</dt>
                <dd className="text-sm font-medium text-emerald-700">
                  <a
                    href={app.website.startsWith("http") ? app.website : `https://${app.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    {app.website}
                  </a>
                </dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">API Base URL</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {app.apiBaseUrl ? app.apiBaseUrl : <span className="text-slate-400">Not provided</span>}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">API Docs URL</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {app.apiDocsUrl ? app.apiDocsUrl : <span className="text-slate-400">Not provided</span>}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">Telegram</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {app.telegram ? app.telegram : <span className="text-slate-400">Not provided</span>}
                </dd>
              </div>

              <div>
                <dt className="text-xs text-slate-500">Discord</dt>
                <dd className="text-sm font-medium text-slate-900">
                  {app.discord ? app.discord : <span className="text-slate-400">Not provided</span>}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Notes */}
        <div>
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Notes & Volume
          </h2>

          <dl className="space-y-2">
            <div>
              <dt className="text-xs text-slate-500">Estimated Daily Volume</dt>
              <dd className="text-sm font-medium text-slate-900">
                {app.estimatedDailyVolume ? app.estimatedDailyVolume : <span className="text-slate-400">Not provided</span>}
              </dd>
            </div>

            <div>
              <dt className="text-xs text-slate-500">Notes</dt>
              <dd className="text-sm text-slate-700 whitespace-pre-wrap border border-slate-100 rounded-lg p-4 bg-slate-50">
                {app.notes ? app.notes : "No notes provided."}
              </dd>
            </div>
          </dl>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <dt className="text-xs text-slate-500">Submitted At</dt>
            <dd className="text-sm font-medium text-slate-900">
              {new Date(app.createdAt).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Last Updated</dt>
            <dd className="text-sm font-medium text-slate-900">
              {new Date(app.updatedAt).toLocaleString()}
            </dd>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Approving will publish the partner into the confirmed partners collection.
          </p>

          <div className="flex space-x-2">
            {app.status !== "approved" && (
              <button
                onClick={verifyAndPublish}
                disabled={updating}
                className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 rounded hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {updating ? "Updating..." : "Approve & Publish"}
              </button>
            )}

            {app.status !== "rejected" && (
              <button
                onClick={() => updateStatus("rejected")}
                disabled={updating}
                className="px-4 py-2 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {updating ? "Updating..." : "Reject"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}