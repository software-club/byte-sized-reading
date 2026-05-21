import { instance } from "./axiosInstance";

export const uploadFile = async (name: string, file: File): Promise<void> => {
  const form = new FormData();

  form.append("name", name);
  form.append("file", file);

  const response = await instance.post("/books", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return;
};
