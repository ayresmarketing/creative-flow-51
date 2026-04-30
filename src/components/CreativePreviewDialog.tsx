import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface CreativeFile {
  id: string;
  file_path: string;
  file_name: string | null;
  format: string;
  position: number;
  drive_file_id?: string | null;
}

interface CreativePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creativeId: string;
  creativeCode: string;
  creativeType: string;
  formatFilter?: string; // "Feed" | "Stories" | undefined (show all)
}

const CreativePreviewDialog = ({ open, onOpenChange, creativeId, creativeCode, creativeType, formatFilter }: CreativePreviewDialogProps) => {
  const [files, setFiles] = useState<CreativeFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!open || !creativeId) return;
    supabase
      .from("creative_files")
      .select("id, file_path, file_name, format, position, drive_file_id")
      .eq("creative_id", creativeId)
      .order("position")
      .then(({ data }) => {
        let filtered = data || [];
        if (formatFilter) {
          filtered = filtered.filter(f => f.format === formatFilter);
        }
        setFiles(filtered);
        setCurrentIndex(0);
        setSignedUrls({});
      });
  }, [open, creativeId, formatFilter]);

  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [loadingUrls, setLoadingUrls] = useState(false);

  const currentFile = files[currentIndex];
  const fileKey = currentFile ? (currentFile.file_path || currentFile.id) : "";

  useEffect(() => {
    if (!currentFile) return;
    if (fileKey && signedUrls[fileKey]) return; // already cached
    const fetchUrl = async () => {
      setLoadingUrls(true);
      try {
        let url: string | null = null;

        if (currentFile.file_path) {
          const folder = currentFile.file_path.split("/").slice(0, -1).join("/");
          const filename = currentFile.file_path.split("/").pop() || "";
          const { data: listed } = await supabase.storage.from("creatives").list(folder, { search: filename });
          if (listed && listed.length > 0) {
            const { data } = await supabase.storage.from("creatives").createSignedUrl(currentFile.file_path, 3600);
            url = data?.signedUrl ?? null;
          }
        }

        if (!url && currentFile.drive_file_id) {
          const { data: migrateData } = await supabase.functions.invoke("google-drive-operations", {
            body: { action: "get_or_migrate_file_url", creative_file_id: currentFile.id },
          });
          url = migrateData?.signedUrl ?? null;
        }

        if (url) {
          setSignedUrls((prev) => ({ ...prev, [fileKey]: url! }));
        }
      } catch {
        // URL fetch failed silently
      } finally {
        setLoadingUrls(false);
      }
    };
    fetchUrl();
  }, [currentFile, fileKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentUrl = currentFile ? signedUrls[fileKey] : undefined;
  const isVideo = creativeType === "VIDEO";
  const isCarousel = creativeType === "CAROUSEL";

  const titleSuffix = formatFilter ? ` — ${formatFilter}` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <DialogTitle className="text-sm font-semibold font-sans">{creativeCode}{titleSuffix}</DialogTitle>
          {currentUrl && (
            <a
              href={currentUrl}
              download={currentFile?.file_name || "criativo"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-xs text-muted-foreground">
                <Download className="h-3.5 w-3.5" />
                Baixar
              </Button>
            </a>
          )}
        </div>
        {loadingUrls && (
          <div className="p-8 text-center text-muted-foreground text-sm flex flex-col items-center gap-2 min-h-[200px] justify-center">
            <span className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Carregando arquivo...
          </div>
        )}
        {!loadingUrls && currentFile && currentUrl && (
          <div className="relative flex items-center justify-center bg-muted min-h-[300px] max-h-[70vh]">
            {isVideo ? (
              <video
                src={currentUrl}
                controls
                muted={muted}
                className="max-w-full max-h-[70vh] object-contain"
                autoPlay
              />
            ) : (
              <img
                src={currentUrl}
                alt={currentFile.file_name || "Creative"}
                className="max-w-full max-h-[70vh] object-contain"
              />
            )}

            {isVideo && (
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-3 right-3 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                onClick={() => setMuted(!muted)}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            )}

            {isCarousel && files.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((i) => i - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full opacity-80 hover:opacity-100"
                  disabled={currentIndex === files.length - 1}
                  onClick={() => setCurrentIndex((i) => i + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {files.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentIndex(i)}
                      className={`h-2 w-2 rounded-full transition-colors ${i === currentIndex ? "bg-primary" : "bg-muted-foreground/40"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        {!loadingUrls && currentFile && !currentUrl && (
          <div className="p-8 text-center text-muted-foreground text-sm">Arquivo não disponível.</div>
        )}
        {!loadingUrls && files.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">Nenhum arquivo encontrado.</div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreativePreviewDialog;