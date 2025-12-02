import { Suspense, lazy } from "react";

// Lazy load components for better performance
const DashboardMetrics = lazy(() =>
  import("./dashboard/DashboardMetrics").then((m) => ({
    default: m.DashboardMetrics,
  }))
);

const RevenueOverview = lazy(() =>
  import("./dashboard/RevenueOverview").then((m) => ({
    default: m.RevenueOverview,
  }))
);

const TopCategories = lazy(() =>
  import("./dashboard/TopCategories").then((m) => ({
    default: m.TopCategories,
  }))
);

const RecentOrders = lazy(() =>
  import("./dashboard/RecentOrders").then((m) => ({
    default: m.RecentOrders,
  }))
);

const TopProducts = lazy(() =>
  import("./dashboard/TopProducts").then((m) => ({
    default: m.TopProducts,
  }))
);

const AlertsPanel = lazy(() =>
  import("./dashboard/AlertsPanel").then((m) => ({
    default: m.AlertsPanel,
  }))
);

// Loading skeleton component
function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-gradient-to-r from-blue-200 to-indigo-200 rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function DashboardHome() {
  return (
    <div className="space-y-6">
      {/* Metrics Section */}
      <Suspense fallback={<LoadingSkeleton />}>
        <DashboardMetrics />
      </Suspense>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="h-[300px] bg-gray-200 rounded-lg" />}>
          <RevenueOverview />
        </Suspense>
        <Suspense fallback={<div className="h-[300px] bg-gray-200 rounded-lg" />}>
          <TopCategories />
        </Suspense>
      </div>

      {/* Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<div className="h-96 bg-gray-200 rounded-lg" />}>
          <RecentOrders />
        </Suspense>
        <Suspense fallback={<div className="h-96 bg-gray-200 rounded-lg" />}>
          <TopProducts />
        </Suspense>
      </div>

      {/* Alerts & Warnings */}
      <Suspense fallback={<div className="h-32 bg-gray-200 rounded-lg" />}>
        <AlertsPanel />
      </Suspense>
    </div>
  );
}
