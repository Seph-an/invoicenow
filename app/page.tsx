import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { InvoiceCard } from "@/components/InvoiceCard";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <Header />
      <main className={styles.main}>
        <InvoiceCard />
      </main>
      <Footer />
    </div>
  );
}
