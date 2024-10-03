import { StatusCodes } from "http-status-codes";

import type { User } from "@/api/user/userValidation";
import { ServiceResponse } from "@/common/models/serviceResponse";
import { StreamModel } from "@/db/streamModel";
import { UserModel } from "@/db/userModel";
import { generateStreamKey } from "@/rtmp/server";
import { logger } from "@/server";

export class UserService {
  // Retrieves all users from the database
  async findAll(): Promise<ServiceResponse<User[] | null>> {
    try {
      // const users = await this.userRepository.findAllAsync();
      const users = await UserModel.find().exec(); // .toArray();  // Cursor를 배열로 변환
      if (!users || users.length === 0) {
        return ServiceResponse.failure("No Users found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<User[]>("Users found", users);
    } catch (ex) {
      const errorMessage = `Error finding all users: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure(
        "An error occurred while retrieving users.",
        null,
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Retrieves a single user by their ID
  async findById(id: string): Promise<ServiceResponse<User | null>> {
    try {
      const user = await UserModel.findById(id).exec();
      if (!user) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }
      return ServiceResponse.success<User>("User found", user);
    } catch (ex) {
      const errorMessage = `Error finding user with id ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while finding user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  async findStreamKeyById(id: string): Promise<ServiceResponse<string | null>> {
    try {
      const user = await UserModel.findById(id).exec();
      if (!user) {
        return ServiceResponse.failure("User not found", null, StatusCodes.NOT_FOUND);
      }
      const stream = await StreamModel.findOneAndUpdate(
        { user: id },
        { $setOnInsert: { user: id, streamKey: generateStreamKey(user.name) } },
        { upsert: true, new: true },
      ).exec();
      console.log(stream);

      if (stream.streamKey.expiresAt < new Date()) {
        stream.streamKey = generateStreamKey(user.name);
        stream.save();
      }

      return ServiceResponse.success<string>("Stream key found", stream.streamKey.value);
    } catch (ex) {
      const errorMessage = `Error finding user with id ${id}: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while finding user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  // Creates a new user
  async createUser(user: User): Promise<ServiceResponse<User | null>> {
    try {
      const newUser = await UserModel.create(user);
      return ServiceResponse.success<User>("User created", newUser);
    } catch (ex) {
      const errorMessage = `Error creating user: ${(ex as Error).message}`;
      logger.error(errorMessage);
      return ServiceResponse.failure("An error occurred while creating user.", null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}

export const userService = new UserService();
