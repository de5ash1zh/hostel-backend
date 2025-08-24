# Frontend Developer Guide

This guide summarizes everything needed to build a frontend for the Hostel Backend.

- Backend stack: Express + Prisma + JWT
- Base URL: http://localhost:3000 (or http://localhost:${PORT})
- API prefix: `/api`
- Auth: Bearer JWT via `Authorization: Bearer <token>`

---

## Quick Start

- Set the frontend `.env` with the API base URL, e.g. `VITE_API_URL=http://localhost:3000` or `NEXT_PUBLIC_API_URL=...`.
- Use a single HTTP client (e.g., Axios/Fetch wrapper) that automatically:
  - Attaches `Authorization` header when a token is present.
  - Parses error responses `{ message: string }`.
- Persist JWT in memory (recommended) or `localStorage` (simpler). Avoid cookies unless you control CSRF.

```ts
// http.ts (Axios example)
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL;

export const api = axios.create({ baseURL: API_URL });

export function setAuthToken(token?: string) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err?.response?.data?.message || "Something went wrong";
    return Promise.reject(new Error(msg));
  }
);
```

---

## Auth Flow

- Register: `POST /api/auth/register` (email must be in allowed list)
- Login: `POST /api/auth/login` → receive `{ token, user }`
- Store token (memory or localStorage) and call `setAuthToken(token)`
- Protected calls require the token header.
- Test: `GET /api/auth/protected`

Example:

```ts
const { data } = await api.post("/api/auth/login", { email, password });
setAuthToken(data.token);
currentUser = data.user; // { id, email, name }
```

Logout:

```ts
setAuthToken(undefined);
localStorage.removeItem("token");
```

---

## Key API Endpoints (Frontend-Oriented)

- Auth

  - POST `/api/auth/register` { email, password, name }
  - POST `/api/auth/login` { email, password } → { token, user }
  - GET `/api/auth/protected` → validate token

- User

  - GET `/api/user/profile` → { user }
  - PUT `/api/user/profile` { name?, email? } → { message, user }

- Groups

  - POST `/api/group` { name, description? } → create (auth)
  - GET `/api/group` → list (no auth)
  - GET `/api/group/:id` → details w/ members (no auth)

- Posts (mounted under `/api` as `/groups/:id/...`)

  - POST `/api/groups/:id/posts` { title, content } (auth)
  - GET `/api/groups/:id/posts`

- Join Requests (mounted under `/api`)

  - POST `/api/groups/:id/join` (auth)
  - GET `/api/groups/:id/requests` (leader only)
  - PUT `/api/requests/:id/accept` (leader)
  - PUT `/api/requests/:id/decline` (leader)

- Members (mounted under `/api`, note path inconsistency: no `group` segment)
  - GET `/api/:id/members` (auth)
  - DELETE `/api/:id/members` { userId, reason? } (leader)
  - POST `/api/:id/leave` (auth)

Error shape: `{ message: string }` with status codes (400/401/403/404/409/500).

---

## Data Models (Inferred)

```ts
export type User = {
  id: number;
  email: string;
  name: string;
  createdAt: string;
};

export type GroupSummary = {
  id: number;
  name: string;
  description: string | null;
  leaderId: number;
  createdAt: string;
  memberCount: number; // from list endpoint mapping
};

export type GroupDetails = {
  id: number;
  name: string;
  description: string | null;
  leaderId: number;
  createdAt: string;
  members: {
    user: { id: number; name: string; email: string };
    joinedAt: string;
  }[];
};

export type Post = {
  id: number;
  title: string;
  content: string;
  author: { id: number; name: string };
  createdAt: string;
};

export type JoinRequest = {
  id: number;
  userId: number;
  status: string; // present in listJoinRequests
  createdAt: string;
  user: { id: number; email: string; name: string };
};
```

---

## UI/UX Flows

- Auth

  - Login form → store token → route to dashboard.
  - Optional registration form; ensure email is in allowed list.

- Groups

  - List view: call `GET /api/group`, show `memberCount`.
  - Details view: `GET /api/group/:id` with members. If `leaderId === currentUser.id`, show leader actions.
  - Create flow (protected): `POST /api/group`.

- Membership

  - Members tab: `GET /api/:id/members` (requires auth).
  - Leader: can remove a member via `DELETE /api/:id/members` with `{ userId, reason? }`.
  - Current user: can leave via `POST /api/:id/leave`.
  - Leader leaving:
    - If other members exist → leadership transfers automatically.
    - If no others → group is deleted; handle success message variants.

- Join Requests

  - Non-member: show “Request to Join” → `POST /api/groups/:id/join`.
  - Leader: Requests panel → `GET /api/groups/:id/requests`.
    - Approve → `PUT /api/requests/:id/accept`
    - Decline → `PUT /api/requests/:id/decline`

- Posts
  - List: `GET /api/groups/:id/posts`.
  - Create (protected): `POST /api/groups/:id/posts`.

---

## State and Access Control Hints

- Current user = result of login or `GET /api/user/profile`.
- Leader checks are server-side; UI should conditionally render based on `group.leaderId === currentUser.id`.
- There is no explicit role field in JWT; token payload contains `id` and `email` only.

---

## Error Handling

- Display `error.message` from client wrapper.
- Common cases:
  - 401 → prompt login/refresh token.
  - 403 → hide leader-only controls.
  - 404 → show not found / navigate back.
  - 409 → show duplicate message (e.g., email in use).

---

## Example Hooks (React)

```ts
import { useEffect, useState } from "react";
import { api } from "./http";

export function useGroup(id: number) {
  const [data, setData] = useState<GroupDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    setLoading(true);
    api
      .get(`/api/group/${id}`)
      .then((res) => setData(res.data.group))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);
  return { data, loading, error };
}
```

Protected route pattern:

```ts
// When app boots
const token = localStorage.getItem("token");
setAuthToken(token || undefined);

// Route guard example
if (!token) redirect("/login");
```

---

## Development Tips

- Respect path nuances:
  - Group member routes do not include `/group` prefix: `/api/:id/members`, `/api/:id/leave`.
  - Posts and join requests use `/api/groups/:id/...`.
- Handle two possible success messages when leader leaves a group.
- Prefer optimistic UI for accept/decline join requests.
- Consider adding skeleton loaders for list/detail pages.

---

## Checklists

- Auth

  - [ ] Store and attach token
  - [ ] Guard protected screens
  - [ ] Handle 401/403 gracefully

- Groups

  - [ ] List, detail, create
  - [ ] Leader controls when `leaderId === currentUser.id`

- Members

  - [ ] List members
  - [ ] Remove member (leader)
  - [ ] Leave group (self)

- Posts

  - [ ] List posts
  - [ ] Create post

- Join Requests
  - [ ] Request to join (non-member)
  - [ ] List incoming (leader)
  - [ ] Accept/decline (leader)

---

## Extensibility Ideas

- Add pagination to groups and posts.
- Add user search/autocomplete.
- Add comments and reactions to posts.
- Normalize API paths for consistency (e.g., mount member routes under `/api/group`).
