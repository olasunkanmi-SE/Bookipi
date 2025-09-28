import { createContext, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { Login, Register } from "../apis/usersApi";
import { ICreateUser, IUser } from "../interfaces/user.interface";
import {
  clearStorage,
  getDecryptedLocalStorage,
  setEncryptedLocalStorage,
} from "../utility/utility";

type AuthenticationProviderProps = {
  children: React.ReactNode;
};

export type AuthenticationProps = {
  currentUser: IUser;

  signUp: (user: ICreateUser) => Promise<void>;
  login: (user: Omit<ICreateUser, "username">) => Promise<void>;
  error: any;
  isAuthenticated: boolean;
  logOut: () => void;
};

export const AuthContext = createContext({} as AuthenticationProps);

export const AuthProvider = ({ children }: AuthenticationProviderProps) => {
  const storedUser = getDecryptedLocalStorage("user", true);

  const [currentUser, setCurrentUser] = useState<IUser>(
    storedUser ? JSON.parse(storedUser) : {}
  );

  const [error, setError] = useState<any>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const getCurrentUser = getDecryptedLocalStorage("user", true);
    if (getCurrentUser) {
      const savedUser = JSON.parse(getCurrentUser);
      if (Object.keys(savedUser).length > 0) {
        setCurrentUser(savedUser);
        setIsAuthenticated(true);
      }
    }
  }, []);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const signUpMutation = useMutation(Register, {
    onSuccess: () => {
      queryClient.invalidateQueries("user");
      navigate("/login");
    },
  });

  const signUp = async (user: ICreateUser) => {
    try {
      setError(null);
      await signUpMutation.mutateAsync(user);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "An unknown error occurred";
      setError(errorMessage);
      throw err;
    }
  };

  const loginMutation = useMutation(Login, {
    onSuccess: (data) => {
      queryClient.invalidateQueries("users");
      setCurrentUser(data);
      if (data) {
        setIsAuthenticated(true);
        setEncryptedLocalStorage("user", JSON.stringify(data), true);
        navigate("/");
      }
    },
  });

  const login = async (user: Omit<ICreateUser, "username">) => {
    try {
      setError(null);
      await loginMutation.mutateAsync(user);
    } catch (err: any) {
      console.log(err);
      const errorMessage = err.response?.data?.details || "Invalid credentials";
      setError(errorMessage);
      throw err;
    }
  };

  const logOut = () => {
    setIsAuthenticated(false);
    clearStorage();
    navigate("/login");
  };

  const value = {
    currentUser,
    signUp,
    error,
    login,
    isAuthenticated,
    logOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
