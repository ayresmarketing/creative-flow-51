import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, StickyNote, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductNotesProps {
  productId: string;
}

interface Note {
  id: string;
  content: string;
  created_at: string;
  created_by: string;
}

const ProductNotes = ({ productId }: ProductNotesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");
  const [adding, setAdding] = useState(false);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["product_notes", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_notes")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Note[];
    },
  });

  const addNote = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("product_notes").insert({
        product_id: productId,
        content: newNote.trim(),
        created_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product_notes", productId] });
      setNewNote("");
      setAdding(false);
      toast({ title: "Nota adicionada" });
    },
    onError: () => {
      toast({ title: "Erro ao adicionar nota", variant: "destructive" });
    },
  });

  const deleteNote = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase.from("product_notes").delete().eq("id", noteId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product_notes", productId] });
      toast({ title: "Nota removida" });
    },
  });

  if (user?.role !== "GESTOR") {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Acesso restrito a gestores.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{notes.length} nota(s)</p>
        {!adding && (
          <Button size="sm" onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4 mr-1" /> Nova Nota
          </Button>
        )}
      </div>

      {adding && (
        <Card className="hub-card-shadow">
          <CardContent className="p-4 space-y-3">
            <Textarea
              placeholder="Escreva sua nota..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={3}
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setAdding(false); setNewNote(""); }}>
                Cancelar
              </Button>
              <Button size="sm" disabled={!newNote.trim()} onClick={() => addNote.mutate()}>
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : notes.length === 0 && !adding ? (
        <Card className="hub-card-shadow">
          <CardContent className="p-12 text-center">
            <StickyNote className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhuma nota adicionada ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id} className="hub-card-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-foreground whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(note.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive shrink-0"
                    onClick={() => deleteNote.mutate(note.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductNotes;
