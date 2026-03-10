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
  Sparkles,
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
  accentColor: string;
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
    accentColor: "from-blue-500 to-blue-700",
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
    accentColor: "from-purple-500 to-purple-700",
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
    accentColor: "from-emerald-500 to-emerald-700",
    titles: [],
  },
  {
    name: "Negócios Locais",
    icon: MapPin,
    color: "text-orange-600 dark:text-orange-400",
    bgGradient: "from-orange-500/10 to-orange-600/5",
    accentColor: "from-orange-500 to-orange-700",
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
      <div className="p-4 md:p-8 min-h-[calc(100vh-3.5rem)] md:min-h-screen relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float-slow-reverse" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/3 to-purple-500/3 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8 md:mb-12 w-full max-w-4xl">
            {selectedCategory && (
              <Button variant="ghost" size="icon" onClick={() => setSelectedCategory(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {selectedCategory ? selectedCategory.name : "Swipe Files"}
                </h1>
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <p className="text-muted-foreground text-sm max-w-md mx-auto">
                {selectedCategory
                  ? "Explore as ideias e referências desta categoria"
                  : "Encontre ideias de criativos, landing pages, vídeos e muito mais"}
              </p>
            </div>
          </div>

          {!selectedCategory ? (
            /* ── Category Grid ── */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6 w-full max-w-3xl">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Card
                    key={cat.name}
                    className={`group cursor-pointer border-border/50 hover:border-border transition-all duration-500 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br ${cat.bgGradient} backdrop-blur-sm`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    <CardContent className="p-6 md:p-8 flex items-center gap-5">
                      <div className={`p-4 rounded-2xl bg-gradient-to-br ${cat.accentColor} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
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
                      <Badge variant="secondary" className="text-xs shrink-0 shadow-sm">
                        {cat.titles.reduce((acc, t) => acc + t.items.length, 0)} itens
                      </Badge>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : selectedCategory.titles.length === 0 ? (
            /* ── Empty Category ── */
            <Card className="border-dashed w-full max-w-3xl">
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
            <div className="space-y-8 w-full max-w-4xl">
              {selectedCategory.titles.map((title) => {
                const TitleIcon = titleIcons[title.name] || FileText;
                return (
                  <div key={title.name} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${selectedCategory.accentColor} text-white shadow-md`}>
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
                            className="group/item"
                          >
                            <Card className="border-border/50 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 backdrop-blur-sm">
                              <CardContent className="p-4 flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-muted group-hover/item:bg-primary/10 transition-colors">
                                  <ItemIcon className="h-5 w-5 text-muted-foreground group-hover/item:text-primary transition-colors" />
                                </div>
                                <span className="flex-1 text-sm font-medium text-foreground group-hover/item:text-primary transition-colors">
                                  {item.label}
                                </span>
                                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity" />
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
      </div>
    </Layout>
  );
};

export default SwipeFiles;
