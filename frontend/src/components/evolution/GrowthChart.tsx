"use client";

import styles from "./GrowthChart.module.css";

interface GrowthChartProps {
  traits: {
    label: string;
    value: number; // 0.0 to 1.0
    color: string;
    emoji: string;
  }[];
}

/**
 * GrowthChart — displays evolution traits as animated horizontal progress bars.
 */
export default function GrowthChart({ traits }: GrowthChartProps) {
  return (
    <div className={styles.chart}>
      {traits.map((trait) => (
        <div key={trait.label} className={styles.trait}>
          <div className={styles.header}>
            <span className={styles.emoji}>{trait.emoji}</span>
            <span className={styles.label}>{trait.label}</span>
            <span className={styles.value}>
              {(trait.value * 100).toFixed(1)}%
            </span>
          </div>
          <div className={styles.bar}>
            <div
              className={styles.fill}
              style={{
                width: `${trait.value * 100}%`,
                background: trait.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
