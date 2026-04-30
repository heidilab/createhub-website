import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

export const resend = apiKey ? new Resend(apiKey) : null;

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@createhub.biz";
export const FROM_NAME = process.env.RESEND_FROM_NAME || "創研社 CREATE HUB";
export const FROM = `${FROM_NAME} <${FROM_EMAIL}>`;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "info@createhub.biz";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.createhub.biz";
