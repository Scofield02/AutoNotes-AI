import { Request, Response, Router } from 'express';
import { PDFGenerator } from '../services/pdfGenerator';
import { TemplateRenderer } from '../services/templateRenderer';
import type { GeneratePDFRequest } from '../types';

const router = Router();
const pdfGenerator = new PDFGenerator();
const templateRenderer = new TemplateRenderer();

// POST /api/pdf/generate
router.post('/generate', async (req: Request<{}, {}, GeneratePDFRequest>, res: Response) => {
  try {
    const { content, metadata = {}, options = {} } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Render HTML with template
    const html = templateRenderer.renderNotesTemplate({
      content,
      title: metadata.title || 'AutoNotes Document',
      author: metadata.author || 'AutoNotes AI',
      date: metadata.date || new Date().toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    });

    // Generate PDF
    const pdfBuffer = await pdfGenerator.generateFromHTML(html, {
      format: options.format || 'A4',
      orientation: options.orientation || 'portrait',
      margin: options.margin || {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    // Send PDF
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="autonotes-${Date.now()}.pdf"`);
    res.send(pdfBuffer);

  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ 
      error: 'Failed to generate PDF',
      message: error.message 
    });
  }
});

// GET /api/pdf/health
router.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok',
    service: 'PDF Generator',
    puppeteer: 'ready'
  });
});

export { router as pdfRouter };

