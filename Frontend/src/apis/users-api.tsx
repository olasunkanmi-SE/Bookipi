import { QueryObserverResult, useQuery } from "react-query";
import {
  ICreateUser,
  IUser,
  IUserResponse,
  IUsersResponse,
} from "../interfaces/user.interface";
import { userApi } from "./axios";

export const GetUsers = async (): Promise<IUsersResponse> => {
  const response = await userApi.get("/users");
  return response.data.data;
};

export const Register = async (user: ICreateUser): Promise<IUserResponse> => {
  const response = await userApi.post("/users/create", {
    email: user.email,
    password: user.password,
    username: user.username,
  });
  return response.data.data;
};

export const Login = async (
  user: Omit<ICreateUser, "username">
): Promise<IUser> => {
  const response = await userApi.post("/users/signin", user);
  return response.data.data;
};

const QueryUserItem = async (name: string): Promise<IUserResponse> => {
  const response = await userApi.get(`/users/${name}`);
  return response.data.data;
};

export const GetUserById = (id: string): QueryObserverResult<IUserResponse> => {
  return useQuery<IUserResponse, Error>(
    ["user", id],
    async () => QueryUserItem(id),
    {
      staleTime: 10000,
      cacheTime: 10000,
      onSuccess: (res) => {
        return {
          data: res.data,
          isSuccess: res.success,
        };
      },
      onError: (err) => {
        return err.message;
      },
    }
  );
};
