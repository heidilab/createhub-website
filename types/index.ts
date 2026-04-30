import type { Timestamp } from "firebase/firestore";

export type EventType = "online" | "offline" | "hybrid";
export type EventCategory = "lecture" | "workshop" | "networking";
export type EventStatus = "upcoming" | "past" | "cancelled";
export type RegistrationStatus = "confirmed" | "cancelled" | "waitlist";
export type PaymentStatus = "pending" | "paid" | "free";
export type UserRole = "member" | "admin";

export type FirestoreDate = Timestamp | Date | string | { seconds: number };

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImage?: string;
  eventType: EventType;
  category: EventCategory;
  speakerName?: string;
  speakerBio?: string;
  eventDate: FirestoreDate;
  endDate?: FirestoreDate;
  location?: string;
  zoomLink?: string;
  isFree: boolean;
  priceHkd: number;
  capacity?: number;
  status: EventStatus;
  isPublished: boolean;
  registrationCount?: number;
  createdAt?: FirestoreDate;
  updatedAt?: FirestoreDate;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userEmail: string;
  userName: string;
  status: RegistrationStatus;
  ticketType: string;
  paymentStatus: PaymentStatus;
  registeredAt: FirestoreDate;
}

export interface TeamMember {
  id: string;
  name: string;
  nameEn?: string;
  title: string;
  bio?: string;
  photoUrl?: string;
  orderIndex: number;
  isVisible: boolean;
  createdAt?: FirestoreDate;
  updatedAt?: FirestoreDate;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  whatsapp?: string;
  category: "course" | "event" | "other";
  message: string;
  isRead: boolean;
  createdAt?: FirestoreDate;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  isActive: boolean;
  subscribedAt?: FirestoreDate;
}

export type ArticleCategory = "insight" | "news" | "case-study" | "tutorial";

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  author: string;
  category: ArticleCategory;
  tags?: string[];
  publishedAt?: FirestoreDate;
  isPublished: boolean;
  createdAt?: FirestoreDate;
  updatedAt?: FirestoreDate;
}

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  whatsapp?: string;
  role: UserRole;
  isNewsletterSubscribed: boolean;
  photoURL?: string;
  createdAt?: FirestoreDate;
}
