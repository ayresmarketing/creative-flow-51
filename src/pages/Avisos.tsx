import { useState, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Bell, Plus, Trash2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface Announcement {
  id: string;
  title: string;
  message: string;
  created_at: string;
}

const Avisos = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const isGestor = user?.role === "GESTOR";

  const fetchAnnouncements = useCallback(async () => {
    const { data } = await (supabase as any)
      .from("announcements")
      .select("id, title, message, created_at")
      .order("created_at", { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await (supabase as any).from("announcements").insert({
      title: title.trim(),
      message: message.trim(),
      created_by: user!.id,
    });
    if (error) {
      toast({ title: "Erro ao criar aviso", variant: "destructive" });
    } else {
      toast({ title: "Aviso criado com sucesso!" });
      setTitle("");
      setMessage("");
      setDialogOpen(false);
      fetchAnnouncements();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from("announcements").delete().eq("id", id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast({ title: "Aviso removido" });
  };

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
            <Bell className="h-6 w-6" /> Avisos
          </h1>
          {isGestor && (
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Novo Aviso
            </Button>
          )}
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-8">Carregando...</p>
        ) : announcements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum aviso</h3>
              <p className="text-muted-foreground">Não há avisos no momento.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((a) => (
              <Card key={a.id} className="hub-card-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{a.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.message}</p>
                      <p className="text-xs text-muted-foreground mt-3">
                        {new Date(a.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {isGestor && (
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(a.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Aviso</DialogTitle>
            <DialogDescription>Este aviso será exibido para todos os clientes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input placeholder="Título do aviso" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea placeholder="Escreva o aviso..." value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Criando..." : "Criar Aviso"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Avisos;
