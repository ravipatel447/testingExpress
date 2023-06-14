import database from "../db/Database";
import * as userService from "./user.service";
import { User } from "../models";
import { IUser } from "../types";

describe("userService testing", () => {
  let user: IUser;
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
    user = await userService.createUser({
      firstName: "Ravi",
      lastName: "Patel",
      email: "ravi@test.com",
      password: "ravi@password",
    });
    expect(user).toEqual(
      expect.objectContaining({
        email: "ravi@test.com",
        firstName: "Ravi",
        lastName: "Patel",
        profileUrl: "https://i.stack.imgur.com/l60Hf.png",
      })
    );
  });

  test("createUser service test", async () => {
    expect(
      await userService.createUser({
        firstName: "Ravi1",
        lastName: "Patel1",
        email: "ravi1@test.com",
        password: "ravi1@password",
      })
    ).toEqual(
      expect.objectContaining({
        email: "ravi1@test.com",
        firstName: "Ravi1",
        lastName: "Patel1",
        profileUrl: "https://i.stack.imgur.com/l60Hf.png",
      })
    );
  });

  test("createUser without email service test", async () => {
    try {
      await userService.createUser({
        firstName: "Ravi2",
        lastName: "Patel2",
        password: "ravi2@password",
      });
    } catch (error) {
      expect(error.message).toMatch("User validation failed");
    }
  });

  test("create duplicate user service test", async () => {
    try {
      await userService.createUser({
        firstName: "Ravi",
        lastName: "Patel",
        email: "ravi@test.com",
        password: "ravi@password",
      });
      // If createUser succeeds, fail the test
      fail("Expected duplicate to throw an error");
    } catch (error) {
      expect(error.message).toMatch(`E11000 duplicate key error collection`);
    }
  });

  test("get many Users service test", async () => {
    expect(await userService.getUsers({})).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: expect.any(String),
          firstName: expect.any(String),
          lastName: expect.any(String),
          profileUrl: expect.stringMatching(/^https?:\/\/.+$/),
        }),
      ])
    );
  });

  test("get One User service test", async () => {
    expect(await userService.getUserByFilter({ _id: user._id })).toEqual(
      expect.objectContaining({
        email: "ravi@test.com",
        firstName: "Ravi",
        lastName: "Patel",
        profileUrl: "https://i.stack.imgur.com/l60Hf.png",
      })
    );
  });

  test("update User Profile service test", async () => {
    expect(
      (user = await userService.updateUserProfile(user, {
        firstName: "Ravi Updated",
        lastName: "Patel",
      }))
    ).toEqual(
      expect.objectContaining({
        email: "ravi@test.com",
        firstName: "Ravi Updated",
        lastName: "Patel",
        profileUrl: "https://i.stack.imgur.com/l60Hf.png",
      })
    );
  });

  test("update User Profile by Id service test", async () => {
    expect(
      (user = await userService.updateUserById(user._id, {
        firstName: "Ravi",
        lastName: "Patel",
      }))
    ).toEqual(
      expect.objectContaining({
        email: "ravi@test.com",
        firstName: "Ravi",
        lastName: "Patel",
        profileUrl: "https://i.stack.imgur.com/l60Hf.png",
      })
    );
  });

  test("update Profile Image of User by Id service test", async () => {
    expect(
      (user = await userService.uploadProfileImage(
        "https://www.rd.com/wp-content/uploads/2019/11/shutterstock_1218889750-e1574101761739-scaled.jpg",
        user
      ))
    ).toEqual(
      expect.objectContaining({
        email: "ravi@test.com",
        firstName: "Ravi",
        lastName: "Patel",
        profileUrl:
          "https://www.rd.com/wp-content/uploads/2019/11/shutterstock_1218889750-e1574101761739-scaled.jpg",
      })
    );
  });

  test("remove Profile Image of User by Id service test", async () => {
    expect((user = await userService.removeProfileImage(user))).toEqual(
      expect.objectContaining({
        email: "ravi@test.com",
        firstName: "Ravi",
        lastName: "Patel",
        profileUrl: "https://i.stack.imgur.com/l60Hf.png",
      })
    );
  });

  test("delete User by Id service test", async () => {
    expect((user = await userService.deleteUserById(user._id))).toEqual(
      expect.objectContaining({
        email: "ravi@test.com",
        firstName: "Ravi",
        lastName: "Patel",
        profileUrl: "https://i.stack.imgur.com/l60Hf.png",
      })
    );
  });
});
