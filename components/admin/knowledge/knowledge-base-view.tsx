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
    tags: "broiler, disease, management",
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

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
            Approved Sources in RAG
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">
            {approvedCount} / {sources.length}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            Strictly queried by Pankh AI generator
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
            1536-Dim Vector Chunks
          </span>
          <div className="text-2xl font-bold font-mono text-indigo-900 mt-1">
            {totalChunks}
          </div>
          <p className="text-[11px] text-stone-500 mt-0.5">
            pgvector indexed embeddings in Neon
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-stone-500 font-bold block">
              Curate Content
            </span>
            <span className="text-xs font-bold text-pankh-clay block mt-1">
              Add Verified Extension Source
            </span>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-pankh-indigo hover:bg-slate-900 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Source</span>
          </button>
        </div>
      </div>

      {/* Sources Table */}
      <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-amber-700" />
            <h3 className="font-serif text-base font-bold text-pankh-clay">
              Verified Agricultural Knowledge Sources ({sources.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Title & Authority</th>
                <th className="py-2.5 px-3">Topic</th>
                <th className="py-2.5 px-3">Version</th>
                <th className="py-2.5 px-3 text-center">Chunks (Vectors)</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {sources.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3 px-3 max-w-md">
                    <div className="font-bold text-pankh-clay line-clamp-1">{s.title}</div>
                    <div className="text-[11px] text-stone-500">{s.authority}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-700 uppercase">
                      {s.topic}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-stone-600">
                    v{s.version} ({s.language})
                  </td>
                  <td className="py-3 px-3 text-center font-mono font-bold text-indigo-950">
                    {s.chunkCount}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleApproval(s.id, s.approved)}
                      className={cn(
                        "text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border transition-colors cursor-pointer",
                        s.approved
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : "bg-stone-100 text-stone-600 border-stone-300"
                      )}
                      title="Toggle approval state (triggers pgvector re-indexing on approval)"
                    >
                      {s.approved ? "APPROVED" : "INACTIVE"}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedSource(s)}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
                    >
                      View Chunks
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Chunks Modal */}
      {selectedSource && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-7 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-start justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                  {selectedSource.approved ? "Approved for RAG" : "Inactive"}
                </span>
                <h3 className="font-serif text-lg font-bold text-pankh-clay mt-1">
                  {selectedSource.title}
                </h3>
                <p className="text-xs text-stone-500">{selectedSource.authority}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSource(null)}
                className="h-8 w-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider font-mono">
                Indexed Text Chunks ({selectedSource.chunks?.length || 0})
              </h4>
              {selectedSource.chunks?.map((ch, idx) => (
                <div key={ch.id} className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono text-stone-500">
                    <span>Chunk #{idx + 1} • Type: {ch.birdType || "BOTH"}</span>
                    <span>ID: {ch.id.slice(-6)}</span>
                  </div>
                  <p className="text-stone-800 leading-relaxed font-sans">{ch.content}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {ch.tags.map((t) => (
                      <span key={t} className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-stone-200 text-stone-700">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Source Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="font-serif text-lg font-bold text-pankh-clay">
                Add Knowledge Source & Index Chunks
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSource} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Source Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Biosecurity Guidelines for Commercial Broiler Sheds"
                  className="w-full p-2.5 bg-stone-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Authoritative Body</label>
                  <input
                    type="text"
                    required
                    value={formData.authority}
                    onChange={(e) => setFormData({ ...formData, authority: e.target.value })}
                    className="w-full p-2 bg-stone-50 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Topic</label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full p-2 bg-stone-50 border rounded-xl"
                  >
                    <option value="health">Flock Health</option>
                    <option value="feed">Feed & Nutrition</option>
                    <option value="vaccine">Vaccination</option>
                    <option value="hygiene">Biosecurity & Hygiene</option>
                    <option value="weather">Heat & Weather Stress</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Initial Chunk Text Content</label>
                <textarea
                  rows={4}
                  required
                  value={formData.chunkContent}
                  onChange={(e) => setFormData({ ...formData, chunkContent: e.target.value })}
                  placeholder="Enter the factual, clinical text snippet that will be vector-embedded for RAG search..."
                  className="w-full p-2.5 bg-stone-50 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Bird Type</label>
                  <select
                    value={formData.birdType}
                    onChange={(e) => setFormData({ ...formData, birdType: e.target.value })}
                    className="w-full p-2 bg-stone-50 border rounded-xl"
                  >
                    <option value="BROILER">Commercial Broiler</option>
                    <option value="LAYER">Layer Flock</option>
                    <option value="BOTH">Both / All Flocks</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Search Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full p-2 bg-stone-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <label className="flex items-center gap-2 font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.approved}
                    onChange={(e) => setFormData({ ...formData, approved: e.target.checked })}
                    className="h-4 w-4 rounded"
                  />
                  <span>Auto-approve & trigger pgvector 1536-dim embedding</span>
                </label>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-pankh-indigo hover:bg-slate-900 text-white rounded-xl font-bold disabled:opacity-50"
                >
                  {isSaving ? "Embedding & Saving..." : "Save & Index"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
