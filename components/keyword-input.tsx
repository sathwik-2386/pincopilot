'use client';

import React, { useState, KeyboardEvent } from 'react';
import { X, Plus, Hash, Copy, Check } from 'lucide-react';

interface KeywordInputProps {
  keywords: string[];
  onChange: (keywords: string[]) => void;
  maxKeywords?: number;
}

export function KeywordInput({
  keywords,
  onChange,
  maxKeywords = 15,
}: KeywordInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [copied, setCopied] = useState(false);

  const addTag = (text: string) => {
    const trimmed = text.trim().replace(/^#/, '');
    if (!trimmed) return;
    if (keywords.length >= maxKeywords) return;
    if (!keywords.includes(trimmed)) {
      onChange([...keywords, trimmed]);
    }
    setInputValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && keywords.length > 0) {
      onChange(keywords.slice(0, -1));
    }
  };

  const removeTag = (indexToRemove: number) => {
    onChange(keywords.filter((_, idx) => idx !== indexToRemove));
  };

  const copyAsHashtags = () => {
    const formatted = keywords.map((k) => `#${k.replace(/\s+/g, '')}`).join(' ');
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5 text-slate-400" />
          <span>Pinterest Keywords / Tags</span>
          <span className="text-[11px] font-normal text-slate-400">
            ({keywords.length}/{maxKeywords})
          </span>
        </label>
        {keywords.length > 0 && (
          <button
            type="button"
            onClick={copyAsHashtags}
            className="text-[11px] text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 transition-colors"
            title="Copy as #hashtags for Pinterest"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-600" />
                <span className="text-emerald-600 font-medium">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy Tags</span>
              </>
            )}
          </button>
        )}
      </div>

      <div className="min-h-[72px] p-2 border border-slate-200 rounded-xl bg-slate-50/50 focus-within:bg-white focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all">
        <div className="flex flex-wrap gap-1.5 items-center">
          {keywords.map((tag, idx) => (
            <span
              key={`${tag}-${idx}`}
              className="inline-flex items-center gap-1 bg-white border border-slate-200/80 text-slate-800 text-xs font-medium px-2.5 py-1 rounded-lg shadow-2xs group hover:border-slate-300"
            >
              <span className="text-slate-400 font-normal">#</span>
              <span>{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(idx)}
                className="text-slate-300 hover:text-red-500 rounded p-0.5 transition-colors"
                title="Remove keyword"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}

          {keywords.length < maxKeywords && (
            <div className="inline-flex items-center flex-1 min-w-[130px]">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  keywords.length === 0
                    ? 'Type a keyword & press Enter...'
                    : 'Add keyword...'
                }
                className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 px-2 py-1 outline-none"
              />
              {inputValue.trim() && (
                <button
                  type="button"
                  onClick={() => addTag(inputValue)}
                  className="p-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors"
                  title="Add tag"
                >
                  <Plus className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      <p className="text-[11px] text-slate-400">
        Press <kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">Enter</kbd> or <kbd className="px-1 py-0.5 bg-slate-100 rounded text-slate-600 border border-slate-200">,</kbd> to separate tags. 5-10 targeted keywords recommended for maximum search ranking.
      </p>
    </div>
  );
}
