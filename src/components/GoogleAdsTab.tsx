import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus, ArrowLeft, ArrowRight, CheckCircle2, XCircle, Pencil, Trash2,
  Clock, Loader2, Image, Link, Type, FileText, Tag, Megaphone, Eye, MessageSquare,
} from "lucide-react";

interface GoogleAdsTabProps {
  productId: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

interface RevisionItem {
  id: string;
  action: string;
  actor_name: string | null;
  comment: string | null;
  created_at: string;
}

// ─── Approval Badge ───
const ApprovalBadge = ({ status }: { status: string }) => {
  if (status === "approved") return <Badge className="bg-green-500/10 text-green-600 border-green-500/30 gap-1"><CheckCircle2 className="h-3 w-3" />Aprovado</Badge>;
  if (status === "rejected") return <Badge className="bg-destructive/10 text-destructive border-destructive/30 gap-1"><XCircle className="h-3 w-3" />Reprovado</Badge>;
  return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pendente</Badge>;
};

// ─── Mini Timeline ───
const MiniTimeline = ({ revisions }: { revisions: RevisionItem[] }) => {
  if (!revisions.length) return null;
  return (
    <div className="mt-2 space-y-1 border-l-2 border-muted pl-3">
      {revisions.map((r) => (
        <div key={r.id} className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{r.actor_name || "Sistema"}</span>{" "}
          {r.action}{r.comment ? ` — "${r.comment}"` : ""}{" "}
          <span className="text-muted-foreground/60">{new Date(r.created_at).toLocaleString("pt-BR")}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───
const GoogleAdsTab = ({ productId }: GoogleAdsTabProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isGestor = user?.role === "GESTOR";

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const fetchCampaigns = useCallback(async () => {
    const { data } = await supabase
      .from("ad_campaigns")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    setCampaigns((data as Campaign[]) || []);
    setLoading(false);
  }, [productId]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  if (selectedCampaign) {
    return (
      <CampaignDetail
        campaign={selectedCampaign}
        onBack={() => { setSelectedCampaign(null); fetchCampaigns(); }}
        isGestor={isGestor}
        userId={user?.id || ""}
        userName={user?.name || ""}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Campanhas Google Ads</h3>
        {isGestor && (
          <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" /> Criar Nova Campanha
          </Button>
        )}
      </div>

      {!loading && campaigns.length === 0 && (
        <Card className="hub-card-shadow">
          <CardContent className="p-8 text-center">
            <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nenhuma campanha criada ainda.</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3">
        {campaigns.map((c) => (
          <Card key={c.id} className="hub-card-shadow hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedCampaign(c)}>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("pt-BR")}</p>
              </div>
              <Badge variant="outline">{c.status === "draft" ? "Rascunho" : c.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateCampaignDialog open={createOpen} onOpenChange={setCreateOpen} productId={productId} onCreated={fetchCampaigns} />
    </div>
  );
};

// ─── Create Campaign Dialog ───
const CreateCampaignDialog = ({ open, onOpenChange, productId, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; productId: string; onCreated: () => void }) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("ad_campaigns").insert({ product_id: productId, name: name.trim() });
    setSaving(false);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Campanha criada!" });
    setName("");
    onOpenChange(false);
    onCreated();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Nova Campanha</DialogTitle>
          <DialogDescription>Defina o nome da campanha de Google Ads.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <Label>Nome da campanha</Label>
          <Input placeholder="Ex: Campanha de Vendas - Verão" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={!name.trim() || saving}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Criando...</> : "Criar Campanha"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Campaign Detail ───
interface CampaignDetailProps {
  campaign: Campaign;
  onBack: () => void;
  isGestor: boolean;
  userId: string;
  userName: string;
}

const CampaignDetail = ({ campaign, onBack, isGestor, userId, userName }: CampaignDetailProps) => {
  const [tab, setTab] = useState("keywords");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h3 className="text-lg font-semibold">{campaign.name}</h3>
          <p className="text-xs text-muted-foreground">Campanha Google Ads</p>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="keywords" className="gap-1"><Tag className="h-3.5 w-3.5" />Palavras-chave</TabsTrigger>
          <TabsTrigger value="titles" className="gap-1"><Type className="h-3.5 w-3.5" />Títulos</TabsTrigger>
          <TabsTrigger value="descriptions" className="gap-1"><FileText className="h-3.5 w-3.5" />Descrições</TabsTrigger>
          <TabsTrigger value="sitelinks" className="gap-1"><Link className="h-3.5 w-3.5" />Sitelinks</TabsTrigger>
          <TabsTrigger value="callouts" className="gap-1"><Megaphone className="h-3.5 w-3.5" />Extensões</TabsTrigger>
          <TabsTrigger value="images" className="gap-1"><Image className="h-3.5 w-3.5" />Imagens</TabsTrigger>
        </TabsList>

        <TabsContent value="keywords" className="mt-4">
          <KeywordsSection campaignId={campaign.id} isGestor={isGestor} userId={userId} userName={userName} />
        </TabsContent>
        <TabsContent value="titles" className="mt-4">
          <TitlesSection campaignId={campaign.id} isGestor={isGestor} userId={userId} userName={userName} />
        </TabsContent>
        <TabsContent value="descriptions" className="mt-4">
          <DescriptionsSection campaignId={campaign.id} isGestor={isGestor} userId={userId} userName={userName} />
        </TabsContent>
        <TabsContent value="sitelinks" className="mt-4">
          <SitelinksSection campaignId={campaign.id} isGestor={isGestor} userId={userId} userName={userName} />
        </TabsContent>
        <TabsContent value="callouts" className="mt-4">
          <CalloutsSection campaignId={campaign.id} isGestor={isGestor} userId={userId} userName={userName} />
        </TabsContent>
        <TabsContent value="images" className="mt-4">
          <ImagesSection campaignId={campaign.id} isGestor={isGestor} userId={userId} userName={userName} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ─── Helper: add revision ───
async function addRevision(campaignId: string, itemType: string, itemId: string, action: string, actorId: string, actorName: string, comment?: string) {
  await supabase.from("ad_campaign_revisions").insert({
    campaign_id: campaignId, item_type: itemType, item_id: itemId,
    action, actor_id: actorId, actor_name: actorName, comment: comment || null,
  });
}

async function fetchRevisions(campaignId: string, itemType: string, itemId: string): Promise<RevisionItem[]> {
  const { data } = await supabase
    .from("ad_campaign_revisions")
    .select("*")
    .eq("campaign_id", campaignId)
    .eq("item_type", itemType)
    .eq("item_id", itemId)
    .order("created_at", { ascending: true });
  return (data as RevisionItem[]) || [];
}

// ─── Keywords Section ───
const KeywordsSection = ({ campaignId, isGestor, userId, userName }: { campaignId: string; isGestor: boolean; userId: string; userName: string }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<Record<string, RevisionItem[]>>({});
  const [newValue, setNewValue] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [suggestionId, setSuggestionId] = useState<string | null>(null);
  const [suggestionValue, setSuggestionValue] = useState("");

  const fetch = useCallback(async () => {
    const { data } = await supabase.from("ad_campaign_keywords").select("*").eq("campaign_id", campaignId).order("position");
    const list = (data as any[]) || [];
    setItems(list);
    const revMap: Record<string, RevisionItem[]> = {};
    for (const item of list) {
      revMap[item.id] = await fetchRevisions(campaignId, "keyword", item.id);
    }
    setRevisions(revMap);
  }, [campaignId]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAdd = async () => {
    if (!newValue.trim()) return;
    const { data, error } = await supabase.from("ad_campaign_keywords").insert({ campaign_id: campaignId, keyword: newValue.trim(), position: items.length }).select().single();
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    await addRevision(campaignId, "keyword", data.id, "Adicionou palavra-chave", userId, userName);
    setNewValue("");
    fetch();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("ad_campaign_keywords").delete().eq("id", id);
    fetch();
  };

  const handleEdit = async () => {
    if (!editId || !editValue.trim()) return;
    await supabase.from("ad_campaign_keywords").update({ keyword: editValue.trim() }).eq("id", editId);
    await addRevision(campaignId, "keyword", editId, "Editou palavra-chave", userId, userName);
    setEditId(null);
    fetch();
  };

  const handleApproval = async (id: string, status: "approved" | "rejected") => {
    await supabase.from("ad_campaign_keywords").update({ approval_status: status }).eq("id", id);
    await addRevision(campaignId, "keyword", id, status === "approved" ? "Aprovou" : "Reprovou", userId, userName);
    fetch();
  };

  const handleSuggestion = async (id: string) => {
    if (!suggestionValue.trim()) return;
    await supabase.from("ad_campaign_keywords").update({ suggestion: suggestionValue.trim(), approval_status: "rejected" }).eq("id", id);
    await addRevision(campaignId, "keyword", id, "Sugeriu troca", userId, userName, `Sugestão: ${suggestionValue.trim()}`);
    setSuggestionId(null);
    setSuggestionValue("");
    fetch();
  };

  return (
    <div className="space-y-4">
      {isGestor && (
        <div className="flex gap-2">
          <Input placeholder="Nova palavra-chave..." value={newValue} onChange={(e) => setNewValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAdd()} />
          <Button onClick={handleAdd} size="sm"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
        </div>
      )}

      {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma palavra-chave adicionada.</p>}

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="hub-card-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {editId === item.id ? (
                    <div className="flex gap-2">
                      <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleEdit()} autoFocus />
                      <Button size="sm" onClick={handleEdit}>Salvar</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>Cancelar</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{item.keyword}</span>
                      <ApprovalBadge status={item.approval_status} />
                    </div>
                  )}
                  {item.suggestion && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> Sugestão de troca: "{item.suggestion}"
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {isGestor ? (
                    <>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditId(item.id); setEditValue(item.keyword); }}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" className="h-8 text-green-600 border-green-300 hover:bg-green-50" onClick={() => handleApproval(item.id, "approved")}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Aprovar</Button>
                      <Button size="sm" variant="outline" className="h-8 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => handleApproval(item.id, "rejected")}><XCircle className="h-3.5 w-3.5 mr-1" />Reprovar</Button>
                      <Button size="sm" variant="outline" className="h-8" onClick={() => { setSuggestionId(item.id); setSuggestionValue(""); }}>Trocar por</Button>
                    </>
                  )}
                </div>
              </div>
              {suggestionId === item.id && (
                <div className="flex gap-2 mt-2">
                  <Input placeholder="Sugestão de troca..." value={suggestionValue} onChange={(e) => setSuggestionValue(e.target.value)} autoFocus />
                  <Button size="sm" onClick={() => handleSuggestion(item.id)}>Enviar</Button>
                  <Button size="sm" variant="ghost" onClick={() => setSuggestionId(null)}>Cancelar</Button>
                </div>
              )}
              <MiniTimeline revisions={revisions[item.id] || []} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── Generic Text Items Section (Titles / Descriptions) ───
interface TextSectionProps {
  campaignId: string;
  isGestor: boolean;
  userId: string;
  userName: string;
  table: string;
  fieldName: string;
  label: string;
  maxChars: number;
  itemType: string;
}

const TextItemsSection = ({ campaignId, isGestor, userId, userName, table, fieldName, label, maxChars, itemType }: TextSectionProps) => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<Record<string, RevisionItem[]>>({});
  const [newValue, setNewValue] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const fetchItems = useCallback(async () => {
    const { data } = await supabase.from(table as any).select("*").eq("campaign_id", campaignId).order("position");
    const list = (data as any[]) || [];
    setItems(list);
    const revMap: Record<string, RevisionItem[]> = {};
    for (const item of list) {
      revMap[item.id] = await fetchRevisions(campaignId, itemType, item.id);
    }
    setRevisions(revMap);
  }, [campaignId, table, itemType]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAdd = async () => {
    if (!newValue.trim() || newValue.length > maxChars) return;
    const insertObj: any = { campaign_id: campaignId, [fieldName]: newValue.trim(), position: items.length };
    const { data, error } = await supabase.from(table as any).insert(insertObj).select().single();
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    await addRevision(campaignId, itemType, (data as any).id, `Adicionou ${label.toLowerCase()}`, userId, userName);
    setNewValue("");
    fetchItems();
  };

  const handleEdit = async () => {
    if (!editId || !editValue.trim() || editValue.length > maxChars) return;
    await supabase.from(table as any).update({ [fieldName]: editValue.trim() }).eq("id", editId);
    await addRevision(campaignId, itemType, editId, `Editou ${label.toLowerCase()}`, userId, userName);
    setEditId(null);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    await supabase.from(table as any).delete().eq("id", id);
    fetchItems();
  };

  const handleApproval = async (id: string, status: "approved" | "rejected") => {
    await supabase.from(table as any).update({ approval_status: status }).eq("id", id);
    await addRevision(campaignId, itemType, id, status === "approved" ? "Aprovou" : "Reprovou", userId, userName);
    fetchItems();
  };

  return (
    <div className="space-y-4">
      {isGestor && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder={`Novo ${label.toLowerCase()}...`}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              maxLength={maxChars}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <Button onClick={handleAdd} size="sm" disabled={!newValue.trim() || newValue.length > maxChars}>
              <Plus className="h-4 w-4 mr-1" />Adicionar
            </Button>
          </div>
          <p className={`text-xs ${newValue.length > maxChars ? "text-destructive" : "text-muted-foreground"}`}>{newValue.length}/{maxChars} caracteres</p>
        </div>
      )}

      {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhum(a) {label.toLowerCase()} adicionado(a).</p>}

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="hub-card-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {editId === item.id ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input value={editValue} onChange={(e) => setEditValue(e.target.value)} maxLength={maxChars} autoFocus onKeyDown={(e) => e.key === "Enter" && handleEdit()} />
                        <Button size="sm" onClick={handleEdit}>Salvar</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditId(null)}>Cancelar</Button>
                      </div>
                      <p className={`text-xs ${editValue.length > maxChars ? "text-destructive" : "text-muted-foreground"}`}>{editValue.length}/{maxChars}</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">{item[fieldName]}</span>
                      <span className="text-xs text-muted-foreground">({item[fieldName].length}/{maxChars})</span>
                      <ApprovalBadge status={item.approval_status} />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {isGestor ? (
                    <>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditId(item.id); setEditValue(item[fieldName]); }}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" className="h-8 text-green-600 border-green-300 hover:bg-green-50" onClick={() => handleApproval(item.id, "approved")}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Aprovar</Button>
                      <Button size="sm" variant="outline" className="h-8 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => handleApproval(item.id, "rejected")}><XCircle className="h-3.5 w-3.5 mr-1" />Reprovar</Button>
                    </>
                  )}
                </div>
              </div>
              <MiniTimeline revisions={revisions[item.id] || []} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const TitlesSection = (props: Omit<TextSectionProps, "table" | "fieldName" | "label" | "maxChars" | "itemType">) => (
  <TextItemsSection {...props} table="ad_campaign_titles" fieldName="title" label="Título" maxChars={30} itemType="title" />
);

const DescriptionsSection = (props: Omit<TextSectionProps, "table" | "fieldName" | "label" | "maxChars" | "itemType">) => (
  <TextItemsSection {...props} table="ad_campaign_descriptions" fieldName="description" label="Descrição" maxChars={90} itemType="description" />
);

// ─── Sitelinks Section ───
const SitelinksSection = ({ campaignId, isGestor, userId, userName }: { campaignId: string; isGestor: boolean; userId: string; userName: string }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<Record<string, RevisionItem[]>>({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description1: "", description2: "", url: "" });
  const [editId, setEditId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    const { data } = await supabase.from("ad_campaign_sitelinks").select("*").eq("campaign_id", campaignId).order("position");
    const list = (data as any[]) || [];
    setItems(list);
    const revMap: Record<string, RevisionItem[]> = {};
    for (const item of list) {
      revMap[item.id] = await fetchRevisions(campaignId, "sitelink", item.id);
    }
    setRevisions(revMap);
  }, [campaignId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const isFormValid = form.title.trim() && form.description1.trim() && form.description2.trim() && form.url.trim()
    && form.title.length <= 25 && form.description1.length <= 35 && form.description2.length <= 35;

  const handleSave = async () => {
    if (!isFormValid) return;
    if (editId) {
      await supabase.from("ad_campaign_sitelinks").update({ ...form }).eq("id", editId);
      await addRevision(campaignId, "sitelink", editId, "Editou sitelink", userId, userName);
    } else {
      const { data, error } = await supabase.from("ad_campaign_sitelinks").insert({ campaign_id: campaignId, ...form, position: items.length }).select().single();
      if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
      await addRevision(campaignId, "sitelink", (data as any).id, "Adicionou sitelink", userId, userName);
    }
    setForm({ title: "", description1: "", description2: "", url: "" });
    setShowForm(false);
    setEditId(null);
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("ad_campaign_sitelinks").delete().eq("id", id);
    fetchItems();
  };

  const handleApproval = async (id: string, status: "approved" | "rejected") => {
    await supabase.from("ad_campaign_sitelinks").update({ approval_status: status }).eq("id", id);
    await addRevision(campaignId, "sitelink", id, status === "approved" ? "Aprovou" : "Reprovou", userId, userName);
    fetchItems();
  };

  const CharCount = ({ value, max }: { value: string; max: number }) => (
    <span className={`text-xs ${value.length > max ? "text-destructive" : "text-muted-foreground"}`}>{value.length}/{max}</span>
  );

  return (
    <div className="space-y-4">
      {isGestor && !showForm && (
        <Button onClick={() => { setShowForm(true); setEditId(null); setForm({ title: "", description1: "", description2: "", url: "" }); }} size="sm">
          <Plus className="h-4 w-4 mr-1" />Adicionar Sitelink
        </Button>
      )}

      {showForm && (
        <Card className="hub-card-shadow">
          <CardContent className="p-4 space-y-3">
            <div className="space-y-1">
              <Label>Título <CharCount value={form.title} max={25} /></Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={25} placeholder="Título do sitelink" />
            </div>
            <div className="space-y-1">
              <Label>Descrição 1 <CharCount value={form.description1} max={35} /></Label>
              <Input value={form.description1} onChange={(e) => setForm({ ...form, description1: e.target.value })} maxLength={35} placeholder="Primeira descrição" />
            </div>
            <div className="space-y-1">
              <Label>Descrição 2 <CharCount value={form.description2} max={35} /></Label>
              <Input value={form.description2} onChange={(e) => setForm({ ...form, description2: e.target.value })} maxLength={35} placeholder="Segunda descrição" />
            </div>
            <div className="space-y-1">
              <Label>URL</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} disabled={!isFormValid}>{editId ? "Salvar" : "Adicionar"}</Button>
              <Button size="sm" variant="ghost" onClick={() => { setShowForm(false); setEditId(null); }}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && !showForm && <p className="text-sm text-muted-foreground text-center py-4">Nenhum sitelink adicionado.</p>}

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="hub-card-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground">{item.title}</span>
                    <ApprovalBadge status={item.approval_status} />
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description1}</p>
                  <p className="text-sm text-muted-foreground">{item.description2}</p>
                  <p className="text-xs text-primary break-all">{item.url}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {isGestor ? (
                    <>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setEditId(item.id); setForm({ title: item.title, description1: item.description1, description2: item.description2, url: item.url }); setShowForm(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" className="h-8 text-green-600 border-green-300 hover:bg-green-50" onClick={() => handleApproval(item.id, "approved")}><CheckCircle2 className="h-3.5 w-3.5 mr-1" />Aprovar</Button>
                      <Button size="sm" variant="outline" className="h-8 text-destructive border-destructive/30 hover:bg-destructive/5" onClick={() => handleApproval(item.id, "rejected")}><XCircle className="h-3.5 w-3.5 mr-1" />Reprovar</Button>
                    </>
                  )}
                </div>
              </div>
              <MiniTimeline revisions={revisions[item.id] || []} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── Callouts Section ───
const CalloutsSection = (props: { campaignId: string; isGestor: boolean; userId: string; userName: string }) => (
  <TextItemsSection {...props} table="ad_campaign_callouts" fieldName="text" label="Extensão" maxChars={25} itemType="callout" />
);

// ─── Images Section ───
const ImagesSection = ({ campaignId, isGestor, userId, userName }: { campaignId: string; isGestor: boolean; userId: string; userName: string }) => {
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [revisions, setRevisions] = useState<Record<string, RevisionItem[]>>({});
  const [uploading, setUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  const fetchItems = useCallback(async () => {
    const { data } = await supabase.from("ad_campaign_images").select("*").eq("campaign_id", campaignId).order("position");
    const list = (data as any[]) || [];
    setItems(list);
    // Generate signed URLs
    const urls: Record<string, string> = {};
    for (const item of list) {
      const { data: urlData } = await supabase.storage.from("ad-campaign-images").createSignedUrl(item.file_path, 3600);
      if (urlData?.signedUrl) urls[item.id] = urlData.signedUrl;
    }
    setImageUrls(urls);
    const revMap: Record<string, RevisionItem[]> = {};
    for (const item of list) {
      revMap[item.id] = await fetchRevisions(campaignId, "image", item.id);
    }
    setRevisions(revMap);
  }, [campaignId]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = `${campaignId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage.from("ad-campaign-images").upload(filePath, file);
      if (uploadError) { toast({ title: "Erro no upload", description: uploadError.message, variant: "destructive" }); continue; }
      const { data, error } = await supabase.from("ad_campaign_images").insert({
        campaign_id: campaignId, file_path: filePath, file_name: file.name,
        image_type: "campaign", position: items.length + i,
      }).select().single();
      if (!error && data) {
        await addRevision(campaignId, "image", (data as any).id, "Adicionou imagem", userId, userName);
      }
    }
    setUploading(false);
    e.target.value = "";
    fetchItems();
  };

  const handleDelete = async (id: string, filePath: string) => {
    await supabase.storage.from("ad-campaign-images").remove([filePath]);
    await supabase.from("ad_campaign_images").delete().eq("id", id);
    fetchItems();
  };

  const handleApproval = async (id: string, status: "approved" | "rejected") => {
    await supabase.from("ad_campaign_images").update({ approval_status: status }).eq("id", id);
    await addRevision(campaignId, "image", id, status === "approved" ? "Aprovou imagem" : "Reprovou imagem", userId, userName);
    fetchItems();
  };

  return (
    <div className="space-y-4">
      {isGestor && (
        <div>
          <label className="cursor-pointer">
            <Button asChild size="sm" disabled={uploading}>
              <span>{uploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</> : <><Plus className="h-4 w-4 mr-1" />Upload de Imagens</>}</span>
            </Button>
            <input type="file" className="hidden" accept="image/*" multiple onChange={handleUpload} />
          </label>
        </div>
      )}

      {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma imagem adicionada.</p>}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item) => (
          <Card key={item.id} className="hub-card-shadow overflow-hidden">
            <div className="aspect-square bg-muted relative">
              {imageUrls[item.id] ? (
                <img src={imageUrls[item.id]} alt={item.file_name || "Imagem"} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full"><Image className="h-8 w-8 text-muted-foreground" /></div>
              )}
              <div className="absolute top-2 right-2">
                <ApprovalBadge status={item.approval_status} />
              </div>
            </div>
            <CardContent className="p-3 space-y-2">
              <p className="text-xs text-muted-foreground truncate">{item.file_name || "Imagem"}</p>
              <div className="flex gap-1">
                {isGestor ? (
                  <Button size="sm" variant="ghost" className="h-7 text-destructive" onClick={() => handleDelete(item.id, item.file_path)}><Trash2 className="h-3.5 w-3.5" /></Button>
                ) : (
                  <>
                    <Button size="sm" variant="outline" className="h-7 text-green-600 border-green-300 text-xs" onClick={() => handleApproval(item.id, "approved")}><CheckCircle2 className="h-3 w-3 mr-1" />Aprovar</Button>
                    <Button size="sm" variant="outline" className="h-7 text-destructive border-destructive/30 text-xs" onClick={() => handleApproval(item.id, "rejected")}><XCircle className="h-3 w-3 mr-1" />Reprovar</Button>
                  </>
                )}
              </div>
              <MiniTimeline revisions={revisions[item.id] || []} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GoogleAdsTab;
