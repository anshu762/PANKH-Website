"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  TrendingDown,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
  Save,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { BatchOption } from "@/types/economics";
import { createTransactionAction } from "@/actions/economics";
import { EXPENSE_CATEGORIES, REVENUE_CATEGORIES } from "@/schemas/economics";
import { getCategoryLabel } from "@/lib/economics/calculations";
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";

interface TransactionAddFormProps {
  batches: BatchOption[];
  preselectedBatchId?: string | null;
}

const DRAFT_STORAGE_KEY = "pankh_economics_draft_tx";
const LAST_USED_STORAGE_KEY = "pankh_economics_last_unit_price";

interface RememberedData {
  [category: string]: {
    unit: string;
    unitPrice?: number;
  };
}

export function TransactionAddForm({
  batches,
  preselectedBatchId,
}: TransactionAddFormProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const d = t.economics;

  // Form State
  const [batchId, setBatchId] = useState<string>(
    preselectedBatchId || batches[0]?.id || ""
  );
  const [type, setType] = useState<"EXPENSE" | "REVENUE">("EXPENSE");
  const [category, setCategory] = useState<string>("feed-starter");
  const [amount, setAmount] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [unit, setUnit] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState<string>("");

  // System & UI State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [rememberedData, setRememberedData] = useState<RememberedData>({});

  // 1. Load remembered last-used units/prices and restore draft on mount
  useEffect(() => {
    try {
      const storedRemembered = localStorage.getItem(LAST_USED_STORAGE_KEY);
      if (storedRemembered) {
        setRememberedData(JSON.parse(storedRemembered));
      }

      const storedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (storedDraft) {
        const draft = JSON.parse(storedDraft);
        if (draft.batchId && batches.some((b) => b.id === draft.batchId)) {
          setBatchId(draft.batchId);
        }
        if (draft.type) setType(draft.type);
        if (draft.category) setCategory(draft.category);
        if (draft.amount) setAmount(draft.amount);
        if (draft.quantity) setQuantity(draft.quantity);
        if (draft.unit) setUnit(draft.unit);
        if (draft.date) setDate(draft.date);
        if (draft.note) setNote(draft.note);
        setDraftRestored(true);
      }
    } catch (e) {
      console.warn("Could not access localStorage:", e);
    }
  }, [batches]);

  // 2. Persist draft to localStorage on changes (Hard Rule #7)
  useEffect(() => {
    // Only save if at least some data is entered
    if (amount || quantity || note) {
      try {
        const draft = {
          batchId,
          type,
          category,
          amount,
          quantity,
          unit,
          date,
          note,
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      } catch (e) {
        console.warn("Could not save draft:", e);
      }
    }
  }, [batchId, type, category, amount, quantity, unit, date, note]);

  // Suggest remembered unit & price when category changes
  const remembered = rememberedData[category];

  const handleApplyRemembered = () => {
    if (!remembered) return;
    if (remembered.unit) setUnit(remembered.unit);
    if (remembered.unitPrice && quantity) {
      const q = parseFloat(quantity);
      if (!isNaN(q) && q > 0) {
        setAmount(String(Math.round(q * remembered.unitPrice)));
      }
    } else if (remembered.unitPrice && !amount) {
      setAmount(String(remembered.unitPrice));
    }
  };

  const handleTypeChange = (newType: "EXPENSE" | "REVENUE") => {
    setType(newType);
    if (newType === "EXPENSE") {
      setCategory("feed-starter");
    } else {
      setCategory("sales-birds");
    }
  };

  // Quick unit recalculation if user types quantity and we know unit price
  const handleQuantityChange = (val: string) => {
    setQuantity(val);
    const q = parseFloat(val);
    if (!isNaN(q) && q > 0 && remembered?.unitPrice && (!amount || amount === "0")) {
      setAmount(String(Math.round(q * remembered.unitPrice)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Please enter a valid amount greater than ₹0");
      return;
    }

    if (!batchId) {
      setErrorMessage("Please select a flock batch");
      return;
    }

    setIsSubmitting(true);

    try {
      const parsedQty = quantity ? parseFloat(quantity) : undefined;
      const res = await createTransactionAction({
        batchId,
        type,
        category,
        amount: parsedAmount,
        quantity: parsedQty && !isNaN(parsedQty) ? parsedQty : null,
        unit: unit.trim() ? unit.trim() : null,
        date,
        note: note.trim() ? note.trim() : null,
      });

      if (!res.success) {
        setErrorMessage(res.error || "Failed to record transaction. Draft is preserved.");
        setIsSubmitting(false);
        return;
      }

      // Success: Save remembered unit & unit price for category
      try {
        const nextRemembered = { ...rememberedData };
        let unitPrice: number | undefined = undefined;
        if (parsedQty && parsedQty > 0) {
          unitPrice = Math.round((parsedAmount / parsedQty) * 100) / 100;
        }
        nextRemembered[category] = {
          unit: unit.trim() || remembered?.unit || "",
          unitPrice: unitPrice ?? remembered?.unitPrice,
        };
        localStorage.setItem(LAST_USED_STORAGE_KEY, JSON.stringify(nextRemembered));

        // Clear draft upon verified success
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch (e) {
        console.warn("Storage error:", e);
      }

      // Redirect back to economics ledger
      router.push("/dashboard/economics");
      router.refresh();
    } catch (err: any) {
      console.error("Submission error:", err);
      setErrorMessage("Network error occurred. Your draft has been preserved. Please retry.");
      setIsSubmitting(false);
    }
  };

  const categoryList = type === "EXPENSE" ? EXPENSE_CATEGORIES : REVENUE_CATEGORIES;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/economics"
            className="h-10 w-10 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 flex items-center justify-center text-stone-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold text-pankh-clay">
              {d.addTransactionTitle}
            </h1>
            <p className="text-xs text-stone-500">
              {d.addTransactionSubtitle}
            </p>
          </div>
        </div>
      </div>

      {draftRestored && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs text-amber-900 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-700 shrink-0" />
            <span>{d.draftRestored}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              try {
                localStorage.removeItem(DRAFT_STORAGE_KEY);
              } catch (_) {}
              setDraftRestored(false);
              setAmount("");
              setQuantity("");
              setNote("");
            }}
            className="text-[11px] underline font-bold text-amber-950"
          >
            Clear Draft
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-900 animate-in fade-in">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Submission Failed:</span> {errorMessage}
          </div>
        </div>
      )}

      {/* Main Entry Card */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200 shadow-sm space-y-6">
        {/* 1. Batch Selection */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-indigo-700" />
            {d.batchSelectorLabel}
          </label>
          <CustomSelect
            value={batchId}
            onChange={setBatchId}
            options={batches.map((b) => ({
              value: b.id,
              label: `${b.name} (${b.startingBirds.toLocaleString("en-IN")} birds)`,
              sublabel: `Flock Status: ${b.status}`,
            }))}
            placeholder="Select flock batch..."
          />
        </div>

        {/* 2. Type Selector (Expense vs Revenue) */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleTypeChange("EXPENSE")}
              className={cn(
                "h-12 rounded-2xl border-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all cursor-pointer",
                type === "EXPENSE"
                  ? "border-pankh-clay bg-stone-900 text-white shadow-xs"
                  : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
              )}
            >
              <TrendingDown className="h-4 w-4" />
              <span>{d.typeExpense}</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange("REVENUE")}
              className={cn(
                "h-12 rounded-2xl border-2 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all cursor-pointer",
                type === "REVENUE"
                  ? "border-emerald-700 bg-emerald-700 text-white shadow-xs"
                  : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
              )}
            >
              <TrendingUp className="h-4 w-4" />
              <span>{d.typeRevenue}</span>
            </button>
          </div>
        </div>

        {/* 3. Category Selector */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-stone-700">
              {d.categoryLabel}
            </label>
            {remembered && (
              <button
                type="button"
                onClick={handleApplyRemembered}
                className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="h-3 w-3" />
                {d.rememberedPriceTip
                  .replace("{price}", String(remembered.unitPrice || "—"))
                  .replace("{unit}", remembered.unit || "unit")}
              </button>
            )}
          </div>
          <CustomSelect
            value={category}
            onChange={setCategory}
            options={categoryList.map((cat) => ({
              value: cat,
              label: getCategoryLabel(cat),
            }))}
            placeholder="Select category..."
          />
        </div>

        {/* 4. Amount Field (Prominent INR) */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            {d.amountLabel} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-sm font-bold font-mono text-stone-500">
              ₹
            </span>
            <input
              type="number"
              step="any"
              min="0.01"
              required
              value={amount}
              onFocus={(e) => e.target.select()}
              onChange={(e) =>
                setAmount(e.target.value.replace(/^0+(?=\d)/, ""))
              }
              placeholder={d.amountPlaceholder}
              className="w-full pl-8 pr-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-base font-bold text-pankh-clay focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* 5. Quantity & Unit (Optional, with fast autofill) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {d.qtyLabel}
            </label>
            <input
              type="number"
              step="any"
              value={quantity}
              onFocus={(e) => e.target.select()}
              onChange={(e) =>
                handleQuantityChange(e.target.value.replace(/^0+(?=\d)/, ""))
              }
              placeholder={d.qtyPlaceholder}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              {d.unitLabel}
            </label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder={d.unitPlaceholder}
              className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* 6. Date Picker */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            {d.dateLabel}
          </label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* 7. Notes / Voucher description */}
        <div>
          <label className="block text-xs font-bold text-stone-700 mb-1.5">
            {d.notesLabel}
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={d.notesPlaceholder}
            className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Submit & Offline Protection Note */}
        <div className="pt-2 space-y-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 rounded-xl bg-pankh-indigo hover:bg-slate-900 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{isSubmitting ? d.submittingBtn : d.submitBtn}</span>
          </button>

          <p className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>{d.draftSavedAlert}</span>
          </p>
        </div>
      </form>
    </div>
  );
}
