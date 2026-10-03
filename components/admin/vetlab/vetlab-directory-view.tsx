"use client";

import React, { useState } from "react";
import {
  Stethoscope,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  X,
  Save,
  Check,
  Building2,
  FlaskConical,
  MessageCircle,
  ShieldCheck,
  Clock,
  Compass,
  Tag,
} from "lucide-react";
import { AdminVetLabItem } from "@/types/admin";
import {
  upsertVetLabAction,
  toggleVetLabVerificationAction,
  deleteVetLabAction,
} from "@/actions/admin";
import { cn } from "@/lib/utils";

interface VetLabDirectoryViewProps {
  initialRecords: AdminVetLabItem[];
}

export function VetLabDirectoryView({ initialRecords }: VetLabDirectoryViewProps) {
  const [records, setRecords] = useState<AdminVetLabItem[]>(initialRecords);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [editingItem, setEditingItem] = useState<AdminVetLabItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Stats calculation
  const totalVerified = records.filter((r) => r.verified).length;
  const vetsCount = records.filter((r) => r.type === "VET").length;
  const labsCount = records.filter((r) => r.type === "LAB").length;
  const avgRadius = records.length > 0
    ? Math.round(records.reduce((sum, r) => sum + (r.serviceRadiusKm || 30), 0) / records.length)
    : 40;

  // Form state
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    type: "VET" as "VET" | "LAB" | "ASSOCIATION",
    qualification: "",
    phone: "",
    whatsapp: "",
    address: "",
    latitude: 30.901,
    longitude: 75.857,
    serviceRadiusKm: 50,
    specializations: "Broiler Pathology, Post-mortem",
    teleconsult: true,
    hours: "9:00 AM - 6:00 PM",
    verified: true,
  });

  const filtered = records.filter((r) => {
    if (typeFilter !== "ALL" && r.type !== typeFilter) return false;
    if (verifiedOnly && !r.verified) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        r.name.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.phone.includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setFormData({
      id: "",
      name: "",
      type: "VET",
      qualification: "B.V.Sc & A.H., M.V.Sc (Avian Pathology)",
      phone: "",
      whatsapp: "",
      address: "Ludhiana, Punjab",
      latitude: 30.901,
      longitude: 75.857,
      serviceRadiusKm: 40,
      specializations: "Broiler Diagnostics, Post-mortem",
      teleconsult: true,
      hours: "9:00 AM - 6:00 PM",
      verified: true,
    });
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: AdminVetLabItem) => {
    setFormData({
      id: item.id,
      name: item.name,
      type: item.type,
      qualification: item.qualification || "",
      phone: item.phone,
      whatsapp: item.whatsapp || "",
      address: item.address,
      latitude: item.latitude || 30.901,
      longitude: item.longitude || 75.857,
      serviceRadiusKm: item.serviceRadiusKm || 50,
      specializations: item.specializations.join(", "),
      teleconsult: item.teleconsult,
      hours: item.hours || "9:00 AM - 6:00 PM",
      verified: item.verified,
    });
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleToggleVerification = async (id: string, current: boolean) => {
    const nextVal = !current;
    const res = await toggleVetLabVerificationAction(id, nextVal);
    if (res.success) {
      setRecords((prev) =>
        prev.map((r) => (r.id === id ? { ...r, verified: nextVal } : r))
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate and remove this specialist record?")) {
      return;
    }
    const res = await deleteVetLabAction(id);
    if (res.success) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const specs = formData.specializations
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await upsertVetLabAction({
      id: formData.id || undefined,
      name: formData.name,
      type: formData.type,
      qualification: formData.qualification || null,
      phone: formData.phone,
      whatsapp: formData.whatsapp || null,
      address: formData.address,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      serviceRadiusKm: Number(formData.serviceRadiusKm),
      specializations: specs,
      teleconsult: formData.teleconsult,
      hours: formData.hours || null,
      verified: formData.verified,
    });

    setIsSaving(false);

    if (res.success && res.record) {
      if (formData.id) {
        setRecords((prev) =>
          prev.map((r) => (r.id === res.record.id ? res.record : r))
        );
      } else {
        setRecords((prev) => [res.record, ...prev]);
      }
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Directory Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Total Directory
            </span>
            <Stethoscope className="h-4 w-4 text-amber-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-pankh-clay mt-1.5">
            {records.length}
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            Registered partners
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Verified Specialists
            </span>
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 mt-1.5">
            {totalVerified}
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            Vetted qualifications
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Diagnostic Labs
            </span>
            <FlaskConical className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-blue-700 mt-1.5">
            {labsCount}
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            Pathology & water labs
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Avg Coverage
            </span>
            <Compass className="h-4 w-4 text-amber-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-800 mt-1.5">
            {avgRadius} <span className="text-sm font-sans">km</span>
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            Dispatch radius
          </p>
        </div>
      </div>

      {/* 2. Top Header & Search Controls */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by specialist name, qualification, address, or phone..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer font-sans"
          >
            <option value="ALL">All Types ({records.length})</option>
            <option value="VET">Veterinarians ({vetsCount})</option>
            <option value="LAB">Diagnostic Labs ({labsCount})</option>
            <option value="ASSOCIATION">Poultry Associations</option>
          </select>

          {/* Verified Toggle */}
          <button
            type="button"
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5",
              verifiedOnly
                ? "bg-emerald-50 text-emerald-900 border-emerald-300 font-bold"
                : "bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100"
            )}
          >
            <ShieldCheck className={cn("h-3.5 w-3.5", verifiedOnly ? "text-emerald-700" : "text-stone-400")} />
            <span>Verified Only</span>
          </button>

          {/* Add Button */}
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Specialist</span>
          </button>
        </div>
      </div>

      {/* 3. Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => {
          const cleanPhone = item.phone.replace(/\D/g, "");
          const waNumber = (item.whatsapp || item.phone).replace(/\D/g, "");
          const waUrl = `https://wa.me/91${waNumber}?text=${encodeURIComponent(
            `Sat Sri Akal ${item.name} ji, Pankh Operations desk se contact kar rahe hain regarding poultry health referral.`
          )}`;

          return (
            <div
              key={item.id}
              className="p-5 rounded-3xl bg-white border border-stone-200/90 hover:border-amber-300/80 shadow-2xs transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 border",
                        item.type === "VET"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-800"
                          : item.type === "LAB"
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-800"
                          : "bg-purple-500/10 border-purple-500/20 text-purple-800"
                      )}
                    >
                      {item.type === "VET" ? (
                        <Stethoscope className="h-5 w-5" />
                      ) : item.type === "LAB" ? (
                        <FlaskConical className="h-5 w-5" />
                      ) : (
                        <Building2 className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif font-bold text-base text-pankh-clay">
                          {item.name}
                        </h4>
                        {item.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                            <Check className="h-2.5 w-2.5" />
                            VERIFIED
                          </span>
                        )}
                      </div>

                      {item.qualification && (
                        <p className="text-[11px] text-amber-900 font-medium font-sans mt-0.5">
                          {item.qualification}
                        </p>
                      )}

                      <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-stone-400 shrink-0" />
                        <span>{item.address}</span>
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-bold border border-stone-200 uppercase shrink-0">
                    {item.type}
                  </span>
                </div>

                {/* Service Radius & Teleconsult Details */}
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-stone-600 bg-[#FAF9F5] p-2.5 rounded-xl border border-stone-200/80">
                  <span className="flex items-center gap-1">
                    <Compass className="h-3 w-3 text-amber-800" />
                    <strong>{item.serviceRadiusKm || 40} km</strong> radius
                  </span>
                  <span>•</span>
                  <span>Teleconsult: <strong>{item.teleconsult ? "Available" : "On-site Only"}</strong></span>
                  {item.hours && (
                    <>
                      <span>•</span>
                      <span>{item.hours}</span>
                    </>
                  )}
                </div>

                {/* Specializations Pills */}
                {item.specializations.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.specializations.map((spec, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-sans border border-stone-200"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${item.phone}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-200 transition-colors shadow-2xs"
                  >
                    <Phone className="h-3 w-3 text-amber-800" />
                    <span>Call</span>
                  </a>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200 transition-colors shadow-2xs"
                  >
                    <MessageCircle className="h-3 w-3 text-emerald-700" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleVerification(item.id, item.verified)}
                    title={item.verified ? "Revoke Verification" : "Verify Specialist"}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer",
                      item.verified
                        ? "bg-stone-100 hover:bg-amber-100 text-stone-700 border-stone-200"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200"
                    )}
                  >
                    {item.verified ? "Revoke" : "Verify"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Edit Record"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Deactivate Record"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs text-stone-400 bg-white rounded-3xl border border-stone-200/90 shadow-2xs space-y-2">
            <Stethoscope className="h-9 w-9 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-700 font-serif">
              No specialists found matching your search
            </p>
            <p className="text-stone-500">
              Try adjusting your query or filter criteria.
            </p>
          </div>
        )}
      </div>

      {/* 4. Structured 4-Section Upsert Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FAF9F5] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-6 shadow-2xl border border-stone-300 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-800">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-pankh-clay">
                    {editingItem ? "Edit Specialist / Lab Record" : "Add New Specialist or Diagnostic Lab"}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    Directory partner in Pankh Connect network
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-5">
              {/* Section 1: Basic Identity */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold block">
                  1. Identity & Classification
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Full Name / Lab Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Dr. Harpreet Singh / GADVASU Avian Lab"
                      className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Entity Type *</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-sans"
                    >
                      <option value="VET">Veterinarian (Doctor)</option>
                      <option value="LAB">Diagnostic Lab</option>
                      <option value="ASSOCIATION">Poultry Association</option>
                    </select>
                  </div>

                  <div className="col-span-full space-y-1">
                    <label className="text-xs font-bold text-stone-700">Qualifications / Accreditation</label>
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      placeholder="e.g. B.V.Sc & A.H., M.V.Sc (Avian Pathology)"
                      className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Geographic Reach */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold block">
                  2. Geographic Coverage & Dispatch Radius
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="col-span-full space-y-1">
                    <label className="text-xs font-bold text-stone-700">Clinic / Lab Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="e.g. Ferozepur Road, Ludhiana, Punjab"
                      className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-sans"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Service Radius (km) *</label>
                    <input
                      type="number"
                      required
                      min={5}
                      max={200}
                      value={formData.serviceRadiusKm}
                      onChange={(e) => setFormData({ ...formData, serviceRadiusKm: Number(e.target.value) })}
                      className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                        className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-stone-700">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                        className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Contact & Hours */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold block">
                  3. Communication & Operating Schedule
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">WhatsApp</label>
                    <input
                      type="tel"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      placeholder="e.g. +91 98765 43210"
                      className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Operating Hours</label>
                    <input
                      type="text"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                      placeholder="e.g. 9:00 AM - 6:00 PM"
                      className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Specializations & Verification */}
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-800 font-bold block">
                  4. Clinical Specializations & Status
                </span>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700">Specializations (Comma separated)</label>
                    <input
                      type="text"
                      value={formData.specializations}
                      onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                      placeholder="e.g. Broiler Pathology, Post-mortem, Water Microbiology"
                      className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-sans"
                    />
                  </div>

                  <div className="flex items-center gap-6 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
                      <input
                        type="checkbox"
                        checked={formData.teleconsult}
                        onChange={(e) => setFormData({ ...formData, teleconsult: e.target.checked })}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Available for Teleconsultation</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-stone-800">
                      <input
                        type="checkbox"
                        checked={formData.verified}
                        onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-emerald-800">Specialist Verified & Approved</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-4 w-4" />
                  <span>{isSaving ? "Saving..." : editingItem ? "Update Record" : "Add Specialist"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
