// Business email confirmed by the site owner for this workflow.
export const BUSINESS_EMAIL = 'Ririsemporium@gmail.com';
export interface ContactFields { name: string; email: string; subject: string; message: string }
const subjects: Record<string, string> = {
  general: 'General Inquiry', order: 'Order Status', returns: 'Returns & Refunds',
  product: 'Product Information', feedback: 'Feedback', other: 'Other',
};

export function prepareContactDraft(fields: ContactFields) {
  const name = fields.name.trim();
  const email = fields.email.trim();
  const message = fields.message.trim();
  if (!name || !email || !message || !Object.hasOwn(subjects, fields.subject)) {
    throw new Error('Please complete your name, email, subject and message.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address.');
  if (name.length > 100 || email.length > 254 || message.length > 2000) {
    throw new Error('Please keep your name under 100 characters and message under 2,000 characters.');
  }
  const body = `Name: ${name}\nReply email: ${email}\n\n${message}`;
  return { body, mailto: `mailto:${BUSINESS_EMAIL}?subject=${encodeURIComponent(subjects[fields.subject])}&body=${encodeURIComponent(body)}` };
}
