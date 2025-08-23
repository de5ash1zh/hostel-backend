import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname workaround for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to CSV file
const CSV_PATH = path.join(__dirname, "allowed_emails.csv");

// If no CSV file available => then use this array for development:
const FALLBACK_ALLOWED = [
  "test@test.com",
  "de5ash1zh@gmail.com",
  "test1@test.com",
];

let cache = null;

// Parse csv text into list of emails
function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  // Header detection
  const hasHeader = /(^|,)\s*email\s*(,|$)/i.test(lines[0]);

  if (hasHeader) {
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const emailIndex = headers.indexOf("email");
    if (emailIndex === -1) return [];

    return lines
      .slice(1)
      .map((line) => line.split(",")[emailIndex]?.trim().toLowerCase())
      .filter(Boolean);
  }

  // No header: assume single email per line (or first column)
  return lines
    .map((line) => line.split(",")[0]?.trim().toLowerCase())
    .filter(Boolean);
}

function loadAllowedSet() {
  if (cache) return cache;

  if (fs.existsSync(CSV_PATH)) {
    const raw = fs.readFileSync(CSV_PATH, "utf8");
    const emails = parseCsv(raw);
    cache = new Set(emails);
  } else {
    cache = new Set(FALLBACK_ALLOWED.map((e) => e.toLowerCase()));
  }

  return cache;
}

function isAllowedEmail(email) {
  if (!email) return false;
  const set = loadAllowedSet();
  return set.has(String(email).toLowerCase());
}

function getAllowedEmails() {
  return Array.from(loadAllowedSet());
}

function reload() {
  cache = null;
  loadAllowedSet();
}

export { isAllowedEmail, getAllowedEmails, reload, CSV_PATH };
