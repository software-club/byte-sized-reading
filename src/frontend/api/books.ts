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

export const getBookSchedule = async (input: { book_id: string }) => {
  const response = await instance.get<any>(`/books/${input.book_id}/schedule`);

  return response.data;
};

export const handleScheduleBook = async (input: {
  book_id: string;
  time: string;
  timezone: string;
  frequency: string;
}) => {
  const response = await instance.post<any>(
    `/books/${input.book_id}/schedule`,
    { ...input, frequency: input.frequency.split(",").map(Number) },
  );

  return response.data;
};

export const getFullDocumentUrl = (path: string): string => {
  return baseURL + path;
};
