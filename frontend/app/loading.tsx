import BrandLoader from "@/components/brand/BrandLoader";

// Shown automatically by Next.js while any page without its own
// loading.tsx is loading (home, shop, login, register, admin, ...).
export default function Loading() {
  return <BrandLoader fullscreen />;
}
