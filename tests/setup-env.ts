// Deterministic, isolated test environment. No real email/Sheets credentials.
// No reCAPTCHA secret is needed: service integration tests don't call Google.
process.env.APP_SECRET = "test-secret-for-vitest-only";
process.env.APP_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64");
process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
delete process.env.SMTP_HOST;
delete process.env.GOOGLE_SHEETS_ID;
delete process.env.NOTIFY_EMAILS;
