const { pool } = require('../config/database');

class Rating {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.store_id = data.store_id;
    this.rating = data.rating;
    this.review_comment = data.review_comment;
    this.rating_given_at = data.rating_given_at;
    this.updated_at = data.updated_at;
  }

  // Submit or update a rating
  static async submitRating(userId, storeId, rating, review_comment = null) {
    try {
      const query = `
        INSERT INTO ratings (user_id, store_id, rating, review_comment)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id, store_id)
        DO UPDATE SET rating = $3, review_comment = $4, updated_at = CURRENT_TIMESTAMP
        RETURNING id, user_id, store_id, rating, review_comment, rating_given_at, updated_at
      `;
      
      const values = [userId, storeId, rating, review_comment];
      const result = await pool.query(query, values);
      
      return new Rating(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get rating by user and store
  static async findByUserAndStore(userId, storeId) {
    try {
      const query = `
        SELECT r.*, u.name as user_name, u.email as user_email, s.store_name
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        JOIN stores s ON r.store_id = s.id
        WHERE r.user_id = $1 AND r.store_id = $2
      `;
      
      const result = await pool.query(query, [userId, storeId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get all ratings for a store (for store owner dashboard)
  static async findByStoreId(storeId) {
    try {
      const query = `
        SELECT r.*, u.name as user_name, u.email as user_email
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        WHERE r.store_id = $1
        ORDER BY r.rating_given_at DESC
      `;
      
      const result = await pool.query(query, [storeId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Get all ratings by a user
  static async findByUserId(userId) {
    try {
      const query = `
        SELECT r.*, s.store_name, s.store_description
        FROM ratings r
        JOIN stores s ON r.store_id = s.id
        WHERE r.user_id = $1
        ORDER BY r.rating_given_at DESC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Delete a rating
  static async deleteRating(userId, storeId) {
    try {
      const query = `
        DELETE FROM ratings 
        WHERE user_id = $1 AND store_id = $2
        RETURNING id, user_id, store_id, rating
      `;
      
      const result = await pool.query(query, [userId, storeId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get rating statistics for a store
  static async getStoreRatingStats(storeId) {
    try {
      const query = `
        SELECT 
          store_id,
          COUNT(*) as total_ratings,
          AVG(rating) as average_rating,
          MIN(rating) as min_rating,
          MAX(rating) as max_rating,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1_count,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2_count,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3_count,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4_count,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5_count
        FROM ratings 
        WHERE store_id = $1
        GROUP BY store_id
      `;
      
      const result = await pool.query(query, [storeId]);
      
      if (result.rows.length === 0) {
        return {
          store_id: storeId,
          total_ratings: 0,
          average_rating: 0,
          min_rating: 0,
          max_rating: 0,
          rating_1_count: 0,
          rating_2_count: 0,
          rating_3_count: 0,
          rating_4_count: 0,
          rating_5_count: 0
        };
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get overall rating statistics (for admin dashboard)
  static async getOverallStats() {
    try {
      const query = `
        SELECT 
          COUNT(*) as total_ratings,
          AVG(rating) as average_rating,
          COUNT(DISTINCT user_id) as users_who_rated,
          COUNT(DISTINCT store_id) as stores_with_ratings,
          COUNT(CASE WHEN rating = 1 THEN 1 END) as rating_1_count,
          COUNT(CASE WHEN rating = 2 THEN 1 END) as rating_2_count,
          COUNT(CASE WHEN rating = 3 THEN 1 END) as rating_3_count,
          COUNT(CASE WHEN rating = 4 THEN 1 END) as rating_4_count,
          COUNT(CASE WHEN rating = 5 THEN 1 END) as rating_5_count
        FROM ratings
      `;
      
      const result = await pool.query(query);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Get recent ratings (for admin dashboard)
  static async getRecentRatings(limit = 10) {
    try {
      const query = `
        SELECT r.*, 
               u.name as user_name, u.email as user_email,
               s.store_name, s.store_description
        FROM ratings r
        JOIN users u ON r.user_id = u.id
        JOIN stores s ON r.store_id = s.id
        ORDER BY r.rating_given_at DESC
        LIMIT $1
      `;
      
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  // Check if user has rated a store
  static async hasUserRatedStore(userId, storeId) {
    try {
      const query = `
        SELECT COUNT(*) as count
        FROM ratings
        WHERE user_id = $1 AND store_id = $2
      `;
      
      const result = await pool.query(query, [userId, storeId]);
      return parseInt(result.rows[0].count) > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Rating;
