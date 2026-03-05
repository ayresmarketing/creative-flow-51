import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import {
  createEmptyBriefingAnswers,
  getBriefingSchema,
  type BriefingAnswers,
  type ProductCategory,
} from "@/components/briefing/briefingSchemas";

export type BriefingResponses = BriefingAnswers;

interface BriefingFormProps {
  category: ProductCategory;
  onSubmit: (responses: BriefingResponses) => Promise<void>;
  saving?: boolean;
}

const BriefingForm = ({ category, onSubmit, saving }: BriefingFormProps) => {
  const schema = useMemo(() => getBriefingSchema(category), [category]);
  const [responses, setResponses] = useState<BriefingResponses>(() =>
    createEmptyBriefingAnswers(schema.fields),
  );

  useEffect(() => {
    setResponses(createEmptyBriefingAnswers(schema.fields));
  }, [schema]);

  const handleChange = (key: string, value: string) => {
    setResponses((prev) => ({ ...prev, [key]: value }));
  };

  const allFilled = schema.fields.every((field) => {
    if (field.required === false) return true;
    return (responses[field.key] ?? "").trim().length > 0;
  });

  return (
    <ScrollArea className="max-h-[60vh] pr-4">
      <div className="space-y-5 pb-4">
        {schema.fields.map((field) => (
          <div key={field.key} className="space-y-1.5">
            <Label className="text-sm font-semibold text-foreground">
              {field.label} {(field.required ?? true) && <span className="text-destructive">*</span>}
            </Label>
            {field.type === "input" ? (
              <Input
                placeholder={field.placeholder}
                value={responses[field.key] ?? ""}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
            ) : (
              <Textarea
                placeholder={field.placeholder}
                value={responses[field.key] ?? ""}
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
