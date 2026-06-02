import { DocumentPickerAsset } from "expo-document-picker";
import { getTokens } from "@/helpers/token";
import { instance } from "./axiosInstance";

export const uploadFile = async (
  name: string,
  author: string,
  description: string,
  asset: DocumentPickerAsset,
): Promise<void> => {
  const { accessToken } = await getTokens();

  if (!accessToken) {
    throw new Error("No access token found");
  }

  const form = new FormData();
  form.append("name", name);
  form.append("author", author);
  form.append("description", description);
  form.append("doc", asset.file as any);

  await instance.post("/books", form, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
