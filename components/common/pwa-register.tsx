"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Pankh PWA ServiceWorker registered with scope:", registration.scope);
          })
          .catch((error) => {
            console.warn("Pankh PWA ServiceWorker registration failed:", error);
          });
      });
    }
  }, []);

  return null;
}
