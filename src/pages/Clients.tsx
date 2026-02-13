import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import CreateClientDialog from "@/components/CreateClientDialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Mail, FolderOpen } from "lucide-react";

interface ClientRecord {
  id: string;
  name: string;
  email: string;
}

const Clients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [clients, setClients] = useState<ClientRecord[]>([]);

  const fetchClients = useCallback(async () => {
    const { data } = await supabase.from("clients").select("id, name, email").order("created_at", { ascending: false });
    setClients(data || []);
  }, []);

  useEffect(() => {
    if (user?.role === "GESTOR") fetchClients();
  }, [user, fetchClients]);

  if (user?.role !== "GESTOR") {
    navigate("/dashboard");
    return null;
  }

  return (
    <Layout>
      <CreateClientDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={fetchClients} />
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground mt-1">Gerencie os clientes da agência</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="hub-shadow gap-2">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {clients.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <Card
                key={client.id}
                className="hub-card-shadow hover:shadow-lg transition-shadow cursor-pointer animate-fade-in"
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{client.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{client.email}</p>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">Cliente</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
                    <FolderOpen className="h-4 w-4" />
                    <span>Ver produtos</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="hub-card-shadow">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum cliente cadastrado</h3>
              <p className="text-muted-foreground mb-4">Comece cadastrando seu primeiro cliente.</p>
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Cliente
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Clients;
