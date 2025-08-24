const { pool } = require('../config/database');

class Store {
  constructor(data) {
    this.id = data.id;
    this.store_name = data.store_name;
    this.store_id = data.store_id;
    this.owner_user_id = data.owner_user_id;
    this.store_description = data.store_description;
    this.average_rating = data.average_rating;
    this.total_ratings = data.total_ratings;
    this.is_active = data.is_active;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Create a new store
  static async create(storeData) {
    const { store_name, store_id, owner_user_id, store_description } = storeData;
    
    try {
      const query = `
        INSERT INTO stores (store_name, store_id, owner_user_id, store_description)
        VALUES ($1, $2, $3, $4)
        RETURNING id, store_name, store_id, owner_user_id, store_description, average_rating, total_ratings, is_active, created_at
      `;
      
      const values = [store_name, store_id, owner_user_id, store_description];
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
        SELECT s.*, u.name as owner_name, u.email as owner_email
        FROM stores s
        LEFT JOIN users u ON s.owner_user_id = u.id
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

  // Find store by store_id
  static async findByStoreId(store_id) {
    try {
      const query = `
        SELECT s.*, u.name as owner_name, u.email as owner_email
        FROM stores s
        LEFT JOIN users u ON s.owner_user_id = u.id
        WHERE s.store_id = $1 AND s.is_active = true
      `;
      
      const result = await pool.query(query, [store_id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Find store by owner user ID
  static async findByOwnerUserId(owner_user_id) {
    try {
      const query = `
        SELECT s.*, u.name as owner_name, u.email as owner_email
        FROM stores s
        LEFT JOIN users u ON s.owner_user_id = u.id
        WHERE s.owner_user_id = $1 AND s.is_active = true
      `;
      
      const result = await pool.query(query, [owner_user_id]);
      
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
        SELECT s.*, u.name as owner_name, u.email as owner_email
        FROM stores s
        LEFT JOIN users u ON s.owner_user_id = u.id
        WHERE s.is_active = true
      `;
      
      const conditions = [];
      const values = [];
      let paramCount = 0;
      
      if (filters.store_name) {
        paramCount++;
        conditions.push(`s.store_name ILIKE $${paramCount}`);
        values.push(`%${filters.store_name}%`);
      }
      
      if (filters.store_id) {
        paramCount++;
        conditions.push(`s.store_id ILIKE $${paramCount}`);
        values.push(`%${filters.store_id}%`);
      }
      
      if (filters.store_description) {
        paramCount++;
        conditions.push(`s.store_description ILIKE $${paramCount}`);
        values.push(`%${filters.store_description}%`);
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
      const { store_name, store_id, store_description } = updateData;
      
      const query = `
        UPDATE stores 
        SET store_name = $1, store_id = $2, store_description = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4 AND is_active = true
        RETURNING id, store_name, store_id, owner_user_id, store_description, average_rating, total_ratings, is_active, updated_at
      `;
      
      const result = await pool.query(query, [store_name, store_id, store_description, id]);
      
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
        RETURNING id, store_name, store_id, is_active
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
        RETURNING id, store_name, average_rating, total_ratings
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
        SELECT s.*, u.name as owner_name, u.email as owner_email,
               r.rating as user_rating
        FROM stores s
        LEFT JOIN users u ON s.owner_user_id = u.id
        LEFT JOIN ratings r ON s.id = r.store_id AND r.user_id = $1
        WHERE s.is_active = true
      `;
      
      const conditions = [];
      const values = [userId];
      let paramCount = 1;
      
      if (filters.store_name) {
        paramCount++;
        conditions.push(`s.store_name ILIKE $${paramCount}`);
        values.push(`%${filters.store_name}%`);
      }
      
      if (filters.store_description) {
        paramCount++;
        conditions.push(`s.store_description ILIKE $${paramCount}`);
        values.push(`%${filters.store_description}%`);
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
