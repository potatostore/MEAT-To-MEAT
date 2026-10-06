import { request } from "./client";
import { ENDPOINTS, USE_MOCK } from "./config";
import { faqs } from "./mock/data";
import * as mock from "./mock/store";
import type { CreateInquiryRequest, Faq, Inquiry } from "./types";

export async function getFaqs(): Promise<Faq[]> {
  if (USE_MOCK) return faqs;
  return request<Faq[]>(ENDPOINTS.support.faqs);
}

export async function createInquiry(body: CreateInquiryRequest): Promise<Inquiry> {
  if (USE_MOCK) return mock.createInquiry(body);
  return request<Inquiry>(ENDPOINTS.support.inquiries, { method: "POST", body });
}

export async function getMyInquiries(): Promise<Inquiry[]> {
  if (USE_MOCK) return mock.getMyInquiries();
  return request<Inquiry[]>(ENDPOINTS.support.myInquiries);
}
