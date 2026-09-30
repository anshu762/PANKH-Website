"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Filter,
  Plus,
  Trash2,
  Edit2,
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { TransactionRecord } from "@/types/economics";
import { getCategoryLabel } from "@/lib/economics/calculations";
import {
  deleteTransactionAction,
  updateTransactionAction,
} from "@/actions/economics";
import { cn } from "@/lib/utils";

interface EconomicsTransactionTableProps {
  transactions: TransactionRecord[];
  onRefresh: () => void;
}

export function EconomicsTransactionTable({
  transactions,
  onRefresh,
}: EconomicsTransactionTableProps) {
  const { t } = useLanguage();
  const d = t.economics;

  const [filterType, setFilterType] = useState<"ALL" | "EXPENSE" | "REVENUE">("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingTx, setEditingTx] = useState<TransactionRecord | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [editNote, setEditNote] = useState<string>("");
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Extract distinct categories
  const categories = Array.from(new Set(transactions.map((tx) => tx.category)));

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    if (filterType !== "ALL" && tx.type !== filterType) return false;
    if (selectedCategory !== "ALL" && tx.category !== selectedCategory) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction record?")) {
      return;
    }
    setDeletingId(id);
    setActionError(null);

    const res = await deleteTransactionAction(id);
    setDeletingId(null);

    if (res.success) {
      onRefresh();
    } else {
      setActionError(res.error || "Failed to delete transaction");
    }
  };

  const handleStartEdit = (tx: TransactionRecord) => {
    setEditingTx(tx);
    setEditAmount(String(tx.amount));
    setEditNote(tx.note || "");
    setActionError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingTx) return;
    const num = parseFloat(editAmount);
    if (isNaN(num) || num <= 0) {
      setActionError("Amount must be a positive number");
      return;
    }

    setIsSubmittingEdit(true);
    setActionError(null);

    const res = await updateTransactionAction({
      id: editingTx.id,
      amount: num,
      note: editNote,
    });

    setIsSubmittingEdit(false);

    if (res.success) {
      setEditingTx(null);
      onRefresh();
    } else {
      setActionError(res.error || "Failed to update transaction");
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-4">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-pankh-clay">
              {d.tableTitle}
            </h3>
            <p className="text-[11px] text-stone-500">
              {filtered.length} vouchers recorded
            </p>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter Buttons */}
          <div className="inline-flex rounded-xl bg-stone-100 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterType("ALL")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-colors cursor-pointer",
                filterType === "ALL"
                  ? "bg-white text-pankh-clay shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              {d.filterAll}
            </button>
            <button
              type="button"
              onClick={() => setFilterType("EXPENSE")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-colors cursor-pointer",
                filterType === "EXPENSE"
                  ? "bg-white text-pankh-clay shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              {d.filterExpenses}
            </button>
            <button
              type="button"
              onClick={() => setFilterType("REVENUE")}
              className={cn(
                "px-3 py-1.5 rounded-lg transition-colors cursor-pointer",
                filterType === "REVENUE"
                  ? "bg-white text-pankh-clay shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              )}
            >
              {d.filterRevenues}
            </button>
          </div>

          {/* Category Dropdown Filter */}
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs text-stone-700 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat).split("(")[0].trim()}
                </option>
              ))}
            </select>
          )}

          <Link
            href="/dashboard/economics/add"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-950 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add</span>
          </Link>
        </div>
      </div>

      {actionError && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Table Data */}
      {filtered.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">{d.colDate}</th>
                <th className="py-2.5 px-3">{d.colType}</th>
                <th className="py-2.5 px-3">{d.colCategory}</th>
                <th className="py-2.5 px-3 text-right">{d.colAmount}</th>
                <th className="py-2.5 px-3">{d.colQtyUnit}</th>
                <th className="py-2.5 px-3">{d.colNotes}</th>
                <th className="py-2.5 px-3 text-right">{d.colActions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((tx) => {
                const dateFormatted = new Date(tx.date).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <tr key={tx.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono text-stone-600 whitespace-nowrap">
                      {dateFormatted}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {tx.type === "EXPENSE" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 font-semibold text-[10px]">
                          <ArrowDownRight className="h-3 w-3 text-stone-600" />
                          Expense
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-semibold text-[10px]">
                          <ArrowUpRight className="h-3 w-3 text-emerald-700" />
                          Revenue
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-pankh-clay">
                      {getCategoryLabel(tx.category)}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-right whitespace-nowrap">
                      <span
                        className={
                          tx.type === "EXPENSE" ? "text-pankh-clay" : "text-emerald-700"
                        }
                      >
                        {tx.type === "EXPENSE" ? "-" : "+"}₹
                        {Number(tx.amount).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-stone-600 font-mono whitespace-nowrap">
                      {tx.quantity ? `${tx.quantity} ${tx.unit || ""}` : "—"}
                    </td>
                    <td className="py-3 px-3 text-stone-500 max-w-xs truncate">
                      {tx.note || "—"}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(tx)}
                          className="h-7 w-7 rounded-lg hover:bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800 transition-colors"
                          title="Edit transaction"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === tx.id}
                          onClick={() => handleDelete(tx.id)}
                          className="h-7 w-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-stone-400 hover:text-red-700 transition-colors disabled:opacity-50"
                          title="Delete transaction"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-8 text-center space-y-2">
          <p className="text-xs text-stone-500">{d.noTransactions}</p>
          <Link
            href="/dashboard/economics/add"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-pankh-indigo text-white font-bold text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Record First Entry</span>
          </Link>
        </div>
      )}

      {/* Quick Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-stone-200">
            <h4 className="font-serif text-lg font-bold text-pankh-clay">
              Edit Transaction
            </h4>
            <p className="text-xs text-stone-500">
              {getCategoryLabel(editingTx.category)} ({editingTx.type})
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono text-sm"
                  min={1}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs"
                  placeholder="Notes / Invoice"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmittingEdit}
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-pankh-indigo hover:bg-slate-900 text-white disabled:opacity-50"
              >
                {isSubmittingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
