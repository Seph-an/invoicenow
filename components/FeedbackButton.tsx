import styles from "./FeedbackButton.module.css";

const mailTo = (() => {
  const subject = encodeURIComponent("InvoiceNow Feedback");
  return `mailto:services@sephanly.com?subject=${subject}`;
})();

const MailIcon = () => (
  <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" />
    <path d="m22 6-10 7L2 6" />
  </svg>
);

export function FeedbackButton() {
  return (
    <a href={mailTo} className={styles.feedbackButton} aria-label="Leave feedback via email">
      <MailIcon />
      <span>Leave Feedback</span>
    </a>
  );
}
