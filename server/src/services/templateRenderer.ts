import Handlebars from 'handlebars';
import { marked } from 'marked';
import type { NoteTemplateData } from '../types/index.js';

export type { NoteTemplateData };

export class TemplateRenderer {
  private templateCache: Map<string, HandlebarsTemplateDelegate> = new Map();

  constructor() {
    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true
    });

    // Register Handlebars helpers
    this.registerHelpers();
  }

  /**
   * Register custom Handlebars helpers
   */
  private registerHelpers(): void {
    // Markdown to HTML helper
    Handlebars.registerHelper('markdown', (text: string) => {
      return new Handlebars.SafeString(marked(text) as string);
    });

    // Date formatting helper
    Handlebars.registerHelper('formatDate', (date: string | Date) => {
      const d = typeof date === 'string' ? new Date(date) : date;
      return d.toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    });
  }

  /**
   * Render notes template with enhanced styling
   */
  renderNotesTemplate(data: NoteTemplateData): string {
    const template = this.getNotesTemplate();
    const compiled = Handlebars.compile(template);
    return compiled(data);
  }

  /**
   * Get the default notes template
   */
  private getNotesTemplate(): string {
    return `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{title}}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 11pt;
      line-height: 1.7;
      color: #1a1a1a;
      background: white;
      max-width: 100%;
      padding: 0;
    }

    h1, h2, h3, h4, h5, h6 {
      color: #1a1a1a;
      font-weight: 600;
      margin-top: 24px;
      margin-bottom: 12px;
      page-break-after: avoid;
    }

    h1 {
      font-size: 22pt;
      border-bottom: 2px solid #1a1a1a;
      padding-bottom: 8px;
      margin-top: 32px;
    }

    h2 {
      font-size: 18pt;
      margin-top: 28px;
    }

    h3 {
      font-size: 14pt;
    }

    h4 {
      font-size: 12pt;
    }

    p {
      margin-bottom: 12px;
      text-align: justify;
      orphans: 3;
      widows: 3;
    }

    strong {
      font-weight: 600;
      color: #1a1a1a;
    }

    em {
      font-style: italic;
      color: #4a4a4a;
    }

    code {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 9.5pt;
      color: #dc2626;
    }

    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 16px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 16px 0;
      page-break-inside: avoid;
    }

    pre code {
      background: none;
      color: #e2e8f0;
      padding: 0;
      font-size: 9pt;
    }

    ul, ol {
      margin: 12px 0 12px 24px;
      padding-left: 0;
    }

    li {
      margin-bottom: 6px;
      line-height: 1.6;
    }

    ul li {
      list-style-type: disc;
    }

    ul ul li {
      list-style-type: circle;
    }

    ol li {
      list-style-type: decimal;
    }

    blockquote {
      border-left: 4px solid #1a1a1a;
      padding-left: 16px;
      margin: 16px 0;
      color: #4a4a4a;
      font-style: italic;
      background: #f8fafc;
      padding: 12px 16px;
      border-radius: 0 4px 4px 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      page-break-inside: avoid;
    }

    th, td {
      border: 1px solid #e2e8f0;
      padding: 10px 12px;
      text-align: left;
    }

    th {
      background: #f1f5f9;
      font-weight: 600;
      color: #1a1a1a;
    }

    tr:nth-child(even) {
      background: #f8fafc;
    }

    a {
      color: #1a1a1a;
      text-decoration: underline;
    }

    a:hover {
      text-decoration: underline;
    }

    hr {
      border: none;
      border-top: 2px solid #e2e8f0;
      margin: 24px 0;
    }

    .page-number {
      text-align: center;
      font-size: 9pt;
      color: #94a3b8;
      margin-top: 20px;
    }

    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }

      h1, h2, h3, h4, h5, h6 {
        page-break-after: avoid;
      }

      pre, blockquote, table {
        page-break-inside: avoid;
      }

      img {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  {{{markdown content}}}
</body>
</html>
    `.trim();
  }

  /**
   * Compile and cache a template
   */
  compileTemplate(name: string, template: string): HandlebarsTemplateDelegate {
    if (!this.templateCache.has(name)) {
      this.templateCache.set(name, Handlebars.compile(template));
    }
    return this.templateCache.get(name)!;
  }
}
