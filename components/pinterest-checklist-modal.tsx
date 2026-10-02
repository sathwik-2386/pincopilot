'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Download,
  X,
  AlertCircle,
  Pin,
  Sparkles,
} from 'lucide-react';

interface PinterestChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  productUrl: string;
  image?: string;
  board?: string;
  onMarkPublished?: () => void;
}

export function PinterestChecklistModal({
  isOpen,
  onClose,
  title,
  description,
  productUrl,
  image,
  board,
  onMarkPublished,
}: PinterestChecklistModalProps) {
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!isOpen) return null;

  const copyText = (text: string, setter: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const copyBundle = () => {
    const bundle = `TITLE:\n${title}\n\nDESCRIPTION:\n${description}\n\nDESTINATION LINK:\n${productUrl}\n\nSUGGESTED BOARD:\n${board || 'Relevant Product Board'}`;
    navigator.clipboard.writeText(bundle);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2200);
  };

  const handleOpenPinterest = () => {
    if (onMarkPublished) {
      onMarkPublished();
    }
    window.open('https://www.pinterest.com/pin-builder/', '_blank', 'noopener,noreferrer');
  };

  const handleDownloadImage = async () => {
    if (!image) return;
    try {
      const response = await fetch(image, { mode: 'cors' }).catch(() => null);
      if (response && response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `pinterest-pin-${(title || 'product').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } else {
        window.open(image, '_blank');
      }
    } catch {
      window.open(image, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-sm shadow-red-500/30">
              <Pin className="h-5 w-5 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Publishing Checklist
              </h3>
              <p className="text-xs text-slate-500">
                Follow these 4 quick steps to create your pin manually
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Checklist Items */}
        <div className="space-y-3 my-5">
          {/* Item 1: Image */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  1. Product Image Ready
                </p>
                <p className="text-[11px] text-slate-500">
                  {image ? 'High-res image selected' : 'No image detected'}
                </p>
              </div>
            </div>
            {image && (
              <button
                type="button"
                onClick={handleDownloadImage}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Save Image</span>
              </button>
            )}
          </div>

          {/* Item 2: Title */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3 min-w-0 mr-2">
              <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800">
                  2. SEO Title Ready
                </p>
                <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
                  {title || 'Optimized title'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyText(title, setCopiedTitle)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors flex-shrink-0"
            >
              {copiedTitle ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Item 3: Description */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3 min-w-0 mr-2">
              <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800">
                  3. Description & CTA Ready
                </p>
                <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
                  {description || 'Search-optimized description'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyText(description, setCopiedDesc)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors flex-shrink-0"
            >
              {copiedDesc ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          {/* Item 4: Destination Link */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3 min-w-0 mr-2">
              <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800">
                  4. Destination / Affiliate Link
                </p>
                <p className="text-[11px] text-slate-500 truncate max-w-[240px]">
                  {productUrl}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => copyText(productUrl, setCopiedUrl)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs transition-colors flex-shrink-0"
            >
              {copiedUrl ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notice */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 mb-5 flex items-start gap-2.5 text-xs text-amber-900">
          <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Semi-automated for safety:</strong> PinPilot never uses automated bot publishing. Clicking below opens Pinterest Pin Builder in a new tab where you can upload the image, paste your details, and publish securely.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={copyBundle}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
          >
            {copiedAll ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-600 font-bold">All Details Copied!</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span>Copy Entire Pin Bundle</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleOpenPinterest}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/25 transition-all"
          >
            <span>Open Pinterest &amp; Publish</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
