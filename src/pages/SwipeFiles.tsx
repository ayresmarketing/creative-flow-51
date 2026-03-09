import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Megaphone,
  ShoppingCart,
  MapPin,
  ArrowLeft,
  ExternalLink,
  Image,
  Video,
  FileText,
  Globe,
  Users,
  Bell,
  CalendarCheck,
  DoorOpen,
  LayoutGrid,
} from "lucide-react";

interface SwipeItem {
  label: string;
  url: string;
  icon: "image" | "video" | "page" | "generic";
}

interface SwipeTitle {
  name: string;
  items: SwipeItem[];
}

interface SwipeCategory {
  name: string;
  icon: typeof Rocket;
  color: string;
  bgGradient: string;
  titles: SwipeTitle[];
}

const iconMap = {
  image: Image,
  video: Video,
  page: Globe,
  generic: FileText,
};

const CATEGORIES: SwipeCategory[] = [
  {
    name: "Perpétuos",
    icon: Rocket,
    color: "text-blue-600 dark:text-blue-400",
    bgGradient: "from-blue-500/10 to-blue-600/5",
    titles: [
      {
        name: "Conversão",
        items: [
          { label: "Fotos de conversão", url: "https://drive.google.com/drive/u/1/folders/1-CnNjLHOi2Av26g7jEBZOhqjT1L8ttEd", icon: "image" },
          { label: "Vídeos de conversão", url: "https://drive.google.com/drive/u/1/folders/1W6KgBLYG1UR6wkd9MGD_RcwglBOfv9Pw", icon: "video" },
          { label: "Página de vendas", url: "https://drive.google.com/drive/u/1/folders/1DtJl3aP8oMScbZ5QOOAl-b6FWi7eveiA", icon: "page" },
          { label: "Carta de vendas", url: "https://drive.google.com/drive/u/1/folders/1OxTXYGIPrvenqHzTnC0ahVnziy9wSWEo", icon: "generic" },
          { label: "Vídeo de vendas", url: "https://drive.google.com/drive/u/1/folders/1JB9KFzuHghSQAaprL3UqbPBVyEOmlN-2", icon: "video" },
        ],
      },
      {
        name: "Distribuição de conteúdo",
        items: [
          { label: "Fotos de conteúdo", url: "https://drive.google.com/drive/u/1/folders/1HwwaO3zzO7gGrKqvP2pF6zpXOsyQKvKQ", icon: "image" },
          { label: "Vídeos de conteúdo", url: "https://drive.google.com/drive/u/1/folders/15_YMcV7A7dowpTwVereLTtbIVWHh6BvF", icon: "video" },
          { label: "Conseguir seguidores", url: "https://drive.google.com/drive/u/1/folders/1UHbLDBuGbA-3YcGPuce7TVV1Ue7WOoyb", icon: "generic" },
        ],
      },
      {
        name: "Remarketing",
        items: [
          { label: "Fotos de remarketing", url: "https://drive.google.com/drive/u/1/folders/1eoGSQzJ79ib5-_klh6SnJGQeFzZznwh7", icon: "image" },
          { label: "Vídeos de remarketing", url: "https://drive.google.com/drive/u/1/folders/1X0ACS4Mg0TJ9Pbwo8-TJu7q6SobPy3gg", icon: "video" },
        ],
      },
    ],
  },
  {
    name: "Lançamentos",
    icon: Megaphone,
    color: "text-purple-600 dark:text-purple-400",
    bgGradient: "from-purple-500/10 to-purple-600/5",
    titles: [
      {
        name: "Captura",
        items: [
          { label: "Fotos de captura", url: "https://drive.google.com/drive/u/1/folders/1-E9iUcwZ6f6TpCdaQq1cm-FoMpq-bQ9v", icon: "image" },
          { label: "Vídeos de captura", url: "https://drive.google.com/drive/u/1/folders/1OxTXYGIPrvenqHzTnC0ahVnziy9wSWEo", icon: "video" },
          { label: "Página de captura", url: "https://drive.google.com/drive/u/1/folders/1uGPYismutUAe1mLNXHMi4L_bjytaNU2d", icon: "page" },
        ],
      },
      {
        name: "Distribuição de conteúdo",
        items: [
          { label: "Fotos de conteúdo", url: "https://drive.google.com/drive/u/1/folders/1HwwaO3zzO7gGrKqvP2pF6zpXOsyQKvKQ", icon: "image" },
          { label: "Vídeos de conteúdo", url: "https://drive.google.com/drive/u/1/folders/15_YMcV7A7dowpTwVereLTtbIVWHh6BvF", icon: "video" },
          { label: "Conseguir seguidores", url: "https://drive.google.com/drive/u/1/folders/1UHbLDBuGbA-3YcGPuce7TVV1Ue7WOoyb", icon: "generic" },
        ],
      },
      {
        name: "Lembrete",
        items: [
          { label: "Fotos de lembrete", url: "https://drive.google.com/drive/u/1/folders/11dMOK9AxqaoEfKlyX3IY8A1K8iPHS1OH", icon: "image" },
          { label: "Vídeos de lembrete", url: "https://drive.google.com/drive/u/1/folders/15Cwqn9uNW-JmY-EtwrzI0uUOrEQSaXOH", icon: "video" },
        ],
      },
      {
        name: "Evento",
        items: [
          { label: "Fotos de aula liberada", url: "https://drive.google.com/drive/u/1/folders/1-Qz_YGuw43byOZ4kteRVWKDxdmpYfvrA", icon: "image" },
          { label: "Vídeos de aula liberada", url: "https://drive.google.com/drive/u/1/folders/1-QK49IyRGJCEidhrb41ILJwKWNAavgBg", icon: "video" },
        ],
      },
      {
        name: "Vagas abertas",
        items: [
          { label: "Fotos de vagas abertas", url: "https://drive.google.com/drive/u/1/folders/1-45yt0gBzoMdS-7K8hWGQ51tEXDFfg35", icon: "image" },
          { label: "Vídeos de vagas abertas", url: "https://drive.google.com/drive/u/1/folders/1xTRoBIkjscdjIKuYrpZ93wjhHuJN1Fru", icon: "video" },
          { label: "Página de vendas", url: "https://drive.google.com/drive/u/1/folders/1DtJl3aP8oMScbZ5QOOAl-b6FWi7eveiA", icon: "page" },
        ],
      },
    ],
  },
  {
    name: "E-commerces",
    icon: ShoppingCart,
    color: "text-emerald-600 dark:text-emerald-400",
    bgGradient: "from-emerald-500/10 to-emerald-600/5",
    titles: [],
  },
  {
    name: "Negócios Locais",
    icon: MapPin,
    color: "text-orange-600 dark:text-orange-400",
    bgGradient: "from-orange-500/10 to-orange-600/5",
    titles: [
      {
        name: "Página",
        items: [
          { label: "Página de lista de espera", url: "https://drive.google.com/drive/u/1/folders/1lbNE0BqKTf_3MhtVo6mSfBPEr0_ujNgA", icon: "page" },
          { label: "Página institucional", url: "https://drive.google.com/drive/u/1/folders/1_Y6HS-VAjdQh4UQ2C4y-fn6fJJFfFNfs", icon: "page" },
          { label: "Página de pré-inscrição", url: "https://drive.google.com/drive/folders/1LWoH9WFFhiXCkOM3BQ29Lqt7S_6awfbp", icon: "page" },
        ],
      },
      {
        name: "Conversão",
        items: [
          { label: "Fotos de captura", url: "https://drive.google.com/drive/folders/1-E9iUcwZ6f6TpCdaQq1cm-FoMpq-bQ9v", icon: "image" },
          { label: "Vídeos de captura", url: "https://drive.google.com/drive/u/1/folders/1OxTXYGIPrvenqHzTnC0ahVnziy9wSWEo", icon: "video" },
        ],
      },
      {
        name: "Distribuição de conteúdo",
        items: [
          { label: "Fotos de conteúdo", url: "https://drive.google.com/drive/u/1/folders/1HwwaO3zzO7gGrKqvP2pF6zpXOsyQKvKQ", icon: "image" },
          { label: "Vídeos de conteúdo", url: "https://drive.google.com/drive/u/1/folders/15_YMcV7A7dowpTwVereLTtbIVWHh6BvF", icon: "video" },
        ],
      },
    ],
  },
];

const titleIcons: Record<string, typeof Rocket> = {
  "Conversão": Rocket,
  "Distribuição de conteúdo": LayoutGrid,
  "Remarketing": Users,
  "Captura": Megaphone,
  "Lembrete": Bell,
  "Evento": CalendarCheck,
  "Vagas abertas": DoorOpen,
  "Página": Globe,
};

const SwipeFiles = () => {
  const [selectedCategory, setSelectedCategory] = useState<SwipeCategory | null>(null);

  return (
    <Layout>
      <div className="p-4 md:p-8 space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          {selectedCategory && (
            <Button variant="ghost" size="icon" onClick={() => setSelectedCategory(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {selectedCategory ? selectedCategory.name : "Swipe Files"}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {selectedCategory
                ? "Explore as ideias e referências desta categoria"
                : "Encontre ideias de criativos, landing pages, vídeos e muito mais"}
            </p>
          </div>
        </div>

        {!selectedCategory ? (
          /* ── Category Grid ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-3xl">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Card
                  key={cat.name}
                  className={`group cursor-pointer border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg bg-gradient-to-br ${cat.bgGradient}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <CardContent className="p-6 md:p-8 flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-background/80 shadow-sm ${cat.color}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cat.titles.length > 0
                          ? `${cat.titles.length} ${cat.titles.length === 1 ? "título" : "títulos"} disponíveis`
                          : "Em breve"}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {cat.titles.reduce((acc, t) => acc + t.items.length, 0)} itens
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : selectedCategory.titles.length === 0 ? (
          /* ── Empty Category ── */
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Em breve</h3>
              <p className="text-muted-foreground">
                Os conteúdos desta categoria estão sendo preparados.
              </p>
            </CardContent>
          </Card>
        ) : (
          /* ── Titles + Items ── */
          <div className="space-y-8">
            {selectedCategory.titles.map((title) => {
              const TitleIcon = titleIcons[title.name] || FileText;
              return (
                <div key={title.name} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-primary/10 ${selectedCategory.color}`}>
                      <TitleIcon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{title.name}</h2>
                    <Badge variant="outline" className="text-xs">
                      {title.items.length}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {title.items.map((item) => {
                      const ItemIcon = iconMap[item.icon];
                      return (
                        <a
                          key={item.label}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group"
                        >
                          <Card className="border-border/50 hover:border-primary/40 transition-all duration-200 hover:shadow-md">
                            <CardContent className="p-4 flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                                <ItemIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                              <span className="flex-1 text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                                {item.label}
                              </span>
                              <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </CardContent>
                          </Card>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SwipeFiles;
