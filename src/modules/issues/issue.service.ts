import { pool } from '../../config/db.js';
import { type IIssue } from './issue.interface.js';

export class IssueService {
  static async create(issue: IIssue): Promise<IIssue> {
    const query = `
      INSERT INTO issues (title, description, type, reporter_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    `;
    const values = [issue.title, issue.description, issue.type, issue.reporter_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAll(filters: { type?: string; status?: string; sort?: string }) {
    let baseQuery = 'SELECT * FROM issues';
    const conditions: string[] = [];
    const values: any[] = [];

    if (filters.type) {
      values.push(filters.type);
      conditions.push(`type = $${values.length}`);
    }
    if (filters.status) {
      values.push(filters.status);
      conditions.push(`status = $${values.length}`);
    }

    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const order = filters.sort === 'oldest' ? 'ASC' : 'DESC';
    baseQuery += ` ORDER BY created_at ${order}`;

    const issuesResult = await pool.query(baseQuery, values);
    const issues = issuesResult.rows;

    if (issues.length === 0) return [];

    // RAW SQL INSTEAD OF JOIN: Fetch unique reporter IDs in a standalone sequential filter array
    const reporterIds = Array.from(new Set(issues.map(issue => issue.reporter_id)));
    
    const reporterQuery = `SELECT id, name, role FROM users WHERE id = ANY($1)`;
    const reportersResult = await pool.query(reporterQuery, [reporterIds]);
    
    const reportersMap = new Map(reportersResult.rows.map(user => [user.id, user]));

    return issues.map(issue => {
      const reporter = reportersMap.get(issue.reporter_id);
      return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter: reporter || null,
        created_at: issue.created_at,
        updated_at: issue.updated_at
      };
    });
  }

  static async getById(id: number) {
    const query = 'SELECT * FROM issues WHERE id = $1';
    const result = await pool.query(query, [id]);
    const issue = result.rows[0];
    if (!issue) return null;

    const userQuery = 'SELECT id, name, role FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [issue.reporter_id]);

    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: userResult.rows[0] || null,
      created_at: issue.created_at,
      updated_at: issue.updated_at
    };
  }

  static async findRawIssue(id: number): Promise<IIssue | null> {
    const query = 'SELECT * FROM issues WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async update(id: number, fields: Partial<IIssue>): Promise<IIssue> {
    const keys = Object.keys(fields);
    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const values = Object.values(fields);
    
    values.push(id);
    const query = `
      UPDATE issues 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${values.length} 
      RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id: number): Promise<boolean> {
    const query = 'DELETE FROM issues WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}