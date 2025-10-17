/**
 * Error types classification
 */
export enum ErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  VALIDATION = 'validation',
  FILE = 'file',
  AI = 'ai',
  PDF = 'pdf',
  UNKNOWN = 'unknown'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Structured application error
 */
export interface AppError {
  type: ErrorType;
  severity: ErrorSeverity;
  title: string;
  message: string;
  details?: string;
  retryable: boolean;
  dismissable: boolean;
  timestamp: Date;
  originalError?: Error;
}

/**
 * Service for handling and classifying errors
 */
export class ErrorHandlingService {
  /**
   * Extract and parse AI API error from response
   */
  private static parseAIError(error: Error): { code?: number; message: string } {
    try {
      // Try to parse JSON error from message
      const jsonMatch = error.message.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const errorObj = JSON.parse(jsonMatch[0]);
        if (errorObj.error) {
          return {
            code: errorObj.error.code,
            message: errorObj.error.message || error.message
          };
        }
      }
    } catch (e) {
      // If parsing fails, return original message
    }
    return { message: error.message };
  }

  /**
   * Map AI API error codes to user-friendly messages
   */
  private static getAIErrorMessage(code?: number, originalMessage?: string): { title: string; message: string; retryable: boolean } {
    // Check for rate limit in message
    if (originalMessage?.toLowerCase().includes('quota') || originalMessage?.toLowerCase().includes('rate limit')) {
      return {
        title: 'Limite di Richieste Raggiunto',
        message: 'Hai raggiunto il limite di richieste per questo modello. Attendi qualche secondo e riprova, oppure cambia modello nelle impostazioni.',
        retryable: true
      };
    }

    switch (code) {
      case 400:
        return {
          title: 'Richiesta Non Valida',
          message: 'I parametri della richiesta non sono corretti. Verifica la configurazione del modello.',
          retryable: false
        };
      
      case 401:
        return {
          title: 'Autenticazione Fallita',
          message: 'La chiave API fornita non è valida. Controlla la chiave nelle impostazioni.',
          retryable: false
        };
      
      case 403:
        return {
          title: 'Accesso Negato',
          message: 'Non hai i permessi necessari per utilizzare questo modello. Verifica il tuo piano API.',
          retryable: false
        };
      
      case 404:
        return {
          title: 'Modello Non Trovato',
          message: 'Il modello specificato non esiste o non è disponibile. Verifica il nome del modello nelle impostazioni.',
          retryable: false
        };
      
      case 429:
        return {
          title: 'Limite di Richieste Raggiunto',
          message: 'Hai raggiunto il limite di richieste per questo modello. Attendi qualche secondo e riprova, oppure cambia modello nelle impostazioni.',
          retryable: true
        };
      
      case 500:
        return {
          title: 'Errore del Servizio AI',
          message: 'Si è verificato un errore interno del servizio AI. Riprova tra qualche istante.',
          retryable: true
        };
      
      case 503:
        return {
          title: 'Servizio Temporaneamente Non Disponibile',
          message: 'Il servizio AI è momentaneamente sovraccarico o in manutenzione. Riprova tra qualche minuto.',
          retryable: true
        };
      
      default:
        // Check for specific error patterns in message
        if (originalMessage?.toLowerCase().includes('api key')) {
          return {
            title: 'Chiave API Non Valida',
            message: 'La chiave API fornita non è corretta. Verifica la configurazione nelle impostazioni.',
            retryable: false
          };
        }
        if (originalMessage?.toLowerCase().includes('timeout')) {
          return {
            title: 'Timeout Richiesta',
            message: 'La richiesta ha impiegato troppo tempo. Riprova o riduci la dimensione del testo.',
            retryable: true
          };
        }
        return {
          title: 'Errore Elaborazione AI',
          message: 'Si è verificato un errore durante l\'elaborazione. Riprova o contatta il supporto se il problema persiste.',
          retryable: true
        };
    }
  }

  /**
   * Classify an error and return a structured AppError
   */
  static classifyError(error: unknown, context?: string): AppError {
    // Network error
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      return {
        type: ErrorType.NETWORK,
        severity: ErrorSeverity.ERROR,
        title: 'Errore di Connessione',
        message: 'Impossibile contattare il server. Verifica che il backend sia avviato sulla porta 3001.',
        details: context,
        retryable: true,
        dismissable: true,
        timestamp: new Date(),
        originalError: error as Error
      };
    }

    // Server error (fetch response not ok)
    if (error && typeof error === 'object' && 'status' in error) {
      const status = (error as any).status;
      
      if (status === 404) {
        return {
          type: ErrorType.SERVER,
          severity: ErrorSeverity.ERROR,
          title: 'Risorsa Non Trovata',
          message: 'L\'endpoint richiesto non è disponibile. Verifica la configurazione del server.',
          details: context,
          retryable: false,
          dismissable: true,
          timestamp: new Date()
        };
      }

      if (status === 500) {
        return {
          type: ErrorType.SERVER,
          severity: ErrorSeverity.CRITICAL,
          title: 'Errore Server',
          message: 'Si è verificato un errore interno del server. Riprova tra qualche istante.',
          details: context,
          retryable: true,
          dismissable: true,
          timestamp: new Date()
        };
      }

      if (status === 413) {
        return {
          type: ErrorType.FILE,
          severity: ErrorSeverity.WARNING,
          title: 'File Troppo Grande',
          message: 'Il file selezionato supera le dimensioni massime consentite.',
          details: 'Prova con un file più piccolo o dividi il contenuto.',
          retryable: false,
          dismissable: true,
          timestamp: new Date()
        };
      }
    }

    // File validation error
    if (error instanceof Error && error.message.toLowerCase().includes('file')) {
      return {
        type: ErrorType.FILE,
        severity: ErrorSeverity.WARNING,
        title: 'File Non Valido',
        message: error.message,
        details: 'Formati supportati: PDF, DOCX, TXT, ODT',
        retryable: false,
        dismissable: true,
        timestamp: new Date(),
        originalError: error
      };
    }

    // AI processing error
    if (error instanceof Error && (error.message.includes('AI') || error.message.includes('API key') || error.message.includes('Gemini') || error.message.includes('OpenRouter') || error.message.includes('"error":'))) {
      const parsedError = this.parseAIError(error);
      const aiErrorInfo = this.getAIErrorMessage(parsedError.code, parsedError.message);
      
      return {
        type: ErrorType.AI,
        severity: parsedError.code === 401 || parsedError.code === 403 ? ErrorSeverity.ERROR : ErrorSeverity.WARNING,
        title: aiErrorInfo.title,
        message: aiErrorInfo.message,
        details: context,
        retryable: aiErrorInfo.retryable,
        dismissable: true,
        timestamp: new Date(),
        originalError: error
      };
    }

    // PDF export error
    if (context?.toLowerCase().includes('pdf')) {
      return {
        type: ErrorType.PDF,
        severity: ErrorSeverity.ERROR,
        title: 'Errore Esportazione PDF',
        message: 'Impossibile generare il file PDF.',
        details: error instanceof Error ? error.message : 'Verifica che il server sia attivo e riprova.',
        retryable: true,
        dismissable: true,
        timestamp: new Date(),
        originalError: error instanceof Error ? error : undefined
      };
    }

    // Generic error
    return {
      type: ErrorType.UNKNOWN,
      severity: ErrorSeverity.ERROR,
      title: 'Errore Inatteso',
      message: error instanceof Error ? error.message : 'Si è verificato un errore imprevisto.',
      details: context,
      retryable: true,
      dismissable: true,
      timestamp: new Date(),
      originalError: error instanceof Error ? error : undefined
    };
  }

  /**
   * Format error for console logging
   */
  static formatErrorForLogging(error: AppError): string {
    return `[${error.severity.toUpperCase()}] ${error.type} - ${error.title}: ${error.message}${error.details ? ` (${error.details})` : ''}`;
  }
}
