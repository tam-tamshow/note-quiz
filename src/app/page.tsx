import { basePath } from "@/lib/quiz/paths";
import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        padding: 24,
        maxWidth: 520,
        margin: "0 auto",
        display: "grid",
        gap: 16,
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Note Quiz</h1>
      <p style={{ opacity: 0.8 }}>
        単音と和音、目的に合わせてクイズを選べます。
      </p>
      <div style={{ display: "grid", gap: 12 }}>
        <Link
          href={`${basePath}/quiz`}
          style={{
            padding: "14px 16px",
            borderRadius: 12,
            border: "1px solid #ddd",
            fontWeight: 600,
          }}
        >
          単音クイズ
        </Link>
        <Link
          href={`${basePath}/chords`}
          style={{
            padding: "14px 16px",
            borderRadius: 12,
            border: "1px solid #ddd",
            fontWeight: 600,
          }}
        >
          和音クイズ
        </Link>
      </div>
    </main>
  );
}
