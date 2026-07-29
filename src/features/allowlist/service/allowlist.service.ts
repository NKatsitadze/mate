import mongoose from 'mongoose';

import { allowedEmailRepository } from '@/features/allowlist/repository/allowed-email.repository';
import { AllowedEmail } from '@/features/allowlist/types/allowlist.types';
import { AddAllowedEmailType } from '@/features/allowlist/validations/allowlist.validation';
import { PaginatedResult, ServiceResult } from '@/shared/types/common';

export async function isEmailAllowedService(email: string): Promise<boolean> {
  const existing = await allowedEmailRepository.findByEmail(email.toLowerCase());
  return existing !== null;
}

export async function addAllowedEmailService(
  adminId: string,
  input: AddAllowedEmailType
): Promise<ServiceResult<{ id: string }>> {
  const normalizedEmail = input.email.toLowerCase();
  const existing = await allowedEmailRepository.findByEmail(normalizedEmail);
  if (existing) return { data: { error: 'ALREADY_ALLOWED' }, status: 409 };

  const id = await allowedEmailRepository.create({
    email: normalizedEmail,
    note: input.note,
    addedByAdminId: new mongoose.Types.ObjectId(adminId),
  });

  return { data: { id }, status: 201 };
}

export async function listAllowedEmailsService(
  page: number,
  limit: number
): Promise<ServiceResult<PaginatedResult<AllowedEmail>>> {
  const { items } = await allowedEmailRepository.findAll(page, limit);

  return {
    data: {
      items: items.map((item) => ({
        id: item._id.toString(),
        email: item.email,
        note: item.note ?? undefined,
        createdAt: item.createdAt,
      })),
    },
    status: 200,
  };
}
