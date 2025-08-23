// scripts/test_auth_helpers.js
import { createToken, verifyToken } from "../src/config/jwt.js";
import { hashPassword, comparePassword } from "../src/config/password.js";
import { isAllowedEmail, getAllowedEmails } from "../src/config/csv.js";
import { JWT_EXPIRES_IN } from "../src/config/env.js";

(async () => {
  console.log("--- JWT ---");
  const token = createToken({ id: "u_123", email: "alice@example.com" });
  console.log("Token:", token.slice(0, 40) + "...");
  const decoded = verifyToken(token);
  console.log("Decoded:", decoded);
  console.log("Expires In:", JWT_EXPIRES_IN);

  console.log("\n--- Password ---");
  const plain = "P@ssw0rd123";
  const hashed = await hashPassword(plain);
  console.log("Hashed:", hashed);
  console.log("Compare (correct):", await comparePassword(plain, hashed));
  console.log("Compare (wrong):", await comparePassword("nope", hashed));

  console.log("\n--- Allowed Emails ---");
  console.log("List:", getAllowedEmails());
  console.log("Allowed (test@test.com):", isAllowedEmail("test@test.com"));
  console.log(
    "Allowed (de5ash1zh@gmail.com):",
    isAllowedEmail("de5ash1zh@gmail.com")
  );
  console.log(
    "Allowed (random@example.com):",
    isAllowedEmail("random@example.com")
  );
})();
