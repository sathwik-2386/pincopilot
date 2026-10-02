'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Copy,
  Check,
  RefreshCw,
  Bookmark,
  ExternalLink,
  Sparkles,
  Link as LinkIcon,
  Tag,
  FileText,
  Package,
  Layers,
  MousePointerClick,
  CheckCircle2,
} from 'lucide-react';
import { KeywordInput } from './keyword-input';
import { PinterestChecklistModal } from './pinterest-checklist-modal';
import { savePin } from '@/lib/storage';
import { PinItem, PinStatus } from '@/types/pin';

interface PinEditorProps {
  productName: string;
  setProductName: (val: string) => void;
  title: string;
  setTitle: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  keywords: string[];
  setKeywords: (val: string[]) => void;
  board: string;
  setBoard: (val: string) => void;
  cta: string;
  setCta: (val: string) => void;
  productUrl: string;
  setProductUrl: (val: string) => void;
  image?: string;
  brand?: string;
  price?: string;
  currency?: string;
  onRegenerate: () => Promise<void>;
  isRegenerating: boolean;
  pinId?: string;
  currentStatus?: PinStatus;
}

export function PinEditor({
  productName,
  setProductName,
  title,
  setTitle,
  description,
  setDescription,
  keywords,
  setKeywords,
  board,
  setBoard,
  cta,
  setCta,
  productUrl,
  setProductUrl,
  image,
  brand,
  price,
  currency,
  onRegenerate,
  isRegenerating,
  pinId,
  currentStatus = 'Draft',
}: PinEditorProps) {
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [status, setStatus] = useState<PinStatus>(currentStatus);

  const copyToClipboard = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleSaveDraft = () => {
    const saved = savePin({
      id: pinId,
      productName,
      productUrl,
      image: image || '',
      title,
      description,
      keywords,
      board,
      cta,
      brand,
      price,
      currency,
      status,
    });

    // Fire custom window event so navbar pin counter updates immediately
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('pinpilot_pins_updated'));
    }

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.8 },
      });
    } catch {}

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-100 p-5 sm:p-7 space-y-6">
      {/* Top Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Pin Editor &amp; SEO Customizer</span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Live Preview Synced
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Refine titles, descriptions, and tags before publishing
          </p>
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as PinStatus)}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-300"
          >
            <option value="Draft">Draft</option>
            <option value="Ready to Publish">Ready to Publish</option>
            <option value="Published">Published</option>
          </select>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-50/80 rounded-2xl border border-slate-200/70">
        <button
          type="button"
          onClick={() => copyToClipboard(title, setCopiedTitle)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
        >
          {copiedTitle ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copiedTitle ? 'Copied Title!' : 'Copy Title'}</span>
        </button>

        <button
          type="button"
          onClick={() => copyToClipboard(description, setCopiedDesc)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
        >
          {copiedDesc ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copiedDesc ? 'Copied Desc!' : 'Copy Description'}</span>
        </button>

        <button
          type="button"
          onClick={() => copyToClipboard(productUrl, setCopiedUrl)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
        >
          {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <LinkIcon className="h-3.5 w-3.5" />}
          <span>{copiedUrl ? 'Copied URL!' : 'Copy URL'}</span>
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-colors shadow-2xs disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? 'animate-spin text-red-600' : ''}`} />
          <span>{isRegenerating ? 'Regenerating...' : 'Regenerate'}</span>
        </button>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <Package className="h-3.5 w-3.5 text-slate-400" />
            <span>Product Name</span>
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
            placeholder="Official product name"
          />
        </div>

        {/* Pinterest Title */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span>Pinterest SEO Title</span>
            </label>
            <span
              className={`text-[11px] font-medium ${
                title.length > 95
                  ? 'text-red-500 font-bold'
                  : title.length > 80
                  ? 'text-amber-500'
                  : 'text-slate-400'
              }`}
            >
              {title.length}/100 chars
            </span>
          </div>
          <input
            type="text"
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all"
            placeholder="Search-optimized, natural title for Pinterest"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Recommended: 40–90 characters. Clear, natural keywords without spam.
          </p>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span>Pin Description</span>
            </label>
            <span
              className={`text-[11px] font-medium ${
                description.length > 480
                  ? 'text-red-500 font-bold'
                  : description.length > 350
                  ? 'text-amber-500'
                  : 'text-slate-400'
              }`}
            >
              {description.length}/500 chars
            </span>
          </div>
          <textarea
            rows={4}
            maxLength={500}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all resize-y"
            placeholder="Engaging product description with natural search keywords and benefits..."
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Naturally include high-traffic Pinterest terms, benefits, and reasons to click.
          </p>
        </div>

        {/* Keywords Tag Input */}
        <KeywordInput keywords={keywords} onChange={setKeywords} />

        {/* Grid for Board, CTA, and Product URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* Pinterest Board */}
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Layers className="h-3.5 w-3.5 text-slate-400" />
              <span>Suggested Board</span>
            </label>
            <input
              type="text"
              value={board}
              onChange={(e) => setBoard(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="e.g. Minimalist Decor"
            />
          </div>

          {/* CTA */}
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <MousePointerClick className="h-3.5 w-3.5 text-slate-400" />
              <span>Call to Action</span>
            </label>
            <input
              type="text"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
              placeholder="e.g. Shop Now"
            />
          </div>
        </div>

        {/* Product URL */}
        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
            <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
            <span>Product / Destination URL</span>
          </label>
          <input
            type="url"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Main Save & Open Pinterest Action Buttons */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={handleSaveDraft}
          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-colors shadow-xs"
        >
          {savedSuccess ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span className="text-emerald-700 font-bold">Saved to History!</span>
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4 text-slate-500" />
              <span>Save Draft to History</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setChecklistOpen(true)}
          className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white bg-red-600 hover:bg-red-700 font-bold text-xs sm:text-sm shadow-lg shadow-red-600/25 transition-all"
        >
          <span>Open Pinterest</span>
          <ExternalLink className="h-4 w-4" />
        </button>
      </div>

      {/* Pinterest Publishing Checklist Modal */}
      <PinterestChecklistModal
        isOpen={checklistOpen}
        onClose={() => setChecklistOpen(false)}
        title={title}
        description={description}
        productUrl={productUrl}
        image={image}
        board={board}
        onMarkPublished={() => {
          setStatus('Ready to Publish');
          handleSaveDraft();
        }}
      />
    </div>
  );
}
