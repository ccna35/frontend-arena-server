// const mysql = require("mysql2");
require("dotenv").config();

import mysql, { ConnectionOptions } from "mysql2";

const access: ConnectionOptions = {
  host: process.env.HOST,
  user: process.env.USER,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
};

export const connection = mysql.createConnection(access);
