"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import GoogleButton from "@/components/auth/GoogleButton";
import { loginWithEmail, loginWithGoogle, resetPassword } from "@/lib/firebase/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginWithEmail(email, password);
      router.push(redirect);
      router.refresh();
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
        setError("電郵或密碼錯誤");
      } else if (code === "auth/user-not-found") {
        setError("此電郵未註冊，請先建立帳戶");
      } else if (code === "auth/too-many-requests") {
        setError("嘗試次數過多，請稍後再試");
      } else {
        setError("登入失敗，請稍後再試");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle();
      router.push(redirect);
      router.refresh();
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "auth/popup-closed-by-user") return;
      setError("Google 登入失敗，請稍後再試");
    }
  };

  const handleReset = async () => {
    if (!email) {
      setError("請先輸入電郵地址");
      return;
    }
    try {
      await resetPassword(email);
      setResetSent(true);
      setError("");
    } catch {
      setError("發送重設密碼郵件失敗");
    }
  };

  return (
    <>
      <div className="eyebrow-muted mb-4">Welcome Back</div>
      <h1 className="font-serif text-[36px] text-brand-text leading-tight mb-2">
        登入
      </h1>
      <p className="text-[13px] text-brand-softer mb-10">
        尚未成為會員？{" "}
        <Link
          href="/register"
          className="text-brand-accent border-b border-brand-accent hover:text-brand-dark hover:border-brand-dark"
        >
          立即加入
        </Link>
      </p>

      <GoogleButton onClick={handleGoogle} />

      <div className="flex items-center gap-4 my-8">
        <div className="flex-1 h-px bg-brand-hair" />
        <span className="text-[11px] text-brand-softer tracking-[0.2em] uppercase">
          或使用電郵
        </span>
        <div className="flex-1 h-px bg-brand-hair" />
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <Field label="電郵" htmlFor="email">
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </Field>

        <Field
          label="密碼"
          htmlFor="password"
          action={
            <button
              type="button"
              onClick={handleReset}
              className="text-[11px] text-brand-accent hover:text-brand-dark"
            >
              忘記密碼？
            </button>
          }
        >
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="•••••••"
            autoComplete="current-password"
          />
        </Field>

        {resetSent && (
          <div className="text-[12px] text-brand-accent bg-brand-bg border border-brand-rule px-3 py-2">
            重設密碼郵件已寄出，請檢查你嘅 inbox
          </div>
        )}

        {error && (
          <div className="text-[12px] text-red-700 bg-red-50 border border-red-200 px-3 py-2">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-dark text-white py-3 text-[14px] font-bold tracking-wide hover:bg-brand-text transition disabled:opacity-50"
        >
          {loading ? "登入中…" : "登入"}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function Field({
  label,
  htmlFor,
  action,
  children,
}: {
  label: string;
  htmlFor: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={htmlFor}
          className="text-[11px] text-brand-muted tracking-[0.15em] uppercase font-semibold"
        >
          {label}
        </label>
        {action}
      </div>
      {children}
    </div>
  );
}
