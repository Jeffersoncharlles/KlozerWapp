export type WhatsAppConnection = {
  status: string;
  phone?: string;
  name?: string;
};

export type WhatsAppLoaderData = {
  connection?: WhatsAppConnection;
  error?: string;
};
