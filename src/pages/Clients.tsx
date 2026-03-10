import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import CreateClientDialog from "@/components/CreateClientDialog";
import ResetPasswordDialog from "@/components/ResetPasswordDialog";
import EmbedReportDialog from "@/components/EmbedReportDialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Users, Mail, FolderOpen, Search, MoreVertical, Trash2, Ban, RotateCcw, KeyRound, Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface ClientRecord {
  id: string;
  name: string;
  email: string;
  logo_url?: string | null;
  is_suspended?: boolean;
  user_id?: string | null;
  report_html?: string | null;
}

const Clients = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resetClient, setResetClient] = useState<{ userId: string; name: string } | null>(null);
  const [embedClient, setEmbedClient] = useState<{ id: string; name: string; reportHtml?: string | null } | null>(null);

  const fetchClients = useCallback(async () => {
    const { data } = await supabase
      .from("clients")
      .select("id, name, email, logo_url, is_suspended, user_id, report_html")
      .order("created_at", { ascending: false });
    setClients((data || []) as ClientRecord[]);
  }, []);

  useEffect(() => {
    if (user?.role === "GESTOR") fetchClients();
  }, [user, fetchClients]);

  if (user?.role !== "GESTOR") {
    navigate("/dashboard");
    return null;
  }

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteConfirm = async () => {
    if (!deleteClientId) return;
    const { error } = await supabase.from("clients").delete().eq("id", deleteClientId);
    if (error) {
      toast({ title: "Erro ao excluir cliente", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cliente excluído com sucesso" });
      setClients((prev) => prev.filter((c) => c.id !== deleteClientId));
    }
    setDeleteOpen(false);
    setDeleteClientId(null);
  };

  const handleToggleSuspend = async (client: ClientRecord) => {
    const newStatus = !client.is_suspended;
    const { error } = await supabase.from("clients").update({ is_suspended: newStatus } as any).eq("id", client.id);
    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    } else {
      toast({ title: newStatus ? "Cliente suspenso" : "Cliente reativado" });
      setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, is_suspended: newStatus } : c));
    }
  };

  return (
    <Layout>
      <CreateClientDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={fetchClients} />
      {resetClient && (
        <ResetPasswordDialog
          open={!!resetClient}
          onOpenChange={(open) => { if (!open) setResetClient(null); }}
          userId={resetClient.userId}
          userName={resetClient.name}
        />
      )}
      {embedClient && (
        <EmbedReportDialog
          open={!!embedClient}
          onOpenChange={(open) => { if (!open) setEmbedClient(null); }}
          clientId={embedClient.id}
          clientName={embedClient.name}
          currentHtml={embedClient.reportHtml}
          onUpdated={fetchClients}
        />
      )}

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente permanentemente? Todos os produtos e criativos associados podem ser afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground mt-1 text-sm">Gerencie os clientes da agência</p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="hub-shadow gap-2 self-start sm:self-auto">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {filteredClients.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredClients.map((client) => (
              <Card
                key={client.id}
                className="hub-card-shadow hover:shadow-lg transition-shadow animate-fade-in relative"
              >
                {/* 3-dot menu */}
                <div
                  className="absolute top-3 right-3 z-10"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {client.user_id && (
                        <DropdownMenuItem
                          onClick={() => setResetClient({ userId: client.user_id!, name: client.name })}
                        >
                          <KeyRound className="h-4 w-4 mr-2" />
                          Resetar senha
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => setEmbedClient({ id: client.id, name: client.name, reportHtml: client.report_html })}
                      >
                        <Code2 className="h-4 w-4 mr-2" />
                        Incorporar HTML de relatório
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleToggleSuspend(client)}
                      >
                        {client.is_suspended ? (
                          <><RotateCcw className="h-4 w-4 mr-2" />Reativar cliente</>
                        ) : (
                          <><Ban className="h-4 w-4 mr-2" />Suspender cliente</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setDeleteClientId(client.id);
                          setDeleteOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir cliente
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CardContent
                  className="p-6 space-y-4 cursor-pointer"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <div className="flex items-start gap-3 pr-6">
                    <Avatar className="h-12 w-12 shrink-0">
                      {client.logo_url ? (
                        <AvatarImage src={client.logo_url} alt={client.name} className="object-cover" />
                      ) : null}
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {client.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-foreground">{client.name}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </div>
                  </div>
                  {client.is_suspended && (
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700">
                      Suspenso
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t border-border">
                    <FolderOpen className="h-4 w-4" />
                    <span>Ver produtos</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : clients.length === 0 ? (
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
        ) : (
          <Card className="hub-card-shadow">
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground">Tente ajustar a busca.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Clients;
