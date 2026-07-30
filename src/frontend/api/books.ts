import { normaliseFrequency } from "@/helpers/schedule";
import { baseURL, instance } from "./axiosInstance";

export type Book = {
  id: string;
  name: string;
  author?: string;
  doc?: string;
  createdAt: string;
};

export type BookSchedule = {
  id: number;
  /** 24 hour "HH:mm" in the schedule's own timezone. */
  time: string;
  /** IANA timezone name, e.g. "Europe/London". */
  timezone: string;
  /** Comma separated days, 0 = Monday ... 6 = Sunday. */
  frequency: string;
};

export type ScheduleBookInput = {
  book_id: string;
  time: string;
  timezone: string;
  /** 0 = Monday ... 6 = Sunday. */
  frequency: number[];
};

export const getBooks = async (): Promise<Book[]> => {
  const response = await instance.get<Book[]>("/books");

  return response.data;
};

/** Returns null when the book has no schedule yet. */
export const getBookSchedule = async (input: {
  book_id: string;
}): Promise<BookSchedule | null> => {
  try {
    const response = await instance.get<BookSchedule>(
      `/books/${input.book_id}/schedule`,
    );

    return response.data;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null;
    }

    throw error;
  }
};

export const handleScheduleBook = async (
  input: ScheduleBookInput,
): Promise<BookSchedule> => {
  const { book_id, ...schedule } = input;

  const response = await instance.post<BookSchedule>(
    `/books/${book_id}/schedule`,
    { ...schedule, frequency: normaliseFrequency(input.frequency) },
  );

  return response.data;
};

export const getFullDocumentUrl = (path: string): string => {
  return baseURL + path;
};
