const pool = require('../config/db');

function id(name) {
  return `\`${String(name).replace(/`/g, '``')}\``;
}

class BaseModel {
  constructor(tableName, primaryKey, fields) {
    this.tableName = tableName;
    this.primaryKey = primaryKey;
    this.fields = fields;
  }

  table() {
    return id(this.tableName);
  }

  column(name) {
    return id(name);
  }

  cleanData(data) {
    return this.fields.reduce((cleaned, field) => {
      if (data[field] !== undefined) {
        cleaned[field] = data[field];
      }
      return cleaned;
    }, {});
  }

  async findAll({ filters = {}, limit, offset, orderBy } = {}) {
    const values = [];
    const where = [];

    Object.entries(filters).forEach(([field, value]) => {
      if (value !== undefined && value !== null && this.fields.includes(field)) {
        where.push(`${this.column(field)} = ?`);
        values.push(value);
      }
    });

    let sql = `SELECT * FROM ${this.table()}`;

    if (where.length > 0) {
      sql += ` WHERE ${where.join(' AND ')}`;
    }

    if (orderBy && [...this.fields, this.primaryKey].includes(orderBy)) {
      sql += ` ORDER BY ${this.column(orderBy)} DESC`;
    }

    if (limit) {
      sql += ' LIMIT ?';
      values.push(Number(limit));

      if (offset) {
        sql += ' OFFSET ?';
        values.push(Number(offset));
      }
    }

    const [rows] = await pool.query(sql, values);
    return rows;
  }

  async findById(idValue) {
    const [rows] = await pool.query(
      `SELECT * FROM ${this.table()} WHERE ${this.column(this.primaryKey)} = ? LIMIT 1`,
      [idValue]
    );
    return rows[0] || null;
  }

  async create(data) {
    const cleaned = this.cleanData(data);
    const keys = Object.keys(cleaned);

    if (keys.length === 0) {
      const error = new Error('No valid fields provided');
      error.statusCode = 400;
      throw error;
    }

    const columns = keys.map((key) => this.column(key)).join(', ');
    const placeholders = keys.map(() => '?').join(', ');
    const values = keys.map((key) => cleaned[key]);

    const [result] = await pool.query(
      `INSERT INTO ${this.table()} (${columns}) VALUES (${placeholders})`,
      values
    );

    return this.findById(result.insertId);
  }

  async update(idValue, data) {
    const cleaned = this.cleanData(data);
    const keys = Object.keys(cleaned);

    if (keys.length === 0) {
      return this.findById(idValue);
    }

    const setClause = keys.map((key) => `${this.column(key)} = ?`).join(', ');
    const values = keys.map((key) => cleaned[key]);
    values.push(idValue);

    const [result] = await pool.query(
      `UPDATE ${this.table()} SET ${setClause} WHERE ${this.column(this.primaryKey)} = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return this.findById(idValue);
  }

  async delete(idValue) {
    const [result] = await pool.query(
      `DELETE FROM ${this.table()} WHERE ${this.column(this.primaryKey)} = ?`,
      [idValue]
    );
    return result.affectedRows > 0;
  }

  async deleteByField(field, value) {
    if (!this.fields.includes(field)) {
      throw new Error(`Invalid field: ${field}`);
    }
    const [result] = await pool.query(
      `DELETE FROM ${this.table()} WHERE ${this.column(field)} = ?`,
      [value]
    );
    return result.affectedRows > 0;
  }
}

module.exports = BaseModel;
