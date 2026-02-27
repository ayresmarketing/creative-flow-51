import { useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, ShoppingBag, BookOpen, Users, Briefcase, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onCreated?: () => void;
}

const categoryOptions = [
  { value: "infoproduto", label: "Infoproduto", icon: BookOpen },
  { value: "prestacao_servico", label: "Prestação de serviço", icon: Briefcase },
  { value: "mentoria", label: "Mentoria", icon: Users },
  { value: "ecommerce", label: "E-commerce", icon: ShoppingBag },
];

const generateAcronym = (name: string): string => {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => w[0].toUpperCase())
    .join("")
    .slice(0, 4);
};

const CreateProductDialog = ({ open, onOpenChange, clientId, onCreated }: CreateProductDialogProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [productName, setProductName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [category, setCategory] = useState("");
  const [showFormPopup, setShowFormPopup] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formConfirmed, setFormConfirmed] = useState(false);
  // New states for loading/success popup
  const [creatingPopup, setCreatingPopup] = useState(false);
  const [createdSuccess, setCreatedSuccess] = useState(false);

  const reset = () => {
    setStep(1);
    setProductName("");
    setAcronym("");
    setCategory("");
    setShowFormPopup(false);
    setSaving(false);
    setFormConfirmed(false);
    setCreatingPopup(false);
    setCreatedSuccess(false);
  };

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const handleNameChange = (value: string) => {
    setProductName(value);
    setAcronym(generateAcronym(value));
  };

  const saveProduct = async () => {
    setSaving(true);
    setCreatingPopup(true);
    setCreatedSuccess(false);

    const { data: product, error } = await supabase.from("products").insert({
      name: productName.trim(),
      acronym: acronym.trim(),
      category,
      client_id: clientId,
    }).select("id").single();

    if (error || !product) {
      toast({ title: "Erro ao criar produto", description: error?.message, variant: "destructive" });
      setSaving(false);
      setCreatingPopup(false);
      return false;
    }

    // Create Google Drive folder for the product
    try {
      await supabase.functions.invoke("google-drive-operations", {
        body: {
          action: "create_product_folder",
          productName: productName.trim(),
          productAcronym: acronym.trim(),
          productId: product.id,
          clientId,
        },
      });
    } catch (driveErr) {
      console.warn("Drive product folder creation failed (non-blocking):", driveErr);
    }

    setSaving(false);
    setCreatedSuccess(true);
    onCreated?.();
    return true;
  };

  const handleCategorySelect = (value: string) => {
    setCategory(value);
    if (value === "infoproduto") {
      setShowFormPopup(true);
    }
  };

  const handleFinish = async () => {
    await saveProduct();
  };

  const handleInfoprodutoFinish = async () => {
    const ok = await saveProduct();
    if (ok) {
      setShowFormPopup(false);
    }
  };

  const handleGoToDash = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <>
      {/* Main create dialog - hidden when creating popup is shown */}
      <Dialog open={open && !creatingPopup} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {step === 1 ? "Novo Produto" : "Tipo do Produto"}
            </DialogTitle>
            <DialogDescription>
              {step === 1
                ? "Dê um nome ao seu produto e defina a sigla."
                : "Selecione a categoria do produto."}
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
                  Mínimo de 3 caracteres. A sigla será usada na nomenclatura dos criativos. Ex:{" "}
                  <span className="font-mono font-semibold text-primary">
                    {acronym || "..."} | ADV001
                  </span>
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="py-2">
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
              <Button
                className="ml-auto"
                disabled={!category || category === "infoproduto" || saving}
                onClick={handleFinish}
              >
                {saving ? "Criando..." : "Criar Produto"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Creating / Success popup */}
      <Dialog open={creatingPopup} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-sm text-center [&>button]:hidden">
          {!createdSuccess ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div>
                <DialogTitle className="text-lg">Criando seu produto</DialogTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Seu produto está sendo criado, aguarde alguns instantes...
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <DialogTitle className="text-lg">Produto criado!</DialogTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Seu produto <span className="font-semibold text-foreground">{productName}</span> foi criado com sucesso.
                </p>
              </div>
              <Button onClick={handleGoToDash} className="mt-2">
                Voltar ao Painel
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Google Forms popup for Infoproduto */}
      <Dialog open={showFormPopup} onOpenChange={setShowFormPopup}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Formulário — Infoproduto</DialogTitle>
            <DialogDescription>Preencha o formulário abaixo para continuar.</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto px-6 pb-6" style={{ maxHeight: "calc(90vh - 200px)" }}>
            <iframe
              src="https://docs.google.com/forms/d/e/1FAIpQLSdVJ3kfqGTtjrophYEhBDClWCQN9M4VEcnQML-66RZ8bTVf9w/viewform?embedded=true"
              width="100%"
              height="4940"
              frameBorder="0"
              marginHeight={0}
              marginWidth={0}
              title="Formulário Infoproduto"
            >
              Carregando…
            </iframe>
          </div>
          <div className="p-4 border-t border-border space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <Checkbox
                checked={formConfirmed}
                onCheckedChange={(v) => setFormConfirmed(!!v)}
              />
              <span className="text-sm text-foreground">
                Confirmei o envio do formulário (apareceu a tela de confirmação)
              </span>
            </label>
            <div className="flex justify-end">
              <Button onClick={handleInfoprodutoFinish} disabled={!formConfirmed || saving}>
                {saving ? "Criando..." : "Concluir e Criar Produto"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateProductDialog;
