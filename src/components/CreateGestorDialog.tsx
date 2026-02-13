import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Copy, Check, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreateGestorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateGestorDialog = ({ open, onOpenChange }: CreateGestorDialogProps) => {
  const { addGestor } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const result = addGestor(name.trim(), email.trim());
    setGeneratedPassword(result.generatedPassword);
    toast({
      title: "Gestor cadastrado!",
      description: `${name} foi adicionado com sucesso.`,
    });
  };

  const handleCopy = () => {
    if (generatedPassword) {
      navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setName("");
    setEmail("");
    setGeneratedPassword(null);
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!generatedPassword ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Novo Gestor
              </DialogTitle>
              <DialogDescription>
                Cadastre um novo gestor. Uma senha será gerada automaticamente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="gestor-name">Nome do Gestor</Label>
                <Input
                  id="gestor-name"
                  placeholder="Ex: Ana Costa"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gestor-email">Email do Gestor</Label>
                <Input
                  id="gestor-email"
                  type="email"
                  placeholder="gestor@ayresmarketing.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit">Cadastrar</Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Gestor cadastrado com sucesso!</DialogTitle>
              <DialogDescription>
                Envie a senha abaixo para o gestor. Ela não será exibida novamente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <p className="text-sm text-foreground font-medium">{email}</p>
              </div>
              <div className="space-y-2">
                <Label>Senha gerada</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
                    {generatedPassword}
                  </code>
                  <Button type="button" variant="outline" size="icon" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleClose}>Fechar</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateGestorDialog;
