import path from "path";
let envName = ".dev.env";
switch (process.env.NODE_ENV) {
  case "PRODUCTION":
    envName = ".prod.env";
    break;
  case "DEVELOPMENT":
    envName = ".dev.env";
    break;
  case "TEST":
    envName = ".test.env";
    break;
  default:
    envName = ".dev.env";
}
require("dotenv").config({
  path: path.resolve(__dirname, "..", "..", envName),
});
export const config = {
  mongodb: {
    url: `mongodb://${process.env.MONGODB_USERNAME || ""}:${
      process.env.MONGODB_PASSWORD || ""
    }@${process.env.MONGODB_HOST}`,
    port: process.env.MONGODB_PORT,
    database: process.env.MONGODB_DATABASE,
  },
  system: {
    port: +process.env.PORT || 3000,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expires: process.env.JWT_EXPIRES,
  },
};
