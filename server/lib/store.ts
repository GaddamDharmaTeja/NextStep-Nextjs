import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MongoClient, type Collection } from "mongodb";

export type UserRole = "user" | "admin" | "owner";
export type InquiryStatus = "pending" | "contacted" | "resolved";
export type LeadStage = "new" | "contacted" | "counseling" | "documents" | "applied" | "visa" | "converted" | "lost";
export type AppointmentStatus = "requested" | "scheduled" | "completed" | "cancelled";
export type InviteStatus = "pending" | "accepted" | "revoked";
export type DocumentStatus = "uploaded" | "reviewing" | "approved" | "rejected";
export type NotificationChannel = "email" | "whatsapp" | "both";

export interface UserRecord {
  id: string;
  clerkId: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: UserRole;
  passwordHash?: string | null;
  createdAt: string;
}

export interface InquiryRecord {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  whatsapp: string | null;
  subject: string;
  message: string;
  status: InquiryStatus;
  leadStage: LeadStage;
  assignedToUserId: string | null;
  assignedToName: string | null;
  followUpAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ProgramRecord {
  id: number;
  title: string;
  description: string;
  country: string;
  duration: string;
  imageUrl: string | null;
  featured: boolean;
  createdAt: string;
}

export interface GalleryImageRecord {
  id: number;
  url: string;
  caption: string | null;
  category: string | null;
  sortOrder: number;
  createdAt: string;
}

export interface TestimonialRecord {
  id: number;
  studentName: string;
  country: string;
  program: string | null;
  message: string;
  avatarUrl: string | null;
  rating: number;
  featured: boolean;
  createdAt: string;
}

export interface DestinationRecord {
  id: number;
  slug: string;
  code: string;
  name: string;
  description: string;
  overview: string;
  highlights: string[];
  universities: string[];
  tuition: string;
  requirements: string[];
  workOptions: string[];
  accent: string;
  featured: boolean;
  createdAt: string;
}

export interface ConsultantRecord {
  id: number;
  name: string;
  role: string;
  specialty: string;
  experience: string;
  imageUrl: string | null;
  bio: string;
  countries: string[];
  languages: string[];
  featured: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface AppointmentRecord {
  id: number;
  name: string;
  email: string;
  phone: string;
  destination: string | null;
  preferredDate: string;
  preferredTime: string;
  notes: string | null;
  status: AppointmentStatus;
  createdAt: string;
}

export interface SiteMetricRecord {
  value: string;
  label: string;
}

export interface SiteServiceRecord {
  title: string;
  text: string;
}

export interface SiteContentRecord {
  heroTitle: string;
  heroAccent: string;
  heroSubtitle: string;
  primaryCta: string;
  secondaryCta: string;
  metrics: SiteMetricRecord[];
  mentorshipTitle: string;
  mentorshipSubtitle: string;
  services: SiteServiceRecord[];
  aboutTitle: string;
  aboutText: string;
  aboutHighlights: string[];
  contactTitle: string;
  contactText: string;
  contactEmail: string;
  contactPhone: string;
  footerTagline: string;
}

export interface OwnerSettingsRecord {
  companyName: string;
  ownerName: string;
  supportEmail: string;
  supportPhone: string;
  timezone: string;
  defaultCounselorMessage: string;
  brandTagline: string;
}

export interface AuditLogRecord {
  id: string;
  actorUserId: string | null;
  actorName: string;
  actorRole: UserRole | "system";
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  createdAt: string;
}

export interface AdminInviteRecord {
  id: string;
  email: string;
  role: UserRole;
  status: InviteStatus;
  invitedByUserId: string | null;
  invitedByName: string;
  createdAt: string;
  acceptedAt: string | null;
}

export interface NotificationTemplateRecord {
  id: string;
  name: string;
  channel: NotificationChannel;
  subject: string;
  message: string;
  updatedAt: string;
}

export interface StudentDocumentRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  fileName: string;
  fileUrl: string;
  contentType: string;
  sizeBytes: number;
  status: DocumentStatus;
  note: string | null;
  uploadedAt: string;
}

export interface AppStore {
  users: UserRecord[];
  inquiries: InquiryRecord[];
  programs: ProgramRecord[];
  gallery: GalleryImageRecord[];
  testimonials: TestimonialRecord[];
  destinations: DestinationRecord[];
  consultants: ConsultantRecord[];
  siteContent: SiteContentRecord;
  appointments: AppointmentRecord[];
  ownerSettings: OwnerSettingsRecord;
  auditLogs: AuditLogRecord[];
  adminInvites: AdminInviteRecord[];
  notificationTemplates: NotificationTemplateRecord[];
  studentDocuments: StudentDocumentRecord[];
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, "../../data");
const dataFile = path.join(dataDir, "db.json");
const mongoStoreId = "app-store";
const mongoDatabaseName = process.env.MONGODB_DB || "nextstep";
const mongoCollectionName = process.env.MONGODB_COLLECTION || "app_store";

type MongoStoreDocument = AppStore & { _id: string };

let mongoClientPromise: Promise<MongoClient> | null = null;

const seedStore: AppStore = {
  users: [
    {
      id: "1",
      clerkId: "local-admin",
      email: "admin@nextstep.local",
      name: "NextStep Admin",
      phone: null,
      role: "owner",
      passwordHash: null,
      createdAt: "2026-05-12T00:00:00.000Z",
    },
  ],
  inquiries: [],
  programs: [
    {
      id: 1,
      title: "MBA in Canada",
      description: "Career-focused MBA pathways in top Canadian business schools.",
      country: "Canada",
      duration: "2 Years",
      imageUrl: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=1200&auto=format&fit=crop",
      featured: true,
      createdAt: "2026-05-12T00:00:00.000Z",
    },
    {
      id: 2,
      title: "MS in Australia",
      description: "Industry-aligned postgraduate programs with strong internship options.",
      country: "Australia",
      duration: "2 Years",
      imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop",
      featured: true,
      createdAt: "2026-05-12T00:00:00.000Z",
    },
  ],
  gallery: [],
  testimonials: [],
  appointments: [],
  consultants: [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Senior Education Consultant",
      specialty: "Canada and scholarship planning",
      experience: "12 Years",
      imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1200&auto=format&fit=crop",
      bio:
        "Priya helps students match their academic profile with Canadian universities, scholarship options, and post-study pathways.",
      countries: ["Canada", "United Kingdom"],
      languages: ["English", "Hindi", "Telugu"],
      featured: true,
      sortOrder: 1,
      createdAt: "2026-05-12T00:00:00.000Z",
    },
    {
      id: 2,
      name: "Rahul Mehta",
      role: "Visa Strategy Mentor",
      specialty: "Australia and New Zealand admissions",
      experience: "8 Years",
      imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1200&auto=format&fit=crop",
      bio:
        "Rahul focuses on practical course shortlisting, documentation readiness, and student visa interview preparation.",
      countries: ["Australia", "New Zealand"],
      languages: ["English", "Hindi"],
      featured: true,
      sortOrder: 2,
      createdAt: "2026-05-12T00:00:00.000Z",
    },
    {
      id: 3,
      name: "Dr. Ananya Krishnan",
      role: "Research Pathway Advisor",
      specialty: "Europe, Germany, and research programs",
      experience: "10 Years",
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop",
      bio:
        "Ananya guides postgraduate and research applicants through university fit, statements of purpose, and supervisor outreach.",
      countries: ["Germany", "Europe", "United States"],
      languages: ["English", "Hindi", "Malayalam"],
      featured: true,
      sortOrder: 3,
      createdAt: "2026-05-12T00:00:00.000Z",
    },
  ],
  destinations: [
    {
      id: 1,
      slug: "united-kingdom",
      code: "GB",
      name: "United Kingdom",
      description:
        "The UK is home to some of the world's most prestigious universities, offering world-class education, a rich cultural experience, and strong graduate outcomes.",
      overview:
        "The UK combines globally respected degrees, shorter course durations, and strong links to industry. Students benefit from a rich academic culture, international campuses, and practical graduate routes.",
      highlights: [
        "World-renowned universities",
        "Post-Study Work Visa up to 2 years",
        "Rich academic tradition",
        "Diverse multicultural environment",
        "Strong research opportunities",
      ],
      universities: ["University of Oxford", "University of Cambridge", "Imperial College London", "UCL", "University of Edinburgh"],
      tuition: "GBP 15,000 - 35,000/year",
      requirements: ["IELTS/TOEFL or accepted English test", "Academic transcripts", "Statement of purpose", "References", "Financial documents"],
      workOptions: ["Up to 20 hours/week during term", "Full-time during eligible breaks", "Graduate Route after studies"],
      accent: "from-blue-50 to-slate-50",
      featured: true,
      createdAt: "2026-05-12T00:00:00.000Z",
    },
    {
      id: 2,
      slug: "united-states",
      code: "US",
      name: "United States",
      description:
        "The USA offers unmatched academic resources, research funding, flexible course choices, and career opportunities at globally recognized institutions.",
      overview:
        "The USA offers unparalleled academic resources, research funding, and career opportunities at globally recognized institutions. International students benefit from vibrant campus life and extensive alumni networks.",
      highlights: [
        "Top-ranked universities worldwide",
        "CPT and OPT work opportunities",
        "Diverse program offerings",
        "Cutting-edge research facilities",
        "Strong entrepreneurship ecosystem",
      ],
      universities: ["MIT", "Harvard University", "Stanford University", "Caltech", "University of Chicago"],
      tuition: "USD 20,000 - 55,000/year",
      requirements: ["SAT/ACT or GRE/GMAT where required", "IELTS/TOEFL or Duolingo", "Academic transcripts", "Statement of purpose", "Financial documents"],
      workOptions: ["On-campus work options", "CPT during eligible programs", "OPT after graduation"],
      accent: "from-rose-50 to-slate-50",
      featured: true,
      createdAt: "2026-05-12T00:00:00.000Z",
    },
    {
      id: 3,
      slug: "canada",
      code: "CA",
      name: "Canada",
      description:
        "Canada is a leading destination for international students thanks to welcoming immigration pathways, high quality of life, and practical work options.",
      overview:
        "Canada is known for safe cities, welcoming policies, respected universities, and strong post-study pathways. It is a practical option for students planning long-term settlement.",
      highlights: [
        "Post-Graduation Work Permit up to 3 years",
        "Pathway to permanent residency",
        "Safe and welcoming environment",
        "Affordable tuition compared with USA/UK",
        "Bilingual English and French culture",
      ],
      universities: ["University of Toronto", "McGill University", "University of British Columbia", "University of Waterloo", "McMaster University"],
      tuition: "CAD 15,000 - 35,000/year",
      requirements: ["IELTS/PTE/TOEFL", "Academic transcripts", "Statement of purpose", "GIC and financial proof", "Study permit documents"],
      workOptions: ["Part-time work during studies", "Co-op options in eligible programs", "PGWP after graduation"],
      accent: "from-emerald-50 to-slate-50",
      featured: true,
      createdAt: "2026-05-12T00:00:00.000Z",
    },
    {
      id: 4,
      slug: "australia",
      code: "AU",
      name: "Australia",
      description:
        "Australia combines globally respected universities with industry-linked education, excellent lifestyle, and practical post-study work routes.",
      overview:
        "Australia offers career-oriented degrees, vibrant student cities, and strong graduate work opportunities. It is especially popular for business, technology, healthcare, and research pathways.",
      highlights: [
        "Post-study work rights",
        "Strong internship options",
        "High quality of life",
        "Globally ranked universities",
        "Popular STEM and business pathways",
      ],
      universities: ["University of Melbourne", "Australian National University", "University of Sydney", "UNSW", "Monash University"],
      tuition: "AUD 22,000 - 45,000/year",
      requirements: ["IELTS/PTE/TOEFL", "Academic transcripts", "Genuine student documents", "Financial evidence", "Health cover"],
      workOptions: ["Part-time work during term", "Full-time during breaks", "Temporary graduate visa options"],
      accent: "from-amber-50 to-slate-50",
      featured: true,
      createdAt: "2026-05-12T00:00:00.000Z",
    },
    {
      id: 5,
      slug: "europe",
      code: "EU",
      name: "Europe",
      description:
        "Europe offers diverse English-taught programs, affordable tuition, cross-border mobility, and strong options across business, technology, and research.",
      overview:
        "Europe gives students access to affordable public education, English-taught degrees, strong research hubs, and a rich cross-cultural academic experience.",
      highlights: [
        "Affordable public universities",
        "English-taught degree options",
        "Schengen travel exposure",
        "Strong research and innovation hubs",
        "Multiple scholarship routes",
      ],
      universities: ["Technical University of Munich", "KU Leuven", "University of Amsterdam", "Sorbonne University", "Lund University"],
      tuition: "EUR 5,000 - 25,000/year",
      requirements: ["Academic transcripts", "English or local language proof", "Motivation letter", "CV", "Financial proof"],
      workOptions: ["Country-specific part-time work", "Internship pathways", "Post-study permits in selected countries"],
      accent: "from-cyan-50 to-slate-50",
      featured: true,
      createdAt: "2026-05-12T00:00:00.000Z",
    },
    {
      id: 6,
      slug: "new-zealand",
      code: "NZ",
      name: "New Zealand",
      description:
        "New Zealand is ideal for students who want focused universities, safety, work opportunities, and a calm environment for long-term growth.",
      overview:
        "New Zealand offers a safe study environment, research-led universities, and a balanced lifestyle. It suits students looking for focused programs and stable post-study options.",
      highlights: [
        "Student-friendly visa settings",
        "Safe study environment",
        "Research-led universities",
        "Good work-life balance",
        "Growing demand for skilled graduates",
      ],
      universities: ["University of Auckland", "University of Otago", "Victoria University of Wellington", "University of Canterbury", "Massey University"],
      tuition: "NZD 20,000 - 40,000/year",
      requirements: ["IELTS/PTE/TOEFL", "Academic transcripts", "Statement of purpose", "Financial evidence", "Health and character documents"],
      workOptions: ["Part-time work while studying", "Post-study work visa options", "Skilled employment pathways"],
      accent: "from-indigo-50 to-slate-50",
      featured: true,
      createdAt: "2026-05-12T00:00:00.000Z",
    },
  ],
  siteContent: {
    heroTitle: "Your global future",
    heroAccent: "starts here.",
    heroSubtitle:
      "We do not just process visas; we architect futures. Partner with passionate mentors dedicated to guiding you to the world's top universities.",
    primaryCta: "Get Free Assessment",
    secondaryCta: "Explore Services",
    metrics: [
      { value: "15+", label: "Years Experience" },
      { value: "10k+", label: "Students Placed" },
      { value: "25+", label: "Countries" },
      { value: "98%", label: "Success Rate" },
    ],
    mentorshipTitle: "A Mentorship Approach",
    mentorshipSubtitle:
      "We go beyond the paperwork. Our advisors are deeply committed to understanding your aspirations and matching you with institutions where you will thrive.",
    services: [
      {
        title: "Personalized Mentorship",
        text: "You are paired with a dedicated consultant who understands your goals and guides every step of the journey.",
      },
      {
        title: "Global Network",
        text: "Direct guidance across leading study destinations including Canada, the UK, Australia, Europe, and the USA.",
      },
      {
        title: "End-to-End Support",
        text: "From university selection and essays to visa readiness, interviews, and pre-departure preparation.",
      },
    ],
    aboutTitle: "Built for serious study abroad decisions.",
    aboutText:
      "Our counseling process blends destination research, admission strategy, scholarship planning, and visa preparation into one guided path.",
    aboutHighlights: [
      "Course shortlisting",
      "Scholarship strategy",
      "Visa documentation",
      "Pre-departure briefing",
    ],
    contactTitle: "Ready to start your assessment?",
    contactText:
      "Book a free consultation and get a practical roadmap for destination selection, admissions, scholarships, and visa preparation.",
    contactEmail: "info@nextstepglobal.edu",
    contactPhone: "+91 1800 123 4567",
    footerTagline: "Global education guidance shaped by mentorship, clarity, and long-term student outcomes.",
  },
  ownerSettings: {
    companyName: "NextStep Global",
    ownerName: "NextStep Owner",
    supportEmail: "info@nextstepglobal.edu",
    supportPhone: "+91 1800 123 4567",
    timezone: "Asia/Kolkata",
    defaultCounselorMessage: "Thank you for your inquiry. A counselor will reach out soon.",
    brandTagline: "Study abroad planning with structure, care, and momentum.",
  },
  auditLogs: [],
  adminInvites: [],
  notificationTemplates: [
    {
      id: "welcome-email",
      name: "Welcome Follow Up",
      channel: "email",
      subject: "Your NextStep consultation request",
      message: "Hi {{name}},\n\nThank you for reaching out. Our team will review your goals and contact you shortly.\n\nRegards,\nNextStep",
      updatedAt: "2026-05-12T00:00:00.000Z",
    },
    {
      id: "docs-reminder",
      name: "Document Reminder",
      channel: "both",
      subject: "Document checklist reminder",
      message: "Hi {{name}},\n\nThis is a reminder to upload your pending documents so we can continue your application process.",
      updatedAt: "2026-05-12T00:00:00.000Z",
    },
  ],
  studentDocuments: [],
};

let writeChain = Promise.resolve();

function cloneStore(store: AppStore): AppStore {
  return JSON.parse(JSON.stringify(store)) as AppStore;
}

export function createAuditLogEntry(input: {
  actorUserId?: string | null;
  actorName: string;
  actorRole: UserRole | "system";
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
}): AuditLogRecord {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    actorUserId: input.actorUserId ?? null,
    actorName: input.actorName,
    actorRole: input.actorRole,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    summary: input.summary,
    createdAt: new Date().toISOString(),
  };
}

function isMongoEnabled(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim());
}

async function getMongoCollection(): Promise<Collection<MongoStoreDocument>> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!mongoClientPromise) {
    mongoClientPromise = new MongoClient(uri).connect();
  }

  const client = await mongoClientPromise;
  return client.db(mongoDatabaseName).collection<MongoStoreDocument>(mongoCollectionName);
}

function normalizeStore(store: AppStore): boolean {
  let changed = false;

  if (!store.destinations) {
    store.destinations = cloneStore(seedStore).destinations;
    changed = true;
  }
  if (!store.siteContent) {
    store.siteContent = cloneStore(seedStore).siteContent;
    changed = true;
  }
  if (!store.siteContent.aboutHighlights?.length) {
    store.siteContent.aboutHighlights = cloneStore(seedStore).siteContent.aboutHighlights;
    changed = true;
  }
  if (!store.siteContent.footerTagline) {
    store.siteContent.footerTagline = cloneStore(seedStore).siteContent.footerTagline;
    changed = true;
  }
  if (!store.appointments) {
    store.appointments = [];
    changed = true;
  }
  if (!store.ownerSettings) {
    store.ownerSettings = cloneStore(seedStore).ownerSettings;
    changed = true;
  }
  if (!store.auditLogs) {
    store.auditLogs = [];
    changed = true;
  }
  if (!store.adminInvites) {
    store.adminInvites = [];
    changed = true;
  }
  if (!store.notificationTemplates) {
    store.notificationTemplates = cloneStore(seedStore).notificationTemplates;
    changed = true;
  }
  if (!store.studentDocuments) {
    store.studentDocuments = [];
    changed = true;
  }
  if (!store.consultants) {
    store.consultants = cloneStore(seedStore).consultants;
    changed = true;
  }

  for (const inquiry of store.inquiries) {
    if (!inquiry.leadStage) {
      inquiry.leadStage = inquiry.status === "resolved" ? "converted" : inquiry.status === "contacted" ? "contacted" : "new";
      changed = true;
    }
    if (inquiry.followUpAt === undefined) {
      inquiry.followUpAt = null;
      changed = true;
    }
    if (inquiry.assignedToUserId === undefined) {
      inquiry.assignedToUserId = null;
      changed = true;
    }
    if (inquiry.assignedToName === undefined) {
      inquiry.assignedToName = null;
      changed = true;
    }
  }

  return changed;
}

async function readLocalStoreOrSeed(): Promise<AppStore> {
  try {
    const store = JSON.parse(await readFile(dataFile, "utf8")) as AppStore;
    normalizeStore(store);
    return store;
  } catch {
    return cloneStore(seedStore);
  }
}

async function writeLocalStore(store: AppStore): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  await writeFile(dataFile, JSON.stringify(store, null, 2), "utf8");
}

async function writeMongoStore(store: AppStore): Promise<void> {
  const collection = await getMongoCollection();
  await collection.updateOne({ _id: mongoStoreId }, { $set: store, $setOnInsert: { _id: mongoStoreId } }, { upsert: true });
}

async function persistStore(store: AppStore): Promise<void> {
  if (isMongoEnabled()) {
    await writeMongoStore(store);
    return;
  }

  await writeLocalStore(store);
}

async function ensureStore(): Promise<void> {
  await mkdir(dataDir, { recursive: true });
  try {
    await readFile(dataFile, "utf8");
  } catch {
    await writeFile(dataFile, JSON.stringify(seedStore, null, 2), "utf8");
  }
}

export async function readStore(): Promise<AppStore> {
  if (isMongoEnabled()) {
    const collection = await getMongoCollection();
    const document = await collection.findOne({ _id: mongoStoreId });

    if (!document) {
      const migratedStore = await readLocalStoreOrSeed();
      normalizeStore(migratedStore);
      await writeMongoStore(migratedStore);
      return migratedStore;
    }

    const { _id: _ignored, ...store } = document;
    const appStore = store as AppStore;
    if (normalizeStore(appStore)) {
      await writeMongoStore(appStore);
    }
    return appStore;
  }

  await ensureStore();
  const store = JSON.parse(await readFile(dataFile, "utf8")) as AppStore;
  if (normalizeStore(store)) {
    await writeLocalStore(store);
  }
  return store;
}

export async function updateStore<T>(updater: (store: AppStore) => T): Promise<T> {
  const run = async () => {
    const store = await readStore();
    const result = updater(store);
    await persistStore(store);
    return result;
  };

  const next = writeChain.then(run, run);
  writeChain = next.then(() => undefined, () => undefined);
  return next;
}

export function nextNumericId(items: Array<{ id: number }>): number {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
}
