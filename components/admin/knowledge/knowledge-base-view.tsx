"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Plus,
  CheckCircle2,
  XCircle,
  Database,
  ExternalLink,
  Edit2,
  Layers,
  Sparkles,
  X,
  Save,
  ShieldCheck,
  Search,
  Filter,
  Check,
  FileText,
} from "lucide-react";
import { AdminKnowledgeSourceItem } from "@/types/admin";
import {
  upsertKnowledgeSourceAction,
  toggleKnowledgeSourceApprovalAction,
} from "@/actions/admin";
import { cn } from "@/lib/utils";

interface KnowledgeBaseViewProps {
  initialSources: AdminKnowledgeSourceItem[];
}

export function KnowledgeBaseView({ initialSources }: KnowledgeBaseViewProps) {
  const [sources, setSources] = useState<AdminKnowledgeSourceItem[]>(initialSources);
  const [selectedSource, setSelectedSource] = useState<AdminKnowledgeSourceItem | null>(null);
  const [search, setSearch] = useState("");
  const [topicFilter, setTopicFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for creating a new source
  const [formData, setFormData] = useState({
    title: "",
    authority: "GADVASU Ludhiana / ICAR",
    topic: "health",
    language: "en",
    version: "2026.1",
    url: "",
    approved: true,
    chunkContent: "",
    birdType: "BROILER",
    tags: "broiler, disease, biosecurity",
  });

  const handleToggleApproval = async (id: string, current: boolean) => {
    const nextVal = !current;
    const res = await toggleKnowledgeSourceApprovalAction(id, nextVal);
    if (res.success) {
      setSources((prev) =>
        prev.map((s) => (s.id === id ? { ...s, approved: nextVal } : s))
      );
    }
  };

  const handleOpenCreate = () => {
    setFormData({
      title: "",
      authority: "GADVASU Ludhiana / ICAR-CPDO",
      topic: "health",
      language: "en",
      version: "2026.1",
      url: "",
      approved: true,
      chunkContent: "",
      birdType: "BROILER",
      tags: "disease, biosecurity, symptom",
    });
    setIsModalOpen(true);
  };

  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const tagsArr = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await upsertKnowledgeSourceAction({
      title: formData.title,
      authority: formData.authority,
      topic: formData.topic,
      language: formData.language,
      version: formData.version,
      url: formData.url || null,
      approved: formData.approved,
      chunks: formData.chunkContent.trim()
        ? [
            {
              content: formData.chunkContent.trim(),
              birdType: formData.birdType,
              tags: tagsArr,
            },
          ]
        : [],
    });

    setIsSaving(false);

    if (res.success) {
      setIsModalOpen(false);
      window.location.reload();
    }
  };

  const approvedCount = sources.filter((s) => s.approved).length;
  const totalChunks = sources.reduce((acc, s) => acc + s.chunkCount, 0);

  const filteredSources = sources.filter((s) => {
    if (topicFilter !== "ALL" && s.topic.toLowerCase() !== topicFilter.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        s.title.toLowerCase().includes(q) ||
        s.authority.toLowerCase().includes(q) ||
        s.topic.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Grounding Compliance Notice */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-2xs flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-amber-800 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-950">
          <p className="font-bold font-serif text-sm">
            Hard Safety Rule 3 & 4 Grounding Guarantee
          </p>
          <p className="leading-relaxed text-stone-700">
            Health and veterinary responses are strictly prohibited from raw model generation. All answers are retrieved from this
            approved knowledge base via pgvector embeddings before passing through the red-flag rules engine. Citations must reflect actual retrieved sources.
          </p>
        </div>
      </div>

      {/* 2. Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-emerald-900">
              Approved Sources in RAG
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-700">
            {approvedCount} <span className="text-sm font-sans font-normal text-stone-500">/ {sources.length}</span>
          </div>
          <p className="text-[11px] text-stone-500">
            Strictly queried by Pankh AI generator
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-stone-500">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-amber-900">
              Vector Chunks Indexed
            </span>
            <Database className="h-4 w-4 text-amber-700" />
          </div>
          <div className="text-3xl font-bold font-mono text-pankh-clay">
            {totalChunks}
          </div>
          <p className="text-[11px] text-stone-500">
            1536-dim pgvector embeddings in Neon
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-stone-600">
              Knowledge Curation
            </span>
            <p className="text-xs font-bold text-pankh-clay font-serif">
              Upload New Research Literature
            </p>
            <p className="text-[10px] text-stone-500 font-mono">
              GADVASU / ICAR / CPDO
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Source</span>
          </button>
        </div>
      </div>

      {/* 3. Search and Topic Filter Controls */}
      <div className="p-4 rounded-2xl bg-white border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="h-4 w-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search literature title, authority, or topic..."
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-stone-600 shrink-0 font-mono">
            Topic:
          </span>
          <select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer font-sans"
          >
            <option value="ALL">All Topics</option>
            <option value="health">Flock Health & Pathology</option>
            <option value="biosecurity">Biosecurity & Sanitation</option>
            <option value="nutrition">Nutrition & Feed</option>
            <option value="management">Shed Management</option>
          </select>
        </div>
      </div>

      {/* 4. Sources Table */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-800">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-pankh-clay">
                Verified Agricultural Knowledge Sources ({filteredSources.length})
              </h3>
              <p className="text-[11px] text-stone-500">
                Peer-reviewed poultry manuals and extension advisories indexed in pgvector
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px] font-mono">
                <th className="py-3 px-3">Title & Authority</th>
                <th className="py-3 px-3">Topic</th>
                <th className="py-3 px-3">Version & Lang</th>
                <th className="py-3 px-3 text-center">Vector Chunks</th>
                <th className="py-3 px-3 text-center">RAG Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredSources.map((s) => (
                <tr key={s.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                  <td className="py-3.5 px-3 max-w-md">
                    <div className="font-serif font-bold text-sm text-pankh-clay line-clamp-1">
                      {s.title}
                    </div>
                    <div className="text-[11px] text-amber-900 font-medium font-mono mt-0.5">
                      {s.authority}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 uppercase font-bold border border-stone-200">
                      {s.topic}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 font-mono text-stone-600 text-[11px]">
                    v{s.version} ({s.language.toUpperCase()})
                  </td>

                  <td className="py-3.5 px-3 text-center font-mono font-bold text-pankh-clay">
                    <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200">
                      {s.chunkCount} chunks
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-center">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border",
                        s.approved
                          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                          : "bg-stone-100 text-stone-600 border-stone-200"
                      )}
                    >
                      {s.approved ? (
                        <>
                          <Check className="h-2.5 w-2.5" />
                          <span>APPROVED</span>
                        </>
                      ) : (
                        <span>PENDING</span>
                      )}
                    </span>
                  </td>

                  <td className="py-3.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedSource(s)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold border border-stone-200 transition-colors shadow-2xs cursor-pointer"
                      >
                        <FileText className="h-3 w-3 text-amber-800" />
                        <span>Chunks</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleApproval(s.id, s.approved)}
                        className={cn(
                          "px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer",
                          s.approved
                            ? "bg-stone-100 hover:bg-amber-100 text-stone-700 border-stone-200"
                            : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200"
                        )}
                      >
                        {s.approved ? "Disable" : "Approve"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSources.length === 0 && (
          <div className="py-16 text-center text-xs text-stone-400 space-y-2">
            <BookOpen className="h-8 w-8 text-stone-300 mx-auto" />
            <p className="text-sm font-bold text-stone-700 font-serif">
              No knowledge sources match your filter
            </p>
            <p className="text-stone-500">
              Try adjusting your search query or topic filter.
            </p>
          </div>
        )}
      </div>

      {/* 5. Chunks Inspection Modal */}
      {selectedSource && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FAF9F5] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-7 space-y-5 shadow-2xl border border-stone-300 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold border border-amber-300">
                  {selectedSource.authority}
                </span>
                <h3 className="font-serif text-lg font-bold text-pankh-clay mt-1">
                  {selectedSource.title}
                </h3>
                <p className="text-xs text-stone-500 font-mono">
                  {selectedSource.chunkCount} vector embeddings indexed
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSource(null)}
                className="h-8 w-8 rounded-lg hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              {selectedSource.chunks && selectedSource.chunks.length > 0 ? (
                selectedSource.chunks.map((c, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
                      <span>Chunk #{idx + 1} ({c.birdType})</span>
                      <div className="flex gap-1">
                        {c.tags.map((t, tidx) => (
                          <span key={tidx} className="px-1.5 py-0.2 rounded bg-stone-100 text-stone-700">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-stone-800 leading-relaxed font-sans text-xs sm:text-sm">
                      {c.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
                  No preview chunks stored directly on this record.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedSource(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 bg-stone-200 hover:bg-stone-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Upload / Add Knowledge Source Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#FAF9F5] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-5 shadow-2xl border border-stone-300 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-800" />
                <h3 className="font-serif font-bold text-lg text-pankh-clay">
                  Add Verified Knowledge Source
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSource} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 font-mono uppercase">Document Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. GADVASU Broiler Health and Biosecurity Manual"
                  className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 font-mono uppercase">Author / Authority *</label>
                  <input
                    type="text"
                    required
                    value={formData.authority}
                    onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-sans"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 font-mono uppercase">Topic Area *</label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-sans"
                  >
                    <option value="health">Health & Pathology</option>
                    <option value="biosecurity">Biosecurity & Sanitization</option>
                    <option value="nutrition">Nutrition & FCR</option>
                    <option value="management">Shed Management</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 font-mono uppercase">Initial Text Chunk for Vectorization</label>
                <textarea
                  rows={4}
                  value={formData.chunkContent}
                  onChange={(e) => setFormData({ ...formData, chunkContent: e.target.value })}
                  placeholder="Paste poultry advisory text here. It will be indexed into pgvector for semantic retrieval..."
                  className="w-full p-3 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 font-mono uppercase">Target Bird Type</label>
                  <select
                    value={formData.birdType}
                    onChange={(e) => setFormData({ ...formData, birdType: e.target.value })}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-sans"
                  >
                    <option value="BROILER">Broiler</option>
                    <option value="LAYER">Layer</option>
                    <option value="DESI">Desi / Backyard</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 font-mono uppercase">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full p-2.5 bg-white border border-stone-300 rounded-xl text-xs font-sans"
                  />
                </div>
              </div>

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
                  <span>{isSaving ? "Indexing..." : "Save & Index"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
