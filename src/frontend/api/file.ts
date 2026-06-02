import { DocumentPickerAsset } from "expo-document-picker";
import { getTokens } from "@/helpers/token";
import { instance } from "./axiosInstance";

export const uploadFile = async (
  name: string,
  author: string,
  asset: DocumentPickerAsset
): Promise<void> => {
  const { accessToken } = await getTokens();

  if (!accessToken) {
    throw new Error("No access token found");
  }

  const form = new FormData();
  form.append("name", name);
  form.append("author", author);
  form.append("file", {
    uri: asset.uri,
    name: asset.name,
    type: asset.mimeType ?? "application/pdf",
  } as any);

  await instance.post("/books", form, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${accessToken}`,
    },
  });
};
