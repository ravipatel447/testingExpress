import { BAD_REQUEST } from "http-status";
import multer from "multer";
import { User } from "../models";
import { ApiError } from "../utils/ApiError";
import { userMessages } from "../messages";
import { IRequest, IUser } from "../types";
import fs from "fs";
import path from "path";

/**
 * create User from body
 * @param {IUser} body
 * @returns {Promise<User>}
 */
export const createUser = async (body: Partial<IUser>): Promise<IUser> => {
  const user = new User(body);
  return user.save();
};

/**
 * @param {String} url urlString
 * @param {Object} user user Object
 * @returns {Promise<IUser>}
 */
export const uploadProfileImage = async (
  url: string,
  user: Partial<IUser>
): Promise<IUser> => {
  user.profileUrl = url;
  return user.save();
};

/**
 * @param {Object} user user Object
 * @returns {Promise<User>}
 */
export const removeProfileImage = async (user: IUser) => {
  deletePreviousAvatar(user._id);
  user.profileUrl = "https://i.stack.imgur.com/l60Hf.png";
  return user.save();
};

/**
 * get users list
 * @param {Object} filters
 * @returns {Promise<IUser[]>}
 */
export const getUsers = async (filters = {}): Promise<IUser[]> => {
  return User.find(filters);
};

/**
 * get user by filter object
 * @param {Object} filters
 * @returns {Promise<User>}
 */
export const getUserByFilter = async (filters: object = {}): Promise<IUser> => {
  return User.findOne(filters);
};

/**
 * Get user by their id
 * @param {String} id user Id
 * @param {Object} filters
 * @returns {Promise<User>}
 */
export const getUserById = async (
  id: string,
  filters: Object
): Promise<IUser> => {
  return getUserByFilter({ _id: id, ...filters });
};

/**
 * Update user by their id and what ever body provided
 * @param {String} id User id
 * @param {Object} body
 * @param {Object} filters
 * @returns {Promise<User>}
 */
export const updateUserById = async (
  id: string,
  body: Partial<IUser>,
  filters: Object = {}
): Promise<IUser> => {
  const user = await User.findOneAndUpdate({ _id: id, ...filters }, body, {
    runValidators: true,
    new: true,
  });
  if (!user) {
    throw new ApiError(userMessages.error.USER_NOT_FOUND, BAD_REQUEST);
  }
  return user;
};

/**
 * @param {Object} user user Object
 * @param {Object} body updates
 * @returns {Promise<User>}
 */
export const updateUserProfile = async (
  user: IUser,
  body: Partial<IUser>
): Promise<IUser> => {
  const updates = Object.keys(body);
  updates.forEach((update) => {
    user[update] = body[update];
  });
  return user.save();
};

/**
 * Delete user by Their Id
 * @param {String} id user Id
 * @param {Object} filters
 * @returns {Promise<User>}
 */
export const deleteUserById = async (
  id: String,
  filters: Object = {}
): Promise<IUser> => {
  deletePreviousAvatar(id);
  const user = await User.findOneAndRemove({ _id: id, ...filters });
  if (!user) {
    throw new ApiError(userMessages.error.USER_NOT_FOUND, BAD_REQUEST);
  }
  return user;
};

const deletePreviousAvatar = (userId: String) => {
  const directory = path.join(__dirname, "..", "..", "Assets", "Avatar"); // Specify the directory where the file is located
  const filenameWithoutExt = `Avatar-${userId}`;
  fs.readdir(directory, (err, files) => {
    if (err) {
      return;
    }
    // Find the file by matching the filename without the extension
    const file = files.find((file) => {
      const fileWithoutExt = path.parse(file).name;
      return fileWithoutExt === filenameWithoutExt;
    });

    if (file) {
      const filePath = path.join(directory, file);
      fs.unlink(filePath, () => {});
    }
  });
};

const storage = multer.diskStorage({
  destination: (_req: IRequest, _file: Express.Multer.File, cb: Function) => {
    cb(null, "Assets/Avatar");
  },
  filename: function (req: IRequest, file: Express.Multer.File, cb: Function) {
    const userId = req.user._id;
    deletePreviousAvatar(userId);
    const mimetype = file.mimetype.split("/")[1];
    cb(null, file.fieldname + "-" + userId + "." + mimetype);
  },
});

const fileFilter = (_req: IRequest, file: any, cb: Function) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Please Upload png,jpg or jpeg image"), false);
  }
};

export const uploadProfileMulter = multer({ storage, fileFilter });
