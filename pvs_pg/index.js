require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const env = process.env.NODE_ENV || "development";
const port = process.env.PORT || 8990;
const config = require("./config/config.json");
const routes = require('./routes')

const app = express();
const { Sequelize } = require("sequelize");

const dbConfig = config[env];

const sequelize = new Sequelize({
  database: dbConfig.database,
  username: dbConfig.username,
  password: dbConfig.password,
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000,
  },
});

const notFoundMiddleware = require("./middlewares/not-found");
const handlerErrorMiddleware = require("./middlewares/error-handler");

app.use(cors());
app.use(express.urlencoded({ extended: false, limit: "100mb" }));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(express.json());

// Test the database connection
sequelize
  .authenticate()
  .then(() => console.log("Database connected..."))
  .catch((err) => console.log("Unable to connect to database, Error: " + err));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
app.use(routes);
app.use(notFoundMiddleware)
app.use(handlerErrorMiddleware);