'use client';

import React, { useState } from 'react';
import {
  Download,
  ExternalLink,
  ImageOff,
  Copy,
  Check,
  Tag,
  ArrowUpRight,
  Pin,
} from 'lucide-react';
import { getDomainFromUrl } from '@/lib/utils';

interface PinPreviewProps {
  image?: string;
  title: string;
  description: string;
  board: string;
  cta: string;
  productUrl: string;
  brand?: string;
  price?: string;
  currency?: string;
}

export function PinPreview({
  image,
  title,
  description,
  board,
  cta,
  productUrl,
  brand,
  price,
  currency = '$',
}: PinPreviewProps) {
  const [imageError, setImageError] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const domain = getDomainFromUrl(productUrl);

  const handleDownloadImage = async () => {
    if (!image) return;
    try {
      // Fetch blob to trigger download
      const response = await fetch(image, { mode: 'cors' }).catch(() => null);
      if (response && response.ok) {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `pinpilot-${(title || 'product').toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30)}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } else {
        // Fallback open in new tab
        window.open(image, '_blank');
      }
    } catch {
      window.open(image, '_blank');
    }
  };

  const handleCopyImageUrl = () => {
    if (!image) return;
    navigator.clipboard.writeText(image);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex items-center justify-between w-full max-w-[340px] mb-2 px-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Pin className="h-3.5 w-3.5 text-red-600 fill-red-600" />
          <span>Live Pin Preview (2:3)</span>
        </span>
        <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          Pinterest Feed View
        </span>
      </div>

      {/* Pinterest-style Card Container */}
      <div className="w-full max-w-[340px] bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 overflow-hidden transition-all duration-200 hover:shadow-2xl">
        {/* Visual 2:3 Aspect ratio container */}
        <div className="relative aspect-[2/3] w-full bg-slate-100 flex flex-col justify-between overflow-hidden group">
          {/* Product Image */}
          {image && !imageError ? (
            <img
              src={image}
              alt={title || 'Product Image'}
              onError={() => setImageError(true)}
              className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-50 text-slate-400">
              <div className="h-14 w-14 rounded-2xl bg-slate-200/80 flex items-center justify-center mb-3 text-slate-400">
                <ImageOff className="h-7 w-7" />
              </div>
              <p className="text-xs font-semibold text-slate-600">
                We couldn&apos;t find a suitable product image.
              </p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
                You can upload a custom image or use your product photo on Pinterest.
              </p>
            </div>
          )}

          {/* Top Overlays */}
          <div className="relative z-10 p-3.5 flex items-start justify-between">
            {/* Board Tag Pill */}
            {board ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/95 backdrop-blur-md text-slate-800 px-2.5 py-1 rounded-full shadow-sm border border-black/5">
                <Tag className="h-3 w-3 text-red-600" />
                <span className="truncate max-w-[130px]">{board}</span>
              </span>
            ) : (
              <span />
            )}

            {/* Price Pill if available */}
            {price && (
              <span className="text-[11px] font-bold bg-slate-900/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full shadow-sm">
                {currency}
                {price}
              </span>
            )}
          </div>

          {/* Hover Image Actions */}
          {image && !imageError && (
            <div className="relative z-10 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-end gap-1.5 bg-gradient-to-b from-transparent via-black/10 to-transparent">
              <button
                type="button"
                onClick={handleCopyImageUrl}
                className="p-2 rounded-full bg-white/90 text-slate-700 hover:bg-white hover:text-slate-900 shadow-md transition-all text-xs"
                title="Copy Image URL"
              >
                {copiedUrl ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleDownloadImage}
                className="p-2 rounded-full bg-white/90 text-slate-700 hover:bg-white hover:text-slate-900 shadow-md transition-all text-xs"
                title="Download Image"
              >
                <Download className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Bottom Card Overlay with Title and CTA */}
          <div className="relative z-10 mt-auto p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/60 to-transparent pt-12 text-white">
            {brand && (
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-300 drop-shadow-xs truncate mb-1">
                {brand}
              </p>
            )}
            <h4 className="font-bold text-sm leading-snug drop-shadow-md line-clamp-2 mb-1.5 text-white">
              {title || 'Your Eye-Catching Pin Headline Here'}
            </h4>
            <p className="text-[11px] text-slate-200 line-clamp-2 drop-shadow-xs mb-3 font-normal opacity-95">
              {description || 'Compelling description with natural product benefits, search keywords, and reason to click...'}
            </p>

            <div className="flex items-center justify-between pt-1 border-t border-white/15">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 truncate max-w-[140px]">
                <ArrowUpRight className="h-3 w-3 text-slate-400" />
                {domain}
              </span>

              <span className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded-full shadow-md transition-colors">
                <span>{cta || 'Shop Now'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* PinPilot Card Footer */}
        <div className="p-3 bg-white border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 font-semibold text-slate-600">
            <span className="h-2 w-2 rounded-full bg-red-600" />
            PinPilot Preview
          </span>
          {image && (
            <button
              type="button"
              onClick={handleDownloadImage}
              className="text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 transition-colors"
            >
              <Download className="h-3 w-3" />
              <span>Save Image</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
