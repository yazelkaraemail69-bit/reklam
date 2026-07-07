"use client";

import { useEffect, useRef } from "react";

interface ScriptInjectorProps {
  /** Raw HTML/script snippet pasted by the admin (Google Analytics, Meta Pixel, GTM, vb.) */
  html?: string;
}

/**
 * Injects arbitrary analytics/ad script snippets at runtime.
 * Scripts inserted via innerHTML do not execute in browsers, so each
 * <script> tag found in the snippet is re-created as a real DOM node.
 */
export function ScriptInjector({ html }: ScriptInjectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!html || !html.trim() || !container) return;

    const template = document.createElement("template");
    template.innerHTML = html;

    const appended: Node[] = [];

    Array.from(template.content.childNodes).forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const source = node as HTMLScriptElement;
        const script = document.createElement("script");
        Array.from(source.attributes).forEach((attr) => {
          script.setAttribute(attr.name, attr.value);
        });
        script.text = source.text;
        container.appendChild(script);
        appended.push(script);
      } else {
        const clone = node.cloneNode(true);
        container.appendChild(clone);
        appended.push(clone);
      }
    });

    return () => {
      appended.forEach((node) => {
        if (container.contains(node)) {
          container.removeChild(node);
        }
      });
    };
  }, [html]);

  if (!html || !html.trim()) return null;

  return <div ref={containerRef} data-script-injector="" style={{ display: "none" }} />;
}
