import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function getAccessToken(supabase: any): Promise<string> {
  const { data: tokenRow } = await supabase
    .from("google_drive_tokens")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!tokenRow) throw new Error("Google Drive não conectado. Faça a autorização primeiro.");

  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
    const clientId = Deno.env.get("cliente_id");
    const clientSecret = Deno.env.get("chave_secreta");

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId!,
        client_secret: clientSecret!,
        refresh_token: tokenRow.refresh_token,
        grant_type: "refresh_token",
      }),
    });

    const newTokens = await res.json();
    if (!newTokens.access_token) throw new Error("Falha ao renovar token do Google Drive");

    await supabase
      .from("google_drive_tokens")
      .update({
        access_token: newTokens.access_token,
        expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
      })
      .eq("id", tokenRow.id);

    return newTokens.access_token;
  }

  return tokenRow.access_token;
}

async function createFolder(accessToken: string, name: string, parentId: string): Promise<string> {
  const res = await fetch("https://www.googleapis.com/drive/v3/files?supportsAllDrives=true", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Erro ao criar pasta: ${JSON.stringify(data)}`);
  return data.id;
}

async function uploadFile(
  accessToken: string,
  fileName: string,
  fileData: Uint8Array,
  mimeType: string,
  parentId: string
): Promise<string> {
  const metadata = JSON.stringify({ name: fileName, parents: [parentId] });
  const boundary = "boundary_" + Date.now();

  const encoder = new TextEncoder();
  const metaPart = encoder.encode(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`
  );
  const filePart = encoder.encode(`--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`);
  const end = encoder.encode(`\r\n--${boundary}--`);

  const body = new Uint8Array(metaPart.length + filePart.length + fileData.length + end.length);
  body.set(metaPart, 0);
  body.set(filePart, metaPart.length);
  body.set(fileData, metaPart.length + filePart.length);
  body.set(end, metaPart.length + filePart.length + fileData.length);

  const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Erro ao enviar arquivo: ${JSON.stringify(data)}`);
  return data.id;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const accessToken = await getAccessToken(supabase);
    const rootFolderId = Deno.env.get("id_da_pasta");

    if (!rootFolderId) throw new Error("id_da_pasta não configurado");

    const { action, ...params } = await req.json();

    let result: any;

    switch (action) {
      case "create_client_folder": {
        const { clientName, clientId } = params;
        const folderId = await createFolder(accessToken, clientName, rootFolderId);

        await supabase.from("google_drive_folders").insert({
          client_id: clientId,
          product_id: null,
          folder_id: folderId,
          folder_name: clientName,
        });

        result = { folderId };
        break;
      }

      case "create_product_folder": {
        const { productName, productId, clientId } = params;

        const { data: clientFolder } = await supabase
          .from("google_drive_folders")
          .select("folder_id")
          .eq("client_id", clientId)
          .is("product_id", null)
          .single();

        if (!clientFolder) throw new Error("Pasta do cliente não encontrada no Drive");

        const folderId = await createFolder(accessToken, productName, clientFolder.folder_id);

        const photoFolder = await createFolder(accessToken, "Fotos", folderId);
        const videoFolder = await createFolder(accessToken, "Vídeos", folderId);
        const carouselFolder = await createFolder(accessToken, "Carrosséis", folderId);

        await supabase.from("google_drive_folders").insert({
          client_id: clientId,
          product_id: productId,
          folder_id: folderId,
          folder_name: productName,
        });

        result = { folderId, subFolders: { photoFolder, videoFolder, carouselFolder } };
        break;
      }

      case "upload_creative": {
        const { productId, creativeType, files } = params;

        const { data: productFolder } = await supabase
          .from("google_drive_folders")
          .select("folder_id")
          .eq("product_id", productId)
          .single();

        if (!productFolder) throw new Error("Pasta do produto não encontrada no Drive");

        const subfolder = creativeType === "PHOTO" ? "Fotos" : creativeType === "VIDEO" ? "Vídeos" : "Carrosséis";

        const listRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${productFolder.folder_id}'+in+parents+and+name='${subfolder}'+and+mimeType='application/vnd.google-apps.folder'&fields=files(id,name)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const listData = await listRes.json();
        let targetFolderId = listData.files?.[0]?.id;

        if (!targetFolderId) {
          targetFolderId = await createFolder(accessToken, subfolder, productFolder.folder_id);
        }

        const uploadedIds: string[] = [];
        for (const file of files) {
          const { data: fileData } = await supabase.storage
            .from("creatives")
            .download(file.file_path);

          if (fileData) {
            const buffer = new Uint8Array(await fileData.arrayBuffer());
            const driveFileId = await uploadFile(
              accessToken,
              file.file_name || file.file_path.split("/").pop(),
              buffer,
              fileData.type || "application/octet-stream",
              targetFolderId
            );
            uploadedIds.push(driveFileId);
          }
        }

        result = { uploadedIds };
        break;
      }

      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Drive operation error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
