import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { LoginUserRequest, RegisterUserRequest } from '../types/user';

// Keep `pool` referenced so TypeScript doesn't warn before Pair B implements queries
void pool;

const router = Router();

/**
 * Task C1: Create a new user account
 * Route: POST /api/users
 *
 * Note on Express 5 + @types/express@5:
 * Write `res.status(...).json(...); return;` rather than `return res.status(...).json(...)`.
 */
router.post('/', async (req: Request<object, object, RegisterUserRequest>, res: Response) => {
  // TODO (Pair B - Backend & DB):
  // 1. Extract and validate `fullName`, `email`, `phone`, (optional `password`) from `req.body`.
  //    Normalize email with `email.trim().toLowerCase()`.
  // 2. (Recommended) If `password` is used, hash with `await bcrypt.hash(password, 10)`.
  // 3. INSERT into `users` via `pool.query(...)` using camelCase SQL aliases:
  //      INSERT INTO users (full_name, email, phone, password_hash)
  //      VALUES ($1, $2, $3, $4)
  //      RETURNING id, full_name AS "fullName", email, phone, created_at AS "createdAt"
  // 4. Catch duplicate email (Postgres error code `'23505'`) and respond `409 Conflict`.
  // 5. Respond `201 Created` with the `UserDto` JSON object.
  void req;
  res.status(501).json({ message: 'TODO: Implement POST /api/users (Task C1)' });
});

/**
 * Task C2: Verify user login credentials
 * Route: POST /api/users/login
 */
router.post('/login', async (req: Request<object, object, LoginUserRequest>, res: Response) => {
  // TODO (Pair B - Backend & DB):
  // 1. Extract and validate `email` (and `password` if enabled) from `req.body`.
  // 2. Query PostgreSQL:
  //      SELECT id, full_name AS "fullName", email, phone, password_hash, created_at AS "createdAt"
  //      FROM users WHERE LOWER(email) = LOWER($1)
  // 3. If not found (or `bcrypt.compare` fails when password_hash is present), respond `401 Unauthorized`.
  // 4. Strip `password_hash` and respond `200 OK` with `UserDto`.
  void req;
  res.status(501).json({ message: 'TODO: Implement POST /api/users/login (Task C2)' });
});

export default router;
