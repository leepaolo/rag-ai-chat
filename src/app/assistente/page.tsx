import type { Metadata } from "next";

import { Chat } from "@/components/Chat";

export const metadata: Metadata = {
  title: "Assistente",
};

export default function AssistentePage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <h1 className="font-display text-display-lg text-ink">Assistente</h1>
      <Chat />
    </main>
  );
}
