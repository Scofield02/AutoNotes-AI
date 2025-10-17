import puppeteer, { Browser, Page, PDFOptions } from 'puppeteer';
import type { PDFOptions as CustomPDFOptions } from '../types/index.js';

export interface PDFGenerationOptions extends CustomPDFOptions {}

export class PDFGenerator {
  private browser: Browser | null = null;

  /**
   * Initialize browser instance (reusable for multiple PDFs)
   */
  private async initBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
    }
    return this.browser;
  }

  /**
   * Generate PDF from HTML content
   */
  async generateFromHTML(
    htmlContent: string, 
    options: PDFGenerationOptions = {}
  ): Promise<Buffer> {
    const browser = await this.initBrowser();
    const page: Page = await browser.newPage();

    try {
      // Set viewport for consistent rendering
      await page.setViewport({
        width: 1200,
        height: 1600,
        deviceScaleFactor: 2
      });

      // Set content and wait for resources
      await page.setContent(htmlContent, {
        waitUntil: ['load', 'networkidle0'],
        timeout: 30000
      });

      // Wait a bit for fonts and CSS to fully load
      await page.evaluateHandle('document.fonts.ready');

      // Configure PDF options
      const pdfOptions: PDFOptions = {
        format: options.format || 'A4',
        landscape: options.orientation === 'landscape',
        printBackground: options.printBackground !== false,
        preferCSSPageSize: options.preferCSSPageSize || false,
        margin: {
          top: options.margin?.top || '20mm',
          right: options.margin?.right || '15mm',
          bottom: options.margin?.bottom || '20mm',
          left: options.margin?.left || '15mm'
        }
      };

      // Generate PDF
      const pdfBuffer = await page.pdf(pdfOptions);

      return Buffer.from(pdfBuffer);

    } finally {
      await page.close();
    }
  }

  /**
   * Close browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Generate PDF with custom page evaluation
   */
  async generateWithCustomization(
    htmlContent: string,
    options: PDFGenerationOptions = {},
    customFn?: (page: Page) => Promise<void>
  ): Promise<Buffer> {
    const browser = await this.initBrowser();
    const page: Page = await browser.newPage();

    try {
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Execute custom function if provided
      if (customFn) {
        await customFn(page);
      }

      const pdfOptions: PDFOptions = {
        format: options.format || 'A4',
        landscape: options.orientation === 'landscape',
        printBackground: true,
        margin: options.margin || {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      };

      const pdfBuffer = await page.pdf(pdfOptions);
      return Buffer.from(pdfBuffer);

    } finally {
      await page.close();
    }
  }
}
