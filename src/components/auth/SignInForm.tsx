"use client";

import React, { useState } from "react";
import Checkbox from "@/components/form/input/Checkbox";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { Link, useRouter } from "@/i18n/navigation";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";
import { toast } from "sonner";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth, isFirebaseConfigured } from "@/lib/firebase/config";

export default function SignInForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim()) {
      toast.error("Por favor introduzca su usuario o email.");
      return;
    }
    if (!password) {
      toast.error("Por favor introduzca su contraseña.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json();

      if (data.success) {
        // Explicitly set client-side cookie so layout guard passes immediately
        document.cookie = "sb_admin_session=true; path=/; max-age=604800; SameSite=Lax";
        toast.success("¡Bienvenido! Sesión iniciada correctamente.");

        const callback =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("callbackUrl") || "/dashboard"
            : "/dashboard";

        setTimeout(() => {
          window.location.href = callback;
        }, 150);
      } else {
        toast.error(data.error || "Usuario o contraseña incorrectos.");
      }
    } catch (err) {
      toast.error("Error de conexión al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured || !auth) {
      toast.error("Google Firebase no está configurado.");
      return;
    }

    setIsGoogleLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleEmail = result.user?.email;

      if (!googleEmail) {
        toast.error("No se pudo obtener el email de Google.");
        return;
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isGoogle: true, googleEmail }),
      });

      const data = await res.json();

      if (data.success) {
        document.cookie = "sb_admin_session=true; path=/; max-age=604800; SameSite=Lax";
        toast.success(`¡Bienvenido ${result.user?.displayName || "Admin"}!`);
        const callback =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("callbackUrl") || "/dashboard"
            : "/dashboard";

        setTimeout(() => {
          window.location.href = callback;
        }, 150);
      } else {
        toast.error(data.error || "Esta cuenta de Google no tiene acceso de administrador.");
      }
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user") {
        toast.error("Error al iniciar sesión con Google.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-1 flex-col lg:w-1/2">
      <div className="mx-auto mb-5 w-full max-w-md sm:pt-10">
        <Link
          href="/grocery"
          className="inline-flex items-center text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700 dark:text-emerald-400"
        >
          <ChevronLeftIcon className="rtl:rotate-180" />
          Volver a la Tienda (SuperBarrio)
        </Link>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 text-title-sm font-bold text-gray-900 sm:text-title-md dark:text-white">
              Panel de Administración
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Introduzca sus credenciales para acceder a la gestión de SuperBarrio.
            </p>
          </div>

          <div>
            <div className="mb-5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading}
                className="inline-flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-xs transition-colors hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 dark:border-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                    fill="#EB4335"
                  />
                </svg>
                {isGoogleLoading ? "Conectando..." : "Acceder con Google (Admin)"}
              </button>
            </div>

            <div className="relative py-3 sm:py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 font-semibold text-gray-400 dark:bg-gray-900">
                  O credenciales directas
                </span>
              </div>
            </div>

            {/* Quick Helper Credentials Card */}
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-3.5 shadow-xs dark:border-emerald-900/60 dark:bg-emerald-950/40">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Credenciales de Acceso Admin:</span>
                  </div>
                  <p className="mt-1 text-emerald-700/90 dark:text-emerald-400 text-[11px]">
                    Usuario: <strong className="font-mono bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded text-emerald-900 dark:text-white">admin</strong>{" "}
                    | Clave: <strong className="font-mono bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded text-emerald-900 dark:text-white">admin</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier("admin");
                    setPassword("admin");
                  }}
                  className="self-start sm:self-auto rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 active:scale-95 transition cursor-pointer"
                >
                  Autocompletar
                </button>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label>
                  Usuario o Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin o aasimameer06@gmail.com"
                  required
                />
              </div>

              <div>
                <Label>
                  Contraseña <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer text-gray-500"
                  >
                    {showPassword ? (
                      <EyeIcon className="size-5 fill-gray-500" />
                    ) : (
                      <EyeCloseIcon className="size-5 fill-gray-500" />
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Checkbox checked={rememberMe} onChange={setRememberMe} />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Recordar sesión
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 font-bold text-white shadow-md hover:from-emerald-700 hover:to-green-700"
                  size="md"
                >
                  {isLoading ? "Verificando..." : "Iniciar Sesión"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
