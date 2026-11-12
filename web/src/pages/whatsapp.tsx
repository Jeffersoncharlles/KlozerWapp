import { useLoaderData } from "react-router";
import { WhatsAppContainer } from "../features/whatsapp/components/whatsapp-container";
import { loadWhatsAppConnection } from "../features/whatsapp/services/whatsapp-service";
import type { WhatsAppLoaderData } from "../features/whatsapp/types";

export const loader = loadWhatsAppConnection;

export function WhatsApp() {
  return <WhatsAppContainer data={useLoaderData() as WhatsAppLoaderData} />;
}
