"use client";

import React, { useState } from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  Edit2,
  Save,
  Layers,
  MapPin,
  Phone,
  Mail,
  Shield,
  Clock,
  X,
} from "lucide-react";
import { AdminFarmerListItem, AdminFarmerDetail } from "@/types/admin";
import { getFarmerDetailAction, updateFarmerNoteAction } from "@/actions/admin";
import { cn } from "@/lib/utils";

interface FarmersDirectoryViewProps {
  initialFarmers: AdminFarmerListItem[];
}

export function FarmersDirectoryView({ initialFarmers }: FarmersDirectoryViewProps) {
  const [farmers, setFarmers] = useState<AdminFarmerListItem[]>(initialFarmers);
  const [search, setSearch] = useState("");
  const [districtFilter, setDistrictFilter] = useState("ALL");
  const [selectedFarmerDetail, setSelectedFarmerDetail] = useState<AdminFarmerDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [adminNoteText, setAdminNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  // Extract unique districts
  const districts = Array.from(new Set(initialFarmers.map((f) => f.district).filter(Boolean)));

  const filtered = farmers.filter((f) => {
    if (districtFilter !== "ALL" && f.district.toLowerCase() !== districtFilter.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        f.name.toLowerCase().includes(q) ||
        f.village.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q) ||
        f.phone.toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenDetail = async (farmerId: string) => {
    setIsLoadingDetail(true);
    const res = await getFarmerDetailAction(farmerId);
    setIsLoadingDetail(false);
    if (res.success && res.farmer) {
      setSelectedFarmerDetail(res.farmer);
      setAdminNoteText(res.farmer.adminNotes || "");
    }
  };

  const handleSaveNote = async () => {
    if (!selectedFarmerDetail) return;
    setIsSavingNote(true);
    const res = await updateFarmerNoteAction(selectedFarmerDetail.id, adminNoteText);
    setIsSavingNote(false);
    if (res.success) {
      setSelectedFarmerDetail({
        ...selectedFarmerDetail,
        adminNotes: adminNoteText,
      });
      setFarmers((prev) =>
        prev.map((f) =>
          f.id === selectedFarmerDetail.id ? { ...f, adminNotes: adminNoteText } : f
        )
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="h-4 w-4 text-stone-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, village, email..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-stone-600 shrink-0">District:</span>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Districts ({initialFarmers.length})</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Farmers Table */}
      <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-700" />
            <h3 className="font-serif text-base font-bold text-pankh-clay">
              Registered Farmers ({filtered.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Farmer</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Language</th>
                <th className="py-2.5 px-3">Farms / Batches</th>
                <th className="py-2.5 px-3">Consent Status</th>
                <th className="py-2.5 px-3">Admin Notes</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-bold text-pankh-clay">{f.name}</div>
                    <div className="text-[11px] text-stone-500 font-mono">{f.phone}</div>
                  </td>
                  <td className="py-3 px-3">
                    <div className="text-stone-800">{f.village}</div>
                    <div className="text-[10px] text-stone-500">{f.district}, {f.state}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 uppercase">
                      {f.preferredLanguage}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono">
                    <span className="font-bold text-pankh-clay">{f.farmsCount}</span> farms •{" "}
                    <span className="font-bold text-emerald-700">{f.activeBatchesCount}</span> active
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "text-[9px] font-mono px-1.5 py-0.2 rounded font-bold",
                          f.consentDataShare
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-200 text-stone-600"
                        )}
                        title="Vet Teleconsult Data Sharing Consent"
                      >
                        Data: {f.consentDataShare ? "YES" : "NO"}
                      </span>
                      <span
                        className={cn(
                          "text-[9px] font-mono px-1.5 py-0.2 rounded font-bold",
                          f.consentMediaShare
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-stone-200 text-stone-600"
                        )}
                        title="Media / Photo Sharing Consent"
                      >
                        Media: {f.consentMediaShare ? "YES" : "NO"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 max-w-xs truncate text-[11px] text-stone-600">
                    {f.adminNotes || "—"}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleOpenDetail(f.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Eye className="h-3 w-3" />
                      <span>Inspect</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Farmer Drill-Down Modal / Drawer */}
      {selectedFarmerDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-6 shadow-xl border border-stone-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 text-indigo-900 font-bold">
                  Farmer ID: {selectedFarmerDetail.id.slice(-6)}
                </span>
                <h3 className="font-serif text-xl font-bold text-pankh-clay mt-1">
                  {selectedFarmerDetail.name}
                </h3>
                <p className="text-xs text-stone-500">
                  {selectedFarmerDetail.village}, {selectedFarmerDetail.district}, {selectedFarmerDetail.state}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFarmerDetail(null)}
                className="h-8 w-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile & Consent */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-4 rounded-2xl">
              <div>
                <span className="text-[10px] font-bold uppercase text-stone-500 block">Contact</span>
                <span className="font-mono font-bold">{selectedFarmerDetail.phone}</span>
                <span className="block text-stone-500 text-[11px]">{selectedFarmerDetail.email}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-stone-500 block">Consent State</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold font-mono", selectedFarmerDetail.consentDataShare ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800")}>
                    Data: {selectedFarmerDetail.consentDataShare ? "Authorized" : "Withheld"}
                  </span>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold font-mono", selectedFarmerDetail.consentMediaShare ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800")}>
                    Media: {selectedFarmerDetail.consentMediaShare ? "Authorized" : "Withheld"}
                  </span>
                </div>
              </div>
            </div>

            {/* Farms & Batches */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-stone-700 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <Layers className="h-3.5 w-3.5 text-indigo-700" />
                Farms & Flock Batches ({selectedFarmerDetail.farms.length})
              </h4>
              <div className="space-y-3">
                {selectedFarmerDetail.farms.map((farm) => (
                  <div key={farm.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span>{farm.name}</span>
                      <span className="font-mono text-stone-500">Cap: {farm.capacity} birds • {farm.shedCount} sheds</span>
                    </div>
                    {farm.batches.map((b) => (
                      <div key={b.id} className="p-2.5 rounded-xl bg-white border border-stone-200 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold">{b.birdType} ({b.breed})</span>
                          <span className="text-stone-500 block">Placed: {b.placementDate}</span>
                        </div>
                        <div className="text-right font-mono">
                          <span className="font-bold text-pankh-clay">{b.currentBirds}</span> / {b.startingBirds} birds
                          <span className="text-[10px] font-bold block text-emerald-700">{b.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Internal Note Editor */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="block text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <Edit2 className="h-3.5 w-3.5 text-amber-600" />
                Administrative Internal Notes
              </label>
              <textarea
                rows={3}
                value={adminNoteText}
                onChange={(e) => setAdminNoteText(e.target.value)}
                placeholder="Add operational notes, support issues, phone follow-up record..."
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isSavingNote}
                  onClick={handleSaveNote}
                  className="px-4 py-2 bg-pankh-indigo hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isSavingNote ? "Saving..." : "Save Note"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
