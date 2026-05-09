"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import GoogleButton from "@/components/auth/GoogleButton";
import { registerWithEmail, loginWithGoogle } from "@/lib/firebase/auth";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (password.length < 6) {
      setError("密碼至少需要 6 個字符");
      setLoading(false);
      return;
    }
    if (!whatsapp.trim() || whatsapp.replace(/\D/g, "").length < 8) {
      setError("請填寫有效嘅 WhatsApp 聯絡電話");
      setLoading(false);
      return;
    }
    try {
      await registerWithEmail(email, password, fullName, whatsapp, newsletter);
      router.push(redirect);
      router.refresh();
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "auth/email-already-in-use") {
        setError("此電郵已註冊，請直接登入");
      } else if (code === "auth/invalid-email") {
        setError("電郵格式不正確");
      } else if (code === "auth/weak-password") {
        setError("密碼強度不足");
      } else {
        setError("註冊失敗，請稍後再試");
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
      setError("Google 註冊失敗，請稍後再試");
    }
  };

  return (
    <>
      <div className="eyebrow-muted mb-4">Create Account</div>
      <h1 className="font-serif text-[36px] text-brand-text leading-tight mb-2">
        立即加入
      </h1>
      <p className="text-[13px] text-brand-softer mb-10">
        已有帳戶？{" "}
        <Link
          href="/login"
          className="text-brand-accent border-b border-brand-accent hover:text-brand-dark hover:border-brand-dark"
        >
          返回登入
        </Link>
      </p>

      <GoogleButton onClick={handleGoogle} label="使用 Google 快速註冊" />

      <div className="flex items-center gap-4 my-7">
        <div className="flex-1 h-px bg-brand-hair" />
        <span className="text-[11px] text-brand-softer tracking-[0.2em] uppercase">
          或填寫資料
        </span>
        <div className="flex-1 h-px bg-brand-hair" />
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <Field label="全名" htmlFor="fullName">
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input"
            placeholder="陳大文"
            autoComplete="name"
          />
        </Field>

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

        <Field label="密碼（最少 6 字符）" htmlFor="password">
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="•••••••"
            autoComplete="new-password"
          />
        </Field>

        <Field label="WhatsApp 聯絡電話" htmlFor="whatsapp">
          <input
            id="whatsapp"
            type="tel"
            required
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="input"
            placeholder="+852 9xxx xxxx"
            autoComplete="tel"
          />
        </Field>

        <label className="flex items-start gap-2.5 text-[12px] text-brand-muted cursor-pointer py-2">
          <input
            type="checkbox"
            checked={newsletter}
            onChange={(e) => setNewsletter(e.target.checked)}
            className="mt-0.5 accent-brand-dark"
          />
          <span>訂閱創研社 Newsletter，接收最新活動資訊（可隨時取消）</span>
        </label>

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
          {loading ? "註冊中…" : "建立帳戶"}
        </button>

        <p className="text-[11px] text-brand-softer leading-relaxed pt-2">
          點擊「建立帳戶」即表示同意創研社嘅
          <Link href="/terms" className="underline hover:text-brand-dark">
            服務條款
          </Link>
          及
          <Link href="/privacy" className="underline hover:text-brand-dark">
            私隱政策
          </Link>
          。
        </p>
      </form>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="block text-[11px] text-brand-muted tracking-[0.15em] uppercase font-semibold mb-1.5"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
