'use client';

import React from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ProgressStep {
  id: string;
  title: string;
  description?: string;
}

const STEPS: ProgressStep[] = [
  { id: 'url', title: 'Product URL received & validated' },
  { id: 'analyze', title: 'Analyzing product page structure' },
  { id: 'info', title: 'Finding product information & specifications' },
  { id: 'image', title: 'Selecting best available product image' },
  { id: 'generate', title: 'Generating Pinterest SEO title & description' },
  { id: 'preview', title: 'Preparing Pinterest pin preview' },
];

interface GenerationProgressProps {
  currentStepIndex: number;
  productUrl?: string;
}

export function GenerationProgress({
  currentStepIndex,
  productUrl,
}: GenerationProgressProps) {
  const percent = Math.min(100, Math.round(((currentStepIndex + 1) / STEPS.length) * 100));

  return (
    <div className="w-full max-w-xl mx-auto my-8 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-100 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
            <Sparkles className="h-4 w-4 animate-spin text-red-600" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">
              PinPilot AI Engine at Work
            </h3>
            <p className="text-xs text-slate-500">
              Transforming product link into optimized pin assets
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-800">{percent}%</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 my-5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-red-500 to-rose-600 h-1.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Steps List */}
      <div className="space-y-3 pt-1">
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const isPending = idx > currentStepIndex;

          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-3.5 p-2 rounded-xl transition-all duration-200',
                isCurrent && 'bg-red-50/70 border border-red-100 shadow-2xs',
                isDone && 'opacity-90',
                isPending && 'opacity-40'
              )}
            >
              <div className="flex-shrink-0">
                {isDone ? (
                  <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                  </div>
                ) : isCurrent ? (
                  <div className="h-6 w-6 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xs shadow-red-500/30">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  </div>
                ) : (
                  <div className="h-6 w-6 rounded-full border border-slate-200 text-slate-400 flex items-center justify-center text-[10px] font-semibold">
                    {idx + 1}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-xs font-medium truncate',
                    isCurrent && 'text-red-950 font-semibold',
                    isDone && 'text-slate-700',
                    isPending && 'text-slate-400'
                  )}
                >
                  {step.title}
                </p>
              </div>

              {isCurrent && (
                <span className="text-[10px] uppercase font-semibold tracking-wider text-red-600 animate-pulse">
                  Processing
                </span>
              )}
            </div>
          );
        })}
      </div>

      {productUrl && (
        <div className="mt-5 pt-3 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 truncate max-w-sm mx-auto">
            Target: <span className="text-slate-600">{productUrl}</span>
          </p>
        </div>
      )}
    </div>
  );
}
