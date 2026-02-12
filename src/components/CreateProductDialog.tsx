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
import { ArrowLeft, ArrowRight, ShoppingBag, BookOpen, Users, Briefcase } from "lucide-react";

interface CreateProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categoryOptions = [
  { value: "infoproduto", label: "Infoproduto", icon: BookOpen },
  { value: "prestacao_servico", label: "Prestação de serviço", icon: Briefcase },
  { value: "mentoria", label: "Mentoria", icon: Users },
  { value: "ecommerce", label: "E-commerce", icon: ShoppingBag },
];

/** Generate a suggested acronym from product name initials */
const generateAcronym = (name: string): string => {
  return name
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => w[0].toUpperCase())
    .join("")
    .slice(0, 6);
};

const CreateProductDialog = ({ open, onOpenChange }: CreateProductDialogProps) => {
  const [step, setStep] = useState(1);
  const [productName, setProductName] = useState("");
  const [acronym, setAcronym] = useState("");
  const [category, setCategory] = useState("");
  const [showFormPopup, setShowFormPopup] = useState(false);

  const reset = () => {
    setStep(1);
    setProductName("");
    setAcronym("");
    setCategory("");
    setShowFormPopup(false);
  };

  const handleClose = (val: boolean) => {
    if (!val) reset();
    onOpenChange(val);
  };

  const handleNameChange = (value: string) => {
    setProductName(value);
    setAcronym(generateAcronym(value));
  };

  const handleCategorySelect = (value: string) => {
    setCategory(value);
    if (value === "infoproduto") {
      setShowFormPopup(true);
    }
  };

  const handleFinish = () => {
    console.log("Product created:", { productName, acronym, category });
    handleClose(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
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
                  maxLength={6}
                  className="font-mono uppercase tracking-widest"
                />
                <p className="text-xs text-muted-foreground">
                  A sigla será usada na nomenclatura dos criativos. Ex:{" "}
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
                disabled={!productName.trim() || !acronym.trim()}
                onClick={() => setStep(2)}
              >
                Próximo <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                className="ml-auto"
                disabled={!category || category === "infoproduto"}
                onClick={handleFinish}
              >
                Criar Produto
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Google Forms popup for Infoproduto */}
      <Dialog open={showFormPopup} onOpenChange={setShowFormPopup}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Formulário — Infoproduto</DialogTitle>
            <DialogDescription>Preencha o formulário abaixo para continuar.</DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto px-6 pb-6" style={{ maxHeight: "calc(90vh - 100px)" }}>
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
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateProductDialog;
