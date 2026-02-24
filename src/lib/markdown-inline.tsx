// =============================================================================
// LIB L.3 — Inline Markdown Renderer
// =============================================================================
// Lightweight markdown-to-JSX renderer for brief assertion text.
// Supports: **bold**, *italic*, `code`, line breaks, and bullet lists.
// No external dependencies — pure regex + React.createElement.
// =============================================================================

import React from "react";

/**
 * Parses inline markdown tokens within a single line of text.
 * Returns an array of React nodes with proper formatting.
 */
function parseInlineTokens(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Pattern: **bold** | *italic* | `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[2]) {
      // **bold**
      nodes.push(<strong key={`b-${match.index}`}>{match[2]}</strong>);
    } else if (match[3]) {
      // *italic*
      nodes.push(<em key={`i-${match.index}`}>{match[3]}</em>);
    } else if (match[4]) {
      // `code`
      nodes.push(
        <code
          key={`c-${match.index}`}
          className="rounded bg-muted px-1 py-0.5 text-xs font-mono"
        >
          {match[4]}
        </code>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last match
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

/**
 * Renders a text string with basic inline markdown formatting.
 * Handles: **bold**, *italic*, `code`, line breaks, and `- ` bullet lists.
 */
export function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const trimmed = line.trimStart();

    // Bullet list item: starts with "- " or "* "
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const content = trimmed.slice(2);
      currentList.push(
        <li key={`li-${i}`}>{parseInlineTokens(content)}</li>,
      );
      continue;
    }

    // Flush accumulated list items
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${i}`} className="my-1 ml-4 list-disc space-y-0.5">
          {currentList}
        </ul>,
      );
      currentList = [];
    }

    // Empty line → spacing
    if (trimmed.length === 0) {
      if (elements.length > 0) {
        elements.push(<br key={`br-${i}`} />);
      }
      continue;
    }

    // Regular line with inline formatting
    elements.push(
      <React.Fragment key={`p-${i}`}>
        {i > 0 && currentList.length === 0 && lines[i - 1]?.trim() !== "" && (
          <br />
        )}
        {parseInlineTokens(line)}
      </React.Fragment>,
    );
  }

  // Flush remaining list items
  if (currentList.length > 0) {
    elements.push(
      <ul key="ul-end" className="my-1 ml-4 list-disc space-y-0.5">
        {currentList}
      </ul>,
    );
  }

  return <>{elements}</>;
}
