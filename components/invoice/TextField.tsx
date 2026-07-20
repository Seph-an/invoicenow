import styles from "../InvoiceCard.module.css";

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  multiline?: boolean;
  placeholder?: string;
  autoComplete?: string;
};

export function TextField({
  id, label, value, onChange, type = "text", multiline = false, placeholder, autoComplete
}: TextFieldProps) {
  return (
    <label htmlFor={id} className={styles.field}>
      <span className={styles.label}>{label}</span>
      {multiline ? (
        <textarea
          id={id}
          className={`${styles.input} ${styles.textarea}`}
          rows={3}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          id={id}
          className={styles.input}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}
