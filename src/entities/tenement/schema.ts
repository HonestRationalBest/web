import { z } from "zod";

export const TenementMediaSchema = z.object({
  type: z.string(),
  cdnUrl: z.string(),
  bluredDataURL: z.string().optional(),
  id: z.number(),
});

export const TenementOwnerSchema = z.object({
  country: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  countProperties: z.number(),
});

export const TenementUserSchema = z.object({
  externalId: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  imageUrl: z.string().nullable(),
});

export const TenementSchema = z.object({
  id: z.number(),
  title: z.string(),
  abstract: z.string().optional(),
  address: z.string().nullable(),
  zip: z.string(),
  city: z.string(),
  country: z.string(),
  rooms: z.number().nullable(),
  roomsBed: z.number().nullable(),
  roomsBath: z.number().nullable(),
  size: z.number(),
  rent: z.number(),
  rentUtilities: z.number(),
  rentFull: z.number(),
  rentDeposit: z.number(),
  location: z.tuple([z.number(), z.number()]),
  createdAt: z.string(),
  updatedAt: z.string(),
  type: z.number(),
  subType: z.number(),
  rentType: z.string(),
  availableFrom: z.string().nullable(),
  floor: z.string().nullable(),
  media: z.array(TenementMediaSchema).nullable().optional().default([]),
  owner: TenementOwnerSchema.optional(),
  user: TenementUserSchema.optional(),
  tags: z.array(z.string()).optional(),
  earliestAppointment: z.string().nullable().optional(),
  isFavorite: z.boolean().optional(),
});

export const TenementSearchResponseSchema = z.object({
  res: z.array(TenementSchema).optional(),
  total: z.number().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
});

export const TenementHistogramResponseSchema = z.object({
  range: z.tuple([z.number(), z.number()]),
  histogram: z.array(z.number()),
});

export const TenementCountResponseSchema = z.object({
  count: z.number(),
});

