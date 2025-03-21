import { db } from "../../firebase/config";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import CourtsSchedule from "./CourtsSchedule";

async function fetchCourts(company) {
  try {
    const courtsRef = collection(db, "company", company, "courts");
    const courtsSnap = await getDocs(courtsRef);
    const courtsData = courtsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return courtsData.length ? courtsData : [];
  } catch (error) {
    console.error("Erro ao buscar quadras:", error);
    return [];
  }
}

async function fetchCompanyData(company) {
  const docRef = doc(db, "company", company);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docSnap.data().dados;
}

export default async function AgendamentoPage({ params }) {
  const resolvedParams = await params;
  const company = resolvedParams.company;

  const courts = await fetchCourts(company);
  const config = await fetchCompanyData(company);

  return <CourtsSchedule courts={courts} company={company} config={config} />;
}