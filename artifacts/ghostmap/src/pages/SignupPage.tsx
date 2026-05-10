import { useEffect } from "react";

export default function SignupPage() {
  useEffect(() => {
    window.location.href = "/api/login";
  }, []);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center"
      style={{ background: "#0c0b11" }}
    >
      <p style={{ color: "rgba(255,255,255,0.4)", fontFamily: "system-ui" }}>
        Redirecting to login…
      </p>
    </div>
  );
}
