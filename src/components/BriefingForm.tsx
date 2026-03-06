import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, icons } from "lucide-react";
import {
  createEmptyBriefingAnswers,
  getBriefingSchema,
  type BriefingAnswers,
  type BriefingFieldDefinition,
  type ProductCategory,
} from "@/components/briefing/briefingSchemas";

export type BriefingResponses = BriefingAnswers;

interface BriefingFormProps {
  category: ProductCategory;
  onSubmit: (responses: BriefingResponses) => Promise<void>;
  saving?: boolean;
}

const AGREEMENT_TEXT = {
  title: "Antes de começar, um aviso rápido:",
  intro: "O que você escrever neste briefing será a base para todo o desenvolvimento do projeto. Cada decisão criativa, estratégia e entrega será guiada pelas informações que você fornecer aqui.",
  subtitle: "Por isso, vale a pena dedicar alguns minutos extras para responder com atenção.",
  points: [
    "Quanto mais claro e completo for o briefing, melhor será o resultado final.",
    "Respostas vagas ou incompletas podem gerar retrabalho e desalinhamentos.",
    "Este documento será usado como referência durante todo o projeto.",
    "Pense que você está nos ajudando a entender seu negócio da forma mais precisa possível.",
  ],
  footer: "Em resumo: quanto melhor o briefing, melhor o projeto.",
};

const FieldIcon = ({ name }: { name?: string }) => {
  if (!name) return null;
  const IconComp = (icons as Record<string, any>)[name];
  if (!IconComp) return null;
  return <IconComp className="h-5 w-5 text-primary shrink-0" />;
};

const BriefingForm = ({ category, onSubmit, saving }: BriefingFormProps) => {
  const schema = useMemo(() => getBriefingSchema(category), [category]);
  const [responses, setResponses] = useState<BriefingResponses>(() =>
    createEmptyBriefingAnswers(schema.fields),
  );
  const [agreed, setAgreed] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1); // -1 = agreement screen

  useEffect(() => {
    setResponses(createEmptyBriefingAnswers(schema.fields));
    setAgreed(false);
    setCurrentStep(-1);
  }, [schema]);

  const fields = schema.fields;
  const totalSteps = fields.length;
  const currentField = currentStep >= 0 ? fields[currentStep] : null;
  const progress = currentStep < 0 ? 0 : ((currentStep + 1) / totalSteps) * 100;

  const handleChange = (key: string, value: string) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const isCurrentFilled = () => {
    if (!currentField) return false;
    if (currentField.required === false) return true;
    return (responses[currentField.key] ?? "").trim().length > 0;
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    } else if (currentStep === 0) {
      setCurrentStep(-1);
    }
  };

  const isLastStep = currentStep === totalSteps - 1;

  const currentSection = currentField?.section;

  // ── Agreement screen ──
  if (currentStep === -1) {
    return (
      <div className="space-y-6 py-2 max-h-[60vh] overflow-y-auto pr-2">
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-warning shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-lg text-foreground">{AGREEMENT_TEXT.title}</h3>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{AGREEMENT_TEXT.intro}</p>
            </div>
          </div>

          <p className="text-sm font-semibold text-foreground">{AGREEMENT_TEXT.subtitle}</p>

          <ul className="space-y-2.5">
            {AGREEMENT_TEXT.points.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <p className="text-sm font-bold text-primary">{AGREEMENT_TEXT.footer}</p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none p-3 rounded-lg border border-border hover:border-primary/40 transition-colors">
          <Checkbox checked={agreed} onCheckedChange={(v) => setAgreed(v === true)} />
          <span className="text-sm font-medium text-foreground">
            Li e concordo com os termos acima. Vou preencher o briefing com atenção.
          </span>
        </label>

        <div className="flex justify-end">
          <Button onClick={() => setCurrentStep(0)} disabled={!agreed}>
            Iniciar Briefing <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  // ── Question step ──
  return (
    <div className="space-y-5 py-2">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {currentSection && (
            <span className="font-semibold text-primary text-xs uppercase tracking-wider">{currentSection}</span>
          )}
          <span>
            {currentStep + 1} / {totalSteps}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      {currentField && (
        <div className="space-y-4 min-h-[200px]">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 mt-0.5">
              <FieldIcon name={currentField.icon} />
            </div>
            <Label className="text-base font-semibold text-foreground leading-snug pt-2">
              {currentField.label}
              {(currentField.required ?? true) && <span className="text-destructive ml-1">*</span>}
            </Label>
          </div>

          <div className="pl-12">
            {currentField.type === "input" && (
              <Input
                placeholder={currentField.placeholder}
                value={responses[currentField.key] ?? ""}
                onChange={(e) => handleChange(currentField.key, e.target.value)}
                autoFocus
                className="text-base"
              />
            )}
            {currentField.type === "textarea" && (
              <Textarea
                placeholder={currentField.placeholder}
                value={responses[currentField.key] ?? ""}
                onChange={(e) => handleChange(currentField.key, e.target.value)}
                className="min-h-[120px] resize-y text-base"
                autoFocus
              />
            )}
            {currentField.type === "radio" && currentField.options && (
              <RadioGroup
                value={responses[currentField.key] ?? ""}
                onValueChange={(v) => handleChange(currentField.key, v)}
                className="space-y-2"
              >
                {currentField.options.map((opt) => (
                  <label
                    key={opt}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      responses[currentField.key] === opt
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <RadioGroupItem value={opt} />
                    <span className="text-sm text-foreground">{opt}</span>
                  </label>
                ))}
              </RadioGroup>
            )}
            {currentField.type === "checkbox" && currentField.options && (
              <div className="space-y-2">
                {currentField.options.map((opt) => {
                  const selectedValues = (responses[currentField.key] ?? "")
                    .split("||")
                    .filter(Boolean);
                  const isChecked = selectedValues.includes(opt);
                  return (
                    <label
                      key={opt}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isChecked
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const next = checked
                            ? [...selectedValues, opt]
                            : selectedValues.filter((v) => v !== opt);
                          handleChange(currentField.key, next.join("||"));
                        }}
                      />
                      <span className="text-sm text-foreground">{opt}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <Button variant="ghost" onClick={handlePrev} size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
        </Button>

        {isLastStep ? (
          <Button
            onClick={() => onSubmit(responses)}
            disabled={!isCurrentFilled() || saving}
            size="sm"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                Confirmar Briefing <CheckCircle2 className="h-4 w-4 ml-1" />
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            disabled={!isCurrentFilled()}
            size="sm"
          >
            Próxima <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default BriefingForm;
