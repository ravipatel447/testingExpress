import request from "supertest";
import app from "../src/server";
import { User } from "../src/models";
import fs from "fs";
import path from "path";
import { IUser } from "../src/types";

let baseUrl = "/api/v1";
let authUrl = "/auth";
let userUrl = "/user";
let user: IUser;
let token: string; // for storing and token;

beforeAll(async () => {
  await User.deleteMany({});
});

describe("End to end Testing", () => {
  test("Sign up new User", async () => {
    await request(app)
      .post(baseUrl + authUrl + "/register")
      .send({
        firstName: "Ravi",
        lastName: "Patel",
        email: "ravi@test.com",
        password: "ravi@test.com",
      })
      .expect(201)
      .then(({ body }) => {
        user = body.data.user;
        token = body.data.token;
      });
  });

  test("Sign up new User with missing values", async () => {
    await request(app)
      .post(baseUrl + authUrl + "/register")
      .send({
        firstName: "Ravi",
        lastName: "Patel",
        password: "ravi@test.com",
      })
      .expect(400);
  });

  test("Sign up with duplicate email", async () => {
    await request(app)
      .post(baseUrl + authUrl + "/register")
      .send({
        firstName: "Ravi",
        lastName: "Patel",
        email: "ravi@test.com",
        password: "ravi@test.com",
      })
      .expect(400);
  });

  test("Sign up with extra feild ", async () => {
    await request(app)
      .post(baseUrl + authUrl + "/register")
      .send({
        firstName: "Ravi",
        lastName: "Patel",
        email: "ravi@test.com",
        password: "ravi@test.com",
        extra: "this is extra",
      })
      .expect(400);
  });

  test("login with correct Credential ", async () => {
    await request(app)
      .post(baseUrl + authUrl + "/login")
      .send({
        email: "ravi@test.com",
        password: "ravi@test.com",
      })
      .expect(200)
      .then(({ body }) => {
        token = body.data.token;
      });
  });

  test("login with wrong Credential ", async () => {
    await request(app)
      .post(baseUrl + authUrl + "/login")
      .send({
        email: "ravi@test.com",
        password: "ravi@wrong.com",
      })
      .expect(400);
  });

  test("login with missing feild ", async () => {
    await request(app)
      .post(baseUrl + authUrl + "/login")
      .send({
        email: "ravi@test.com",
      })
      .expect(400);
  });

  test("login with extra feild ", async () => {
    await request(app)
      .post(baseUrl + authUrl + "/login")
      .send({
        email: "ravi@test.com",
        password: "ravi@test.com",
        extra: "this is extra",
      })
      .expect(400);
  });
  // User handler
  test("get Profile of logged In user", async () => {
    await request(app)
      .get(baseUrl + userUrl + "/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
  });

  test("get Profile of logged In user without Bearer token", async () => {
    await request(app)
      .get(baseUrl + userUrl + "/me")
      .expect(401);
  });

  test("get Profile of logged In user without modified Bearer token", async () => {
    await request(app)
      .get(baseUrl + userUrl + "/me")
      .set("Authorization", `Bearer ${token}modified`)
      .expect(401);
  });

  test("update my Profile with valid parameters", async () => {
    await request(app)
      .patch(baseUrl + userUrl + "/me")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "Ravi Updated",
        lastName: "Patel Updated",
        password: "ravi@updated.com",
      })
      .expect(200);
  });

  test("update my Profile with Invalid parameters", async () => {
    await request(app)
      .patch(baseUrl + userUrl + "/me")
      .set("Authorization", `Bearer ${token}`)
      .send({
        firstName: "Ravi Updated",
        email: "email@test.com",
        lastName: "Patel Updated",
        password: "ravi@updated.com",
      })
      .expect(400);
  });

  test("update my Profile with Invalid token", async () => {
    await request(app)
      .patch(baseUrl + userUrl + "/me")
      .set("Authorization", `Bearer ${token}invalid`)
      .send({
        firstName: "Ravi Updated",
        lastName: "Patel Updated",
        password: "ravi@updated.com",
      })
      .expect(401);
  });

  test("upload avatar of user of jpeg", async () => {
    await request(app)
      .post(baseUrl + userUrl + "/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach(
        "Avatar",
        fs.createReadStream(path.join(__dirname, "test-image", "jpgTest.jpeg"))
      )
      .expect(201);
  });

  test("upload avatar of user as before should not create duplicate file", async () => {
    await request(app)
      .post(baseUrl + userUrl + "/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach(
        "Avatar",
        fs.createReadStream(path.join(__dirname, "test-image", "jpgTest.jpeg"))
      )
      .expect(201);
  });

  test("upload avatar of user png", async () => {
    await request(app)
      .post(baseUrl + userUrl + "/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach(
        "Avatar",
        fs.createReadStream(path.join(__dirname, "test-image", "pngTest.png"))
      )
      .expect(201)
      .then(({ body }) => {
        user = body.data.user;
      });
  });

  test("upload avatar of user pdf should reject", async () => {
    await request(app)
      .post(baseUrl + userUrl + "/avatar")
      .set("Authorization", `Bearer ${token}`)
      .attach(
        "Avatar",
        fs.createReadStream(path.join(__dirname, "test-image", "pdfTest.pdf"))
      )
      .expect(500);
  });

  test("upload avatar with no file", async () => {
    await request(app)
      .post(baseUrl + userUrl + "/avatar")
      .set("Authorization", `Bearer ${token}`)
      .expect(500);
  });

  test("get Avatar of User", async () => {
    console.log(user.profileUrl);
    await request(app)
      .get(`/avatar/${user.profileUrl}`)
      .expect("Content-Type", /image\/(png|jpeg|jpg)/);
  });

  test("get Avatar of User with invalid url", async () => {
    console.log(user.profileUrl);
    await request(app).get(`/avatar/${user.profileUrl}invalid`).expect(404);
  });

  test("delete avatar of user", async () => {
    await request(app)
      .delete(baseUrl + userUrl + "/me/avatar")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
  });

  test("delete avatar of user with invalid token", async () => {
    await request(app)
      .delete(baseUrl + userUrl + "/me/avatar")
      .set("Authorization", `Bearer ${token}invalid`)
      .expect(401);
  });

  test("delete avatar of user without auth", async () => {
    await request(app)
      .delete(baseUrl + userUrl + "/me/avatar")
      .expect(401);
  });

  test("delete user with invalid token", async () => {
    await request(app)
      .delete(baseUrl + userUrl + "/me")
      .set("Authorization", `Bearer ${token}invalid`)
      .expect(401);
  });

  test("delete user profile wihout auth", async () => {
    await request(app)
      .delete(baseUrl + userUrl + "/me")
      .expect(401);
  });

  test("delete user with valid token", async () => {
    await request(app)
      .delete(baseUrl + userUrl + "/me")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
  });

  test("page not found", async () => {
    await request(app).get("/xyz").expect(404);
  });
});
