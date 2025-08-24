const { pool } = require('../config/database');

class Role {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.created_at = data.created_at;
  }

  // Get all roles
  static async findAll() {
    try {
      const query = 'SELECT * FROM roles ORDER BY id';
      const result = await pool.query(query);
      return result.rows.map(row => new Role(row));
    } catch (error) {
      throw error;
    }
  }

  // Find role by name
  static async findByName(name) {
    try {
      const query = 'SELECT * FROM roles WHERE name = $1';
      const result = await pool.query(query, [name]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Role(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Find role by ID
  static async findById(id) {
    try {
      const query = 'SELECT * FROM roles WHERE id = $1';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return new Role(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  // Get role constants
  static get ROLES() {
    return {
      SYSTEM_ADMIN: 'system_admin',
      NORMAL_USER: 'normal_user',
      STORE_OWNER: 'store_owner'
    };
  }

  // Get role IDs (useful for quick lookups)
  static async getRoleIds() {
    try {
      const roles = await this.findAll();
      const roleMap = {};
      roles.forEach(role => {
        roleMap[role.name] = role.id;
      });
      return roleMap;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Role;
