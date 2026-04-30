const path = require("path");

const dbFile = process.env.DATABASE_FILE || "./data/dev.sqlite3";

module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: path.resolve(__dirname, dbFile)
    },
    useNullAsDefault: true,
    migrations: {
      directory: path.resolve(__dirname, "migrations")
    }
  }
};
