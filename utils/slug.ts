// lib/utils/slug.ts
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Replace spaces with hyphens
    .replace(/-+/g, '-')           // Replace multiple hyphens with single
    .replace(/^-+/, '')            // Remove leading hyphens
    .replace(/-+$/, '');           // Remove trailing hyphens
};

export const isValidSlug = (slug: string): boolean => {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
};

export const formatSlugForDisplay = (slug: string): string => {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};