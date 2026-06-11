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
  const response = await instance.get<Book[]>("/books");

  return response.data;
};

export const getFullDocumentUrl = (path: string): string => {
  return baseURL + path;
};
