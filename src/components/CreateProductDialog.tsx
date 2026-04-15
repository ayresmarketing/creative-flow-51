import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, ShoppingBag, BookOpen, Users, Briefcase, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BriefingForm, { type BriefingResponses } from "./BriefingForm";
import { invokeGoogleDriveOperation } from "@/lib/googleDrive";
import {
  buildBriefingText,
  getBriefingSchema,
  getCategoryLabel,
  serializeBriefingPayload,
  type ProductCategory,
} from "./briefing/briefingSchemas";

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onCreated?: () => void;
}

const categoryOptions: { value: ProductCategory; label: string; icon: typeof BookOpen }[] = [
  { value: "infoproduto", label: "Infoproduto", icon: BookOpen },
  { value: "prestacao_servico", label: "Prestação de serviço", icon: Briefcase },
  { value: "mentoria", label: "Mentoria", icon: Users },
  { value: "ecommerce", label: "E-commerce", icon: ShoppingBag },
];

const generateAcronym = (name: string): string => {
  const words = name.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return "";

  if (words.length >= 3) {
    return words.slice(0, 4).map((w) => w[0].toUpperCase()).join("");
  }

  if (words.length === 2) {
    const first = words[0][0].toUpperCase();
    const second = words[1][0].toUpperCase();
    const third = words[1].length > 1
      ? words[1][1].toUpperCase()
      : words[0].length > 1
        ? words[0][1].toUpperCase()
        : "X";
    return `${first}${second}${third}`;
  }

  const single = words[0].toUpperCase();
  return single.length >= 3 ? single.slice(0, 3) : single.padEnd(3, single[single.length - 1]);
};

const CreateProductDialog = ({ open, onOpenChange, clientId, onCreated }: CreateProductDialogProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [productName, setProductName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [category, setCategory] = useState<ProductCategory | "">("");
  const [showBriefingForm, setShowBriefingForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creatingState, setCreatingState] = useState<"idle" | "loading" | "success">("idle");

  const selectedCategory = useMemo<ProductCategory>(() => {
    return category || "infoproduto";
  }, [category]);

  const reset = () => {
    setStep(1);
    setProductName("");
    setAcronym("");
    setCategory("");
    setShowBriefingForm(false);
    setSaving(false);
    setCreatingState("idle");
  };

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const handleNameChange = (value: string) => {
    setProductName(value);
    setAcronym(generateAcronym(value));
  };

  const saveProduct = async (briefingData?: BriefingResponses) => {
    if (!category) return false;

    setSaving(true);
    setCreatingState("loading");

    const { data: product, error } = await supabase
      .from("products")
      .insert({
        name: productName.trim(),
        acronym: acronym.trim(),
        category,
        client_id: clientId,
      })
      .select("id")
      .single();

    if (error || !product) {
      toast({ title: "Erro ao criar produto", description: error?.message, variant: "destructive" });
      setSaving(false);
      setCreatingState("idle");
      return false;
    }

    if (briefingData) {
      const serializedBriefing = serializeBriefingPayload(category, briefingData);
      const { error: briefingError } = await (supabase.from("product_briefings") as any).upsert(
        {
          product_id: product.id,
          responses: serializedBriefing,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "product_id" },
      );

      if (briefingError) {
        toast({ title: "Erro ao salvar briefing", description: briefingError.message, variant: "destructive" });
      }

      await invokeGoogleDriveOperation({
        action: "upload_briefing",
        productId: product.id,
        productName: productName.trim(),
        categoryLabel: getCategoryLabel(category),
        briefingText: buildBriefingText(serializedBriefing, productName.trim()),
      });
    }

    await invokeGoogleDriveOperation({
      action: "create_product_folder",
      productName: productName.trim(),
      productAcronym: acronym.trim(),
      productId: product.id,
      clientId,
    });

    setSaving(false);
    setCreatingState("success");
    onCreated?.();
    return true;
  };

  const handleSkipBriefing = async () => {
    await saveProduct();
  };

  const handleCategorySelect = (value: string) => {
    setCategory(value as ProductCategory);
    setShowBriefingForm(true);
  };

  const handleBriefingSubmit = async (responses: BriefingResponses) => {
    const ok = await saveProduct(responses);
    if (ok) setShowBriefingForm(false);
  };

  const handleBackToDash = () => {
    handleClose(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={creatingState === "loading" ? undefined : handleClose}>
        <DialogContent className="sm:max-w-md">
          {creatingState === "loading" ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
              <p className="text-foreground font-semibold text-lg text-center">
                Seu produto está sendo criado
              </p>
              <p className="text-muted-foreground text-sm text-center">
                Aguarde alguns instantes...
              </p>
            </div>
          ) : creatingState === "success" ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
              <p className="text-foreground font-semibold text-lg text-center">
                Produto criado com sucesso!
              </p>
              <p className="text-muted-foreground text-sm text-center">
                Produto, briefing e pasta já estão prontos.
              </p>
              <Button onClick={handleBackToDash} className="mt-4">
                Voltar ao Dashboard
              </Button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>
                  {step === 1 ? "Novo Produto" : "Tipo do Produto"}
                </DialogTitle>
                <DialogDescription>
                  {step === 1
                    ? "Dê um nome ao seu produto e defina a sigla."
                    : "Selecione a categoria e preencha o briefing interno."}
                </DialogDescription>
              </DialogHeader>

              {step === 1 && (
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="product-name">Nome do produto</Label>
                    <Input
                      id="product-name"
                      placeholder="Ex: Método Viver de Piercing"
                      value={productName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product-acronym">Sigla do produto</Label>
                    <Input
                      id="product-acronym"
                      placeholder="Ex: MVP"
                      value={acronym}
                      onChange={(e) => setAcronym(e.target.value.toUpperCase())}
                      maxLength={4}
                      className="font-mono uppercase"
                    />
                    <p className="text-xs text-muted-foreground">
                      Mínimo de 3 e máximo de 4 caracteres. Se não preencher, geramos automaticamente. Ex: {" "}
                      <span className="font-mono font-semibold text-primary">
                        {acronym || "..."} | ADV001
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="py-2 space-y-3">
                  <RadioGroup value={category} onValueChange={handleCategorySelect} className="grid grid-cols-1 gap-3">
                    {categoryOptions.map((opt) => {
                      const Icon = opt.icon;
                      return (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-colors ${
                            category === opt.value
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/40"
                          }`}
                        >
                          <RadioGroupItem value={opt.value} />
                          <div className="p-2 rounded-md bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium text-foreground">{opt.label}</span>
                        </label>
                      );
                    })}
                  </RadioGroup>

                  {category && (
                    <p className="text-xs text-muted-foreground">
                      Briefing ativo: {getBriefingSchema(selectedCategory).title}
                    </p>
                  )}
                </div>
              )}

              <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
                {step === 2 && (
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
                  </Button>
                )}

                {step === 1 ? (
                  <Button
                    className="ml-auto"
                    disabled={!productName.trim() || !acronym.trim() || acronym.trim().length < 3}
                    onClick={() => setStep(2)}
                  >
                    Próximo <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="outline"
                      disabled={!category || saving}
                      onClick={handleSkipBriefing}
                    >
                      Pular Briefing
                    </Button>
                    <Button
                      disabled={!category || saving}
                      onClick={() => setShowBriefingForm(true)}
                    >
                      Preencher Briefing
                    </Button>
                  </div>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showBriefingForm} onOpenChange={setShowBriefingForm}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>{getBriefingSchema(selectedCategory).title}</DialogTitle>
            <DialogDescription>
              {getBriefingSchema(selectedCategory).description}
            </DialogDescription>
          </DialogHeader>
          <BriefingForm
            category={selectedCategory}
            onSubmit={handleBriefingSubmit}
            saving={saving}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateProductDialog;
