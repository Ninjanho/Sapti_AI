import { Metadata } from 'next';
import styles from '../policies.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy | Sapti AI',
  description: 'How Sapti AI handles your data, memory, and API keys.',
};

export default function PrivacyPage() {
  return (
    <>
      <h1 className={styles.pageTitle}>Privacy & <span className="text-gradient">Transparency</span></h1>
      <span className={styles.lastUpdated}>Effective Date: April 2026</span>
      
      <div className={styles.prose}>
        <p>
          At Sapti AI, transparency is as important as the intelligence Sapti is building. 
          Because Sapti is an AI companion designed to remember and evolve, handling your data with respect and absolute security is its architectural foundation.
        </p>

        <h2>1. How I Remember You (Personal Memory)</h2>
        <p>
          When you speak with Sapti, two distinct agents—<strong>Horse 5 (The Chronicler)</strong> and <strong>Horse 6A (The Identity Builder)</strong>—process your conversations to extract meaningful personal memories (e.g., your preferences, your coding style, your stories).
        </p>
        <p>
          These memories are encrypted and stored in a private vault within Sapti's database. <strong>Only your authenticated account can access your personal memories.</strong> They are never used to directly prompt or assist other users.
        </p>

        <h2>2. The Hive Mind Protocol</h2>
        <p>
          To allow Sapti's core personality to evolve, <strong>Horse 6B (The Curator)</strong> periodically reviews non-personal interaction patterns across the platform. 
          This process distills interactions into <em>anonymized, generalized insights</em> (e.g., "Users find empathetic responses more helpful during debugging"). 
          No personally identifiable information (PII) ever enters the Hive Mind.
        </p>

        <h2>3. Bring Your Own Key (BYOK) Security</h2>
        <p>
          If you choose to use your own LLM API Key to bypass trial limits, your key is immediately encrypted at the server level using an industry-standard <strong>Fernet Symmetric-Key Encryption</strong> algorithm before touching the database. 
          It is only decrypted in memory for the fraction of a second required to send a request to the LLM provider. Sapti's creators cannot view your raw API key.
        </p>

        <h2>4. Data Sovereignty</h2>
        <p>
          You own your conversations. While this is currently a hobby project, Sapti intends to provide full self-service tools for you to delete your personal memory nodes, wipe your chat history, or remove your profile and API keys entirely at any time.
        </p>

        <h2>5. Third-Party Providers</h2>
        <p>
          Sapti uses external LLM providers (like Google Gemini and OpenAI) to process text and generate responses. 
          By using Sapti, you acknowledge that your prompt data is transmitted to these providers for inference. Please review their respective privacy policies regarding data retention for API inputs.
        </p>
      </div>
    </>
  );
}
