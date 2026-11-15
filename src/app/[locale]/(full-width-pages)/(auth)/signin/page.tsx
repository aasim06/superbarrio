import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión | SuperBarrio Control Center",
  description: "Acceso seguro al panel de administración de SuperBarrio Supermercado.",
};

export default function SignIn() {
  return <SignInForm />;
}
