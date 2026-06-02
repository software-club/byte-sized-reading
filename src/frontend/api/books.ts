import { getTokens } from "@/helpers/token";
import { instance } from "./axiosInstance";

export type Book = {
  id: string;
  name: string;
  author?: string;
  fileSize?: number;
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
