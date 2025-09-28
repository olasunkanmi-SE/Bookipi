export interface ICreateUser {
  email: string;
  password: string;
  username: string;
}

export interface IUser {
  _id: string;
  email: string;
  role?: string;
  username: string;
  accessToken?: string;
}

interface IApiResponse {
  success: boolean;
  code: number;
  message: string;
}

export interface IUsersResponse extends IApiResponse {
  data: IUser[];
}

export interface IUserResponse extends IApiResponse {
  data: IUser;
  request: {
    type: string;
    url: string;
  };
}
