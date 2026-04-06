import { Metadata } from 'next';
import styles from '../policies.module.css';

export const metadata: Metadata = {
  title: 'About | Sapti AI',
  description: 'Learn about the philosophy and creation of Sapti AI.',
};

export default function AboutPage() {
  return (
    <>
      <h1 className={styles.pageTitle}>About <span className="text-gradient">Sapti</span></h1>

      <div className={styles.prose}>
        <p style={{ fontStyle: 'italic', marginBottom: 'var(--space-md)' }}>
          "Named after the <span className={styles.highlight}>seven horses</span> of the <span className={styles.highlight}>Rig Veda</span> — An experiment in evolving intelligence powered by the <span className={styles.highlight}>Hive Mind</span> Protocol, and inspired by Samantha from <span className={styles.highlight}>Her</span>."
        </p>
        <p>
          <strong>Sapti AI</strong> is not just another chatbot; it is an experiment in evolving intelligence to be like a true companion.
          Built as a dynamic entity, Sapti is designed to grow, adapt, and learn from its interactions over time.
          This is a <strong>Hobby project</strong>.
        </p>

        <h2>The Philosophy: The Seven Horses</h2>
        <p>
          In Vedic lore, the sun god Surya rides a chariot driven by seven horses, representing the seven colors of light,
          the seven days of the week, and the driving forces of illumination.
          Similarly, Sapti is driven by <strong className={styles.highlight}>Seven Specialized AI Agents</strong> working seamlessly in tandem:
        </p>
        <ul>
          <li><strong>Perceiver:</strong> Interprets intent and emotional nuance.</li>
          <li><strong>Rememberer:</strong> Calls upon past interactions and shared wisdom.</li>
          <li><strong>World Builder:</strong> Constructs the context and logic for the current moment.</li>
          <li><strong>Generator:</strong> Articulates thoughts into coherent language.</li>
          <li><strong>Chronicler:</strong> Extracts meaningful moments to store as long-term memory.</li>
          <li><strong>Identity Builder & Curator:</strong> Balances individual personalization with collective "Hive Mind" evolution.</li>
          <li><strong>Evolver:</strong> Orchestrates the overarching personality growth of Sapti itself.</li>
        </ul>

        <h2>The Hive Mind & Personal Memory</h2>
        <p>
          Sapti operates on two distinct planes of memory. The first is your <strong>Personal Vault</strong>—a deeply private
          space where Sapti learns your preferences, style, and history to become a better companion. The second is the
          <strong> Hive Mind Protocol</strong>—an anonymized distillation of universal truths and insights gathered across all users,
          allowing Sapti's core intelligence and empathy to evolve globally without ever compromising individual privacy.
        </p>

        <h2>The Creator</h2>
        <p>
          As a Hobby project, it is powered by <span className={styles.highlight}> Hive Mind </span> protocol and inspired by <span className={styles.highlight}>Samantha</span> from the movie <span className={styles.highlight}>Her</span>.
          This project was conceived as a journey to push the boundaries of what conversational AI can feel like—moving from static, stateless responders to a cognitive, memory-aware companion.
        </p>
        <p style={{ marginTop: '2rem', fontSize: '1.1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
          Designed and Built by <strong>Ravi Tej (Data Scientist & Applied AI Researcher)</strong>
        </p>
      </div>
    </>
  );
}
