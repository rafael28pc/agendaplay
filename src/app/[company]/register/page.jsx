import { db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";
import RegisterForm from "./RegisterForm";

async function fetchCompanyData(company) {
  const docRef = doc(db, "company", company);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docSnap.data().dados;
}

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const company = resolvedParams.company;
  const dados = await fetchCompanyData(company);
  if (!dados) return { title: "Empresa não encontrada" };
  return { title: `Registro - ${dados.nome}` };
}

export default async function RegisterPage({ params }) {
  const resolvedParams = await params;
  const company = resolvedParams.company;
  const config = await fetchCompanyData(company);

  if (!config) notFound();

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: config.config.corPrimaria || "#FFFFFF" }}
    >
      <div className="bg-white/10 p-8 rounded-lg shadow-lg w-full max-w-md text-white">
        <img
          src={config.config.logoUrl}
          alt={`Logo ${config.nome}`}
          className="max-w-[100px] mx-auto mb-6"
        />
        <h1 className="text-3xl font-bold text-center mb-6">
          Registro - {config.nome}
        </h1>
        <RegisterForm company={company} config={config} />
      </div>
    </div>
  );
}