import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Clock,
  Star,
  Download
} from "lucide-react";

const Reports = () => {
  const mockData = [
    {
      code: "ADV0003",
      product: "Tênis Esportivo Pro",
      objective: "Vendas",
      spend: "R$ 2.450,00",
      clicks: 1240,
      cpc: "R$ 1,98",
      ctr: "3.2%",
      retention: "65%",
      hook: "78%",
      score: 9.2
    },
    {
      code: "ADF0007", 
      product: "Linha Premium Skincare",
      objective: "Remarketing",
      spend: "R$ 1.890,00",
      clicks: 980,
      cpc: "R$ 1,93",
      ctr: "2.8%",
      retention: "58%",
      hook: "82%",
      score: 8.7
    }
  ];

  return (
    <Layout>
      <div className="p-8 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
            <p className="text-muted-foreground mt-1">
              Performance dos melhores criativos
            </p>
          </div>
          <Button className="hub-shadow gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {[
            { icon: BarChart3, label: "Total Investido", value: "R$ 12.450", color: "primary" },
            { icon: MousePointer, label: "Total Cliques", value: "8.240", color: "success" },
            { icon: TrendingUp, label: "CPC Médio", value: "R$ 1,95", color: "warning" },
            { icon: Star, label: "Score Médio", value: "8.9", color: "primary" }
          ].map((stat, index) => (
            <Card key={index} className="hub-card-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-${stat.color}/10 rounded-lg`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="hub-card-shadow">
          <CardHeader>
            <CardTitle>Top Criativos por Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.map((creative, index) => (
                <div key={creative.code} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge className="w-8 h-8 rounded-full flex items-center justify-center">
                        #{index + 1}
                      </Badge>
                      <div>
                        <p className="font-semibold">{creative.code}</p>
                        <p className="text-sm text-muted-foreground">{creative.product}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-warning" />
                      <span className="font-bold text-success">{creative.score}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Investido</p>
                      <p className="font-semibold">{creative.spend}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Cliques</p>
                      <p className="font-semibold">{creative.clicks}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CPC</p>
                      <p className="font-semibold">{creative.cpc}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CTR</p>
                      <p className="font-semibold text-success">{creative.ctr}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Retenção</p>
                      <p className="font-semibold">{creative.retention}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Gancho</p>
                      <p className="font-semibold">{creative.hook}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;