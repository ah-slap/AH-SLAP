import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db';
import { UserDto, RegisterUserRequest, LoginUserRequest } from '../types/user';

const router = Router();

// Task C1: POST /api/users (Register a new user)
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fullName, email, phone, password } = req.body as RegisterUserRequest;

    // 1. Input validation
    if (!fullName || !email || !phone || !password) {
      res.status(400).json({ error: 'All fields (fullName, email, phone, password) are required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      res.status(400).json({ error: 'Invalid email format.' });
      return;
    }

    // 2. Hash password before saving
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Insert into PostgreSQL & return camelCase UserDto
    const result = await pool.query<UserDto>(
      `INSERT INTO users (full_name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name AS "fullName", email, phone, created_at AS "createdAt"`,
      [fullName.trim(), normalizedEmail, phone.trim(), passwordHash]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    // PostgreSQL unique_violation error code (duplicate email)
    if (err?.code === '23505') {
      res.status(409).json({ error: 'A user with this email already exists.' });
      return;
    }
    next(err);
  }
});

// Task C2: POST /api/users/login (Authenticate existing user)
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body as LoginUserRequest;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Fetch user + password_hash from DB
    const result = await pool.query(
      `SELECT id, full_name AS "fullName", email, phone, password_hash, created_at AS "createdAt"
       FROM users
       WHERE email = $1`,
      [normalizedEmail]
    );

    const userRow = result.rows[0];
    if (!userRow) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // 2. Verify password against stored hash
    const isMatch = await bcrypt.compare(password, userRow.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // 3. Return safe UserDto (without password_hash)
    const { password_hash, ...userDto } = userRow;
    res.status(200).json(userDto as UserDto);
  } catch (err) {
    next(err);
  }
});

export default router;