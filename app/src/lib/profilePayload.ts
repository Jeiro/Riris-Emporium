import type { User } from '../types';

// Explicit whitelist: profile edits cannot change identity, role or verified email.
export function profileWritePayload(data: Partial<User>) {
  return {
    ...(data.firstName !== undefined ? { name: data.firstName } : {}),
    ...(data.lastName !== undefined ? { last_name: data.lastName } : {}),
    ...(data.phone !== undefined ? { phone: data.phone.trim() } : {}),
    updated_at: new Date().toISOString(),
  };
}
