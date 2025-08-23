// scripts/test_auth.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  validateStatus: () => true, // handle errors manually
});

const random = Date.now();
const testUser = {
  email: `test${random}@test.com`, // unique each run
  password: "password123",
  name: "Test User",
};

async function runTests() {
  console.log("🟢 Starting Auth Tests...\n");

  // 1. Register new user
  console.log("➡️ Register new user...");
  let res = await api.post("/auth/register", testUser);
  console.log(res.status, res.data);

  // 2. Register same user again
  console.log("\n➡️ Register same user again...");
  res = await api.post("/auth/register", testUser);
  console.log(res.status, res.data);

  // 3. Register disallowed email
  console.log("\n➡️ Register disallowed email...");
  res = await api.post("/auth/register", {
    email: "notallowed@example.com",
    password: "password123",
    name: "Not Allowed",
  });
  console.log(res.status, res.data);

  // 4. Login with correct credentials
  console.log("\n➡️ Login with correct credentials...");
  res = await api.post("/auth/login", {
    email: testUser.email,
    password: testUser.password,
  });
  console.log(res.status, res.data);
  const token = res.data?.token;

  // 5. Login with wrong password
  console.log("\n➡️ Login with wrong password...");
  res = await api.post("/auth/login", {
    email: testUser.email,
    password: "wrongpassword",
  });
  console.log(res.status, res.data);

  // 6. Login with non-existent email
  console.log("\n➡️ Login with non-existent email...");
  res = await api.post("/auth/login", {
    email: "ghost@example.com",
    password: "password123",
  });
  console.log(res.status, res.data);

  // 7. Access protected route with valid token
  console.log("\n➡️ Access protected route with valid token...");
  res = await api.get("/auth/protected", {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log(res.status, res.data);

  // 8. Access protected route with invalid token
  console.log("\n➡️ Access protected route with invalid token...");
  res = await api.get("/auth/protected", {
    headers: { Authorization: "Bearer invalidtoken" },
  });
  console.log(res.status, res.data);

  console.log("\n✅ All tests executed");
}

runTests().catch((err) => {
  console.error("❌ Test script failed:", err.message);
});
