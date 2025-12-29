"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/quiz");
  }, [router]);

  return (
    <main style={{ padding: 24 }}>
      <p>Redirecting to quiz...</p>
    </main>
  );
}
