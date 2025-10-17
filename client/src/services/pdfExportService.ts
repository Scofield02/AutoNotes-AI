export interface PDFExportOptions {
  title?: string;
  author?: string;
  date?: string;
  format?: 'A4' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

export class PDFExportService {
  private readonly API_URL: string;

  constructor(apiUrl: string = 'http://localhost:3001/api') {
    this.API_URL = apiUrl;
  }

  /**
   * Export content to PDF via backend
   */
  async exportToPDF(
    content: string,
    options: PDFExportOptions = {}
  ): Promise<Blob> {
    try {
      const response = await fetch(`${this.API_URL}/pdf/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          metadata: {
            title: options.title || 'AutoNotes Document',
            author: options.author || 'AutoNotes AI',
            date: options.date || new Date().toISOString(),
          },
          options: {
            format: options.format || 'A4',
            orientation: options.orientation || 'portrait',
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to generate PDF');
      }

      return await response.blob();
    } catch (error) {
      console.error('PDF Export Error:', error);
      throw error;
    }
  }

  /**
   * Download PDF blob as file
   */
  downloadPDF(blob: Blob, filename: string = 'autonotes.pdf'): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export and download PDF in one call
   */
  async exportAndDownload(
    content: string,
    filename: string = 'autonotes.pdf',
    options: PDFExportOptions = {}
  ): Promise<void> {
    const blob = await this.exportToPDF(content, options);
    this.downloadPDF(blob, filename);
  }

  /**
   * Check if server is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_URL}/pdf/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const pdfExportService = new PDFExportService();
