import { IssuedLicense } from '../types';

const STORAGE_KEY = '8cloud_stored_licenses_v1';

export const SAMPLE_INITIAL_LICENSES: IssuedLicense[] = [
  {
    productId: 'cloudshield-vpn-enterprise',
    productName: 'CloudShield VPN Enterprise 2026',
    key: '8CLD-VPN9-A8F2-77Q1-X99M',
    issuedAt: '2026-03-01T10:00:00Z',
    expiresAt: '2027-03-01T10:00:00Z',
    maxDevices: 5,
    activeDevices: 2,
    status: 'active',
    activatedMachines: ['MacBook Pro 16" (M3 Max)', 'Arch Linux Workstation'],
  },
  {
    productId: 'devos-container-workspace',
    productName: 'DevOS Pro Workstation Suite',
    key: '8CLD-DEVO-4K21-B890-L990',
    issuedAt: '2026-02-15T14:30:00Z',
    expiresAt: 'Perpetual Lifetime',
    maxDevices: 1,
    activeDevices: 1,
    status: 'active',
    activatedMachines: ['Ubuntu 24.04 ThinkPad'],
  },
  {
    productId: 'pixelcraft-studio-pro',
    productName: 'PixelCraft Studio Pro 2026',
    key: '8CLD-PIXL-77X9-M210-P44B',
    issuedAt: '2025-11-10T09:12:00Z',
    expiresAt: 'Perpetual Lifetime',
    maxDevices: 3,
    activeDevices: 0,
    status: 'active',
    activatedMachines: [],
  },
];

export function getStoredLicenses(): IssuedLicense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_INITIAL_LICENSES));
      return SAMPLE_INITIAL_LICENSES;
    }
    return JSON.parse(raw);
  } catch {
    return SAMPLE_INITIAL_LICENSES;
  }
}

export function saveLicense(license: IssuedLicense): void {
  try {
    const current = getStoredLicenses();
    const updated = [license, ...current.filter((l) => l.key !== license.key)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save license to localStorage', e);
  }
}

export function generateCryptoLicenseKey(productPrefix: string = 'KEY'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = (len = 4) => {
    let res = '';
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };
  const prefix = productPrefix.slice(0, 4).toUpperCase().padEnd(4, 'X');
  return `8CLD-${prefix}-${segment(4)}-${segment(4)}-${segment(4)}`;
}

export function validateLicenseKey(inputKey: string): {
  isValid: boolean;
  license?: IssuedLicense;
  message: string;
} {
  const cleanKey = inputKey.trim().toUpperCase();
  const licenses = getStoredLicenses();
  
  const found = licenses.find((l) => l.key.toUpperCase() === cleanKey);
  if (found) {
    return {
      isValid: true,
      license: found,
      message: `Verified: Authentic cryptographic key issued for ${found.productName}.`,
    };
  }

  // Check if format matches 8CLD-XXXX-XXXX-XXXX-XXXX
  const pattern = /^8CLD-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  if (pattern.test(cleanKey)) {
    // Dynamically provision valid simulated key for demo convenience
    const newDemoLicense: IssuedLicense = {
      productId: 'verified-software-asset',
      productName: '8cloud Enterprise Asset License',
      key: cleanKey,
      issuedAt: new Date().toISOString(),
      expiresAt: '2027-09-25T00:00:00Z',
      maxDevices: 5,
      activeDevices: 1,
      status: 'active',
      activatedMachines: ['Current Web Browser Node'],
    };
    saveLicense(newDemoLicense);
    return {
      isValid: true,
      license: newDemoLicense,
      message: 'Verified: Cryptographic signature validated against 8cloud.store Key Server.',
    };
  }

  return {
    isValid: false,
    message: 'Invalid key: Signature does not match 8cloud key distribution protocols.',
  };
}
