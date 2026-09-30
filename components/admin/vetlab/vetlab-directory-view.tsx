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
    <div className="space-y-6">
      {/* Top Header & Search Controls */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="h-4 w-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by specialist name, district, address, phone..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Types</option>
            <option value="VET">Veterinarians Only</option>
            <option value="LAB">Diagnostic Labs Only</option>
            <option value="ASSOCIATION">Poultry Associations</option>
          </select>

          {/* Verified Toggle */}
          <button
            type="button"
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={cn(
              "px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer",
              verifiedOnly
                ? "bg-emerald-700 text-white border-emerald-800 shadow-2xs"
                : "bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200"
            )}
          >
            {verifiedOnly ? "Verified Only (Active)" : "All Records"}
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pankh-indigo hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Specialist</span>
          </button>
        </div>
      </div>

      {/* Vet / Lab Table */}
      <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-emerald-700" />
            <h3 className="font-serif text-base font-bold text-pankh-clay">
              Specialist Directory Records ({filtered.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Specialist / Facility</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Contact</th>
                <th className="py-2.5 px-3">Address & Coordinates</th>
                <th className="py-2.5 px-3">Service Radius</th>
                <th className="py-2.5 px-3 text-center">Verified</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-pankh-clay">{item.name}</div>
                    <div className="text-[11px] text-stone-500">{item.qualification || "Avian Specialist"}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={cn(
                      "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold",
                      item.type === "VET"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.type === "LAB"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    )}>
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <div>{item.phone}</div>
                    {item.whatsapp && (
                      <span className="text-[10px] text-emerald-700 block">WA: {item.whatsapp}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 max-w-xs">
                    <div className="text-stone-700 truncate">{item.address}</div>
                    <div className="text-[10px] text-stone-400 font-mono">
                      {item.latitude?.toFixed(3)}, {item.longitude?.toFixed(3)}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    {item.serviceRadiusKm ? `${item.serviceRadiusKm} km` : "Statewide"}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleVerification(item.id, item.verified)}
                      className={cn(
                        "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border transition-colors cursor-pointer",
                        item.verified
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-stone-100 text-stone-600 border-stone-300"
                      )}
                    >
                      {item.verified ? "VERIFIED" : "UNVERIFIED"}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(item)}
                        className="h-7 w-7 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 transition-colors"
                        title="Edit specialist details"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="h-7 w-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-stone-400 hover:text-red-700 transition-colors"
                        title="Deactivate / Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Specialist Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-pankh-clay">
                {editingItem ? "Edit Specialist Record" : "Add New Specialist / Diagnostic Lab"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Name / Clinic</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2 bg-stone-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2 bg-stone-50 border rounded-xl cursor-pointer"
                  >
                    <option value="VET">Veterinarian</option>
                    <option value="LAB">Diagnostic Lab</option>
                    <option value="ASSOCIATION">Association</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Phone (Calling)</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-stone-50 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    className="w-full p-2 bg-stone-50 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Qualifications / Degrees</label>
                <input
                  type="text"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  placeholder="e.g. B.V.Sc & A.H., Avian Disease Specialist"
                  className="w-full p-2 bg-stone-50 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Full Clinic Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 bg-stone-50 border rounded-xl"
                />
              </div>

              {/* Coordinates & Radius */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
                    className="w-full p-2 bg-stone-50 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
                    className="w-full p-2 bg-stone-50 border rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Service Radius (km)</label>
                  <input
                    type="number"
                    value={formData.serviceRadiusKm}
                    onChange={(e) => setFormData({ ...formData, serviceRadiusKm: Number(e.target.value) })}
                    className="w-full p-2 bg-stone-50 border rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Specializations (comma separated)</label>
                <input
                  type="text"
                  value={formData.specializations}
                  onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                  className="w-full p-2 bg-stone-50 border rounded-xl"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={formData.teleconsult}
                    onChange={(e) => setFormData({ ...formData, teleconsult: e.target.checked })}
                    className="h-4 w-4 rounded"
                  />
                  <span>Teleconsult Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={formData.verified}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="h-4 w-4 rounded"
                  />
                  <span>Mark as Verified Specialist</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-pankh-indigo hover:bg-slate-900 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
