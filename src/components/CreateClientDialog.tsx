import { useState, useRef } from "react";
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
import { Copy, Check, UserPlus, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreateClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}

const CreateClientDialog = ({ open, onOpenChange, onCreated }: CreateClientDialogProps) => {
  const { addClient } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      const result = await addClient(name.trim(), email.trim());
      const clientId = result.user.clientId;

      // Upload logo if provided
      if (logoFile && clientId) {
        const ext = logoFile.name.split(".").pop();
        const path = `${clientId}/logo.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("client-logos")
          .upload(path, logoFile, { upsert: true });

        if (!upErr) {
          const { data: urlData } = supabase.storage.from("client-logos").getPublicUrl(path);
          await supabase.from("clients").update({ logo_url: urlData.publicUrl } as any).eq("id", clientId);
        }
      }

      // Create Google Drive folder for the client
      if (clientId) {
        try {
          await supabase.functions.invoke("google-drive-operations", {
            body: { action: "create_client_folder", clientName: name.trim(), clientId },
          });
        } catch (driveErr) {
          console.warn("Drive folder creation failed (non-blocking):", driveErr);
        }
      }

      setGeneratedPassword(result.generatedPassword);
      toast({
        title: "Cliente cadastrado!",
        description: `${name} foi adicionado com sucesso.`,
      });
      onCreated?.();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
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
    setLogoFile(null);
    setLogoPreview(null);
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
                <UserPlus className="h-5 w-5" />
                Novo Cliente
              </DialogTitle>
              <DialogDescription>
                Cadastre um novo cliente. Uma senha será gerada automaticamente.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Foto/Logo da empresa (opcional)</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-dashed border-muted-foreground/30">
                    {logoPreview ? (
                      <AvatarImage src={logoPreview} alt="Logo preview" className="object-cover" />
                    ) : (
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs text-center leading-tight px-1">
                        Sem foto
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoSelect}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4" />
                      {logoFile ? "Trocar foto" : "Selecionar foto"}
                    </Button>
                    {logoFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-4 w-4" />
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="client-name">Nome do Cliente</Label>
                <Input
                  id="client-name"
                  placeholder="Ex: Empresa XYZ"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-email">Email do Cliente</Label>
                <Input
                  id="client-email"
                  type="email"
                  placeholder="cliente@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Cliente cadastrado com sucesso!</DialogTitle>
              <DialogDescription>
                Envie a senha abaixo para o cliente. Ela não será exibida novamente.
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

export default CreateClientDialog;
