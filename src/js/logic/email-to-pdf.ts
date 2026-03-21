import PostalMime from 'postal-mime';
import MsgReader from '@kenjiuno/msgreader';
import {
  formatBytes,
  escapeHtml,
  uint8ArrayToBase64,
  sanitizeEmailHtml,
  formatRawDate,
} from '../utils/helpers.js';
import type { EmailAttachment, ParsedEmail, EmailRenderOptions } from '@/types';

export type { EmailAttachment, ParsedEmail, EmailRenderOptions };

function formatAddress(
  name: string | undefined,
  email: string | undefined
): string {
  if (name && email) {
    return `${name} (${email})`;
  }
  return email || name || '';
}

export async function parseEmlFile(file: File): Promise<ParsedEmail> {
  const arrayBuffer = await file.arrayBuffer();
  const parser = new PostalMime();
  const email = await parser.parse(arrayBuffer);

  const from =
    formatAddress(email.from?.name, email.from?.address) || 'Unknown Sender';

  const to = (email.to || [])
    .map((addr) => formatAddress(addr.name, addr.address))
    .filter(Boolean);

  const cc = (email.cc || [])
    .map((addr) => formatAddress(addr.name, addr.address))
    .filter(Boolean);

  const bcc = (email.bcc || [])
    .map((addr) => formatAddress(addr.name, addr.address))
    .filter(Boolean);

  // Helper to map parsing result to EmailAttachment
  const mapAttachment = (att: any): EmailAttachment => {
    let content: Uint8Array | undefined;
    let size = 0;
    if (att.content) {
      if (att.content instanceof ArrayBuffer) {
        content = new Uint8Array(att.content);
        size = content.byteLength;
      } else if (att.content instanceof Uint8Array) {
        content = att.content;
        size = content.byteLength;
      }
    }
    return {
      filename: att.filename || 'unnamed',
      size,
      contentType: att.mimeType || 'application/octet-stream',
      content,
      contentId: att.contentId
        ? att.contentId.replace(/^<|>$/g, '')
        : undefined,
    };
  };

  const attachments: EmailAttachment[] = [
    ...(email.attachments || []).map(mapAttachment),
    ...((email as any).inline || []).map(mapAttachment),
  ];

  // Preserve original date string from headers
  let rawDateString = '';
  if (email.headers) {
    const dateHeader = email.headers.find(
      (h) => h.key.toLowerCase() === 'date'
    );
    if (dateHeader) {
      rawDateString = dateHeader.value as string;
    }
  }
  if (!rawDateString && email.date) {
    rawDateString = email.date; // fallback if header missing but parsed date exists as string?
  }

  let parsedDate: Date | null = null;
  if (email.date) {
    try {
      parsedDate = new Date(email.date);
      if (isNaN(parsedDate.getTime())) {
        parsedDate = null;
      }
    } catch {
      parsedDate = null;
    }
  }

  return {
    subject: email.subject || '(No Subject)',
    from,
    to,
    cc,
    bcc,
    date: parsedDate,
    rawDateString,
    htmlBody: email.html || '',
    textBody: email.text || '',
    attachments,
  };
}

export async function parseMsgFile(file: File): Promise<ParsedEmail> {
  const arrayBuffer = await file.arrayBuffer();
  const msgReader = new MsgReader(arrayBuffer);
  const msgData = msgReader.getFileData();

  const from =
    formatAddress(msgData.senderName, msgData.senderEmail) || 'Unknown Sender';

  const to: string[] = [];
  const cc: string[] = [];
  const bcc: string[] = [];

  if (msgData.recipients) {
    for (const recipient of msgData.recipients) {
      const recipientStr = formatAddress(recipient.name, recipient.email);
      if (!recipientStr) continue;

      const recipType = String(recipient.recipType).toLowerCase();
      if (recipType === 'cc' || recipType === '2') {
        cc.push(recipientStr);
      } else if (recipType === 'bcc' || recipType === '3') {
        bcc.push(recipientStr);
      } else {
        to.push(recipientStr);
      }
    }
  }

  const attachments: EmailAttachment[] = (msgData.attachments || []).map(
    (att: any) => ({
      filename: att.fileName || att.name || 'unnamed',
      size: att.content?.length || 0,
      contentType: att.mimeType || 'application/octet-stream',
      content: att.content ? new Uint8Array(att.content) : undefined,
      contentId: att.pidContentId
        ? att.pidContentId.replace(/^<|>$/g, '')
        : undefined,
    })
  );

  let date: Date | null = null;
  let rawDateString = '';
  if (msgData.messageDeliveryTime) {
    rawDateString = msgData.messageDeliveryTime;
    date = new Date(msgData.messageDeliveryTime);
  } else if (msgData.clientSubmitTime) {
    rawDateString = msgData.clientSubmitTime;
    date = new Date(msgData.clientSubmitTime);
  }

  return {
    subject: msgData.subject || '(No Subject)',
    from,
    to,
    cc,
    bcc,
    date,
    rawDateString,
    htmlBody: msgData.bodyHtml || '',
    textBody: msgData.body || '',
    attachments,
  };
}

/**
 * Replace CID references in HTML with base64 data URIs
 */
function processInlineImages(
  html: string,
  attachments: EmailAttachment[]
): string {
  if (!html) return html;

  // Create a map of contentIds to attachments
  const cidMap = new Map<string, EmailAttachment>();
  attachments.forEach((att) => {
    if (att.contentId) {
      cidMap.set(att.contentId, att);
    }
  });

  return html.replace(/src=["']cid:([^"']+)["']/g, (match, cid) => {
    const att = cidMap.get(cid);
    if (att && att.content) {
      const base64 = uint8ArrayToBase64(att.content);
      return `src="data:${att.contentType};base64,${base64}"`;
    }
    return match;
  });
}

export function renderEmailToHtml(
  email: ParsedEmail,
  options: EmailRenderOptions = {}
): string {
  const { includeCcBcc = true, includeAttachments = true } = options;

  let processedHtml = '';
  if (email.htmlBody) {
    const sanitizedHtml = sanitizeEmailHtml(email.htmlBody);
    processedHtml = processInlineImages(sanitizedHtml, email.attachments);
  } else {
    processedHtml = `<pre style="white-space: pre-wrap; font-family: inherit; margin: 0;">${escapeHtml(email.textBody)}</pre>`;
  }

  let dateStr = 'Unknown Date';
  if (email.rawDateString) {
    dateStr = formatRawDate(email.rawDateString);
  } else if (email.date && !isNaN(email.date.getTime())) {
    dateStr = email.date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  const attachmentHtml =
    includeAttachments && email.attachments.length > 0
      ? `
    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #cccccc;">
      <p style="margin: 0 0 8px 0; font-size: 11px; color: #666; font-weight: 600;">Attachments (${email.attachments.length})</p>
      <ul style="margin: 0; padding-left: 20px; font-size: 10px; color: #555;">
        ${email.attachments
          .map(
            (att) =>
              `<li style="margin-bottom: 5px;">${escapeHtml(att.filename)} <span style="color: #999;">(${formatBytes(att.size)})</span></li>`
          )
          .join('')}
      </ul>
    </div>
  `
      : '';

  let ccBccHtml = '';
  if (includeCcBcc) {
    if (email.cc.length > 0) {
      ccBccHtml += `
      <div style="margin-bottom: 8px;">
        <span style="font-weight: 600; color: #666; margin-right: 8px;">CC:</span>
        <span style="color: #333;">${escapeHtml(email.cc.join(', '))}</span>
      </div>`;
    }
    if (email.bcc.length > 0) {
      ccBccHtml += `
      <div style="margin-bottom: 8px;">
        <span style="font-weight: 600; color: #666; margin-right: 8px;">BCC:</span>
        <span style="color: #333;">${escapeHtml(email.bcc.join(', '))}</span>
      </div>`;
    }
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 40px 20px; background: #fff;">
  <div style="border-bottom: 2px solid #999999; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 0 0 12px 0;">${escapeHtml(email.subject)}</h1>
    <div style="font-size: 12px; color: #555;">
      <div style="margin-bottom: 8px;">
        <span style="font-weight: 600; color: #666; margin-right: 8px;">From:</span>
        <span style="color: #333;">${escapeHtml(email.from)}</span>
      </div>
      <div style="margin-bottom: 8px;">
        <span style="font-weight: 600; color: #666; margin-right: 8px;">To:</span>
        <span style="color: #333;">${escapeHtml(email.to.join(', ') || 'Unknown')}</span>
      </div>
      ${ccBccHtml}
      <div style="margin-bottom: 8px;">
        <span style="font-weight: 600; color: #666; margin-right: 8px;">Date:</span>
        <span style="color: #333;">${escapeHtml(dateStr)}</span>
      </div>
    </div>
  </div>
  <div style="font-size: 12px; color: #333;">
    ${processedHtml}
  </div>
  ${attachmentHtml}
</body>
</html>`;
}

export async function parseEmailFile(file: File): Promise<ParsedEmail> {
  const ext = file.name.toLowerCase().split('.').pop();

  if (ext === 'eml') {
    return parseEmlFile(file);
  } else if (ext === 'msg') {
    return parseMsgFile(file);
  } else {
    throw new Error(`Unsupported file type: .${ext}`);
  }
}
