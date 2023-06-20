import mongoose from "mongoose";
import { config } from "../config";

class Database {
  url = config.mongodb.url;
  port = config.mongodb.port;
  database = config.mongodb.database;

  get fullUrl() {
    return `${this.url}:${this.port}/${this.database}?authSource=admin`;
  }
  _connect() {
    console.log(this.fullUrl);
    return mongoose.connect(this.fullUrl);
  }
  _disconnect() {
    // console.log(this.fullUrl);
    return mongoose.disconnect();
  }
}

const database: Database = new Database();

export default database;
