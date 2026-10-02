'use client';

import React, { useState } from 'react';
import {
  Link as LinkIcon,
  Sparkles,
  Clipboard,
  X,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface ProductUrlFormProps {
  onSubmitUrl: (url: string) => void;
  isLoading: boolean;
  initialUrl?: string;
}

const SAMPLE_PRODUCTS = [
  {
    name: 'Retinol Glow Serum',
    category: 'Beauty',
    url: 'https://www.sephora.com/product/the-ordinary-retinol-0-5-in-squalane-P427421',
  },
  {
    name: 'Ceramic Pour-Over Dripper',
    category: 'Kitchen',
    url: 'https://www.target.com/p/hario-v60-ceramic-coffee-dripper-white/-/A-82601931',
  },
  {
    name: 'Ergonomic Desk Lamp',
    category: 'Home & Office',
    url: 'https://www.ikea.com/us/en/p/tertial-work-lamp-dark-gray-40450802/',
  },
  {
    name: 'Canvas Weekender Duffle',
    category: 'Fashion',
    url: 'https://www.nordstrom.com/s/herschel-supply-co-novel-duffel-bag/3400595',
  },
];

export function ProductUrlForm({
  onSubmitUrl,
  isLoading,
  initialUrl = '',
}: ProductUrlFormProps) {
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a valid product URL.');
      return;
    }

    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        setError('Please enter a valid HTTP or HTTPS product URL.');
        return;
      }
    } catch {
      setError('Please enter a valid product URL.');
      return;
    }

    onSubmitUrl(trimmed);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setError(null);
      }
    } catch {
      // Clipboard permissions denied
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setUrl(sampleUrl);
    setError(null);
    onSubmitUrl(sampleUrl);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Hero Header */}
      <div className="text-center space-y-3 pt-4 sm:pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-100 text-red-700 text-xs font-semibold shadow-2xs">
          <Zap className="h-3.5 w-3.5 fill-red-500 text-red-500" />
          <span>Semi-Automated Affiliate Pin Generator</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Turn Any Product URL Into a{' '}
          <span className="bg-gradient-to-r from-red-600 via-rose-600 to-red-500 bg-clip-text text-transparent">
            Pinterest Pin
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Paste a product link and let AI prepare the product information, Pinterest title, description, keywords and pin preview. You stay in control of publishing.
        </p>
      </div>

      {/* URL Input Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 p-3 sm:p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative flex-1 flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <LinkIcon className="h-5 w-5" />
              </div>

              <input
                type="text"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isLoading}
                placeholder="https://example.com/product"
                aria-label="Product URL"
                className="w-full pl-11 pr-20 py-3.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-slate-50/70 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white focus:border-transparent transition-all disabled:opacity-60"
              />

              {/* Paste & Clear actions inside input */}
              <div className="absolute right-2 flex items-center gap-1">
                {url ? (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
                    title="Clear URL"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg shadow-2xs transition-colors"
                    title="Paste from clipboard"
                  >
                    <Clipboard className="h-3 w-3" />
                    <span>Paste</span>
                  </button>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-white bg-red-600 hover:bg-red-700 font-bold text-sm shadow-md shadow-red-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-white" />
              <span>{isLoading ? 'Analyzing...' : 'Generate Pin'}</span>
              <ArrowRight className="h-4 w-4 hidden sm:inline" />
            </button>
          </div>

          {/* Validation Error Message */}
          {error && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs font-semibold text-red-700 animate-in fade-in duration-150">
              {error}
            </div>
          )}
        </form>

        {/* 1-Click Samples Bar */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Quick 1-Click Tests:</span>
          {SAMPLE_PRODUCTS.map((sample) => (
            <button
              key={sample.name}
              type="button"
              onClick={() => handleSelectSample(sample.url)}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/80 hover:bg-red-50 hover:text-red-700 text-slate-600 text-xs font-medium transition-colors border border-transparent hover:border-red-100 disabled:opacity-50"
            >
              <span>{sample.name}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                ({sample.category})
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
