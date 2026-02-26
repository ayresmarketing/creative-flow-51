import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceRoleKey
    );

    const { action, user_ids, new_admin } = await req.json();
    const results: string[] = [];

    if (action === "delete_users" && Array.isArray(user_ids)) {
      for (const uid of user_ids) {
        // Delete from profiles, user_roles, clients first
        await supabaseAdmin.from("profiles").delete().eq("user_id", uid);
        await supabaseAdmin.from("user_roles").delete().eq("user_id", uid);
        await supabaseAdmin.from("clients").delete().eq("user_id", uid);
        // Delete auth user
        const { error } = await supabaseAdmin.auth.admin.deleteUser(uid);
        if (error) {
          results.push(`Error deleting ${uid}: ${error.message}`);
        } else {
          results.push(`Deleted user ${uid}`);
        }
      }
    }

    if (action === "create_admin" && new_admin) {
      const { data: adminAuth, error: adminError } = await supabaseAdmin.auth.admin.createUser({
        email: new_admin.email,
        password: new_admin.password,
        email_confirm: true,
        user_metadata: { name: new_admin.name },
      });

      if (adminError) {
        results.push(`Admin error: ${adminError.message}`);
      } else {
        const adminId = adminAuth.user.id;
        await supabaseAdmin.from("user_roles").insert({ user_id: adminId, role: "gestor" });
        await supabaseAdmin.from("profiles").insert({ user_id: adminId, name: new_admin.name, email: new_admin.email });
        results.push(`Admin created: ${adminId}`);
      }
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
