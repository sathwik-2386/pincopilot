'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductUrlForm } from '@/components/product-url-form';
import { GenerationProgress } from '@/components/generation-progress';
import { PinPreview } from '@/components/pin-preview';
import { PinEditor } from '@/components/pin-editor';
import { getUserSettings, getPinById } from '@/lib/storage';
import { ProductData } from '@/types/product';
import { PinItem, PinStatus } from '@/types/pin';
import { AlertCircle, ArrowLeft, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';

function GeneratePageContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('editId');

  // Loading and workflow states
  const [isLoading, setIsLoading] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');

  // Generated Pin State
  const [hasGeneratedPin, setHasGeneratedPin] = useState(false);
  const [activePinId, setActivePinId] = useState<string | undefined>(undefined);
  const [activeStatus, setActiveStatus] = useState<PinStatus>('Draft');

  // Editable fields
  const [productName, setProductName] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [board, setBoard] = useState('');
  const [cta, setCta] = useState('');
  const [image, setImage] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('$');

  const [isRegenerating, setIsRegenerating] = useState(false);

  // Check for editId on initial load
  useEffect(() => {
    if (editId) {
      const pin = getPinById(editId);
      if (pin) {
        setActivePinId(pin.id);
        setProductName(pin.productName);
        setProductTitle(pin.title);
        setDescription(pin.description);
        setKeywords(pin.keywords || []);
        setBoard(pin.board || '');
        setCta(pin.cta || 'Shop Now');
        setImage(pin.image || '');
        setProductUrl(pin.productUrl || '');
        setBrand(pin.brand || '');
        setPrice(pin.price || '');
        setCurrency(pin.currency || '$');
        setActiveStatus(pin.status || 'Draft');
        setHasGeneratedPin(true);
      }
    }
  }, [editId]);

  // Main URL submission handler
  const handleGeneratePin = async (url: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setCurrentUrl(url);
    setCurrentStepIndex(0); // 1. URL received

    try {
      // Step 2 & 3: Analyze Product Page
      setCurrentStepIndex(1); // Analyzing page
      await new Promise((r) => setTimeout(r, 400));

      setCurrentStepIndex(2); // Finding product info
      const analyzeRes = await fetch('/api/analyze-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const analyzeData = await analyzeRes.json();

      if (!analyzeRes.ok || !analyzeData.success || !analyzeData.product) {
        throw new Error(
          analyzeData.error || 'Failed to extract product information from this website.'
        );
      }

      const extracted: ProductData = analyzeData.product;

      // Step 4: Product Image selected
      setCurrentStepIndex(3); // Finding image
      await new Promise((r) => setTimeout(r, 300));

      // Step 5: Generating Pinterest Content with Gemini
      setCurrentStepIndex(4); // Generating content
      const userSettings = getUserSettings();

      const generateRes = await fetch('/api/generate-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: {
            productName: extracted.productName,
            productImage: extracted.productImage,
            description: extracted.description,
            brand: extracted.brand,
            price: extracted.price,
            currency: extracted.currency,
            canonicalUrl: extracted.canonicalUrl,
            originalUrl: extracted.originalUrl,
          },
          apiKey: userSettings.geminiApiKey || undefined,
          userDefaults: {
            defaultCta: userSettings.defaultCta,
            defaultBoard: userSettings.defaultBoard,
            defaultKeywords: userSettings.defaultKeywords,
          },
        }),
      });

      const generateData = await generateRes.json();

      if (!generateRes.ok || !generateData.success || !generateData.pin) {
        throw new Error(
          generateData.error || 'Failed to generate Pinterest copy using Gemini.'
        );
      }

      const pinContent = generateData.pin;

      // Step 6: Preparing live preview
      setCurrentStepIndex(5);
      await new Promise((r) => setTimeout(r, 300));

      // Populate editor and preview
      setProductName(extracted.productName);
      setProductTitle(pinContent.title);
      setDescription(pinContent.description);
      setKeywords(pinContent.keywords);
      setBoard(pinContent.board);
      setCta(pinContent.cta);
      setImage(extracted.productImage);
      setProductUrl(extracted.canonicalUrl || extracted.originalUrl);
      setBrand(extracted.brand);
      setPrice(extracted.price);
      setCurrency(extracted.currency || '$');
      setActivePinId(`pin_${Date.now()}`);
      setActiveStatus('Draft');

      setHasGeneratedPin(true);
    } catch (err: any) {
      console.error('Generation flow error:', err);
      setErrorMessage(
        err.message || 'An unexpected error occurred during generation. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Re-generate copy with Gemini
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const userSettings = getUserSettings();
      const res = await fetch('/api/generate-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: {
            productName,
            description,
            brand,
            price,
            currency,
            originalUrl: productUrl,
          },
          apiKey: userSettings.geminiApiKey || undefined,
          userDefaults: {
            defaultCta: userSettings.defaultCta,
            defaultBoard: userSettings.defaultBoard,
            defaultKeywords: userSettings.defaultKeywords,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.pin) {
        setProductTitle(data.pin.title);
        setDescription(data.pin.description);
        setKeywords(data.pin.keywords);
        setBoard(data.pin.board);
        setCta(data.pin.cta);
      } else {
        alert(data.error || 'Failed to regenerate content.');
      }
    } catch (e: any) {
      alert(e.message || 'Error communicating with Gemini.');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleResetToForm = () => {
    setHasGeneratedPin(false);
    setActivePinId(undefined);
    setErrorMessage(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* If not generated yet or loading: Show Input Form */}
      {!hasGeneratedPin && (
        <div className="space-y-6">
          <ProductUrlForm
            onSubmitUrl={handleGeneratePin}
            isLoading={isLoading}
            initialUrl={currentUrl}
          />

          {/* Loading Animation */}
          {isLoading && (
            <GenerationProgress
              currentStepIndex={currentStepIndex}
              productUrl={currentUrl}
            />
          )}

          {/* Error Banner */}
          {errorMessage && !isLoading && (
            <div className="max-w-2xl mx-auto p-4 bg-red-50/90 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 animate-in fade-in duration-200">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-sm">Extraction or Generation Notice</p>
                <p className="text-xs text-red-700 leading-relaxed">{errorMessage}</p>
                <p className="text-[11px] text-red-600 pt-1">
                  Tip: Some storefronts block automated web scrapers. Try one of our quick 1-click test examples above or paste a direct product link.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Generated Result: Split Screen Live Preview & Editor */}
      {hasGeneratedPin && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={handleResetToForm}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Generate Another Pin</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>Ready for Pinterest Review</span>
              </span>
            </div>
          </div>

          {/* Side by side on desktop, stacked on mobile */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: 2:3 Vertical Pinterest Preview */}
            <div className="lg:col-span-5 flex justify-center lg:sticky lg:top-24">
              <PinPreview
                image={image}
                title={productTitle}
                description={description}
                board={board}
                cta={cta}
                productUrl={productUrl}
                brand={brand}
                price={price}
                currency={currency}
              />
            </div>

            {/* Right: Full Editable Form */}
            <div className="lg:col-span-7">
              <PinEditor
                productName={productName}
                setProductName={setProductName}
                title={productTitle}
                setTitle={setProductTitle}
                description={description}
                setDescription={setDescription}
                keywords={keywords}
                setKeywords={setKeywords}
                board={board}
                setBoard={setBoard}
                cta={cta}
                setCta={setCta}
                productUrl={productUrl}
                setProductUrl={setProductUrl}
                image={image}
                brand={brand}
                price={price}
                currency={currency}
                onRegenerate={handleRegenerate}
                isRegenerating={isRegenerating}
                pinId={activePinId}
                currentStatus={activeStatus}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GeneratePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading PinPilot...</div>}>
      <GeneratePageContent />
    </Suspense>
  );
}
