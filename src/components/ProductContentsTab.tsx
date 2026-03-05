import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductContentsTabProps {
  productId: string;
}

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  position: number;
}

interface ProductContentAccessRow {
  id: string;
  content_id: string;
  access_sent: boolean;
  sent_at: string | null;
}

const ProductContentsTab = ({ productId }: ProductContentsTabProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isGestor = user?.role === "GESTOR";

  const { data: contents = [], isLoading: loadingContents } = useQuery({
    queryKey: ["product_contents", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contents")
        .select("id, title, description, youtube_url, position")
        .order("position", { ascending: true });
      if (error) throw error;
      return data as ContentItem[];
    },
  });

  const { data: accessRows = [], isLoading: loadingAccess } = useQuery({
    queryKey: ["product_content_access", productId],
    queryFn: async () => {
      const { data, error } = await (supabase.from("product_content_access" as any) as any)
        .select("id, content_id, access_sent, sent_at")
        .eq("product_id", productId);
      if (error) throw error;
      return (data ?? []) as ProductContentAccessRow[];
    },
  });

  const accessByContentId = useMemo(
    () => new Map(accessRows.map((row) => [row.content_id, row])),
    [accessRows],
  );

  const toggleAccess = useMutation({
    mutationFn: async (contentId: string) => {
      if (!isGestor || !user?.id) {
        throw new Error("Apenas gestores podem alterar esse status.");
      }

      const current = accessByContentId.get(contentId);
      const nextValue = !current?.access_sent;

      const { error } = await (supabase.from("product_content_access" as any) as any).upsert(
        {
          product_id: productId,
          content_id: contentId,
          access_sent: nextValue,
          sent_at: nextValue ? new Date().toISOString() : null,
          updated_by: user.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "product_id,content_id" },
      );

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product_content_access", productId] });
    },
    onError: (error: Error) => {
      toast({ title: "Não foi possível atualizar", description: error.message, variant: "destructive" });
    },
  });

  if (loadingContents || loadingAccess) {
    return <p className="text-sm text-muted-foreground">Carregando conteúdos...</p>;
  }

  if (contents.length === 0) {
    return (
      <Card className="hub-card-shadow">
        <CardContent className="p-8 text-center text-muted-foreground">
          Nenhum conteúdo cadastrado.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {contents.map((content) => {
        const access = accessByContentId.get(content.id);
        const isSent = Boolean(access?.access_sent);

        return (
          <Card key={content.id} className="hub-card-shadow">
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">{content.title}</h3>
                  {content.description && (
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {content.description}
                    </p>
                  )}
                </div>

                {isSent && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Acesso enviado
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={content.youtube_url} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4 mr-1" /> Assistir vídeo
                  </a>
                </Button>

                <Button
                  size="sm"
                  variant={isSent ? "secondary" : "default"}
                  disabled={!isGestor || toggleAccess.isPending}
                  onClick={() => toggleAccess.mutate(content.id)}
                >
                  {isSent ? "Desmarcar acesso" : "Marcar acesso enviado"}
                </Button>

                {isSent && access?.sent_at && (
                  <p className="text-xs text-muted-foreground">
                    Marcado em {new Date(access.sent_at).toLocaleString("pt-BR")}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ProductContentsTab;
