export type DashboardMetrics = {
  total_contacts: number;
  total_messages: number;
  total_cards: number;
  active_workflows: number;
};

export type DashboardLoaderData = {
  metrics?: DashboardMetrics;
  whatsappStatus?: string;
  error?: string;
};
