"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

/**
 * Root error boundary. Catches errors that escape the root layout
 * itself (so the regular error.tsx can't run). Must render its own
 * <html><body> because the root layout failed to render.
 *
 * Kept minimal on purpose — if this is the screen the user sees, the
 * app is fundamentally broken and we just want one clear escape route.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
    Sentry.captureException(error, {
      tags: { boundary: "root", digest: error.digest ?? "unknown" },
      level: "fatal",
    });
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: "#0c0a09",
          color: "#ece7dc",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: 560, textAlign: "left" }}>
          <p
            style={{
              margin: 0,
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.32em",
              color: "#ef7b35cc",
            }}
          >
            Error / hard fault
          </p>
          <h1
            style={{
              marginTop: 16,
              fontSize: "clamp(2rem, 5vw, 3.4rem)",
              fontWeight: 800,
              textTransform: "uppercase",
              lineHeight: 0.95,
              letterSpacing: "-0.01em",
            }}
          >
            Something hit the floor.
          </h1>
          <p
            style={{
              marginTop: 20,
              fontSize: 15,
              lineHeight: 1.6,
              color: "#d6d3d1cc",
            }}
          >
            We&rsquo;ve hit a fault we can&rsquo;t recover in place.
            Reload the page. If it persists, we&rsquo;re on it.
          </p>
          {error.digest ? (
            <p
              style={{
                marginTop: 12,
                fontFamily: "ui-monospace, monospace",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                color: "#a8a29eb3",
              }}
            >
              Incident: <span style={{ color: "#d6d3d1" }}>{error.digest}</span>
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 36,
              background: "#ece7dc",
              color: "#0c0a09",
              border: "none",
              padding: "12px 20px",
              fontFamily:
                "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 13,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
