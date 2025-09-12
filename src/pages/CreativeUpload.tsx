import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Upload,
  Image,
  Video,
  Layers,
  ArrowLeft,
  Check,
  X,
  FileImage,
  FileVideo,
  Folder
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

type CreativeType = "PHOTO" | "VIDEO" | "CAROUSEL";
type ObjectiveType = "Vendas" | "Remarketing" | "Conteúdo" | "Captação" | "Lembrete" | "Carrinho Aberto";
type FormatType = "Feed" | "Stories" | "YouTube";

const CreativeUpload = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [creativeType, setCreativeType] = useState<CreativeType | "">("");
  const [objective, setObjective] = useState<ObjectiveType | "">("");
  const [formats, setFormats] = useState<FormatType[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [notes, setNotes] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const objectives: ObjectiveType[] = [
    "Vendas", "Remarketing", "Conteúdo", "Captação", "Lembrete", "Carrinho Aberto"
  ];

  const formatOptions: FormatType[] = ["Feed", "Stories", "YouTube"];

  // Mock product data
  const productName = "Tênis Esportivo Pro";
  const nextCounters = { photo: 1, video: 1, carousel: 1 };

  const generateCode = () => {
    if (!creativeType || !objective) return "";
    
    const typePrefix = creativeType === "PHOTO" ? "ADF" : 
                      creativeType === "VIDEO" ? "ADV" : "ADC";
    const counter = creativeType === "PHOTO" ? nextCounters.photo :
                   creativeType === "VIDEO" ? nextCounters.video : nextCounters.carousel;
    
    return `${productName} - ${objective} - ${typePrefix}${counter.toString().padStart(4, '0')}`;
  };

  const getAcceptedFileTypes = () => {
    switch (creativeType) {
      case "PHOTO": return "image/*";
      case "VIDEO": return "video/*";
      case "CAROUSEL": return "image/*";
      default: return "";
    }
  };

  const getMaxFiles = () => {
    return creativeType === "CAROUSEL" ? 10 : 1;
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    
    const fileArray = Array.from(selectedFiles);
    const maxFiles = getMaxFiles();
    
    if (fileArray.length > maxFiles) {
      alert(`Máximo de ${maxFiles} arquivo(s) permitido(s)`);
      return;
    }

    // Validate file types
    const isValidType = fileArray.every(file => {
      if (creativeType === "PHOTO" || creativeType === "CAROUSEL") {
        return file.type.startsWith("image/");
      }
      if (creativeType === "VIDEO") {
        return file.type.startsWith("video/");
      }
      return false;
    });

    if (!isValidType) {
      alert("Tipo de arquivo inválido para o tipo selecionado");
      return;
    }

    setFiles(fileArray);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleFormatToggle = (format: FormatType) => {
    setFormats(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  const canProceed = () => {
    switch (step) {
      case 1: return creativeType !== "";
      case 2: return objective !== "";
      case 3: return formats.length > 0;
      case 4: return files.length > 0;
      default: return false;
    }
  };

  const handleSubmit = () => {
    // Mock submission
    console.log({
      type: creativeType,
      objective,
      formats,
      files,
      notes,
      generatedCode: generateCode()
    });
    
    // Navigate back to product
    navigate(`/products/${id}`);
  };

  const getTypeIcon = (type: CreativeType) => {
    switch (type) {
      case "PHOTO": return <Image className="h-6 w-6" />;
      case "VIDEO": return <Video className="h-6 w-6" />;
      case "CAROUSEL": return <Layers className="h-6 w-6" />;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Selecione o tipo de criativo</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(["PHOTO", "VIDEO", "CAROUSEL"] as CreativeType[]).map((type) => (
                  <Card 
                    key={type}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      creativeType === type ? "ring-2 ring-primary hub-shadow" : ""
                    }`}
                    onClick={() => setCreativeType(type)}
                  >
                    <CardContent className="p-6 text-center">
                      <div className={`mx-auto mb-4 p-4 rounded-lg ${
                        type === "PHOTO" ? "bg-primary/10 text-primary" :
                        type === "VIDEO" ? "bg-success/10 text-success" :
                        "bg-warning/10 text-warning"
                      }`}>
                        {getTypeIcon(type)}
                      </div>
                      <h4 className="font-semibold">
                        {type === "PHOTO" ? "Foto" : 
                         type === "VIDEO" ? "Vídeo" : "Carrossel"}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-2">
                        {type === "PHOTO" ? "Imagem única para campanhas" :
                         type === "VIDEO" ? "Vídeo para engajamento" :
                         "Múltiplas imagens em sequência"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Selecione o objetivo</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {objectives.map((obj) => (
                  <Card 
                    key={obj}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      objective === obj ? "ring-2 ring-primary hub-shadow" : ""
                    }`}
                    onClick={() => setObjective(obj)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          objective === obj ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          <Check className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{obj}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Selecione os formatos</h3>
              <p className="text-muted-foreground mb-6">Escolha em quais formatos o criativo será usado</p>
              <div className="space-y-3">
                {formatOptions.map((format) => (
                  <Card 
                    key={format}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      formats.includes(format) ? "ring-2 ring-primary hub-shadow" : ""
                    }`}
                    onClick={() => handleFormatToggle(format)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={formats.includes(format)}
                          onChange={() => handleFormatToggle(format)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{format}</p>
                          <p className="text-sm text-muted-foreground">
                            {format === "Feed" ? "Formato quadrado para feed do Instagram/Facebook" :
                             format === "Stories" ? "Formato vertical para Stories" :
                             "Formato horizontal para YouTube"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Envie os arquivos</h3>
              
              {/* File Upload Area */}
              <Card 
                className={`border-2 border-dashed transition-colors ${
                  isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
              >
                <CardContent className="p-8 text-center">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">
                    {creativeType === "CAROUSEL" 
                      ? "Arraste múltiplas imagens ou clique para selecionar"
                      : "Arraste o arquivo ou clique para selecionar"}
                  </p>
                  <p className="text-muted-foreground mb-4">
                    {creativeType === "PHOTO" ? "Formatos suportados: JPG, PNG, WEBP" :
                     creativeType === "VIDEO" ? "Formatos suportados: MP4, MOV, AVI" :
                     `Até ${getMaxFiles()} imagens (JPG, PNG, WEBP)`}
                  </p>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    accept={getAcceptedFileTypes()}
                    multiple={creativeType === "CAROUSEL"}
                    onChange={(e) => handleFileSelect(e.target.files)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    Selecionar Arquivo{creativeType === "CAROUSEL" ? "s" : ""}
                  </Button>
                </CardContent>
              </Card>

              {/* Selected Files */}
              {files.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Arquivos selecionados:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {files.map((file, index) => (
                      <Card key={index} className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded">
                            {file.type.startsWith("image/") ? (
                              <FileImage className="h-4 w-4 text-primary" />
                            ) : (
                              <FileVideo className="h-4 w-4 text-success" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFiles(files.filter((_, i) => i !== index))}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações (opcional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Adicione observações sobre este criativo..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
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
              <p className="text-muted-foreground">
                Verifique os dados antes de enviar o criativo
              </p>
            </div>

            <Card className="hub-card-shadow">
              <CardHeader>
                <CardTitle className="text-lg">Resumo do criativo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Produto</Label>
                    <p className="font-medium">{productName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Código gerado</Label>
                    <p className="font-mono font-medium text-primary">{generateCode()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Tipo</Label>
                    <div className="flex items-center gap-2">
                      {creativeType && getTypeIcon(creativeType)}
                      <span className="font-medium">
                        {creativeType === "PHOTO" ? "Foto" : 
                         creativeType === "VIDEO" ? "Vídeo" : "Carrossel"}
                      </span>
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
                    {formats.map(format => (
                      <Badge key={format} variant="outline">{format}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-muted-foreground">
                    Arquivo{files.length > 1 ? "s" : ""} ({files.length})
                  </Label>
                  <div className="mt-1 space-y-1">
                    {files.map((file, index) => (
                      <p key={index} className="text-sm font-medium">{file.name}</p>
                    ))}
                  </div>
                </div>

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
    { title: "Arquivos", completed: files.length > 0 },
    { title: "Revisar", completed: false }
  ];

  return (
    <Layout>
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate(`/products/${id}`)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Enviar Criativo</h1>
            <p className="text-muted-foreground mt-1">
              {productName}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <Card className="hub-card-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              {steps.map((stepItem, index) => (
                <div key={index} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                    step > index + 1 || stepItem.completed
                      ? "bg-success text-success-foreground"
                      : step === index + 1
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {step > index + 1 || stepItem.completed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className={`ml-2 text-sm font-medium ${
                    step === index + 1 ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {stepItem.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-px mx-4 ${
                      step > index + 1 ? "bg-success" : "bg-muted"
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card className="hub-card-shadow">
          <CardContent className="p-8">
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => step > 1 ? setStep(step - 1) : navigate(`/products/${id}`)}
          >
            {step === 1 ? "Cancelar" : "Voltar"}
          </Button>
          
          <Button 
            onClick={() => step === 5 ? handleSubmit() : setStep(step + 1)}
            disabled={!canProceed()}
            className="hub-shadow"
          >
            {step === 5 ? "Enviar Criativo" : "Continuar"}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default CreativeUpload;