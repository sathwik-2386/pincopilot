'use client';

import React, { useState, useEffect } from 'react';
import {
  Key,
  Layers,
  MousePointerClick,
  Hash,
  User,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Check,
  Download,
  Upload,
  RefreshCw,
} from 'lucide-react';
import {
  getUserSettings,
  saveUserSettings,
  getSavedPins,
  DEFAULT_SETTINGS,
} from '@/lib/storage';
import { UserSettings } from '@/types/pin';

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // API Connection Test State
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  useEffect(() => {
    const current = getUserSettings();
    setSettings(current);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveUserSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleTestConnection = async () => {
    setTestingKey(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: settings.geminiApiKey }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Gemini API authentication verified successfully!',
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to authenticate with Gemini API.',
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e.message || 'Network error while testing connection.',
      });
    } finally {
      setTestingKey(false);
    }
  };

  const handleExportData = () => {
    const pins = getSavedPins();
    const blob = new Blob(
      [
        JSON.stringify(
          {
            app: 'PinPilot',
            version: '1.0',
            exportedAt: new Date().toISOString(),
            pins,
            settings: { ...settings, geminiApiKey: '' }, // don't export private key in JSON
          },
          null,
          2
        ),
      ],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pinpilot-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Application Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Configure Gemini AI credentials, pin defaults, and Pinterest profile preferences
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Gemini API Key Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Key className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Gemini API Configuration
                </h3>
                <p className="text-xs text-slate-500">
                  Used by server routes to generate Pinterest SEO titles, descriptions, and keywords
                </p>
              </div>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline flex-shrink-0"
            >
              <span>Get API Key</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
              Gemini API Key
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={settings.geminiApiKey}
                  onChange={(e) =>
                    setSettings({ ...settings, geminiApiKey: e.target.value })
                  }
                  placeholder="AIzaSy... or leave blank to use GEMINI_API_KEY from .env.local"
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-medium"
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingKey}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors disabled:opacity-50 flex-shrink-0"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${testingKey ? 'animate-spin' : ''}`} />
                <span>{testingKey ? 'Testing...' : 'Test Connection'}</span>
              </button>
            </div>

            {/* Test Result Message */}
            {testResult && (
              <div
                className={`mt-3 p-3 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-slate-500 text-xs flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Environment Safety:</strong> You can also set your key server-side in <code className="px-1 py-0.5 bg-slate-200 rounded text-slate-800">.env.local</code> as <code className="px-1 py-0.5 bg-slate-200 rounded text-slate-800">GEMINI_API_KEY</code>.
                Any key entered here stays in your local browser storage and is only passed via encrypted HTTPS server request.
              </p>
            </div>
          </div>
        </div>

        {/* Pin Defaults Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="h-10 w-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pin Generation Defaults
              </h3>
              <p className="text-xs text-slate-500">
                Pre-fill your preferred boards, calls to action, and recurring tags
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Default CTA */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <MousePointerClick className="h-3.5 w-3.5 text-slate-400" />
                <span>Default Call To Action</span>
              </label>
              <input
                type="text"
                value={settings.defaultCta}
                onChange={(e) =>
                  setSettings({ ...settings, defaultCta: e.target.value })
                }
                placeholder="e.g. Discover More"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Examples: &ldquo;Discover More&rdquo;, &ldquo;Shop Now&rdquo;, &ldquo;Check It Out&rdquo;
              </p>
            </div>

            {/* Default Board */}
            <div>
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Layers className="h-3.5 w-3.5 text-slate-400" />
                <span>Default Pinterest Board</span>
              </label>
              <input
                type="text"
                value={settings.defaultBoard}
                onChange={(e) =>
                  setSettings({ ...settings, defaultBoard: e.target.value })
                }
                placeholder="e.g. Skincare Products"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Fallback category board when Gemini categorizes the product.
              </p>
            </div>
          </div>

          {/* Default Keywords */}
          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
              <Hash className="h-3.5 w-3.5 text-slate-400" />
              <span>Default Keywords / Tags</span>
            </label>
            <input
              type="text"
              value={settings.defaultKeywords}
              onChange={(e) =>
                setSettings({ ...settings, defaultKeywords: e.target.value })
              }
              placeholder="e.g. best finds, top rated, aesthetic, gift guide"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Comma-separated base keywords always factored into SEO generation.
            </p>
          </div>
        </div>

        {/* Pinterest Profile Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="h-10 w-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Pinterest Profile
              </h3>
              <p className="text-xs text-slate-500">
                Optionally link your Pinterest profile for reference
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
              Pinterest Profile URL
            </label>
            <input
              type="url"
              value={settings.pinterestProfile}
              onChange={(e) =>
                setSettings({ ...settings, pinterestProfile: e.target.value })
              }
              placeholder="https://pinterest.com/yourbrand"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:bg-white"
            />
          </div>
        </div>

        {/* Backup & Export Section */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Data Management</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Export all your generated pin history to a JSON backup file
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportData}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Pin History</span>
          </button>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {saveSuccess ? (
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in duration-150">
              <Check className="h-4 w-4 text-emerald-600" />
              <span>Settings successfully saved!</span>
            </div>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-white bg-red-600 hover:bg-red-700 font-bold text-xs sm:text-sm shadow-lg shadow-red-600/25 transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
