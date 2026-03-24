import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Upload, Image, Video, Layers, ArrowLeft, Check, X, FileImage, FileVideo, ArrowUp, ArrowDown, Plus, Copy as CopyIcon
} from "lucide-react";

type CreativeType = "PHOTO" | "VIDEO" | "CAROUSEL";
type ObjectiveType = "Vendas" | "Remarketing" | "Conteúdo" | "Captação" | "Lembrete" | "Carrinho Aberto";
type FormatType = "Feed" | "Stories";

interface BulkItem {
  id: string;
  primaryFile: File;
  secondaryFile: File | null;
}

const CreativeUpload = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const roteiroId = searchParams.get("roteiro_id");
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [creativeType, setCreativeType] = useState<CreativeType | "">("");
  const [objective, setObjective] = useState<ObjectiveType | "">("");
  const [formats, setFormats] = useState<FormatType[]>([]);
  const [feedFiles, setFeedFiles] = useState<File[]>([]);
  const [storiesFiles, setStoriesFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [isDragOverFeed, setIsDragOverFeed] = useState(false);
  const [isDragOverStories, setIsDragOverStories] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Bulk mode
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkPrimaryFormat, setBulkPrimaryFormat] = useState<FormatType | "">("");
  const [bulkItems, setBulkItems] = useState<BulkItem[]>([]);
  const [isDragOverBulk, setIsDragOverBulk] = useState(false);
  const [needsApproval, setNeedsApproval] = useState<boolean | null>(null);
  const [isCollaborator, setIsCollaborator] = useState(false);

  const [productName, setProductName] = useState("");
  const [productAcronym, setProductAcronym] = useState("");

  const objectives: ObjectiveType[] = [
    "Vendas", "Remarketing", "Conteúdo", "Captação", "Lembrete", "Carrinho Aberto",
  ];

  useEffect(() => {
    if (!id) return;
    supabase.from("products").select("name, acronym").eq("id", id).single()
      .then(({ data }) => {
        if (data) {
          setProductName(data.name);
          setProductAcronym(data.acronym);
        }
      });
  }, [id]);

  // Check if user is a collaborator (team member with colaborador role)
  useEffect(() => {
    if (!user?.id) return;
    (supabase as any)
      .from("client_team_members")
      .select("team_role")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }: any) => {
        if (data?.team_role === "colaborador") {
          setIsCollaborator(true);
        }
      });
  }, [user?.id]);

  const getTypePrefix = useCallback(() => {
    if (creativeType === "PHOTO") return "ADF";
    if (creativeType === "VIDEO") return "ADV";
    if (creativeType === "CAROUSEL") return "ADC";
    return "";
  }, [creativeType]);

  const getCurrentMaxSequence = useCallback(async () => {
    if (!creativeType || !objective || !id) return 0;

    const { data: existingCreatives, error } = await supabase
      .from("creatives")
      .select("code")
      .eq("product_id", id)
      .eq("objective", objective)
      .eq("type", creativeType);

    if (error || !existingCreatives?.length) return 0;

    const typePrefix = getTypePrefix();
    const sequenceRegex = new RegExp(`${typePrefix}(\\d+)$`);

    return existingCreatives.reduce((max, creative) => {
      const match = creative.code?.match(sequenceRegex);
      if (!match) return max;

      const parsed = Number.parseInt(match[1], 10);
      return Number.isNaN(parsed) ? max : Math.max(max, parsed);
    }, 0);
  }, [creativeType, objective, id, getTypePrefix]);

  const buildCreativeCode = useCallback((sequence: number) => {
    const typePrefix = getTypePrefix();
    if (!typePrefix || !objective) return "";

    return `${productAcronym} | ${objective} | ${typePrefix}${sequence.toString().padStart(3, "0")}`;
  }, [getTypePrefix, objective, productAcronym]);

  const [generatedCode, setGeneratedCode] = useState("");

  useEffect(() => {
    if (step !== 5 || !creativeType || !objective || bulkMode) return;

    getCurrentMaxSequence().then((maxSequence) => {
      setGeneratedCode(buildCreativeCode(maxSequence + 1));
    });
  }, [step, creativeType, objective, bulkMode, getCurrentMaxSequence, buildCreativeCode]);

  const getAcceptedFileTypes = () => {
    switch (creativeType) {
      case "PHOTO": return "image/*";
      case "VIDEO": return "video/*";
      case "CAROUSEL": return "image/*";
      default: return "";
    }
  };

  const getMaxFiles = () => (creativeType === "CAROUSEL" ? 10 : 1);

  const handleFileSelect = (selectedFiles: FileList | null, target: "feed" | "stories") => {
    if (!selectedFiles) return;
    const fileArray = Array.from(selectedFiles);
    const maxFiles = getMaxFiles();
    if (fileArray.length > maxFiles) {
      alert(`Máximo de ${maxFiles} arquivo(s) permitido(s)`);
      return;
    }
    if (target === "feed") setFeedFiles(fileArray);
    else setStoriesFiles(fileArray);
  };

  const handleDrop = (e: React.DragEvent, target: "feed" | "stories") => {
    e.preventDefault();
    if (target === "feed") setIsDragOverFeed(false);
    else setIsDragOverStories(false);
    handleFileSelect(e.dataTransfer.files, target);
  };

  const handleFormatToggle = (format: FormatType) => {
    setFormats((prev) => {
      const next = prev.includes(format) ? prev.filter((f) => f !== format) : [...prev, format];
      if (!next.includes("Feed")) setFeedFiles([]);
      if (!next.includes("Stories")) setStoriesFiles([]);
      return next;
    });
  };

  const hasRequiredFiles = () => {
    const needFeed = formats.includes("Feed");
    const needStories = formats.includes("Stories");
    return (!needFeed || feedFiles.length > 0) && (!needStories || storiesFiles.length > 0);
  };

  // Bulk handlers
  const handleBulkPrimaryFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    const newItems: BulkItem[] = files.map((f) => ({
      id: crypto.randomUUID(),
      primaryFile: f,
      secondaryFile: null,
    }));
    setBulkItems((prev) => [...prev, ...newItems]);
  };

  const handleBulkSecondaryFile = (itemId: string, file: File | null) => {
    setBulkItems((prev) => prev.map((item) =>
      item.id === itemId ? { ...item, secondaryFile: file } : item
    ));
  };

  const removeBulkItem = (itemId: string) => {
    setBulkItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const canProceed = () => {
    if (bulkMode) {
      switch (step) {
        case 1: return creativeType !== "";
        case 2: return objective !== "";
        case 3: return bulkPrimaryFormat !== "";
        case 4: return bulkItems.length > 0;
        default: return false;
      }
    }
    switch (step) {
      case 1: return creativeType !== "";
      case 2: return objective !== "";
      case 3: return formats.length > 0;
      case 4: return hasRequiredFiles();
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!id || !creativeType || !objective || submitting) return;
    setSubmitting(true);

    try {
      const currentMaxSequence = await getCurrentMaxSequence();

      if (bulkMode) {
        // Bulk submit - create one creative per item
        for (let i = 0; i < bulkItems.length; i++) {
          const item = bulkItems[i];
          const code = buildCreativeCode(currentMaxSequence + i + 1);
          if (!code) throw new Error("Falha ao gerar código do criativo");

          const itemFormats: FormatType[] = [bulkPrimaryFormat as FormatType];
          if (item.secondaryFile) {
            const secondaryFormat = bulkPrimaryFormat === "Feed" ? "Stories" : "Feed";
            itemFormats.push(secondaryFormat);
          }

          const { data: creative, error: crErr } = await supabase.from("creatives").insert({
            code,
            type: creativeType,
            objective,
            formats: itemFormats,
            product_id: id,
            notes: notes || null,
          }).select("id").single();

          if (crErr || !creative) {
            throw crErr ?? new Error("Falha ao criar criativo no lote");
          }

          // Upload primary file
          const primaryPath = `${id}/${creative.id}/${bulkPrimaryFormat}/${Date.now()}_${item.primaryFile.name}`;
          await supabase.storage.from("creatives").upload(primaryPath, item.primaryFile);
          await supabase.from("creative_files").insert({
            creative_id: creative.id,
            file_path: primaryPath,
            file_name: item.primaryFile.name,
            format: bulkPrimaryFormat,
            position: 0,
            file_size: item.primaryFile.size,
          });

          // Upload secondary file if exists
          if (item.secondaryFile) {
            const secondaryFormat = bulkPrimaryFormat === "Feed" ? "Stories" : "Feed";
            const secondaryPath = `${id}/${creative.id}/${secondaryFormat}/${Date.now()}_${item.secondaryFile.name}`;
            await supabase.storage.from("creatives").upload(secondaryPath, item.secondaryFile);
            await supabase.from("creative_files").insert({
              creative_id: creative.id,
              file_path: secondaryPath,
              file_name: item.secondaryFile.name,
              format: secondaryFormat,
              position: 0,
              file_size: item.secondaryFile.size,
            });
          }

          // Google Drive upload
          try {
            const { data: uploadedFiles } = await supabase
              .from("creative_files")
              .select("file_path, file_name")
              .eq("creative_id", creative.id);
            if (uploadedFiles && uploadedFiles.length > 0) {
              await supabase.functions.invoke("google-drive-operations", {
                body: {
                  action: "upload_creative",
                  productId: id,
                  creativeType,
                  objective,
                  creativeCode: code,
                  files: uploadedFiles,
                },
              });
            }
          } catch (driveErr) {
            console.warn("Drive upload failed (non-blocking):", driveErr);
          }
        }

        toast({ title: `${bulkItems.length} criativos enviados com sucesso!` });
        navigate(`/products/${id}`);
        return;
      }

      // Single submit (existing logic)
      const code = generatedCode || buildCreativeCode(currentMaxSequence + 1);
      if (!code) throw new Error("Falha ao gerar código do criativo");

      const { data: creative, error: crErr } = await supabase.from("creatives").insert({
        code,
        type: creativeType,
        objective,
        formats,
        product_id: id,
        notes: notes || null,
      }).select("id").single();

      if (crErr || !creative) throw crErr;

      const allFiles: { file: File; format: string; position: number }[] = [];
      feedFiles.forEach((f, i) => allFiles.push({ file: f, format: "Feed", position: i }));
      storiesFiles.forEach((f, i) => allFiles.push({ file: f, format: "Stories", position: i }));

      for (const { file, format, position } of allFiles) {
        const filePath = `${id}/${creative.id}/${format}/${Date.now()}_${file.name}`;
        const { error: upErr } = await supabase.storage.from("creatives").upload(filePath, file);
        if (upErr) continue;

        await supabase.from("creative_files").insert({
          creative_id: creative.id,
          file_path: filePath,
          file_name: file.name,
          format,
          position,
          file_size: file.size,
        });
      }

      if (roteiroId && creative) {
        await supabase
          .from("roteiros")
          .update({
            video_creative_id: creative.id,
            video_sent_at: new Date().toISOString(),
            is_recorded: true,
          })
          .eq("id", roteiroId);
      }

      try {
        const { data: uploadedFiles } = await supabase
          .from("creative_files")
          .select("file_path, file_name")
          .eq("creative_id", creative.id);

        if (uploadedFiles && uploadedFiles.length > 0) {
          await supabase.functions.invoke("google-drive-operations", {
            body: {
              action: "upload_creative",
              productId: id,
              creativeType,
              objective,
              creativeCode: code,
              files: uploadedFiles,
            },
          });
        }
      } catch (driveErr) {
        console.warn("Drive upload failed (non-blocking):", driveErr);
      }

      toast({ title: "Criativo enviado com sucesso!" });
      navigate(`/products/${id}`);
    } catch (err: any) {
      toast({ title: "Erro ao enviar criativo", description: "Tente novamente.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = (type: CreativeType) => {
    switch (type) {
      case "PHOTO": return <Image className="h-6 w-6" />;
      case "VIDEO": return <Video className="h-6 w-6" />;
      case "CAROUSEL": return <Layers className="h-6 w-6" />;
    }
  };

  const moveFile = (files: File[], setFiles: (f: File[]) => void, fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= files.length) return;
    const updated = [...files];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setFiles(updated);
  };

  const FileUploadZone = ({ target, files, setFiles, isDragOver, setIsDragOver, label }: {
    target: "feed" | "stories"; files: File[]; setFiles: (f: File[]) => void;
    isDragOver: boolean; setIsDragOver: (v: boolean) => void; label: string;
  }) => (
    <div className="space-y-3">
      <Label className="text-sm font-semibold">{label}</Label>
      <Card
        className={`border-2 border-dashed transition-colors ${isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"}`}
        onDrop={(e) => handleDrop(e, target)}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <CardContent className="p-6 text-center">
          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground mb-1">
            {creativeType === "CAROUSEL" ? "Arraste múltiplas imagens" : "Arraste o arquivo"} ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            {creativeType === "PHOTO" ? "JPG, PNG, WEBP" : creativeType === "VIDEO" ? "MP4, MOV, AVI" : `Até ${getMaxFiles()} imagens`}
          </p>
          <input type="file" id={`file-upload-${target}`} className="hidden" accept={getAcceptedFileTypes()} multiple={creativeType === "CAROUSEL"} onChange={(e) => handleFileSelect(e.target.files, target)} />
          <Button variant="outline" size="sm" onClick={() => document.getElementById(`file-upload-${target}`)?.click()}>
            Selecionar
          </Button>
        </CardContent>
      </Card>
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <Card key={index} className="p-2">
              <div className="flex items-center gap-2">
                {creativeType === "CAROUSEL" && files.length > 1 && (
                  <div className="flex flex-col gap-0.5">
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" disabled={index === 0} onClick={() => moveFile(files, setFiles, index, index - 1)}>
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-5 w-5 p-0" disabled={index === files.length - 1} onClick={() => moveFile(files, setFiles, index, index + 1)}>
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="p-1.5 bg-primary/10 rounded">
                  {file.type.startsWith("image/") ? <FileImage className="h-3 w-3 text-primary" /> : <FileVideo className="h-3 w-3 text-green-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setFiles(files.filter((_, i) => i !== index))}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const secondaryFormatLabel = bulkPrimaryFormat === "Feed" ? "Stories" : "Feed";

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Selecione o tipo de criativo</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(["PHOTO", "VIDEO", "CAROUSEL"] as CreativeType[]).map((type) => (
                <Card
                  key={type}
                  className={`cursor-pointer transition-all hover:shadow-md ${creativeType === type ? "ring-2 ring-primary hub-shadow" : ""}`}
                  onClick={() => { setCreativeType(type); setBulkMode(false); setBulkItems([]); }}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`mx-auto mb-4 p-4 rounded-lg ${type === "PHOTO" ? "bg-primary/10 text-primary" : type === "VIDEO" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"}`}>
                      {getTypeIcon(type)}
                    </div>
                    <h4 className="font-semibold">{type === "PHOTO" ? "Foto" : type === "VIDEO" ? "Vídeo" : "Carrossel"}</h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      {type === "PHOTO" ? "Imagem única para campanhas" : type === "VIDEO" ? "Vídeo para engajamento" : "Múltiplas imagens em sequência"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Bulk toggle - only for PHOTO and VIDEO */}
            {(creativeType === "PHOTO" || creativeType === "VIDEO") && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CopyIcon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-sm">Subir vários simultaneamente</p>
                        <p className="text-xs text-muted-foreground">Envie múltiplos criativos de uma só vez</p>
                      </div>
                    </div>
                    <Switch
                      checked={bulkMode}
                      onCheckedChange={(checked) => {
                        setBulkMode(checked);
                        setBulkItems([]);
                        setBulkPrimaryFormat("");
                        setFormats([]);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Selecione o objetivo</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {objectives.map((obj) => (
                <Card
                  key={obj}
                  className={`cursor-pointer transition-all hover:shadow-md ${objective === obj ? "ring-2 ring-primary hub-shadow" : ""}`}
                  onClick={() => setObjective(obj)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${objective === obj ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                        <Check className="h-4 w-4" />
                      </div>
                      <span className="font-medium">{obj}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        if (bulkMode) {
          return (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-4">Selecione o formato principal</h3>
              <p className="text-muted-foreground mb-4">Todos os arquivos que você subir serão registrados neste formato. A versão alternativa poderá ser adicionada individualmente.</p>
              <div className="space-y-3">
                {(["Feed", "Stories"] as FormatType[]).map((format) => (
                  <Card
                    key={format}
                    className={`cursor-pointer transition-all hover:shadow-md ${bulkPrimaryFormat === format ? "ring-2 ring-primary hub-shadow" : ""}`}
                    onClick={() => setBulkPrimaryFormat(format)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${bulkPrimaryFormat === format ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                          <Check className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{format}</p>
                          <p className="text-sm text-muted-foreground">
                            {format === "Feed" ? "Formato quadrado/horizontal para feed" : "Formato vertical 9:16 para Stories/Reels"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Quais versões você tem?</h3>
            <p className="text-muted-foreground mb-6">Selecione se possui a versão Feed, Stories ou ambas</p>
            <div className="space-y-3">
              {(["Feed", "Stories"] as FormatType[]).map((format) => (
                <Card
                  key={format}
                  className={`cursor-pointer transition-all hover:shadow-md ${formats.includes(format) ? "ring-2 ring-primary hub-shadow" : ""}`}
                  onClick={() => handleFormatToggle(format)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Checkbox checked={formats.includes(format)} />
                      <div className="flex-1">
                        <p className="font-medium">{format}</p>
                        <p className="text-sm text-muted-foreground">
                          {format === "Feed" ? "Formato quadrado/horizontal para feed" : "Formato vertical 9:16 para Stories/Reels"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        if (bulkMode) {
          return (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold mb-2">Envie os arquivos ({bulkPrimaryFormat})</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione todos os arquivos de {bulkPrimaryFormat}. Depois, você pode adicionar a versão {secondaryFormatLabel} individualmente para cada um.
              </p>

              {/* Upload zone for bulk primary */}
              <Card
                className={`border-2 border-dashed transition-colors ${isDragOverBulk ? "border-primary bg-primary/5" : "border-muted-foreground/25"}`}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOverBulk(false);
                  handleBulkPrimaryFiles(e.dataTransfer.files);
                }}
                onDragOver={(e) => { e.preventDefault(); setIsDragOverBulk(true); }}
                onDragLeave={() => setIsDragOverBulk(false)}
              >
                <CardContent className="p-6 text-center">
                  <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Arraste os arquivos ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    {creativeType === "PHOTO" ? "JPG, PNG, WEBP" : "MP4, MOV, AVI"} · Múltiplos arquivos
                  </p>
                  <input
                    type="file"
                    id="bulk-file-upload"
                    className="hidden"
                    accept={getAcceptedFileTypes()}
                    multiple
                    onChange={(e) => handleBulkPrimaryFiles(e.target.files)}
                  />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById("bulk-file-upload")?.click()}>
                    <Plus className="h-4 w-4 mr-1" />
                    Selecionar Arquivos
                  </Button>
                </CardContent>
              </Card>

              {/* Bulk items list */}
              {bulkItems.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">{bulkItems.length} criativo(s) · {bulkPrimaryFormat}</Label>
                  <div className="flex flex-col gap-2">
                    {bulkItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-3 rounded-lg border border-border bg-card">
                        {/* Format badge */}
                        <Badge variant="outline" className="text-xs shrink-0">{bulkPrimaryFormat}</Badge>
                        {/* File name truncated */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {item.primaryFile.name.slice(0, 22)}{item.primaryFile.name.length > 22 ? "..." : ""}
                          </p>
                          <p className="text-xs text-muted-foreground">{(item.primaryFile.size / (1024 * 1024)).toFixed(1)} MB</p>
                        </div>
                        {/* Remove button */}
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0" onClick={() => removeBulkItem(item.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                        {/* Stories button */}
                        {item.secondaryFile ? (
                          <div className="flex items-center gap-1 ml-1 px-2 py-1 rounded bg-primary/10">
                            <Badge variant="secondary" className="text-xs shrink-0">{secondaryFormatLabel}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 shrink-0"
                              onClick={() => handleBulkSecondaryFile(item.id, null)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <input
                              type="file"
                              id={`secondary-${item.id}`}
                              className="hidden"
                              accept={getAcceptedFileTypes()}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleBulkSecondaryFile(item.id, f);
                              }}
                            />
                            <Button
                              size="sm"
                              variant="default"
                              className="text-xs h-7 shrink-0"
                              onClick={() => document.getElementById(`secondary-${item.id}`)?.click()}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              + {secondaryFormatLabel}
                            </Button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea id="notes" placeholder="Adicione observações..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Envie os arquivos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formats.includes("Feed") && (
                <FileUploadZone target="feed" files={feedFiles} setFiles={setFeedFiles} isDragOver={isDragOverFeed} setIsDragOver={setIsDragOverFeed} label="📐 Versão Feed" />
              )}
              {formats.includes("Stories") && (
                <FileUploadZone target="stories" files={storiesFiles} setFiles={setStoriesFiles} isDragOver={isDragOverStories} setIsDragOver={setIsDragOverStories} label="📱 Versão Stories" />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea id="notes" placeholder="Adicione observações sobre este criativo..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
          </div>
        );

      case 5:
        if (bulkMode) {
          return (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Revisar e confirmar</h3>
                <p className="text-muted-foreground">Você está prestes a enviar {bulkItems.length} criativos</p>
              </div>
              <Card className="hub-card-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Tipo</Label>
                      <p className="font-medium">{creativeType === "PHOTO" ? "Foto" : "Vídeo"}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Objetivo</Label>
                      <p className="font-medium">{objective}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Formato principal</Label>
                      <p className="font-medium">{bulkPrimaryFormat}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Total de criativos</Label>
                      <p className="font-medium">{bulkItems.length}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Com versão {secondaryFormatLabel}</Label>
                    <p className="font-medium">{bulkItems.filter((i) => i.secondaryFile).length} de {bulkItems.length}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Revisar e confirmar</h3>
              <p className="text-muted-foreground">Verifique os dados antes de enviar o criativo</p>
            </div>

            <Card className="hub-card-shadow">
              <CardHeader><CardTitle className="text-lg">Resumo do criativo</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Código gerado</Label>
                    <p className="font-mono font-semibold text-primary text-lg">{generatedCode || "..."}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                    <div className="flex items-center gap-2">
                      {creativeType && getTypeIcon(creativeType as CreativeType)}
                      <span className="font-medium">{creativeType === "PHOTO" ? "Foto" : creativeType === "VIDEO" ? "Vídeo" : "Carrossel"}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Objetivo</Label>
                    <p className="font-medium">{objective}</p>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Formatos</Label>
                  <div className="flex gap-2 mt-1">
                    {formats.map((format) => (
                      <Badge key={format} variant="outline">{format}</Badge>
                    ))}
                  </div>
                </div>
                {formats.includes("Feed") && feedFiles.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Arquivos Feed ({feedFiles.length})</Label>
                    <div className="mt-1 space-y-1">
                      {feedFiles.map((file, i) => (
                        <p key={i} className="text-sm font-medium">{file.name}</p>
                      ))}
                    </div>
                  </div>
                )}
                {formats.includes("Stories") && storiesFiles.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Arquivos Stories ({storiesFiles.length})</Label>
                    <div className="mt-1 space-y-1">
                      {storiesFiles.map((file, i) => (
                        <p key={i} className="text-sm font-medium">{file.name}</p>
                      ))}
                    </div>
                  </div>
                )}
                {notes && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Observações</Label>
                    <p className="text-sm">{notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = bulkMode
    ? [
        { title: "Tipo", completed: creativeType !== "" },
        { title: "Objetivo", completed: objective !== "" },
        { title: "Formato", completed: bulkPrimaryFormat !== "" },
        { title: "Arquivos", completed: bulkItems.length > 0 },
        { title: "Revisar", completed: false },
      ]
    : [
        { title: "Tipo", completed: creativeType !== "" },
        { title: "Objetivo", completed: objective !== "" },
        { title: "Formatos", completed: formats.length > 0 },
        { title: "Arquivos", completed: hasRequiredFiles() },
        { title: "Revisar", completed: false },
      ];

  return (
    <Layout>
      <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/products/${id}`)} className="gap-2 self-start">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {bulkMode ? "Enviar Criativos em Lote" : "Enviar Criativo"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">{productName || "Carregando..."}</p>
          </div>
        </div>

        {/* Progress Steps */}
        <Card className="hub-card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between overflow-x-auto">
              {steps.map((stepItem, index) => (
                <div key={index} className="flex items-center shrink-0">
                  <div className={`flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-medium ${
                    step > index + 1 ? "bg-green-500 text-white"
                    : step === index + 1 ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                  }`}>
                    {step > index + 1 ? <Check className="h-3 w-3 md:h-4 md:w-4" /> : index + 1}
                  </div>
                  <span className={`ml-1 md:ml-2 text-xs md:text-sm font-medium hidden sm:inline ${step === index + 1 ? "text-foreground" : "text-muted-foreground"}`}>
                    {stepItem.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-6 md:w-12 h-px mx-2 md:mx-4 ${step > index + 1 ? "bg-green-500" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="hub-card-shadow">
          <CardContent className="p-4 md:p-8">{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => (step > 1 ? setStep(step - 1) : navigate(`/products/${id}`))}>
            {step === 1 ? "Cancelar" : "Voltar"}
          </Button>
          <Button
            onClick={() => (step === 5 ? handleSubmit() : setStep(step + 1))}
            disabled={step < 5 ? !canProceed() : submitting}
            className="hub-shadow"
          >
            {step === 5 ? (submitting ? "Enviando..." : bulkMode ? `Enviar ${bulkItems.length} Criativos` : "Enviar Criativo") : "Continuar"}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CreativeUpload;
