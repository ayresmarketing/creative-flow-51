import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

serve(async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error || !code) {
    return new Response(`<html><body><h2>Erro na autorização</h2><p>${error || "Código não recebido"}</p></body></html>`, {
      headers: { "Content-Type": "text/html" },
      status: 400,
    });
  }

  const clientId = Deno.env.get("cliente_id");
  const clientSecret = Deno.env.get("chave_secreta");
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const redirectUri = `${supabaseUrl}/functions/v1/google-drive-callback`;

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId!,
      client_secret: clientSecret!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();

  if (!tokens.refresh_token) {
    return new Response(`<html><body><h2>Erro</h2><p>Refresh token não recebido. Tente novamente.</p><pre>${JSON.stringify(tokens, null, 2)}</pre></body></html>`, {
      headers: { "Content-Type": "text/html" },
      status: 400,
    });
  }

  // Store tokens using service role
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Delete old tokens and insert new
  await supabase.from("google_drive_tokens").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const { error: insertErr } = await supabase.from("google_drive_tokens").insert({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
  });

  if (insertErr) {
    return new Response(`<html><body><h2>Erro ao salvar tokens</h2><pre>${JSON.stringify(insertErr)}</pre></body></html>`, {
      headers: { "Content-Type": "text/html" },
      status: 500,
    });
  }

  return new Response(`<html><body><h2>✅ Google Drive conectado com sucesso!</h2><p>Você pode fechar esta janela.</p></body></html>`, {
    headers: { "Content-Type": "text/html" },
  });
});
