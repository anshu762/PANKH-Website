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
  Warehouse,
  MessageCircle,
  Stethoscope,
  ChevronRight,
  Activity,
  Check,
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

  // Stats calculation
  const totalFarms = farmers.reduce((sum, f) => sum + (f.farmsCount || 0), 0);
  const activeBatches = farmers.reduce((sum, f) => sum + (f.activeBatchesCount || 0), 0);
  const consentedCount = farmers.filter((f) => f.consentDataShare).length;
  const consentRate = farmers.length > 0 ? Math.round((consentedCount / farmers.length) * 100) : 0;

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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Executive Top Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Total Farmers
            </span>
            <Users className="h-4 w-4 text-amber-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-pankh-clay mt-1.5">
            {farmers.length}
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            Registered accounts
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Active Batches
            </span>
            <Activity className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-emerald-700 mt-1.5">
            {activeBatches}
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            Flocks in active cycle
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Commercial Sheds
            </span>
            <Warehouse className="h-4 w-4 text-stone-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-pankh-clay mt-1.5">
            {totalFarms}
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            Registered farm units
          </p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono">
              Teleconsult Consent
            </span>
            <Shield className="h-4 w-4 text-amber-700" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-800 mt-1.5">
            {consentRate}%
          </div>
          <p className="text-[10px] text-stone-500 mt-1">
            {consentedCount} authorized records
          </p>
        </div>
      </div>

      {/* 2. Search & District Filter Controls */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by farmer name, phone, village, district, or email..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-stone-600 shrink-0 font-mono">
            District:
          </span>
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer font-sans"
          >
            <option value="ALL">All Districts ({initialFarmers.length} farmers)</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3. Farmers Directory Table */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-800">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-pankh-clay">
                Farmers & Commercial Sheds ({filtered.length})
              </h3>
              <p className="text-[11px] text-stone-500">
                Registered poultry operations and active biosecurity consent records
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px] font-mono">
                <th className="py-3 px-3">Farmer</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Language</th>
                <th className="py-3 px-3">Flocks & Sheds</th>
                <th className="py-3 px-3">Consent Status</th>
                <th className="py-3 px-3">Admin Notes</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((f) => {
                const cleanPhone = f.phone.replace(/\D/g, "");
                const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                  `Sat Sri Akal ${f.name} ji, Pankh Operations desk se contact kar rahe hain.`
                )}`;

                return (
                  <tr key={f.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                    {/* Farmer Name & Contact */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 font-serif font-bold text-xs flex items-center justify-center shrink-0">
                          {f.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-serif font-bold text-sm text-pankh-clay block">
                            {f.name}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono">
                            <a
                              href={`tel:${f.phone}`}
                              className="hover:text-amber-800 hover:underline flex items-center gap-1"
                            >
                              <Phone className="h-2.5 w-2.5" />
                              {f.phone}
                            </a>
                            <span>•</span>
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 hover:underline"
                            >
                              WhatsApp
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-3">
                      <div className="text-stone-900 font-medium">{f.village}</div>
                      <div className="text-[11px] text-stone-500 font-mono">
                        {f.district}, {f.state}
                      </div>
                    </td>

                    {/* Language */}
                    <td className="py-3.5 px-3">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 uppercase font-bold border border-stone-200">
                        {f.preferredLanguage}
                      </span>
                    </td>

                    {/* Flocks / Sheds */}
                    <td className="py-3.5 px-3 font-mono">
                      <div>
                        <span className="font-bold text-pankh-clay">{f.farmsCount}</span> sheds
                      </div>
                      <div className="text-[11px] text-emerald-700 font-bold">
                        {f.activeBatchesCount} active batch
                      </div>
                    </td>

                    {/* Consent Badges */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border",
                            f.consentDataShare
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                              : "bg-stone-100 text-stone-600 border-stone-200"
                          )}
                          title="Vet Teleconsult Data Sharing Consent"
                        >
                          Data: {f.consentDataShare ? "YES" : "NO"}
                        </span>
                        <span
                          className={cn(
                            "text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border",
                            f.consentMediaShare
                              ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                              : "bg-stone-100 text-stone-600 border-stone-200"
                          )}
                          title="Media Sharing Consent"
                        >
                          Media: {f.consentMediaShare ? "YES" : "NO"}
                        </span>
                      </div>
                    </td>

                    {/* Admin Notes */}
                    <td className="py-3.5 px-3 max-w-xs truncate text-[11px] text-stone-600 italic">
                      {f.adminNotes || "—"}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDetail(f.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-950 font-bold text-xs border border-amber-300 transition-colors cursor-pointer shadow-2xs"
                      >
                        <Eye className="h-3 w-3 text-amber-800" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-xs text-stone-400 space-y-2">
            <Users className="h-8 w-8 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-700 font-serif">
              No farmers found matching your search
            </p>
            <p className="text-stone-500">
              Try adjusting your query or district filter.
            </p>
          </div>
        )}
      </div>

      {/* 4. Farmer Drill-Down Modal / Slide-Over Drawer */}
      {selectedFarmerDetail && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FAF9F5] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-6 shadow-2xl border border-stone-300 animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-stone-200">
              <div className="space-y-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold border border-amber-300">
                  Farmer ID: {selectedFarmerDetail.id.slice(-6)}
                </span>
                <h3 className="font-serif text-2xl font-bold text-pankh-clay">
                  {selectedFarmerDetail.name}
                </h3>
                <p className="text-xs text-stone-500 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-stone-400" />
                  <span>{selectedFarmerDetail.village}, {selectedFarmerDetail.district}, {selectedFarmerDetail.state}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedFarmerDetail(null)}
                className="h-8 w-8 rounded-lg hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Profile & Consent */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-stone-500 block font-mono">Contact Info</span>
                <span className="font-mono font-bold text-sm block mt-0.5">{selectedFarmerDetail.phone}</span>
                <span className="text-stone-500 text-[11px] block">{selectedFarmerDetail.email}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-stone-500 block font-mono">Consent State</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold font-mono border", selectedFarmerDetail.consentDataShare ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-stone-100 text-stone-600 border-stone-200")}>
                    Data: {selectedFarmerDetail.consentDataShare ? "Authorized" : "Withheld"}
                  </span>
                  <span className={cn("text-[10px] px-2 py-0.5 rounded font-bold font-mono border", selectedFarmerDetail.consentMediaShare ? "bg-emerald-100 text-emerald-900 border-emerald-300" : "bg-stone-100 text-stone-600 border-stone-200")}>
                    Media: {selectedFarmerDetail.consentMediaShare ? "Authorized" : "Withheld"}
                  </span>
                </div>
              </div>
            </div>

            {/* Farm Sheds & Batches */}
            <div className="space-y-3">
              <h4 className="font-serif font-bold text-base text-pankh-clay flex items-center gap-2">
                <Warehouse className="h-4 w-4 text-amber-800" />
                <span>Commercial Sheds & Flocks ({selectedFarmerDetail.farms.length})</span>
              </h4>

              <div className="space-y-3">
                {selectedFarmerDetail.farms.map((farm) => (
                  <div key={farm.id} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-pankh-clay font-serif">{farm.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        Cap: {farm.capacity.toLocaleString()} birds
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-500">
                      Type: <strong>{farm.farmType}</strong> • Sheds: <strong>{farm.shedCount}</strong> • Ventilation: <strong>{farm.ventilationType}</strong>
                    </div>

                    {/* Batches under this farm */}
                    <div className="pt-2 border-t border-stone-100 space-y-1.5">
                      <span className="text-[10px] font-bold text-stone-500 uppercase font-mono">
                        Active & Historical Flocks
                      </span>
                      {farm.batches.length === 0 ? (
                        <p className="text-stone-400 italic text-[11px]">No batches placed yet.</p>
                      ) : (
                        farm.batches.map((batch) => (
                          <div key={batch.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-[11px] font-mono">
                            <div>
                              <span className="font-bold text-pankh-clay">{batch.breed}</span> ({batch.birdType})
                              <span className="text-stone-400 ml-1.5">Placed: {new Date(batch.placementDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span>{batch.currentBirds} / {batch.startingBirds} birds</span>
                              <span className={cn("px-1.5 py-0.2 rounded text-[9px] font-bold uppercase", batch.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700")}>
                                {batch.status}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Note Section */}
            <div className="space-y-2 pt-2 border-t border-stone-200">
              <label className="text-xs font-bold text-stone-700 font-mono uppercase block">
                Internal Administrative Notes
              </label>
              <textarea
                rows={3}
                value={adminNoteText}
                onChange={(e) => setAdminNoteText(e.target.value)}
                placeholder="Notes on farm inspection, extension assistance, biosecurity compliance..."
                className="w-full p-3 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isSavingNote}
                  onClick={handleSaveNote}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>{isSavingNote ? "Saving Note..." : "Save Note"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
