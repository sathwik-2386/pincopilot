import { PinItem, PinStatus, UserSettings } from '@/types/pin';

const HISTORY_KEY = 'pinpilot_pins_history_v1';
const SETTINGS_KEY = 'pinpilot_user_settings_v1';

export const DEFAULT_SETTINGS: UserSettings = {
  geminiApiKey: '',
  defaultCta: 'Discover More',
  defaultBoard: 'Trending Products',
  defaultKeywords: 'best finds, must haves, aesthetic, gift ideas',
  pinterestProfile: '',
};

function isClient(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getSavedPins(): PinItem[] {
  if (!isClient()) return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read pins history from localStorage', e);
    return [];
  }
}

export function getPinById(id: string): PinItem | null {
  const pins = getSavedPins();
  return pins.find((p) => p.id === id) || null;
}

export function savePin(
  pinInput: Omit<PinItem, 'id' | 'createdAt'> & { id?: string; createdAt?: string }
): PinItem {
  if (!isClient()) {
    return {
      ...pinInput,
      id: pinInput.id || `pin_${Date.now()}`,
      createdAt: pinInput.createdAt || new Date().toISOString(),
    };
  }

  const existingPins = getSavedPins();
  const id = pinInput.id || `pin_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const createdAt = pinInput.createdAt || new Date().toISOString();

  const newPin: PinItem = {
    ...pinInput,
    id,
    createdAt,
  };

  const existingIndex = existingPins.findIndex((p) => p.id === id);
  let updatedPins: PinItem[];

  if (existingIndex >= 0) {
    updatedPins = [...existingPins];
    updatedPins[existingIndex] = newPin;
  } else {
    updatedPins = [newPin, ...existingPins];
  }

  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedPins));
  } catch (e) {
    console.error('Failed to save pin to localStorage', e);
  }

  return newPin;
}

export function updatePinStatus(id: string, status: PinStatus): boolean {
  if (!isClient()) return false;
  const pins = getSavedPins();
  const target = pins.find((p) => p.id === id);
  if (!target) return false;

  target.status = status;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(pins));
    return true;
  } catch {
    return false;
  }
}

export function deletePin(id: string): boolean {
  if (!isClient()) return false;
  const pins = getSavedPins();
  const filtered = pins.filter((p) => p.id !== id);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

export function duplicatePin(id: string): PinItem | null {
  const original = getPinById(id);
  if (!original) return null;

  return savePin({
    ...original,
    id: undefined,
    createdAt: undefined,
    title: `${original.title} (Copy)`,
    status: 'Draft',
  });
}

export function clearAllPins(): void {
  if (!isClient()) return;
  localStorage.removeItem(HISTORY_KEY);
}

export function getUserSettings(): UserSettings {
  if (!isClient()) return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveUserSettings(settings: Partial<UserSettings>): UserSettings {
  if (!isClient()) return DEFAULT_SETTINGS;
  const current = getUserSettings();
  const updated = { ...current, ...settings };
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
  return updated;
}
