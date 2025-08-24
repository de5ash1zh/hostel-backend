# Hostel Backend API Documentation

## Features
- Authentication with JWT (Bearer tokens via `Authorization` header)
- Registration restricted to allowed emails (`src/config/allowed_emails.csv`)
- User profile: get/update current user
- Groups: create, list, get details (with member count and members)
- Group posts: create and list posts per group
- Join requests: request to join, leader lists/accepts/declines
- Group membership: list members, leader removes member (with reason), user can leave
- Leader leave behavior: auto transfer leadership or delete group if last member
- Centralized error handling with consistent `{ "message": string }` responses
- Security & middleware: CORS, Helmet, JSON body parsing
- Config via environment variables (`JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`)

- Version: 1.0.0
- Stack: Express.js, Prisma, JWT Auth
- Base URL: http://localhost:${PORT} (default PORT=3000)
- Prefix: All routes are mounted under `/api` unless noted.

---

## Authentication

- Scheme: Bearer JWT
- Header: `Authorization: Bearer <token>`
- Token: created by `POST /api/auth/login`

Errors are returned as JSON: `{ "message": string }`

---

## Quick Reference

| Module | Method | Endpoint | Auth | Description |
|---|---|---|---|---|
| Auth | POST | /api/auth/register | No | Register a new user (allowed emails only) |
| Auth | POST | /api/auth/login | No | Login, returns JWT token |
| Auth | GET | /api/auth/protected | Yes | Test route; echoes decoded user |
| Users | GET | /api/user/profile | Yes | Get current user profile |
| Users | PUT | /api/user/profile | Yes | Update current user profile |
| Groups | POST | /api/group | Yes | Create a new group (current user becomes leader) |
| Groups | GET | /api/group | No | List all groups with memberCount |
| Groups | GET | /api/group/:id | No | Get group details with members |
| Group Posts | POST | /api/groups/:id/posts | Yes | Create a post in a group |
| Group Posts | GET | /api/groups/:id/posts | No | List posts in a group |
| Join Requests | POST | /api/groups/:id/join | Yes | Send join request to a group |
| Join Requests | GET | /api/groups/:id/requests | Yes (Leader) | List join requests for a group |
| Join Requests | PUT | /api/requests/:id/accept | Yes (Leader) | Accept a join request |
| Join Requests | PUT | /api/requests/:id/decline | Yes (Leader) | Decline a join request |
| Group Members | GET | /api/:id/members | Yes | List members of a group |
| Group Members | DELETE | /api/:id/members | Yes (Leader) | Remove a member from group |
| Group Members | POST | /api/:id/leave | Yes | Current user leaves a group |

Note: Group Members routes are mounted under `/api` without the `group` segment, e.g., `/api/:id/members`. This differs from other group-related paths that use `/api/group` or `/api/groups`.

---

## Endpoints

### Auth

#### Register
- POST `/api/auth/register`
- Body (JSON):
```
{
  "email": "user@example.com",
  "password": "strong_password",
  "name": "User Name"
}
```
- Rules:
  - Email must be present in `src/config/allowed_emails.csv`.
  - Email must be unique.
- Responses:
  - 201 Created
```
{
  "message": "User registered successfully",
  "user": {
    "id": number,
    "email": string,
    "name": string,
    "createdAt": string
  }
}
```
  - 403 Email not allowed
  - 409 User already exists

#### Login
- POST `/api/auth/login`
- Body (JSON):
```
{
  "email": "user@example.com",
  "password": "strong_password"
}
```
- Responses:
  - 200 OK
```
{
  "message": "Login successful",
  "token": string,
  "user": { "id": number, "email": string, "name": string }
}
```
  - 401 User not found / Invalid credentials

#### Protected Test
- GET `/api/auth/protected`
- Header: `Authorization: Bearer <token>`
- Response 200 OK:
```
{ "message": "You have access!", "user": { id, email, ... } }
```

---

### Users

#### Get Profile
- GET `/api/user/profile`
- Auth: Required
- Response 200 OK:
```
{ "user": { "id": number, "email": string, "name": string, "createdAt": string } }
```
- Errors: 401 Unauthorized, 404 User not found

#### Update Profile
- PUT `/api/user/profile`
- Auth: Required
- Body (JSON) — all optional:
```
{ "name": string, "email": string }
```
- Notes:
  - If changing `email`, it must be unique.
- Responses:
  - 200 OK
```
{ "message": "Profile updated", "user": { id, email, name, createdAt } }
```
  - 401 Unauthorized, 409 Email already in use

---

### Groups

#### Create Group
- POST `/api/group`
- Auth: Required
- Body (JSON):
```
{ "name": string, "description": string|null }
```
- Responses:
  - 201 Created
```
{ "message": "Group created successfully", "group": { id, name, description, leaderId, createdAt } }
```
  - 400 Group name is required, 401 Unauthorized

#### List Groups
- GET `/api/group`
- Auth: Not required
- Response 200 OK:
```
{ "groups": [ { id, name, description, leaderId, createdAt, memberCount } ] }
```

#### Get Group Details
- GET `/api/group/:id`
- Auth: Not required
- Response 200 OK:
```
{
  "group": {
    "id": number,
    "name": string,
    "description": string|null,
    "createdAt": string,
    "leaderId": number,
    "members": [ { "user": { "id": number, "name": string, "email": string }, "joinedAt": string } ]
  }
}
```
- Errors: 404 Group not found

---

### Group Posts

#### Create Post
- POST `/api/groups/:id/posts`
- Auth: Required
- Body (JSON):
```
{ "title": string, "content": string }
```
- Responses:
  - 201 Created: `{ "message": "Post created", "post": { ... } }`
  - 400 title and content required, 401 Unauthorized

#### List Posts
- GET `/api/groups/:id/posts`
- Auth: Not required
- Response 200 OK:
```
{ "posts": [ { id, title, content, author: { id, name }, createdAt } ] }
```

---

### Join Requests

#### Create Join Request
- POST `/api/groups/:id/join`
- Auth: Required
- Responses:
  - 201 Created
```
{ "message": "Join request sent", "joinRequest": { id, groupId, userId, createdAt } }
```
  - 400 Already a member / Request already sent
  - 401 Unauthorized

#### List Join Requests (Leader)
- GET `/api/groups/:id/requests`
- Auth: Required (must be group leader)
- Response 200 OK:
```
{ "requests": [ { id, userId, status, createdAt, user: { id, email, name } } ] }
```
- Errors: 404 Group not found, 403 Forbidden

#### Accept Join Request (Leader)
- PUT `/api/requests/:id/accept`
- Auth: Required (must be group leader)
- Response 200 OK: `{ "message": "Join request accepted" }`
- Errors: 401 Unauthorized, 404 Join Request not found, 403 Only group leader can accept

#### Decline Join Request (Leader)
- PUT `/api/requests/:id/decline`
- Auth: Required (must be group leader)
- Response 200 OK: `{ "message": "Join request declined" }`
- Errors: 401 Unauthorized, 404 Join request not found, 403 Only group leader can decline

---

### Group Members

Note: These routes are mounted as `/api/:id/...` (no `group` segment).

#### List Members
- GET `/api/:id/members`
- Auth: Required
- Response 200 OK:
```
{ "members": [ { "user": { id, name, email } } ] }
```

#### Remove Member (Leader)
- DELETE `/api/:id/members`
- Auth: Required (must be group leader)
- Body (JSON):
```
{ "userId": number, "reason": string|null }
```
- Response 200 OK: `{ "message": "Member removed successfully", "reason": string|null }`
- Errors: 403 Only group leaders can remove members

#### Leave Group
- POST `/api/:id/leave`
- Auth: Required
- Behavior:
  - If the leaver is the leader and another member exists, leadership transfers to another member.
  - If the leaver is the sole member, the group is deleted.
- Response 200 OK:
  - `{ "message": "You left the group" }` or
  - `{ "message": "Group deleted as leader left and no members left" }`
- Errors: 404 Group not found

---

## Errors and Status Codes

- 400 Bad Request – validation failures (e.g., missing fields)
- 401 Unauthorized – missing/invalid token, or unauthenticated actions
- 403 Forbidden – not permitted (e.g., non-leader attempting leader actions)
- 404 Not Found – resource not found
- 409 Conflict – duplicate resource (e.g., email)
- 500 Internal Server Error – unhandled errors

Global error handler lives in `src/middleware/error.middleware.js`.

---

## Authentication Details

- JWT is signed with secret `JWT_SECRET` and `JWT_EXPIRES_IN` from environment.
- Required env vars are defined in `src/config/env.js`; `JWT_SECRET` is mandatory.

---

## Curl Examples

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"pass","name":"User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"pass"}'

# Get profile
curl http://localhost:3000/api/user/profile \
  -H 'Authorization: Bearer <TOKEN>'

# Create group
curl -X POST http://localhost:3000/api/group \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Block A","description":"Freshers"}'

# Create post in group 1
curl -X POST http://localhost:3000/api/groups/1/posts \
  -H 'Authorization: Bearer <TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{"title":"Notice","content":"Meeting at 7 PM"}'
```

---

## Notes and Inconsistencies

- Group Members routes are mounted under `/api/:id/...`, not `/api/group/:id/...`. If you prefer consistent paths, consider mounting `groupMember.routes.js` under `/api/group` similar to `group.routes.js`.
- Allowed email list is controlled by `src/config/allowed_emails.csv`. Registration will fail for emails not in this list.

---

## Changelog
- 1.0.0 – Initial documentation generated from codebase routes/controllers.
