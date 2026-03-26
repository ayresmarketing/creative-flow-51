import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Copy, Check, Shield, Users, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function generatePassword(length = 12): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
}

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  onAdded?: () => void;
}

type TeamRole = "admin" | "colaborador";

const AddTeamMemberDialog = ({ open, onOpenChange, clientId, clientName, onAdded }: AddTeamMemberDialogProps) => {
  const { toast } = useToast();

  const [step, setStep] = useState<"role" | "form" | "done">("role");
  const [selectedRole, setSelectedRole] = useState<TeamRole | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFunctionError = async (error: any) => {
    const response = error?.context;
    if (response && typeof response.json === "function") {
      try {
        const payload = await response.json();
        return payload?.error || error.message;
      } catch {
        return error.message;
      }
    }
    return error?.message || "Erro inesperado";
  };

  const handleAvatarSelect = (file: File | null) => {
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !selectedRole) {
      toast({ title: "Preencha nome e e-mail", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const password = generatePassword();

      const response = await supabase.functions.invoke("create-user", {
        body: { name: name.trim(), email: email.trim(), password, role: "cliente", is_team_member: true },
      });

      if (response.error) throw response.error;

      const userId = response.data.user_id;

      const { data: insertedMember, error: memberError } = await (supabase as any).from("client_team_members").insert({
        client_id: clientId,
        email: email.trim(),
        user_id: userId,
        team_role: selectedRole,
        member_name: name.trim(),
      }).select("id").single();

      if (memberError) throw memberError;

      if (avatarFile && insertedMember?.id) {
        const ext = avatarFile.name.split(".").pop() || "jpg";
        const path = `team-members/${userId}/avatar.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("client-logos")
          .upload(path, avatarFile, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("client-logos").getPublicUrl(path);
          await (supabase as any)
            .from("client_team_members")
            .update({ avatar_url: urlData.publicUrl })
            .eq("id", insertedMember.id);
        }
      }

      setGeneratedPassword(password);
      setStep("done");
      toast({ title: "Membro adicionado com sucesso!" });
      onAdded?.();
    } catch (err: any) {
      const message = await parseFunctionError(err);
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setSaving(false);
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
    setStep("role");
    setSelectedRole(null);
    setName("");
    setEmail("");
    setGeneratedPassword(null);
    setCopied(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === "role" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Tipo de Acesso
              </DialogTitle>
              <DialogDescription>
                Escolha o tipo de acesso para o novo membro da equipe de <strong>{clientName}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <Card
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedRole === "admin" ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedRole("admin")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Administrador</p>
                    <p className="text-xs text-muted-foreground">Acesso completo ao painel, mesmas permissões do cliente principal.</p>
                  </div>
                </div>
              </Card>
              <Card
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${selectedRole === "colaborador" ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedRole("colaborador")}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Colaborador</p>
                    <p className="text-xs text-muted-foreground">Pode subir criativos (com aprovação) e acessar roteiros.</p>
                  </div>
                </div>
              </Card>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancelar</Button>
              <Button onClick={() => setStep("form")} disabled={!selectedRole}>
                Continuar
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Adicionar {selectedRole === "admin" ? "Administrador" : "Colaborador"}
              </DialogTitle>
              <DialogDescription>
                Preencha os dados do novo membro.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Foto do membro (opcional)</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border border-border">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt="Prévia" className="object-cover" />
                    ) : null}
                    <AvatarFallback>Foto</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAvatarSelect(e.target.files?.[0] || null)}
                    />
                    <Button type="button" variant="outline" size="sm" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4" />
                      {avatarFile ? "Trocar foto" : "Selecionar foto"}
                    </Button>
                    {avatarFile ? (
                      <Button type="button" variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={() => handleAvatarSelect(null)}>
                        <X className="h-4 w-4" /> Remover
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-name">Nome</Label>
                <Input
                  id="member-name"
                  placeholder="Nome do funcionário"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-email">E-mail</Label>
                <Input
                  id="member-email"
                  type="email"
                  placeholder="email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("role")}>Voltar</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Criando..." : "Adicionar Membro"}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "done" && generatedPassword && (
          <>
            <DialogHeader>
              <DialogTitle>Membro criado com sucesso!</DialogTitle>
              <DialogDescription>
                Envie as credenciais para o funcionário. A senha não será exibida novamente.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">E-mail</Label>
                <p className="text-sm font-medium">{email}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Tipo de Acesso</Label>
                <p className="text-sm font-medium">{selectedRole === "admin" ? "Administrador" : "Colaborador"}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Senha</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded-md text-sm font-mono">
                    {generatedPassword}
                  </code>
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
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

export default AddTeamMemberDialog;
