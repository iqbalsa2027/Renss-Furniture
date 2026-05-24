import { MessageCircle } from "lucide-react";
import { defaultWhatsAppUrl } from "../lib/whatsapp";

export function WhatsAppFloatButton() {
  return (
    <a
      href={defaultWhatsAppUrl}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat WhatsApp"
      // className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white shadow-2xl transition-transform duration-200 hover:scale-105 hover:bg-[#20ba57]"
      className="fixed bottom-6 right-6 z-50 flex items-center  font-medium text-white shadow-2xl transition-transform duration-200 hover:scale-105 hover:bg-[#20ba57]"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15">
        <MessageCircle className="h-5 w-5" />
      </span>
      {/* <span className="hidden sm:inline">Chat WhatsApp</span> */}
    </a>
  );
}
