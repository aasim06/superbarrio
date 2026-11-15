import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import { LeafIcon } from "@/icons";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
          {children}

          {/* Right Side Store Branding Banner */}
          <div className="lg:w-1/2 w-full h-full bg-gradient-to-br from-[#051c14] via-[#092b1e] to-[#04150f] lg:grid items-center hidden relative overflow-hidden">
            {/* Ambient emerald glowing orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-green-500/10 blur-3xl pointer-events-none" />

            <div className="relative items-center justify-center flex z-10 px-8">
              <GridShape />
              <div className="flex flex-col items-center max-w-md text-center">
                <Link
                  href="/grocery"
                  className="group flex flex-col items-center mb-6 transition-transform duration-200 hover:scale-105"
                >
                  {/* Glowing Store Logo Icon Box */}
                  <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-[0_12px_32px_rgba(16,185,129,0.45)] ring-4 ring-emerald-500/20">
                    <LeafIcon className="h-10 w-10 transition-transform duration-300 group-hover:rotate-12" />
                    <span className="absolute -top-1 -end-1 flex h-4 w-4">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-400 ring-2 ring-[#051c14]" />
                    </span>
                  </div>

                  {/* Store Brand Typography */}
                  <div className="flex items-center gap-2">
                    <span className="font-outfit text-3xl font-black tracking-tight text-white">
                      Super<span className="text-emerald-400">Barrio</span>
                    </span>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-emerald-300 uppercase">
                      CONTROL
                    </span>
                  </div>
                  <span className="mt-1 text-xs font-semibold text-emerald-200/70 tracking-widest uppercase">
                    Supermercado Fresco & Delivery Exprés
                  </span>
                </Link>
              </div>
            </div>
          </div>

          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
