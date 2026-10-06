import BrandLoader from "@/components/brand/BrandLoader";

// Inside the dashboard the sidebar and topbar stay on screen, so the
// loader only fills the content area instead of covering everything.
export default function DashboardLoading() {
  return <BrandLoader fullscreen={false} label="Loading dashboard" />;
}
