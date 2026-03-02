import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

export interface BriefingResponses {
  empresa: string;
  produto: string;
  transformacao: string;
  diferencial: string;
  cliente_ideal: string;
  maior_dor: string;
  tentativas_anteriores: string;
  desejo: string;
  frase_eu_ajudo: string;
  crencas_mitos: string;
  objecoes: string;
  preco_incluso: string;
  valor_resolver: string;
  garantia: string;
  bonus: string;
  concorrentes: string;
  urls_vendas: string;
  metodologias: string;
  produto_principal: string;
  ticket_medio: string;
}

const briefingFields: { key: keyof BriefingResponses; label: string; placeholder: string; type: "input" | "textarea" }[] = [
  { key: "empresa", label: "Nome da sua empresa", placeholder: "Ex: Ayres Marketing", type: "input" },
  { key: "produto", label: "1. Qual é o seu produto? O que exatamente você entrega?", placeholder: "Ex: Curso online de inglês para iniciantes com foco em conversação, com 12 módulos em vídeo, suporte via Telegram e material de apoio em PDF.", type: "textarea" },
  { key: "transformacao", label: "2. Qual é a principal transformação ou resultado que seu cliente terá ao comprar isso?", placeholder: "Ex: Falar inglês com segurança em até 3 meses, mesmo que comece do zero.", type: "textarea" },
  { key: "diferencial", label: "3. O que torna seu produto diferente dos concorrentes?", placeholder: "Ex: A única metodologia com foco em conversas reais, baseada em situações do cotidiano.", type: "textarea" },
  { key: "cliente_ideal", label: "4. Quem é o seu cliente ideal? (idade, profissão, localização, comportamento digital)", placeholder: "Ex: Mulheres de 30 a 45 anos, mães, que trabalham CLT ou empreendem.", type: "textarea" },
  { key: "maior_dor", label: "5. Qual é o maior problema ou dor que essa pessoa sente hoje?", placeholder: "Ex: Sente vergonha de falar inglês no trabalho e já perdeu promoções por isso.", type: "textarea" },
  { key: "tentativas_anteriores", label: "6. Quais tentativas anteriores essa pessoa já fez para resolver isso (e por que falharam)?", placeholder: "Ex: Já tentou 2 cursos online de inglês, mas achou as aulas chatas e sem acompanhamento.", type: "textarea" },
  { key: "desejo", label: "7. O que ela quer muito conquistar (mesmo que ainda não admita)?", placeholder: "Ex: Ser reconhecida no trabalho e se sentir inteligente falando inglês com fluência.", type: "textarea" },
  { key: "frase_eu_ajudo", label: '8. Complete a frase: "Eu ajudo [público] a [resultado específico] em [tempo] sem [sacrifício]"', placeholder: "Ex: Eu ajudo mães ocupadas a aprender inglês em 3 meses sem aulas cansativas ou decoreba.", type: "textarea" },
  { key: "crencas_mitos", label: "9. Quais crenças erradas ou mitos esse público acredita sobre o problema ou solução?", placeholder: "Ex: Que só é possível aprender inglês morando fora ou pagando caro por aulas particulares.", type: "textarea" },
  { key: "objecoes", label: "10. Quais são as 3 maiores objeções que você costuma ouvir na hora da venda?", placeholder: "Ex: Não tenho tempo / Já tentei e não funcionou / Não tenho dinheiro agora", type: "textarea" },
  { key: "preco_incluso", label: "11. Qual o preço atual do seu produto e o que está incluso?", placeholder: "Ex: R$497 à vista – inclui acesso vitalício ao curso, suporte em grupo e certificado.", type: "textarea" },
  { key: "valor_resolver", label: "12. Quanto vale para seu cliente resolver esse problema HOJE?", placeholder: "Ex: Perder uma promoção no trabalho por não falar inglês pode custar +R$5.000/ano.", type: "textarea" },
  { key: "garantia", label: "13. Existe alguma garantia ou promessa que você faz hoje?", placeholder: "Ex: Garantia incondicional de 7 dias.", type: "textarea" },
  { key: "bonus", label: "14. Que bônus você já oferece (ou poderia oferecer)?", placeholder: "Ex: Aulas ao vivo 1x/semana, Checklist de pronúncia, Grupo de Networking.", type: "textarea" },
  { key: "concorrentes", label: "15. Quais são os principais concorrentes e o que você acha que eles fazem bem ou mal?", placeholder: "Ex: O inglês do XCoach é muito bom tecnicamente, mas sem acompanhamento.", type: "textarea" },
  { key: "urls_vendas", label: "Coloque a URL das páginas de vendas de cada concorrente", placeholder: "https://...", type: "textarea" },
  { key: "metodologias", label: "Quais principais diferenciais que seu produto tem? Conte mais sobre suas metodologias.", placeholder: "Ex: Método ARC (Análise, Roteiro e Copy) — roteiro guiado + templates personalizáveis.", type: "textarea" },
  { key: "produto_principal", label: "Qual seu produto principal?", placeholder: "Aquele que você gostaria de focar se só tivesse uma opção.", type: "input" },
  { key: "ticket_medio", label: "Qual seu ticket médio?", placeholder: "Ex: R$497", type: "input" },
];

export { briefingFields };

interface BriefingFormProps {
  onSubmit: (responses: BriefingResponses) => Promise<void>;
  saving?: boolean;
}

const emptyResponses = (): BriefingResponses =>
  Object.fromEntries(briefingFields.map((f) => [f.key, ""])) as unknown as BriefingResponses;

const BriefingForm = ({ onSubmit, saving }: BriefingFormProps) => {
  const [responses, setResponses] = useState<BriefingResponses>(emptyResponses());

  const handleChange = (key: keyof BriefingResponses, value: string) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const allFilled = briefingFields.every((f) => responses[f.key].trim().length > 0);

  return (
    <ScrollArea className="max-h-[60vh] pr-4">
      <div className="space-y-5 pb-4">
        {briefingFields.map((field, i) => (
          <div key={field.key} className="space-y-1.5">
            <Label className="text-sm font-semibold text-foreground">
              {field.label} <span className="text-destructive">*</span>
            </Label>
            {field.type === "input" ? (
              <Input
                placeholder={field.placeholder}
                value={responses[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            ) : (
              <Textarea
                placeholder={field.placeholder}
                value={responses[field.key]}
                onChange={(e) => handleChange(field.key, e.target.value)}
                className="min-h-[80px] resize-y"
              />
            )}
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <Button onClick={() => onSubmit(responses)} disabled={!allFilled || saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...
              </>
            ) : (
              "Confirmar Briefing e Criar Produto"
            )}
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};

export default BriefingForm;
