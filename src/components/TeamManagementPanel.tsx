import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Shield, User, MoreVertical, Trash2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ResetPasswordDialog from "@/components/ResetPasswordDialog";
import { useToast } from "@/hooks/use-toast";

interface TeamMember {
  id: string;
  email: string;
  team_role: string;
  created_at: string;
  name?: string;
  user_id?: string | null;
  avatar_url?: string | null;
}

interface TeamManagementPanelProps {
  clientId: string;
}

const TeamManagementPanel = ({ clientId }: TeamManagementPanelProps) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetMember, setResetMember] = useState<{ userId: string; name: string } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMembers = async () => {
      const { data } = await (supabase as any)
        .from("client_team_members")
        .select("id, email, team_role, created_at, user_id, member_name, avatar_url")
        .eq("client_id", clientId)
        .order("created_at", { ascending: true });

      if (data) {
        const withNames = await Promise.all(
          data.map(async (m: any) => {
            if (m.member_name) {
              return { ...m, name: m.member_name };
            }
            if (m.user_id) {
              const { data: profile } = await supabase
                .from("profiles")
                .select("name")
                .eq("user_id", m.user_id)
                .maybeSingle();
              return { ...m, name: profile?.name || m.email };
            }
            return { ...m, name: m.email };
          })
        );
        setMembers(withNames);
      }
      setLoading(false);
    };
    fetchMembers();
  }, [clientId]);

  const handleDeleteMember = async (memberId: string) => {
    const { error } = await supabase.from("client_team_members").delete().eq("id", memberId);
    if (error) {
      toast({ title: "Erro ao excluir membro", description: error.message, variant: "destructive" });
      return;
    }

    setMembers((prev) => prev.filter((member) => member.id !== memberId));
    toast({ title: "Membro removido com sucesso" });
  };

  if (loading) return <div className="p-4 text-center text-muted-foreground text-sm">Carregando equipe...</div>;

  if (members.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Nenhum membro na equipe ainda.</p>
          <p className="text-xs text-muted-foreground mt-1">Use o botão "Adicionar Equipe" para convidar membros.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {resetMember ? (
        <ResetPasswordDialog
          open={!!resetMember}
          onOpenChange={(open) => { if (!open) setResetMember(null); }}
          userId={resetMember.userId}
          userName={resetMember.name}
        />
      ) : null}
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Users className="h-5 w-5" />
        Equipe ({members.length})
      </h3>
      <div className="grid gap-3">
        {members.map((member) => (
          <Card key={member.id} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex items-center gap-4">
              <Avatar className="h-10 w-10">
                {member.avatar_url ? <AvatarImage src={member.avatar_url} alt={member.name} className="object-cover" /> : null}
                <AvatarFallback>
                  {member.team_role === "admin" ? (
                    <Shield className="h-4 w-4 text-primary" />
                  ) : (
                    <User className="h-4 w-4 text-amber-600" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{member.name}</p>
                <p className="text-xs text-muted-foreground truncate">{member.email}</p>
              </div>
              <Badge
                variant={member.team_role === "admin" ? "default" : "secondary"}
                className="shrink-0"
              >
                {member.team_role === "admin" ? "Administrador" : "Colaborador"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {member.user_id ? (
                    <DropdownMenuItem onClick={() => setResetMember({ userId: member.user_id!, name: member.name || member.email })}>
                      <KeyRound className="h-4 w-4 mr-2" />
                      Resetar senha
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDeleteMember(member.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir membro
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TeamManagementPanel;
