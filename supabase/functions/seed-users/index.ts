import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results: string[] = [];

    // Create gestor test user
    const { data: gestorAuth, error: gestorError } = await supabaseAdmin.auth.admin.createUser({
      email: "testegestor@gmail.com",
      password: "123456",
      email_confirm: true,
      user_metadata: { name: "Gestor Teste" },
    });

    if (gestorError) {
      results.push(`Gestor error: ${gestorError.message}`);
    } else {
      const gestorId = gestorAuth.user.id;
      await supabaseAdmin.from("user_roles").insert({ user_id: gestorId, role: "gestor" });
      results.push(`Gestor created: ${gestorId}`);
    }

    // Create cliente test user
    const { data: clienteAuth, error: clienteError } = await supabaseAdmin.auth.admin.createUser({
      email: "testecliente@gmail.com",
      password: "123456",
      email_confirm: true,
      user_metadata: { name: "Cliente Teste" },
    });

    if (clienteError) {
      results.push(`Cliente error: ${clienteError.message}`);
    } else {
      const clienteId = clienteAuth.user.id;
      await supabaseAdmin.from("user_roles").insert({ user_id: clienteId, role: "cliente" });
      await supabaseAdmin.from("clients").insert({
        name: "Empresa Teste",
        email: "testecliente@gmail.com",
        user_id: clienteId,
      });
      results.push(`Cliente created: ${clienteId}`);
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
