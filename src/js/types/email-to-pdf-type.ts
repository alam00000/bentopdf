export interface EmailAttachment {
  filename: string;
  size: number;
  contentType: string;
  content?: Uint8Array;
  contentId?: string;
}

export interface ParsedEmail {
  subject: string;
  from: string;
  to: string[];
  cc: string[];
  bcc: string[];
  date: Date | null;
  rawDateString: string;
  htmlBody: string;
  textBody: string;
  attachments: EmailAttachment[];
}

export interface EmailRenderOptions {
  includeCcBcc?: boolean;
  includeAttachments?: boolean;
  pageSize?: 'a4' | 'letter' | 'legal';
}
