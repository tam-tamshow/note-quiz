"use client";

import dynamic from "next/dynamic";

const ChordQuizPageClient = dynamic(() => import("./ChordQuizPageClient"), {
  ssr: false,
});

export default function ChordQuizPageClientWrapper() {
  return <ChordQuizPageClient />;
}
