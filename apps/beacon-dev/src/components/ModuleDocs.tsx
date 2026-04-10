'use client';

import { useEffect, useState } from 'react';

function renderMarkdown(md: string): string {
  let html = md
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
    // Headers
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="inline">$1</code>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr/>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    // Table rows (basic)
    .replace(/^\|(.+)\|$/gm, (match, content) => {
      const cells = content.split('|').map((c: string) => c.trim());
      if (cells.every((c: string) => /^-+$/.test(c))) return '';
      const tag = 'td';
      return '<tr>' + cells.map((c: string) => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
    })
    // Paragraphs (lines that aren't already tagged)
    .replace(/^(?!<[hluotp]|<\/|<hr|<pre|<tr)(.+)$/gm, '<p>$1</p>');

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');
  // Wrap consecutive <tr> in <table>
  html = html.replace(/((?:<tr>.*<\/tr>\n?)+)/g, '<table>$1</table>');

  return html;
}

export default function ModuleDocs({ group }: { group: string }) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/admin/module-docs/${group}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load');
        return res.text();
      })
      .then(setContent)
      .catch(() => setError('Could not load module documentation.'));
  }, [group]);

  if (error) return <div style={{ color: '#6b7280', padding: '40px' }}>{error}</div>;
  if (!content) return <div style={{ color: '#6b7280', padding: '40px' }}>Loading...</div>;

  return (
    <div
      className="module-docs-content"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
}
