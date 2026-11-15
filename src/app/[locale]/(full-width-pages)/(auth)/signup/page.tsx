import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Registro de Administrador | SuperBarrio Control Center",
  description: "Crear cuenta de acceso para SuperBarrio Supermercado.",
};

export default function SignUp() {
  return <SignUpForm />;
}
