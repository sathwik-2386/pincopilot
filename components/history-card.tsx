'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  Check,
  Calendar,
  Layers,
  ImageOff,
  MoreVertical,
  CheckCircle2,
  Clock,
  Pin,
  Eye,
} from 'lucide-react';
import { PinItem, PinStatus } from '@/types/pin';
import { formatDate } from '@/lib/utils';
import { PinterestChecklistModal } from './pinterest-checklist-modal';

interface HistoryCardProps {
  pin: PinItem;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onStatusChange: (id: string, status: PinStatus) => void;
  onSelectForEdit: (pin: PinItem) => void;
}

export function HistoryCard({
  pin,
  onDelete,
  onDuplicate,
  onStatusChange,
  onSelectForEdit,
}: HistoryCardProps) {
  const [imageError, setImageError] = useState(false);
  const [copiedBundle, setCopiedBundle] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);

  const getStatusBadge = (status: PinStatus) => {
    switch (status) {
      case 'Published':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Ready to Publish':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Draft':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const handleCopyBundle = () => {
    const text = `TITLE:\n${pin.title}\n\nDESCRIPTION:\n${pin.description}\n\nDESTINATION LINK:\n${pin.productUrl}\n\nBOARD:\n${pin.board}`;
    navigator.clipboard.writeText(text);
    setCopiedBundle(true);
    setTimeout(() => setCopiedBundle(false), 2000);
  };

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Top Image & Status Row */}
      <div className="relative aspect-[16/10] w-full bg-slate-100 overflow-hidden">
        {pin.image && !imageError ? (
          <img
            src={pin.image}
            alt={pin.title || pin.productName}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
            <ImageOff className="h-6 w-6 mb-1 text-slate-300" />
            <span className="text-[10px]">No image</span>
          </div>
        )}

        {/* Status Dropdown Pill */}
        <div className="absolute top-2.5 left-2.5">
          <select
            value={pin.status}
            onChange={(e) => onStatusChange(pin.id, e.target.value as PinStatus)}
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full border shadow-xs cursor-pointer focus:outline-none ${getStatusBadge(
              pin.status
            )}`}
          >
            <option value="Draft">Draft</option>
            <option value="Ready to Publish">Ready to Publish</option>
            <option value="Published">Published</option>
          </select>
        </div>

        {/* Board Pill */}
        {pin.board && (
          <div className="absolute bottom-2.5 left-2.5">
            <span className="text-[10px] font-semibold bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-md truncate max-w-[150px] inline-block shadow-2xs">
              {pin.board}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {pin.brand && (
            <p className="text-[10px] uppercase font-bold text-red-600 tracking-wider mb-0.5">
              {pin.brand}
            </p>
          )}
          <h4 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
            {pin.title || pin.productName}
          </h4>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {pin.description}
          </p>
        </div>

        {/* Meta / Date */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(pin.createdAt)}</span>
          </span>

          <span className="text-slate-500 font-medium">
            {pin.keywords ? `${pin.keywords.length} tags` : ''}
          </span>
        </div>

        {/* Actions Bar */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1">
            {/* Edit / Load in Editor */}
            <button
              type="button"
              onClick={() => onSelectForEdit(pin)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Edit Pin in Studio"
            >
              <Edit className="h-3.5 w-3.5" />
            </button>

            {/* Duplicate */}
            <button
              type="button"
              onClick={() => onDuplicate(pin.id)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Duplicate Pin"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>

            {/* Copy Bundle */}
            <button
              type="button"
              onClick={handleCopyBundle}
              className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
              title="Copy All Details"
            >
              {copiedBundle ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Eye className="h-3.5 w-3.5" />}
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => onDelete(pin.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete from History"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Open Pinterest / Checklist Button */}
          <button
            type="button"
            onClick={() => setPublishModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-2xs transition-colors"
          >
            <span>Publish</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </div>

      <PinterestChecklistModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        title={pin.title}
        description={pin.description}
        productUrl={pin.productUrl}
        image={pin.image}
        board={pin.board}
        onMarkPublished={() => onStatusChange(pin.id, 'Published')}
      />
    </div>
  );
}
