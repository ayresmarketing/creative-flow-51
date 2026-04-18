import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const OBJECTIVES = ["Vendas", "Conteúdo", "Lembrete", "Remarketing", "Captação", "Carrinho Aberto", "Outro"];
const MEDIA_TYPES = ["Fotos", "Vídeos", "Carrosséis"];

function escapeDriveQueryValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getMediaSubfolder(creativeType: string): string {
  return creativeType === "PHOTO" ? "Fotos" : creativeType === "VIDEO" ? "Vídeos" : "Carrosséis";
}

async function getAccessToken(supabase: any): Promise<string> {
  const { data: tokenRow } = await supabase
    .from("google_drive_tokens")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!tokenRow) throw new Error("Google Drive não conectado.");

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

async function findFolder(accessToken: string, parentId: string, name: string): Promise<string | null> {
  const q = `'${parentId}' in parents and name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();
  return data.files?.[0]?.id || null;
}

async function findOrCreateFolder(accessToken: string, parentId: string, name: string): Promise<string> {
  const existing = await findFolder(accessToken, parentId, name);
  if (existing) return existing;
  return await createFolder(accessToken, name, parentId);
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

async function uploadFileResumable(
  accessToken: string,
  fileName: string,
  fileBody: ReadableStream<Uint8Array>,
  mimeType: string,
  parentId: string,
  fileSize?: number,
): Promise<string> {
  const initHeaders: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json; charset=UTF-8",
    "X-Upload-Content-Type": mimeType,
  };

  if (fileSize) {
    initHeaders["X-Upload-Content-Length"] = `${fileSize}`;
  }

  const initRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true", {
    method: "POST",
    headers: initHeaders,
    body: JSON.stringify({
      name: fileName,
      parents: [parentId],
    }),
  });

  if (!initRes.ok) {
    const errorData = await initRes.json().catch(() => ({}));
    throw new Error(`Erro ao iniciar upload resumable: ${JSON.stringify(errorData)}`);
  }

  const uploadUrl = initRes.headers.get("location");
  if (!uploadUrl) {
    throw new Error("Google Drive não retornou a URL de upload resumable");
  }

  const uploadHeaders: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": mimeType,
  };

  if (fileSize) {
    uploadHeaders["Content-Length"] = `${fileSize}`;
  }

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: uploadHeaders,
    body: fileBody,
    duplex: "half",
  } as RequestInit);

  const uploadData = await uploadRes.json().catch(() => ({}));
  if (!uploadRes.ok) {
    throw new Error(`Erro ao enviar arquivo: ${JSON.stringify(uploadData)}`);
  }

  return uploadData.id;
}

async function deleteFilesByName(accessToken: string, parentId: string, fileName: string) {
  const q = `'${parentId}' in parents and name='${fileName}' and trashed=false`;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();

  if (!Array.isArray(data.files) || data.files.length === 0) return;

  await Promise.all(
    data.files.map((file: { id: string }) =>
      fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?supportsAllDrives=true`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    )
  );
}

async function deleteFilesByCreativeCode(accessToken: string, parentId: string, creativeCode: string) {
  const escapedCode = escapeDriveQueryValue(creativeCode);
  const q = `'${parentId}' in parents and name contains '${escapedCode}' and trashed=false`;
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const data = await res.json();

  const matcher = new RegExp(`^${escapeRegex(creativeCode)}(?:_\\d+)?\\.[^.]+$`);
  const matchingFiles = Array.isArray(data.files)
    ? data.files.filter((file: { name: string }) => matcher.test(file.name))
    : [];

  if (matchingFiles.length === 0) return [];

  await Promise.all(
    matchingFiles.map((file: { id: string }) =>
      fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?supportsAllDrives=true`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    )
  );

  return matchingFiles.map((file: { id: string }) => file.id);
}

function getFileExtension(filePath: string): string {
  const parts = filePath.split(".");
  return parts.length > 1 ? "." + parts[parts.length - 1] : "";
}

function sanitizeFileName(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, "_").trim();
}

function buildCreativeDriveFileName(creativeCode: string, fileNameOrPath: string, index: number, total: number): string {
  const ext = getFileExtension(fileNameOrPath);
  return total > 1
    ? `${creativeCode}_${index + 1}${ext}`
    : `${creativeCode}${ext}`;
}

async function getCreativeStorageSource(supabase: any, filePath: string) {
  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from("creatives")
    .createSignedUrl(filePath, 120);

  if (signedUrlError || !signedUrlData?.signedUrl) {
    throw new Error(`Falha ao gerar URL assinada do storage para ${filePath}`);
  }

  const sourceResponse = await fetch(signedUrlData.signedUrl);
  if (!sourceResponse.ok || !sourceResponse.body) {
    throw new Error(`Falha ao baixar arquivo do storage para ${filePath}`);
  }

  const sizeHeader = sourceResponse.headers.get("content-length");
  const parsedSize = sizeHeader ? Number(sizeHeader) : undefined;

  return {
    body: sourceResponse.body,
    mimeType: sourceResponse.headers.get("content-type") || "application/octet-stream",
    fileSize: parsedSize && !Number.isNaN(parsedSize) ? parsedSize : undefined,
  };
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
        const { productName, productId, clientId, productAcronym } = params;
        const folderDisplayName = productAcronym || productName;

        const { data: clientFolder } = await supabase
          .from("google_drive_folders")
          .select("folder_id")
          .eq("client_id", clientId)
          .is("product_id", null)
          .single();

        if (!clientFolder) throw new Error("Pasta do cliente não encontrada no Drive");

        // Create product folder with acronym
        const folderId = await createFolder(accessToken, folderDisplayName, clientFolder.folder_id);

        // Create objective subfolders, each with Fotos/Vídeos/Carrosséis inside
        for (const objective of OBJECTIVES) {
          const objFolderId = await createFolder(accessToken, objective, folderId);
          for (const mediaType of MEDIA_TYPES) {
            await createFolder(accessToken, mediaType, objFolderId);
          }
        }

        // Create helper folders
        await createFolder(accessToken, "Roteiros", folderId);
        await createFolder(accessToken, "Briefing", folderId);

        await supabase.from("google_drive_folders").insert({
          client_id: clientId,
          product_id: productId,
          folder_id: folderId,
          folder_name: folderDisplayName,
        });

        result = { folderId };
        break;
      }

      case "upload_creative": {
        const { productId, creativeType, objective, files, creativeCode, replaceExisting } = params;

        const { data: productFolder } = await supabase
          .from("google_drive_folders")
          .select("folder_id")
          .eq("product_id", productId)
          .single();

        if (!productFolder) throw new Error("Pasta do produto não encontrada no Drive");

        // Navigate: Product > Objective > MediaType
        const mediaSubfolder = getMediaSubfolder(creativeType);

        const objFolderId = await findOrCreateFolder(accessToken, productFolder.folder_id, objective);
        const targetFolderId = await findOrCreateFolder(accessToken, objFolderId, mediaSubfolder);

        if (replaceExisting) {
          await deleteFilesByCreativeCode(accessToken, targetFolderId, creativeCode);
        }

        const uploadedIds: string[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          const storageSource = await getCreativeStorageSource(supabase, file.file_path);
          const driveFileName = buildCreativeDriveFileName(
            creativeCode,
            file.file_name || file.file_path,
            i,
            files.length,
          );

          const driveFileId = await uploadFileResumable(
            accessToken,
            driveFileName,
            storageSource.body,
            storageSource.mimeType,
            targetFolderId,
            storageSource.fileSize,
          );
          uploadedIds.push(driveFileId);
        }

        result = { uploadedIds };
        break;
      }

      case "delete_creative": {
        const { productId, creativeType, objective, creativeCode } = params;

        const { data: productFolder } = await supabase
          .from("google_drive_folders")
          .select("folder_id")
          .eq("product_id", productId)
          .single();

        if (!productFolder) throw new Error("Pasta do produto não encontrada no Drive");

        const mediaSubfolder = getMediaSubfolder(creativeType);
        const objFolderId = await findOrCreateFolder(accessToken, productFolder.folder_id, objective);
        const targetFolderId = await findOrCreateFolder(accessToken, objFolderId, mediaSubfolder);
        const deletedIds = await deleteFilesByCreativeCode(accessToken, targetFolderId, creativeCode);

        result = { deletedIds };
        break;
      }

      case "upload_roteiro": {
        const { productId, title, content, referenceLinks } = params;

        const { data: productFolder } = await supabase
          .from("google_drive_folders")
          .select("folder_id")
          .eq("product_id", productId)
          .single();

        if (!productFolder) throw new Error("Pasta do produto não encontrada no Drive");

        const roteirosFolderId = await findOrCreateFolder(accessToken, productFolder.folder_id, "Roteiros");

        const links = Array.isArray(referenceLinks)
          ? referenceLinks.filter((link) => typeof link === "string" && link.trim().length > 0)
          : [];

        const referencesSection = links.length > 0
          ? `\n\nReferências\n${"-".repeat(11)}\n${links.map((link: string) => `- ${link}`).join("\n")}`
          : "";

        const fileContent = `${title}\n${"=".repeat(title.length)}\n\n${content}${referencesSection}`;
        const encoder = new TextEncoder();
        const fileData = encoder.encode(fileContent);
        const fileName = `${sanitizeFileName(title)}.txt`;

        const driveFileId = await uploadFile(
          accessToken,
          fileName,
          fileData,
          "text/plain",
          roteirosFolderId
        );

        result = { driveFileId };
        break;
      }

      case "upload_briefing": {
        const { productId, productName, categoryLabel, briefingText } = params;

        const { data: productFolder } = await supabase
          .from("google_drive_folders")
          .select("folder_id")
          .eq("product_id", productId)
          .single();

        if (!productFolder) throw new Error("Pasta do produto não encontrada no Drive");

        const briefingFolderId = await findOrCreateFolder(accessToken, productFolder.folder_id, "Briefing");

        const fileData = new TextEncoder().encode(String(briefingText || ""));
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const fileName = `Briefing - ${sanitizeFileName(String(categoryLabel || productName || "Produto"))} - ${timestamp}.txt`;

        const driveFileId = await uploadFile(
          accessToken,
          fileName,
          fileData,
          "text/plain",
          briefingFolderId,
        );

        result = { driveFileId };
        break;
      }

      case "populate_drive_ids": {
        // One-time migration: find Drive file IDs for all creative_files records
        const { data: allCreatives } = await supabase
          .from("creatives")
          .select("id, code, type, objective, product_id");

        const { data: allFolders } = await supabase
          .from("google_drive_folders")
          .select("product_id, folder_id")
          .not("product_id", "is", null);

        const folderMap: Record<string, string> = {};
        for (const f of allFolders || []) folderMap[f.product_id] = f.folder_id;

        let updated = 0;
        let notFound = 0;

        for (const creative of allCreatives || []) {
          const productFolderId = folderMap[creative.product_id];
          if (!productFolderId) continue;

          const mediaSubfolder = getMediaSubfolder(creative.type);
          const objFolderId = await findFolder(accessToken, productFolderId, creative.objective);
          if (!objFolderId) { notFound++; continue; }
          const mediaFolderId = await findFolder(accessToken, objFolderId, mediaSubfolder);
          if (!mediaFolderId) { notFound++; continue; }

          // Search for files whose name starts with the creative code
          const escapedCode = escapeDriveQueryValue(creative.code);
          const q = `'${mediaFolderId}' in parents and name contains '${escapedCode}' and trashed=false`;
          const res = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&supportsAllDrives=true&includeItemsFromAllDrives=true`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          const data = await res.json();
          const files: { id: string; name: string }[] = data.files || [];

          if (files.length === 0) { notFound++; continue; }

          // Get creative_files for this creative
          const { data: creativeFiles } = await supabase
            .from("creative_files")
            .select("id, file_name")
            .eq("creative_id", creative.id);

          for (let i = 0; i < (creativeFiles || []).length; i++) {
            const cf = creativeFiles![i];
            const driveFile = files.length === 1 ? files[0] : (files[i] || files[0]);
            if (!driveFile) continue;
            await supabase
              .from("creative_files")
              .update({ drive_file_id: driveFile.id })
              .eq("id", cf.id);
            updated++;
          }
        }

        result = { updated, notFound };
        break;
      }

      case "get_or_migrate_file_url": {
        // Returns a Supabase Storage signed URL, migrating from Drive if needed
        const { creative_file_id } = params;

        const { data: cf } = await supabase
          .from("creative_files")
          .select("id, file_path, drive_file_id, creative_id")
          .eq("id", creative_file_id)
          .single();

        if (!cf) throw new Error("creative_file não encontrado");

        // Check if file exists in Storage
        const { data: storageCheck } = await supabase.storage
          .from("creatives")
          .list(cf.file_path.split("/").slice(0, -1).join("/"), {
            search: cf.file_path.split("/").pop(),
          });

        const existsInStorage = storageCheck && storageCheck.length > 0;

        if (!existsInStorage && cf.drive_file_id) {
          // Download from Drive and upload to Storage
          const driveRes = await fetch(
            `https://www.googleapis.com/drive/v3/files/${cf.drive_file_id}?alt=media&supportsAllDrives=true`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          if (!driveRes.ok) throw new Error("Falha ao baixar arquivo do Drive");

          const contentType = driveRes.headers.get("content-type") || "application/octet-stream";
          const fileBytes = new Uint8Array(await driveRes.arrayBuffer());

          const { error: uploadError } = await supabase.storage
            .from("creatives")
            .upload(cf.file_path, fileBytes, { contentType, upsert: true });

          if (uploadError) throw new Error(`Falha ao enviar para Storage: ${uploadError.message}`);
        }

        // Return signed URL from Storage
        const { data: signedData } = await supabase.storage
          .from("creatives")
          .createSignedUrl(cf.file_path, 3600);

        result = { signedUrl: signedData?.signedUrl || null };
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
