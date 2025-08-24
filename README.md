# Hostel Backend API Documentation

## Introduction

This API documentation provides details on how to interact with the Hostel Backend API. The API is built using Node.js, Express.js, and Prisma. It uses JWT authentication for protected routes.

---

## API Reference Table

| Module         | Method | Endpoint                  | Auth Required | Description                                  |
| -------------- | ------ | ------------------------- | ------------- | -------------------------------------------- |
| Authentication | POST   | /api/auth/register        | No            | Register a new user                          |
| Authentication | POST   | /api/auth/login           | No            | Login an existing user                       |
| Users          | GET    | /api/user/profile         | Yes           | Get current user's profile                   |
| Users          | PUT    | /api/user/profile         | Yes           | Update current user's profile                |
| Groups         | POST   | /api/group                | Yes           | Create a new group                           |
| Groups         | GET    | /api/group                | No            | List all groups                              |
| Groups         | GET    | /api/group/:id            | No            | Get group details                            |
| Group Posts    | POST   | /api/group/:id/posts      | Yes           | Create a new post in a group                 |
| Group Posts    | GET    | /api/group/:id/posts      | No            | List all posts in a group                    |
| Join Requests  | POST   | /api/groups/:id/join      | Yes           | Create a join request for a group            |
| Join Requests  | GET    | /api/groups/:id/requests  | Yes (Leader)  | List join requests for a group (leader only) |
| Join Requests  | PUT    | /api/requests/:id/accept  | Yes (Leader)  | Accept a join request (adds member)          |
| Join Requests  | PUT    | /api/requests/:id/decline | Yes (Leader)  | Decline a join request                       |
| Group Members  | GET    | /api/group/:id/members    | Yes           | List members of a group                      |
| Group Members  | DELETE | /api/groups/:id/members   | Yes (Leader)  | Remove a member from a group (with reason)   |
| Group Members  | DELETE | /api/groups/:id/leave     | Yes           | Leave a group                                |

---

## Detailed Endpoints

### Authentication

#### Register

- **POST** `/api/auth/register`
- **Body**:

```json
{
 test@test.com
de5ash1zh@gmail.com
test1@test.com
}
```
