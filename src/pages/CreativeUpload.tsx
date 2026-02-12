import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Upload, Image, Video, Layers, ArrowLeft, Check, X, FileImage, FileVideo
} from "lucide-react";

type CreativeType = "PHOTO" | "VIDEO" | "CAROUSEL";
type ObjectiveType = "Vendas" | "Remarketing" | "Conteúdo" | "Captação" | "Lembrete" | "Carrinho Aberto";
type FormatType = "Feed" | "Stories";

const CreativeUpload = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [creativeType, setCreativeType] = useState<CreativeType | "">("");
  const [objective, setObjective] = useState<ObjectiveType | "">("");
  const [formats, setFormats] = useState<FormatType[]>([]);
  const [feedFiles, setFeedFiles] = useState<File[]>([]);
  const [storiesFiles, setStoriesFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [isDragOverFeed, setIsDragOverFeed] = useState(false);
  const [isDragOverStories, setIsDragOverStories] = useState(false);

  const objectives: ObjectiveType[] = [
    "Vendas", "Remarketing", "Conteúdo", "Captação", "Lembrete", "Carrinho Aberto",
  ];

  // Mock product data
  const productAcronym = "MVP";
  const nextCounters = { photo: 2, video: 3, carousel: 2 };

  const generateCode = () => {
    if (!creativeType || !objective) return "";
    const typePrefix = creativeType === "PHOTO" ? "ADF" : creativeType === "VIDEO" ? "ADV" : "ADC";
    const counter = creativeType === "PHOTO" ? nextCounters.photo : creativeType === "VIDEO" ? nextCounters.video : nextCounters.carousel;
    return `${productAcronym} | ${typePrefix}${counter.toString().padStart(3, "0")}`;
  };

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
    const isValidType = fileArray.every((file) => {
      if (creativeType === "PHOTO" || creativeType === "CAROUSEL") return file.type.startsWith("image/");
      if (creativeType === "VIDEO") return file.type.startsWith("video/");
      return false;
    });
    if (!isValidType) {
      alert("Tipo de arquivo inválido para o tipo selecionado");
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
      // Clear files for unchecked format
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

  const canProceed = () => {
    switch (step) {
      case 1: return creativeType !== "";
      case 2: return objective !== "";
      case 3: return formats.length > 0;
      case 4: return hasRequiredFiles();
      default: return false;
    }
  };

  const handleSubmit = () => {
    console.log({ type: creativeType, objective, formats, feedFiles, storiesFiles, notes, generatedCode: generateCode() });
    navigate(`/products/${id}`);
  };

  const getTypeIcon = (type: CreativeType) => {
    switch (type) {
      case "PHOTO": return <Image className="h-6 w-6" />;
      case "VIDEO": return <Video className="h-6 w-6" />;
      case "CAROUSEL": return <Layers className="h-6 w-6" />;
    }
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
                <div className="p-1.5 bg-primary/10 rounded">
                  {file.type.startsWith("image/") ? <FileImage className="h-3 w-3 text-primary" /> : <FileVideo className="h-3 w-3 text-success" />}
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
                  onClick={() => setCreativeType(type)}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`mx-auto mb-4 p-4 rounded-lg ${type === "PHOTO" ? "bg-primary/10 text-primary" : type === "VIDEO" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
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
                          {format === "Feed" ? "Formato quadrado/horizontal para feed do Instagram/Facebook" : "Formato vertical 9:16 para Stories/Reels"}
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
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Envie os arquivos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formats.includes("Feed") && (
                <FileUploadZone
                  target="feed" files={feedFiles} setFiles={setFeedFiles}
                  isDragOver={isDragOverFeed} setIsDragOver={setIsDragOverFeed}
                  label="📐 Versão Feed"
                />
              )}
              {formats.includes("Stories") && (
                <FileUploadZone
                  target="stories" files={storiesFiles} setFiles={setStoriesFiles}
                  isDragOver={isDragOverStories} setIsDragOver={setIsDragOverStories}
                  label="📱 Versão Stories"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea id="notes" placeholder="Adicione observações sobre este criativo..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <Check className="h-8 w-8 text-success" />
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
                    <p className="font-mono font-semibold text-primary text-lg">{generateCode()}</p>
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
                      {feedFiles.map((file, i) => <p key={i} className="text-sm font-medium">{file.name}</p>)}
                    </div>
                  </div>
                )}

                {formats.includes("Stories") && storiesFiles.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Arquivos Stories ({storiesFiles.length})</Label>
                    <div className="mt-1 space-y-1">
                      {storiesFiles.map((file, i) => <p key={i} className="text-sm font-medium">{file.name}</p>)}
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

  const steps = [
    { title: "Tipo", completed: creativeType !== "" },
    { title: "Objetivo", completed: objective !== "" },
    { title: "Formatos", completed: formats.length > 0 },
    { title: "Arquivos", completed: hasRequiredFiles() },
    { title: "Revisar", completed: false },
  ];

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(`/products/${id}`)} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Enviar Criativo</h1>
            <p className="text-muted-foreground mt-1">Método Viver de Piercing</p>
          </div>
        </div>

        {/* Progress Steps */}
        <Card className="hub-card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((stepItem, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step > index + 1 ? "bg-success text-success-foreground"
                    : step === index + 1 ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                  }`}>
                    {step > index + 1 ? <Check className="h-4 w-4" /> : index + 1}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${step === index + 1 ? "text-foreground" : "text-muted-foreground"}`}>
                    {stepItem.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-px mx-4 ${step > index + 1 ? "bg-success" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="hub-card-shadow">
          <CardContent className="p-8">{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => (step > 1 ? setStep(step - 1) : navigate(`/products/${id}`))}>
            {step === 1 ? "Cancelar" : "Voltar"}
          </Button>
          <Button onClick={() => (step === 5 ? handleSubmit() : setStep(step + 1))} disabled={!canProceed()} className="hub-shadow">
            {step === 5 ? "Enviar Criativo" : "Continuar"}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CreativeUpload;
