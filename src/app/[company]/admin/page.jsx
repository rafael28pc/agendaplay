import { db } from "../../firebase/config";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { notFound } from "next/navigation";
import AdminDashboard from "./AdminDashboard";

async function fetchCompanyData(company) {
  const docRef = doc(db, "company", company);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docSnap.data().dados;
}

async function fetchUsers(company) {
  const usersRef = collection(db, "company", company, "users");
  const usersSnap = await getDocs(usersRef);
  return usersSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export default async function AdminPage({ params }) {
  const resolvedParams = await params;
  const company = resolvedParams.company;
  const config = await fetchCompanyData(company);
  const users = await fetchUsers(company);

  if (!config) notFound();

  return (
    <AdminDashboard params={resolvedParams} config={config} users={users} />
  );
}