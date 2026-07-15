import Cookies from "js-cookie";

const TOKEN_KEY = "token";

export const saveToken = (token: string) => {
  Cookies.set(TOKEN_KEY, token, {
    expires: 7,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

export const getToken = (): string | undefined => {
  return Cookies.get(TOKEN_KEY);
};

export const logout = () => {
  Cookies.remove(TOKEN_KEY);
};