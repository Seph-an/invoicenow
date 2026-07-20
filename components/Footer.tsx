import styles from "./Footer.module.css";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className={styles.footer}>
      © {currentYear} All rights reserved | By{" "}
      <a href="https://dev.sephan.co.ke" target="_blank" rel="noreferrer">
        dev.sephan.co.ke
      </a>
    </footer>
  );
}
