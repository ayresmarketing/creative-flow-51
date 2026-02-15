import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Play, CheckCircle2, FileDown, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ContentDialog from "@/components/ContentDialog";

interface Content {
  id: string;
  title: string;
  description: string;
  youtube_url: string;
  support_file_path: string | null;
  support_file_name: string | null;
  position: number;
  created_at: string;
}

function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^?&/#]+)/
  );
  return match ? match[1] : null;
}

const Contents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);

  const { data: contents = [], isLoading } = useQuery({
    queryKey: ["contents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contents")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return data as Content[];
    },
  });

  const { data: completions = [] } = useQuery({
    queryKey: ["content_completions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("content_completions")
        .select("content_id");
      if (error) throw error;
      return data.map((c) => c.content_id);
    },
  });

  const toggleCompletion = useMutation({
    mutationFn: async (contentId: string) => {
      const isCompleted = completions.includes(contentId);
      if (isCompleted) {
        const { error } = await supabase
          .from("content_completions")
          .delete()
          .eq("content_id", contentId)
          .eq("user_id", user!.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("content_completions")
          .insert({ content_id: contentId, user_id: user!.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content_completions"] });
    },
  });

  const deleteContent = useMutation({
    mutationFn: async (content: Content) => {
      if (content.support_file_path) {
        await supabase.storage.from("content-files").remove([content.support_file_path]);
      }
      const { error } = await supabase.from("contents").delete().eq("id", content.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      toast({ title: "Conteúdo removido" });
    },
  });

  const completedCount = contents.filter((c) => completions.includes(c.id)).length;

  const handleSupportDownload = async (content: Content) => {
    if (!content.support_file_path) return;
    const { data } = supabase.storage.from("content-files").getPublicUrl(content.support_file_path);
    window.open(data.publicUrl, "_blank");
  };

  return (
    <Layout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Conteúdos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {completedCount} de {contents.length} concluídos
            </p>
          </div>
          {user?.role === "GESTOR" && (
            <Button onClick={() => { setEditingContent(null); setDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Conteúdo
            </Button>
          )}
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : contents.length === 0 ? (
          <p className="text-muted-foreground">Nenhum conteúdo cadastrado.</p>
        ) : (
          <div className="grid gap-6">
            {contents.map((content) => {
              const videoId = extractYoutubeId(content.youtube_url);
              const isCompleted = completions.includes(content.id);
              return (
                <Card key={content.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-0">
                      {/* Video embed */}
                      <div className="aspect-video bg-black">
                        {videoId ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={content.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <Play className="h-12 w-12" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-5 flex flex-col">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="font-semibold text-lg text-foreground leading-tight">
                            {content.title}
                          </h3>
                          {isCompleted && (
                            <Badge variant="default" className="shrink-0">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Concluído
                            </Badge>
                          )}
                        </div>

                        {content.description && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap flex-1 mb-4">
                            {content.description}
                          </p>
                        )}

                        <div className="flex flex-wrap gap-2 mt-auto">
                          {content.support_file_name && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSupportDownload(content)}
                            >
                              <FileDown className="h-4 w-4 mr-1" />
                              {content.support_file_name}
                            </Button>
                          )}

                          <Button
                            variant={isCompleted ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => toggleCompletion.mutate(content.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            {isCompleted ? "Desmarcar" : "Marcar como Concluído"}
                          </Button>

                          {user?.role === "GESTOR" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => { setEditingContent(content); setDialogOpen(true); }}
                              >
                                Editar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => deleteContent.mutate(content)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <ContentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editingContent={editingContent}
      />
    </Layout>
  );
};

export default Contents;
