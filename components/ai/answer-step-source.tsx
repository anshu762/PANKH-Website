"use client";

import React, { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { SourceMeta } from "@/types/ai";

interface AnswerStepSourceProps {
  label: string;
  sourceTitle: string;
  sourceAuthority?: string;
  sources?: SourceMeta[];
}

export function AnswerStepSource({
  label,
  sourceTitle,
  sourceAuthority,
  sources = [],
}: AnswerStepSourceProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="pt-2 border-t border-stone-200/80">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200/80 text-stone-700 text-xs font-semibold transition-colors min-h-[36px]"
        >
          <BookOpen className="h-3.5 w-3.5 text-stone-500" />
          <span>
            {label} {sourceTitle}
          </span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5 ml-0.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 ml-0.5" />
          )}
        </button>

        {sourceAuthority && (
          <span className="text-[11px] text-stone-500 italic">
            {sourceAuthority}
          </span>
        )}
      </div>

      {expanded && (
        <div className="mt-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-2 animate-in fade-in">
          <span className="font-bold text-stone-700 uppercase tracking-wider text-[10px]">
            Verified Knowledge Source
          </span>
          <p className="text-stone-700 font-medium">{sourceTitle}</p>
          {sourceAuthority && (
            <p className="text-stone-500">Authority: {sourceAuthority}</p>
          )}
          {sources.length > 0 && (
            <div className="mt-2 pt-2 border-t border-stone-200 space-y-1.5">
              <span className="font-bold text-stone-600 text-[10px]">
                Referenced Chunks:
              </span>
              {sources.map((s, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-white border border-stone-200/60 text-stone-600"
                >
                  <p className="text-[11px] italic">“{s.excerpt}”</p>
                  {s.url && (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-amber-700 hover:underline flex items-center gap-1 mt-1 font-semibold"
                    >
                      Official Guidelines Link <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
