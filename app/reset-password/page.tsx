"use client";

export default function ResetPasswordPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, #17335d 0%, #0a1220 30%, #05080f 100%)",
        color: "white",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          borderRadius: 24,
          padding: 28,
          background: "rgba(16,22,34,0.94)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.28)",
        }}
      >
        <h1 style={{ fontSize: 34, marginTop: 0 }}>Reset Password</h1>

        <div
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 14,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#cbd5e1",
            lineHeight: 1.6,
          }}
        >
          Password reset is temporarily disabled.
        </div>

        <div style={{ marginTop: 16 }}>
          <a href="/auth" style={{ color: "#60a5fa" }}>
            Back to login
          </a>
        </div>
      </div>
    </main>
  );
}