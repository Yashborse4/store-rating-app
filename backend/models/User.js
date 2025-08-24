const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.role_id = data.role_id;
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.address = data.address;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { username, email, password, role_id, first_name, last_name, address } = userData;
    
    try {
      // Hash password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      const query = `
        INSERT INTO users (username, email, password_hash, role_id, first_name, last_name, address)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, username, email, role_id, first_name, last_name, address, is_active, created_at
      `;
      
      const values = [username, email, password_hash, role_id, first_name, last_name, address];
      const result = await pool.query(query, values);
      
      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const query = `
        SELECT u.*, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = $1 AND u.is_active = true
      `;
      
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return {
        ...result.rows[0],
        role_name: result.rows[0].role_name
      };
    } catch (error) {
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const query = `
        SELECT u.*, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.username = $1 AND u.is_active = true
      `;
      
      const result = await pool.query(query, [username]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return {
        ...result.rows[0],
        role_name: result.rows[0].role_name
      };
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const query = `
        SELECT u.*, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.id = $1 AND u.is_active = true
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return {
        ...result.rows[0],
        role_name: result.rows[0].role_name
      };
    } catch (error) {
      throw error;
    }
  }

  // Validate password
  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get all users (admin only)
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.address,
               u.is_active, u.created_at, r.name as role_name,
               COALESCE(s.average_rating, 0) as average_rating
        FROM users u
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN stores s ON u.id = s.owner_id AND r.name = 'store_owner'
      `;
      
      const conditions = [];
      const values = [];
      let paramCount = 0;
      
      if (filters.name) {
        paramCount++;
        conditions.push(`(u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`);
        values.push(`%${filters.name}%`);
      }
      
      if (filters.email) {
        paramCount++;
        conditions.push(`u.email ILIKE $${paramCount}`);
        values.push(`%${filters.email}%`);
      }
      
      if (filters.address) {
        paramCount++;
        conditions.push(`u.address ILIKE $${paramCount}`);
        values.push(`%${filters.address}%`);
      }
      
      if (filters.role) {
        paramCount++;
        conditions.push(`r.name = $${paramCount}`);
        values.push(filters.role);
      }
      
      if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
      }
      
      query += ` ORDER BY u.created_at DESC`;
      
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Update user status
  static async updateStatus(id, is_active) {
    try {
      const query = `
        UPDATE users 
        SET is_active = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, username, email, is_active
      `;
      
      const result = await pool.query(query, [is_active, id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update user password
  static async updatePassword(id, newPassword) {
    try {
      // Hash new password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(newPassword, saltRounds);
      
      const query = `
        UPDATE users 
        SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, username, email
      `;
      
      const result = await pool.query(query, [password_hash, id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
