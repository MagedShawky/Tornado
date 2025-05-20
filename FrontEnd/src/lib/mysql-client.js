// File: src/lib/mysql-client.js

/**
 * QueryBuilder class for building SQL queries with a Supabase-like API
 */
class QueryBuilder {
    constructor(tableName, client) {
      this.tableName = tableName;
      this.client = client;
      this.resetQuery();
    }
  
    resetQuery() {
      this._select = '*';
      this._where = [];
      this._whereParams = [];
      this._orderBy = [];
      this._limit = null;
      this._offset = null;
      return this;
    }
  
    select(columns) {
      if (Array.isArray(columns)) {
        this._select = columns.join(', ');
      } else if (typeof columns === 'string') {
        this._select = columns;
      }
      return this;
    }
  
    where(column, operator, value) {
      if (value === undefined) {
        value = operator;
        operator = '=';
      }
      this._where.push(`${column} ${operator} ?`);
      this._whereParams.push(value);
      return this;
    }
  
    order(column, direction = 'asc') {
      this._orderBy.push(`${column} ${direction.toUpperCase()}`);
      return this;
    }
  
    limit(count) {
      this._limit = count;
      return this;
    }
  
    offset(count) {
      this._offset = count;
      return this;
    }
  
    async _buildAndExecuteQuery(additionalSQL = '') {
      let query = `SELECT ${this._select} FROM ${this.tableName}`;
      const params = [...this._whereParams];
  
      if (this._where.length > 0) {
        query += ` WHERE ${this._where.join(' AND ')}`;
      }
  
      if (this._orderBy.length > 0) {
        query += ` ORDER BY ${this._orderBy.join(', ')}`;
      }
  
      if (this._limit !== null) {
        query += ` LIMIT ?`;
        params.push(this._limit);
      }
  
      if (this._offset !== null) {
        query += ` OFFSET ?`;
        params.push(this._offset);
      }
  
      query += additionalSQL;
  
      const result = await this.client.query(query, params);
      this.resetQuery();
      return result;
    }
  
    async get() {
      return this._buildAndExecuteQuery();
    }
  
    async single() {
      const results = await this.limit(1).get();
      return results.length > 0 ? results[0] : null;
    }
  
    async insert(data) {
        try {
          const columns = Object.keys(data);
          const values = Object.values(data);
          const placeholders = columns.map(() => '?').join(', ');
      
          const query = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
          console.log('Executing insert query:', query);
          console.log('With values:', values);
          
          const result = await this.client.query(query, values);
          console.log('Insert result:', result);
          
          return {
            ...data,
            id: result.insertId
          };
        } catch (error) {
          console.error('Insert error:', error);
          throw error;
        }
      }
  
    async update(data) {
      if (this._where.length === 0) {
        throw new Error('Update operation requires a where clause');
      }
  
      const setClause = Object.keys(data).map(key => `${key} = ?`).join(', ');
      const params = [...Object.values(data), ...this._whereParams];
  
      const query = `UPDATE ${this.tableName} SET ${setClause} WHERE ${this._where.join(' AND ')}`;
      await this.client.query(query, params);
      
      // Return the updated data
      return this._buildAndExecuteQuery();
    }
  
    async delete() {
      if (this._where.length === 0) {
        throw new Error('Delete operation requires a where clause');
      }
  
      const query = `DELETE FROM ${this.tableName} WHERE ${this._where.join(' AND ')}`;
      await this.client.query(query, this._whereParams);
      
      return { success: true };
    }
  }
  
  /**
   * MySQLClient class that mimics Supabase client API
   */
  class MySQLClient {
    constructor(apiUrl) {
      if (!apiUrl) {
        console.warn('API URL not provided to MySQLClient, using default: http://localhost:5000/api');
      }
      this.apiUrl = apiUrl || 'http://localhost:5000/api';
    }
  
    async query(query, params = []) {
      try {
        const response = await fetch(`${this.apiUrl}/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, params }),
        });
  
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Query failed');
        }
  
        return await response.json();
      } catch (error) {
        console.error('Query error:', error);
        throw error;
      }
    }
  
    table(tableName) {
      return new QueryBuilder(tableName, this);
    }
  
    from(tableName) {
      return this.table(tableName);
    }
  }
  
  // Get API URL from environment variable or use default
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  
  // Create and export a singleton instance of the client
  const mysqlClient = new MySQLClient(API_URL);
  
  // Default export for direct import
  export default mysqlClient;
  
  // Named export for destructuring import
  export { mysqlClient };