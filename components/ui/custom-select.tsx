"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
  value: string;
  label: string;
  sublabel?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  id?: string;
  name?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  disabled = false,
  className,
  triggerClassName,
  menuClassName,
  id,
  name,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = (optValue: string) => {
    onChange(optValue);
    setIsOpen(false);
  };

  const SelectedIcon = selectedOption?.icon;

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full text-left", className)}
    >
      {/* Hidden input for form data serialization if needed */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Trigger Button */}
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={cn(
          "w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-2 shadow-2xs outline-none cursor-pointer",
          disabled
            ? "bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed"
            : isOpen
            ? "bg-white border-amber-500 ring-2 ring-amber-500/20 text-pankh-clay"
            : "bg-white hover:bg-stone-50/80 border-stone-300 text-pankh-clay",
          triggerClassName
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {SelectedIcon && (
            <SelectedIcon className="h-4 w-4 shrink-0 text-amber-600" />
          )}
          <div className="truncate">
            {selectedOption ? (
              <span className="truncate block font-semibold">
                {selectedOption.label}
              </span>
            ) : (
              <span className="text-stone-400 font-normal">{placeholder}</span>
            )}
          </div>
        </div>

        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-stone-500 transition-transform duration-200",
            isOpen && "rotate-180 text-amber-600"
          )}
        />
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div
          role="listbox"
          className={cn(
            "absolute left-0 right-0 mt-1.5 rounded-2xl bg-white border border-stone-200 shadow-xl py-1.5 px-1 z-50 max-h-64 overflow-y-auto no-scrollbar animate-in fade-in zoom-in-95 duration-150",
            menuClassName
          )}
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-xs text-stone-400 italic text-center">
              No options available
            </div>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === value;
              const OptIcon = opt.icon;

              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer my-0.5",
                    isSelected
                      ? "bg-amber-50/90 text-amber-950 font-bold border border-amber-200/80"
                      : "text-stone-700 hover:bg-stone-100/80 hover:text-stone-900 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {OptIcon && (
                      <OptIcon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isSelected ? "text-amber-700" : "text-stone-400"
                        )}
                      />
                    )}
                    <div className="truncate">
                      <span className="block truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="block text-[10px] text-stone-500 font-normal truncate mt-0.5">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check className="h-3.5 w-3.5 text-amber-700 shrink-0 ml-2" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
