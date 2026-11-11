import { DashboardHeader } from "./dashboard-header";
import { DashboardOverview } from "./dashboard-overview";
import type { DashboardLoaderData } from "../types";

export function DashboardContainer({ data }: { data: DashboardLoaderData }) {
  return (
    <div className="min-h-svh bg-background">
      <DashboardHeader />
      <DashboardOverview data={data} />
    </div>
  );
}
