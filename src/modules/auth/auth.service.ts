import { pool } from '../../config/db.js';
import { type IUser } from './auth.interface.js';
import bcrypt from 'bcrypt';

export class AuthService {
  static async findByEmail(email: string): Promise<IUser | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  static async createUser(user: IUser): Promise<IUser> {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password!, saltRounds);
    
    const query = `
      INSERT INTO users (name, email, password, role) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id, name, email, role, created_at, updated_at
    `;
    const values = [user.name, user.email, hashedPassword, user.role || 'contributor'];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}