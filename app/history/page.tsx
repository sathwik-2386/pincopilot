'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Clock,
  Search,
  Filter,
  Sparkles,
  Trash2,
  CheckCircle2,
  Layers,
  FileQuestion,
  ExternalLink,
} from 'lucide-react';
import {
  getSavedPins,
  deletePin,
  duplicatePin,
  updatePinStatus,
  clearAllPins,
} from '@/lib/storage';
import { PinItem, PinStatus } from '@/types/pin';
import { HistoryCard } from '@/components/history-card';

export default function HistoryPage() {
  const router = useRouter();
  const [pins, setPins] = useState<PinItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PinStatus>('All');
  const [loaded, setLoaded] = useState(false);

  const refreshPins = () => {
    const data = getSavedPins();
    setPins(data);
  };

  useEffect(() => {
    refreshPins();
    setLoaded(true);

    const onStorage = () => refreshPins();
    window.addEventListener('storage', onStorage);
    window.addEventListener('pinpilot_pins_updated', onStorage);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('pinpilot_pins_updated', onStorage);
    };
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this saved pin?')) {
      deletePin(id);
      refreshPins();
      window.dispatchEvent(new Event('pinpilot_pins_updated'));
    }
  };

  const handleDuplicate = (id: string) => {
    duplicatePin(id);
    refreshPins();
    window.dispatchEvent(new Event('pinpilot_pins_updated'));
  };

  const handleStatusChange = (id: string, status: PinStatus) => {
    updatePinStatus(id, status);
    refreshPins();
    window.dispatchEvent(new Event('pinpilot_pins_updated'));
  };

  const handleSelectForEdit = (pin: PinItem) => {
    router.push(`/?editId=${pin.id}`);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all saved pins? This cannot be undone.')) {
      clearAllPins();
      refreshPins();
      window.dispatchEvent(new Event('pinpilot_pins_updated'));
    }
  };

  // Filter and search
  const filteredPins = pins.filter((p) => {
    const matchesFilter = statusFilter === 'All' || p.status === statusFilter;
    if (!matchesFilter) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = p.productName?.toLowerCase().includes(q);
    const titleMatch = p.title?.toLowerCase().includes(q);
    const boardMatch = p.board?.toLowerCase().includes(q);
    const kwMatch = p.keywords?.some((k) => k.toLowerCase().includes(q));

    return nameMatch || titleMatch || boardMatch || kwMatch;
  });

  const draftCount = pins.filter((p) => p.status === 'Draft').length;
  const readyCount = pins.filter((p) => p.status === 'Ready to Publish').length;
  const publishedCount = pins.filter((p) => p.status === 'Published').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Pin History &amp; Library
            </h1>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {pins.length} {pins.length === 1 ? 'Pin' : 'Pins'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage your drafts, track publishing readiness, and duplicate pin bundles
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {pins.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>
          )}

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate New Pin</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Total Generated</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{pins.length}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs text-slate-500 font-medium">Drafts</p>
          <p className="text-2xl font-bold text-slate-700 mt-1">{draftCount}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-blue-100 bg-blue-50/20 shadow-2xs">
          <p className="text-xs text-blue-700 font-medium">Ready to Publish</p>
          <p className="text-2xl font-bold text-blue-800 mt-1">{readyCount}</p>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-2xs">
          <p className="text-xs text-emerald-700 font-medium">Published</p>
          <p className="text-2xl font-bold text-emerald-800 mt-1">{publishedCount}</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by product name, title, keywords, or board..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-slate-50 rounded-xl border border-slate-200/80 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {(['All', 'Draft', 'Ready to Publish', 'Published'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Saved Pins */}
      {loaded && filteredPins.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPins.map((pin) => (
            <HistoryCard
              key={pin.id}
              pin={pin}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onStatusChange={handleStatusChange}
              onSelectForEdit={handleSelectForEdit}
            />
          ))}
        </div>
      ) : loaded && pins.length > 0 ? (
        /* Empty Search Results */
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <FileQuestion className="h-10 w-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            No matching pins found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing the status filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('All');
            }}
            className="text-xs font-semibold text-red-600 hover:underline pt-2"
          >
            Reset Filters
          </button>
        </div>
      ) : loaded ? (
        /* No Pins Saved Yet */
        <div className="text-center py-20 px-4 bg-white rounded-3xl border border-dashed border-slate-300 shadow-xs space-y-4">
          <div className="h-14 w-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <Clock className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              No pins saved in history yet
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
              When you generate pins from product links, click &ldquo;Save Draft&rdquo; to store and track them here.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Your First Pin</span>
          </Link>
        </div>
      ) : null}
    </div>
  );
}
