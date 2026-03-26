import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import TeamManagementPanel from "@/components/TeamManagementPanel";
import AddTeamMemberDialog from "@/components/AddTeamMemberDialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { UserPlus } from "lucide-react";

const TeamPage = () => {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (user?.isTeamMember && user.teamRole === "colaborador") {
    return (
      <Layout>
        <div className="p-8 text-center text-muted-foreground">Colaboradores não podem gerenciar a equipe.</div>
      </Layout>
    );
  }

  if (!user?.clientId) {
    return (
      <Layout>
        <div className="p-8 text-center text-muted-foreground">Nenhum cliente associado.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Minha Equipe</h1>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Adicionar Membro
          </Button>
        </div>

        <TeamManagementPanel key={refreshKey} clientId={user.clientId} />

        <AddTeamMemberDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          clientId={user.clientId}
          clientName={user.name}
          onAdded={() => setRefreshKey((k) => k + 1)}
        />
      </div>
    </Layout>
  );
};

export default TeamPage;
