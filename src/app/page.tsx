"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`${base}/quiz`);
  }, [router]);

  return (
    <main style={{ padding: 24 }}>
      <p>Redirecting to quiz...</p>
    </main>
  );
}
