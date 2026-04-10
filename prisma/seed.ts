import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { email: "admin@ksanagaratharsangam.com" },
    update: {},
    create: {
      email: "admin@ksanagaratharsangam.com",
      password: hashedPassword,
      name: "Admin",
      role: "admin",
    },
  });

  // Default settings
  const settings = [
    { key: "site_name", value: "Nagarathar Sangam KSA" },
    { key: "site_description", value: "Chettinad Community in Saudi Arabia" },
    { key: "contact_email", value: "info@ksanagaratharsangam.com" },
    { key: "contact_phone", value: "+966 XX XXX XXXX" },
    { key: "hero_title", value: "Nagarathar Sangam KSA" },
    { key: "hero_subtitle", value: "Preserving Our Heritage, Building Our Future in the Kingdom" },
    { key: "about_text", value: "We are a vibrant community of Nagarathars (Chettiars) residing in the Kingdom of Saudi Arabia, united by our rich cultural heritage, traditions, and values passed down through generations." },
    { key: "notification_email", value: "admin@ksanagaratharsangam.com" },
    { key: "smtp_host", value: "" },
    { key: "smtp_port", value: "587" },
    { key: "smtp_user", value: "" },
    { key: "smtp_pass", value: "" },
    { key: "smtp_from", value: "" },
  ];

  for (const s of settings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // Gallery categories
  const categories = [
    { name: "Temples", slug: "temples", sortOrder: 1 },
    { name: "Festivals", slug: "festivals", sortOrder: 2 },
    { name: "Community Events", slug: "community-events", sortOrder: 3 },
    { name: "Cultural Programs", slug: "cultural-programs", sortOrder: 4 },
    { name: "Heritage", slug: "heritage", sortOrder: 5 },
    { name: "Family Gatherings", slug: "family-gatherings", sortOrder: 6 },
  ];

  for (const cat of categories) {
    await prisma.galleryCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Default forms
  const forms = [
    {
      name: "Member Registration",
      slug: "member-registration",
      description: "Register as a member of Nagarathar Sangam KSA",
      fields: JSON.stringify([
        { name: "fullName", label: "Full Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone Number", type: "tel", required: true },
        { name: "city", label: "City in KSA", type: "text", required: true },
        { name: "nativePlace", label: "Native Place (Chettinad)", type: "text", required: true },
        { name: "occupation", label: "Occupation", type: "text", required: false },
        { name: "familyMembers", label: "Number of Family Members (excluding yourself)", type: "number", required: false },
      ]),
    },
    {
      name: "Event Registration",
      slug: "event-registration",
      description: "Register for upcoming events",
      fields: JSON.stringify([
        { name: "fullName", label: "Full Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "phone", label: "Phone Number", type: "tel", required: true },
        { name: "eventName", label: "Event", type: "select", required: true, options: ["Pongal Celebration", "Annual Meet", "Cultural Night"] },
        { name: "guests", label: "Number of Guests", type: "number", required: true },
        { name: "dietaryPreference", label: "Dietary Preference", type: "select", required: false, options: ["Vegetarian", "Non-Vegetarian"] },
      ]),
    },
    {
      name: "Contact Us",
      slug: "contact-us",
      description: "Get in touch with us",
      fields: JSON.stringify([
        { name: "fullName", label: "Full Name", type: "text", required: true },
        { name: "email", label: "Email", type: "email", required: true },
        { name: "subject", label: "Subject", type: "text", required: true },
        { name: "message", label: "Message", type: "textarea", required: true },
      ]),
    },
    {
      name: "Nagarathar Fundraising",
      slug: "nagarathar-fundraising",
      description: "Apply for community financial assistance — Marriage, Medical, Education or Other purposes. All applications are reviewed by the committee.",
      fields: JSON.stringify([
        { name: "fundCategory", label: "Fundraising Category", type: "select", required: true, options: ["Marriage Assistance", "Medical Assistance", "Education Assistance", "Other Purpose"] },
        { name: "fullName", label: "Applicant Full Name", type: "text", required: true },
        { name: "fatherName", label: "Father / Husband Name", type: "text", required: true },
        { name: "email", label: "Email Address", type: "email", required: true },
        { name: "phone", label: "Phone Number (WhatsApp)", type: "tel", required: true },
        { name: "iqamaNumber", label: "Iqama / National ID / Passport Number", type: "text", required: false },
        { name: "nativePlace", label: "Native Place (Chettinad Village)", type: "text", required: true },
        { name: "currentCity", label: "Current City / Country", type: "text", required: true },
        { name: "occupation", label: "Occupation / Employer", type: "text", required: true },
        { name: "monthlyIncome", label: "Monthly Income (SAR / Local Currency)", type: "text", required: true },
        { name: "familyMembers", label: "Number of Family Members", type: "number", required: true },
        { name: "amountRequested", label: "Amount Requested (SAR)", type: "text", required: true },
        { name: "purposeDetail", label: "Detailed Purpose & Reason for Request", type: "textarea", required: true },

        // Marriage-specific fields
        { name: "brideName", label: "Bride Name", type: "text", required: true, showWhen: { fundCategory: ["Marriage Assistance"] } },
        { name: "groomName", label: "Groom Name", type: "text", required: true, showWhen: { fundCategory: ["Marriage Assistance"] } },
        { name: "marriageDate", label: "Marriage Date", type: "date", required: true, showWhen: { fundCategory: ["Marriage Assistance"] } },
        { name: "marriageVenue", label: "Marriage Venue / Location", type: "text", required: false, showWhen: { fundCategory: ["Marriage Assistance"] } },

        // Medical-specific fields
        { name: "patientName", label: "Patient Name", type: "text", required: true, showWhen: { fundCategory: ["Medical Assistance"] } },
        { name: "patientRelation", label: "Relationship to Patient", type: "text", required: true, showWhen: { fundCategory: ["Medical Assistance"] } },
        { name: "hospitalName", label: "Hospital / Clinic Name", type: "text", required: true, showWhen: { fundCategory: ["Medical Assistance"] } },
        { name: "diagnosis", label: "Diagnosis / Medical Condition", type: "textarea", required: true, showWhen: { fundCategory: ["Medical Assistance"] } },
        { name: "treatmentCost", label: "Estimated Treatment Cost", type: "text", required: true, showWhen: { fundCategory: ["Medical Assistance"] } },

        // Education-specific fields
        { name: "studentName", label: "Student Name", type: "text", required: true, showWhen: { fundCategory: ["Education Assistance"] } },
        { name: "studentRelation", label: "Relationship to Student", type: "text", required: true, showWhen: { fundCategory: ["Education Assistance"] } },
        { name: "institutionName", label: "Institution / University Name", type: "text", required: true, showWhen: { fundCategory: ["Education Assistance"] } },
        { name: "courseName", label: "Course / Program Name", type: "text", required: true, showWhen: { fundCategory: ["Education Assistance"] } },
        { name: "academicYear", label: "Academic Year", type: "text", required: false, showWhen: { fundCategory: ["Education Assistance"] } },

        // Other purpose fields
        { name: "otherPurposeTitle", label: "Purpose Title / Summary", type: "text", required: true, showWhen: { fundCategory: ["Other Purpose"] } },

        // Common fields for all categories (beneficiary, proofs, references)
        { name: "beneficiaryName", label: "Beneficiary Name (if different from applicant)", type: "text", required: false },
        { name: "beneficiaryRelation", label: "Relationship to Beneficiary", type: "text", required: false },
        { name: "proofIdDoc", label: "ID Proof (Iqama/Passport) — Upload File Name or Google Drive Link", type: "text", required: true },
        { name: "proofIncome", label: "Salary Certificate / Income Proof — Upload File Name or Google Drive Link", type: "text", required: true },
        { name: "proofPurpose", label: "Supporting Document (Medical Report / Marriage Invitation / Admission Letter / Other) — Upload File Name or Google Drive Link", type: "text", required: true },
        { name: "proofBank", label: "Bank Statement (Last 3 months) — Upload File Name or Google Drive Link", type: "text", required: false },
        { name: "referenceOne", label: "Reference 1 — Name & Phone (Sangam Member)", type: "text", required: true },
        { name: "referenceTwo", label: "Reference 2 — Name & Phone (Sangam Member)", type: "text", required: false },
        { name: "declaration", label: "I hereby declare that all information provided is true and correct. I understand that false information may lead to rejection.", type: "select", required: true, options: ["Yes, I agree to the declaration"] },
        { name: "additionalNotes", label: "Additional Notes / Comments", type: "textarea", required: false },
      ]),
    },
  ];

  for (const form of forms) {
    await prisma.form.upsert({
      where: { slug: form.slug },
      update: { fields: form.fields, description: form.description },
      create: form,
    });
  }

  // Navigation items — clear and re-insert to avoid duplicates
  await prisma.navigation.deleteMany({});
  const navItems = [
    { label: "Home", url: "#home", sortOrder: 1 },
    { label: "About", url: "#about", sortOrder: 2 },
    { label: "Services", url: "#services", sortOrder: 3 },
    { label: "Gallery", url: "#gallery", sortOrder: 4 },
    { label: "Events", url: "#events", sortOrder: 5 },
    { label: "Contact", url: "#contact", sortOrder: 6 },
  ];

  for (const nav of navItems) {
    await prisma.navigation.create({ data: nav });
  }

  // Default page
  await prisma.page.upsert({
    where: { slug: "home" },
    update: {},
    create: {
      title: "Home",
      slug: "home",
      content: "Welcome to Nagarathar Sangam KSA",
      status: "published",
      sortOrder: 1,
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
