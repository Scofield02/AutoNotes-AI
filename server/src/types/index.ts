/**
 * Global type definitions for AutoNotes Server
 */

/**
 * PDF Generation Request
 */
export interface GeneratePDFRequest {
  content: string;
  metadata?: PDFMetadata;
  options?: PDFOptions;
}

/**
 * PDF Metadata
 */
export interface PDFMetadata {
  title?: string;
  author?: string;
  date?: string;
  subject?: string;
  keywords?: string[];
}

/**
 * PDF Generation Options
 */
export interface PDFOptions {
  format?: 'A4' | 'A3' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  margin?: PDFMargin;
  printBackground?: boolean;
  preferCSSPageSize?: boolean;
}

/**
 * PDF Margin Configuration
 */
export interface PDFMargin {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

/**
 * Template Data for rendering
 */
export interface NoteTemplateData {
  title: string;
  author: string;
  date: string;
  content: string;
}

/**
 * API Response Types
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  service: string;
  timestamp?: string;
  puppeteer?: string;
}

export interface ErrorResponse {
  error: string;
  message?: string;
  timestamp: string;
}
