import { supabase } from "@/integrations/supabase/client";

type GoogleDriveOperationPayload = {
  action: string;
  [key: string]: unknown;
};

export async function invokeGoogleDriveOperation<T = unknown>(
  payload: GoogleDriveOperationPayload,
): Promise<T | null> {
  const { data, error } = await supabase.functions.invoke("google-drive-operations", {
    body: payload,
  });

  if (error) {
    throw new Error(error.message || "Falha ao sincronizar com o Google Drive");
  }

  if (data && typeof data === "object" && "error" in data && typeof data.error === "string") {
    throw new Error(data.error);
  }

  return (data as T | null) ?? null;
}