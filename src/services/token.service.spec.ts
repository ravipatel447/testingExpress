import database from "../db/Database";
import { createUser } from "./user.service";
import { generateUserToken, verifyToken } from "./token.service";
import { User } from "../models";
import { IUser } from "../types";
import { tokenMessages } from "../messages";
describe("tokenService testing", () => {
  let user: IUser;
  let token: string;
  beforeAll(async () => {
    // Connect to the MongoDB database
    await database._connect();
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from the database after running all tests
    await database._disconnect();
  });

  test("createUser service test", async () => {
    expect(
      (user = await createUser({
        firstName: "Token",
        lastName: "Service",
        email: "token@service.com",
        password: "token@password",
      }))
    ).toEqual(
      expect.objectContaining({
        email: "token@service.com",
        firstName: "Token",
        lastName: "Service",
        profileUrl: "https://i.stack.imgur.com/l60Hf.png",
      })
    );
  });

  test("Generate Token of user", async () => {
    expect((token = await generateUserToken(user))).toEqual(expect.any(String));
  });

  test("verify valid token", async () => {
    expect(await verifyToken(token)).toEqual(
      expect.objectContaining({
        email: "token@service.com",
        firstName: "Token",
        lastName: "Service",
        profileUrl: "https://i.stack.imgur.com/l60Hf.png",
      })
    );
  });

  test("verify Invalid token", async () => {
    try {
      await verifyToken(token + "invalid");
      fail("Expected to throw an error");
    } catch (error) {
      expect(error.message).toMatch(tokenMessages.error.INVALID_TOKEN);
    }
  });
});
