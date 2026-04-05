"use client";

import { useEffect, useState } from "react";

interface StreamingTextProps {
  content: string;
  speed?: number; // ms per character
}

/**
 * StreamingText — renders text character by character for a streaming effect.
 * Used when playing back non-streamed responses with animation.
 */
export default function StreamingText({ content, speed = 20 }: StreamingTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setDisplayed("");
    setIndex(0);
  }, [content]);

  useEffect(() => {
    if (index < content.length) {
      const timer = setTimeout(() => {
        setDisplayed((prev) => prev + content[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [index, content, speed]);

  return (
    <span>
      {displayed}
      {index < content.length && (
        <span
          style={{
            display: "inline-block",
            width: 2,
            height: "1em",
            background: "var(--accent-primary)",
            marginLeft: 2,
            animation: "pulse 1s ease-in-out infinite",
            verticalAlign: "text-bottom",
          }}
        />
      )}
    </span>
  );
}
