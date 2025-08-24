const { pool } = require('../config/database');

class Store {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.address = data.address;
    this.owner_id = data.owner_id;
    this.average_rating = data.average_rating;
    this.total_ratings = data.total_ratings;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new store
  static async create(storeData) {
    const { name, email, address, owner_id } = storeData;
    
    try {
      const query = `
        INSERT INTO stores (name, email, address, owner_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, address, owner_id, average_rating, total_ratings, is_active, created_at
      `;
      
      const values = [name, email, address, owner_id];
      const result = await pool.query(query, values);
      
      return new Store(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find store by ID
  static async findById(id) {
    try {
      const query = `
        SELECT s.*, u.first_name as owner_first_name, u.last_name as owner_last_name,
               u.username as owner_username
        FROM stores s
        LEFT JOIN users u ON s.owner_id = u.id
        WHERE s.id = $1 AND s.is_active = true
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

  // Find store by email
  static async findByEmail(email) {
    try {
      const query = `
        SELECT s.*, u.first_name as owner_first_name, u.last_name as owner_last_name
        FROM stores s
        LEFT JOIN users u ON s.owner_id = u.id
        WHERE s.email = $1 AND s.is_active = true
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

  // Find store by owner ID
  static async findByOwnerId(owner_id) {
    try {
      const query = `
        SELECT s.*, u.first_name as owner_first_name, u.last_name as owner_last_name
        FROM stores s
        LEFT JOIN users u ON s.owner_id = u.id
        WHERE s.owner_id = $1 AND s.is_active = true
      `;
      
      const result = await pool.query(query, [owner_id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get all stores with search functionality
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT s.*, u.first_name as owner_first_name, u.last_name as owner_last_name,
               u.username as owner_username
        FROM stores s
        LEFT JOIN users u ON s.owner_id = u.id
        WHERE s.is_active = true
      `;
      
      const conditions = [];
      const values = [];
      let paramCount = 0;
      
      if (filters.name) {
        paramCount++;
        conditions.push(`s.name ILIKE $${paramCount}`);
        values.push(`%${filters.name}%`);
      }
      
      if (filters.address) {
        paramCount++;
        conditions.push(`s.address ILIKE $${paramCount}`);
        values.push(`%${filters.address}%`);
      }
      
      if (filters.email) {
        paramCount++;
        conditions.push(`s.email ILIKE $${paramCount}`);
        values.push(`%${filters.email}%`);
      }
      
      if (conditions.length > 0) {
        query += ` AND ` + conditions.join(' AND ');
      }
      
      query += ` ORDER BY s.created_at DESC`;
      
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Update store information
  static async update(id, updateData) {
    try {
      const { name, email, address } = updateData;
      
      const query = `
        UPDATE stores 
        SET name = $1, email = $2, address = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 AND is_active = true
        RETURNING id, name, email, address, owner_id, average_rating, total_ratings, is_active, updated_at
      `;
      
      const result = await pool.query(query, [name, email, address, id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Update store status
  static async updateStatus(id, is_active) {
    try {
      const query = `
        UPDATE stores 
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

  // Update store rating statistics (called after rating changes)
  static async updateRatingStats(storeId) {
    try {
      const query = `
        UPDATE stores 
        SET 
          average_rating = (
            SELECT COALESCE(ROUND(AVG(rating::numeric), 2), 0.00)
            FROM ratings 
            WHERE store_id = $1
          ),
          total_ratings = (
            SELECT COUNT(*)
            FROM ratings 
            WHERE store_id = $1
          ),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, name, average_rating, total_ratings
      `;
      
      const result = await pool.query(query, [storeId]);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get stores with user's rating (for normal users)
  static async findAllWithUserRating(userId, filters = {}) {
    try {
      let query = `
        SELECT s.*, u.first_name as owner_first_name, u.last_name as owner_last_name,
               r.rating as user_rating
        FROM stores s
        LEFT JOIN users u ON s.owner_id = u.id
        LEFT JOIN ratings r ON s.id = r.store_id AND r.user_id = $1
        WHERE s.is_active = true
      `;
      
      const conditions = [];
      const values = [userId];
      let paramCount = 1;
      
      if (filters.name) {
        paramCount++;
        conditions.push(`s.name ILIKE $${paramCount}`);
        values.push(`%${filters.name}%`);
      }
      
      if (filters.address) {
        paramCount++;
        conditions.push(`s.address ILIKE $${paramCount}`);
        values.push(`%${filters.address}%`);
      }
      
      if (conditions.length > 0) {
        query += ` AND ` + conditions.join(' AND ');
      }
      
      query += ` ORDER BY s.created_at DESC`;
      
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get dashboard statistics
  static async getDashboardStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_stores,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_stores,
          COALESCE(AVG(average_rating), 0) as overall_average_rating,
          SUM(total_ratings) as total_ratings_count
        FROM stores
      `;
      
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Store;
