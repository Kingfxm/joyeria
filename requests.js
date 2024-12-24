const { query } = require("express");
const { Pool } = require("pg");
const format = require("pg-format");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: 5432,
  allowExitOnIddle: true,
});

const convertHATEOAS = (result) => {
  const results = result
    .map((r) => {
      return {
        name: r.nombre,
        href: `/joyas/joya/${r.id}`,
      };
    })
    .slice(0, 6);

  const joyas = result.length;
  const stockTotal = result.reduce((a, b) => a + b.stock, 0);
  const HATEOAS = {
    joyas,
    stockTotal,
    results,
  };

  return HATEOAS;
};

const getJoyas = async ({ limit = 6, page = 1, order_by = "id_ASC" }) => {
  try {
    const [sort, direction] = order_by.split("_");
    const query = format(
      "SELECT * FROM inventario ORDER BY %s %s LIMIT %s OFFSET %s",
      sort,
      direction,
      Math.abs(limit),
      Math.abs((page - 1) * limit)
    );
    const { rows: joyas } = await pool.query(query);
    const result = joyas.map((j) => {});
    if (joyas.length === 0) {
      throw new Error("Joyas no encontradas");
    } else {
      return joyas;
    }
  } catch (error) {
    throw new Error(error, "Error al obtener las joyas");
  }
};

const getJoyasFilter = async ({ precio_min, precio_max, categoria, metal }) => {
  try {
    let filter = [];
    const values = [];
    const addFilter = (field, sort, value) => {
      values.push(value);
      filter.push(`${field} ${sort} $${filter.length + 1}`);
    };
    if (precio_min) addFilter("precio", ">=", precio_min);
    if (precio_max) addFilter("precio", "<=", precio_max);
    if (categoria) addFilter("categoria", "=", categoria);
    if (metal) addFilter("metal", "=", metal);
    let query = `SELECT * FROM inventario`;
    if (filter.length > 0) {
      query += ` WHERE ${filter.join(" AND ")}`;
    }
    const { rows: joyas } = await pool.query(query, values);
    if (joyas.length === 0) {
      throw new Error("Joyas no encontradas");
    } else {
      return joyas;
    }
  } catch (error) {
    throw new Error(error, "Error al obtener las joyas");
  }
};

// * ------     MIDDLEWARES    ------- *

const reportRequest = (req, res, next) => {
  const params = req.query;
  console.log(
    `Hoy ${new Date()} se ha hecho una consulta en la ruta: ${
      req.url
    } con los parametros: ${JSON.stringify(params)}`
  );
  next();
};

module.exports = { getJoyas, getJoyasFilter, convertHATEOAS, reportRequest };
