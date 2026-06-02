import { getTokens } from "@/helpers/token";
import { baseURL, instance } from "./axiosInstance";

export type Book = {
  id: string;
  name: string;
  author?: string;
  doc?: string;
  createdAt: string;
};

export const getBooks = async (): Promise<Book[]> => {
  const { accessToken } = await getTokens();

  if (!accessToken) {
    throw new Error("No access token found");
  }

  const response = await instance.get<Book[]>("/books", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};

export const getFullDocumentUrl = (path: string): string => {
  return baseURL + path;
};
