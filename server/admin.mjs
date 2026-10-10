import { ApiError, requireId, validateProduct, publicOrder } from './core.mjs';

export function requireAdmin(user) {
  if (user?.email_verified !== true || user?.storeAdmin !== true) throw new ApiError(403, 'Store administrator access is required.');
}

export function normalizeProduct(input) {
  const id = requireId(input.id);
  if (typeof input.active !== 'boolean') throw new ApiError(400, 'Choose draft or published status.');
  const text = (value, max, label) => {
    if (typeof value !== 'string' || !value.trim() || value.length > max) throw new ApiError(400, `${label} is required (maximum ${max} characters).`);
    return value.trim();
  };
  const display = input.display || {};
  const categories = { ebooks: 'Ebooks', 'web-assets': 'Web assets', 'ai-prompts': 'AI prompts', 'social-media': 'Social media' };
  if (!Object.hasOwn(categories, display.categoryId)) throw new ApiError(400, 'Choose a digital-product category.');
  if (!Array.isArray(input.files) || input.files.length > 10 || input.files.some(file => !file || typeof file !== 'object')) throw new ApiError(400, 'Choose up to 10 product files.');
  const product = { id, active: input.active, kind: 'download', name: text(input.name, 180, 'Name'), amount: input.amount,
    files: Array.isArray(input.files) ? input.files.map(file => ({ id: file?.id, name: file?.name, objectPath: file?.objectPath, generation: file?.generation })) : [],
    display: { categoryId: display.categoryId, categoryName: categories[display.categoryId],
      tagline: text(display.tagline, 240, 'Tagline'), description: text(display.description, 4000, 'Description'),
      longDescription: text(display.longDescription || display.description, 12000, 'Full description'),
      deliveryFormat: text(display.deliveryFormat, 100, 'Format'), downloadSize: text(display.downloadSize, 100, 'Size'),
      version: text(display.version, 60, 'Version'), licenseType: text(display.licenseType, 240, 'License'),
      gradientTheme: 'from-cyan-600 to-blue-700', iconType: display.categoryId === 'ebooks' ? 'BookOpen' : 'Package',
      ...Object.fromEntries(['features', 'tags'].map(key => {
        const values = display[key] || [];
        if (!Array.isArray(values) || values.length > 30) throw new ApiError(400, `Too many ${key}.`);
        return [key, values.filter(value => typeof value !== 'string' || value.trim()).map(value => text(value, 240, key))];
      })), includedFiles: [] },
  };
  // Drafts may be prepared without files; published products must pass the same checkout validation.
  if (!Number.isSafeInteger(product.amount) || product.amount < 100 || product.amount > 100000000) throw new ApiError(400, 'Price must be between INR 1 and 1,000,000.');
  if (product.files.length || product.active) validateProduct({ ...product, active: true });
  product.display.includedFiles = product.files.map(file => file.name);
  return product;
}

export function createAdmin({ repo, storage, paymentMode, enabled }) {
  return {
    async dashboard() {
      await storage.checkHealth?.();
      const [products, orders] = await Promise.all([repo.adminProducts(), repo.adminOrders()]);
      return { products, orders: orders.map(order => ({ ...publicOrder(order), uid: order.uid })),
        configuration: { paymentMode, paymentsEnabled: enabled, privateStorageVerified: true } };
    },
    async save(user, input) {
      const product = normalizeProduct(input);
      for (const file of product.files) await storage.assertPrivate(file);
      await repo.saveProduct(product, input.revision ?? null, user.uid, input.existing === true);
      return { saved: true };
    },
    async upload(user, name, bytes) {
      if (typeof name !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9 ._-]{0,170}\.(pdf|epub|zip)$/i.test(name)) throw new ApiError(400, 'Use a simple PDF, EPUB or ZIP filename.');
      const pdf = name.toLowerCase().endsWith('.pdf');
      if (bytes.length < 5 || (pdf ? bytes.subarray(0, 5).toString() !== '%PDF-' : bytes.readUInt16LE(0) !== 0x4b50)) throw new ApiError(400, 'File content does not match its format.');
      return { file: await storage.upload(name, bytes, user.uid) };
    },
  };
}
