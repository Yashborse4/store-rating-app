const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.password_hash = data.password_hash;
    this.role = data.role;
    this.address = data.address;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new user
  static async create(userData) {
    const { name, email, password, role = 'normal_user', address } = userData;
    
    try {
      // Hash password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);
      
      const query = `
        INSERT INTO users (name, email, password_hash, role, address)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, role, address, is_active, created_at
      `;
      
      const values = [name, email, password_hash, role, address];
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
        SELECT *
        FROM users
        WHERE email = $1 AND is_active = true
      `;
      
      const result = await pool.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find user by name
  static async findByName(name) {
    try {
      const query = `
        SELECT *
        FROM users
        WHERE name = $1 AND is_active = true
      `;
      
      const result = await pool.query(query, [name]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  static async findById(id) {
    try {
      const query = `
        SELECT *
        FROM users
        WHERE id = $1 AND is_active = true
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
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
        SELECT u.id, u.name, u.email, u.address, u.role,
               u.is_active, u.created_at,
               COALESCE(s.average_rating, 0) as average_rating
        FROM users u
        LEFT JOIN stores s ON u.id = s.owner_user_id AND u.role = 'store_owner'
      `;
      
      const conditions = [];
      const values = [];
      let paramCount = 0;
      
      if (filters.name) {
        paramCount++;
        conditions.push(`u.name ILIKE $${paramCount}`);
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
        conditions.push(`u.role = $${paramCount}`);
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
        RETURNING id, name, email, is_active
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
        RETURNING id, name, email
      `;
      
      const result = await pool.query(query, [password_hash, id]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
