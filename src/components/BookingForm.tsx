import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, CalendarDays, User } from "lucide-react";
import { cn } from "@/lib/utils";

const problems = [
  "Нарушение звукопроизношения",
  "Задержка речевого развития",
  "Заикание",
  "Дислексия / Дисграфия",
  "Общее недоразвитие речи",
  "Подготовка к школе",
  "Консультация",
  "Другое",
];

const BookingForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    parent_name: "",
    phone: "",
    email: "",
    child_age: "",
    problem: "",
    preferred_time: "",
    comment: "",
  });

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) update("problem", detail);
    };
    window.addEventListener("select-problem", handler);
    return () => window.removeEventListener("select-problem", handler);
  }, []);

  const handleNext = () => setStep(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.parent_name || !form.phone || !form.problem) {
      toast({ title: "Заполните обязательные поля", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.from("applications").insert({
        parent_name: form.parent_name,
        phone: `+7${form.phone.replace(/[^0-9]/g, "")}`,
        email: form.email || null,
        child_age: form.child_age || null,
        problem: form.problem,
        preferred_time: form.preferred_time || null,
        comment: form.comment || null,
      });
      if (error) throw error;
      toast({ title: "Заявка отправлена!", description: "Мы свяжемся с вами в ближайшее время." });
      setForm({ parent_name: "", phone: "", email: "", child_age: "", problem: "", preferred_time: "", comment: "" });
      setStep(1);
    } catch (err: any) {
      toast({ title: "Ошибка при отправке", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking" className="pt-20 pb-16 md:py-16 bg-warm">
      <div className="mx-auto px-4 sm:px-6 md:container md:px-4 pt-safe">
        <div className="max-w-lg md:mx-auto">
          <div className="text-center mb-6 md:mb-8 mt-2 md:mt-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 text-foreground">Записаться на приём</h2>
            <p className="text-sm text-muted-foreground">Оставьте заявку, и мы свяжемся с вами</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-5 md:mb-6">
            {[
              { num: 1, icon: User, label: "Данные" },
              { num: 2, icon: CalendarDays, label: "Дата" },
            ].map(({ num, icon: Icon, label }) => (
              <button
                key={num}
                type="button"
                onClick={() => setStep(num)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
                  step === num
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : step > num
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-sm border border-border">
            {/* Step 1 */}
            <div className={cn("space-y-4 transition-all duration-300 ease-in-out", step === 1 ? "opacity-100 translate-y-0" : "hidden opacity-0 translate-y-2")}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="parent_name" className="text-xs">Имя родителя *</Label>
                  <Input id="parent_name" value={form.parent_name} onChange={(e) => update("parent_name", e.target.value)} placeholder="Анна" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs">Телефон *</Label>
                  <div className="flex">
                    <span className="inline-flex items-center px-2.5 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-xs">+7</span>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                        let formatted = "";
                        if (digits.length > 0) formatted += "(" + digits.slice(0, 3);
                        if (digits.length >= 3) formatted += ")";
                        if (digits.length > 3) formatted += "-" + digits.slice(3, 6);
                        if (digits.length > 6) formatted += "-" + digits.slice(6, 8);
                        if (digits.length > 8) formatted += "-" + digits.slice(8, 10);
                        update("phone", formatted);
                      }}
                      placeholder="(___)-___-__-__"
                      className="rounded-l-none h-9 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="anna@mail.ru" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="child_age" className="text-xs">Возраст ребёнка</Label>
                  <Input id="child_age" inputMode="numeric" value={form.child_age} onChange={(e) => update("child_age", e.target.value.replace(/\D/g, ""))} placeholder="5" className="h-9 text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Проблема *</Label>
                <Select value={form.problem} onValueChange={(v) => update("problem", v)}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Выберите проблему" /></SelectTrigger>
                  <SelectContent>
                    {problems.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="comment" className="text-xs">Комментарий</Label>
                <Textarea id="comment" value={form.comment} onChange={(e) => update("comment", e.target.value)} placeholder="Дополнительная информация..." rows={2} className="text-sm resize-none" />
              </div>

              <Button type="button" size="default" className="w-full h-10" onClick={handleNext}>
                Выбрать дату и время
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Step 2 */}
            <div className={cn("space-y-4 transition-all duration-300 ease-in-out", step === 2 ? "opacity-100 translate-y-0" : "hidden opacity-0 translate-y-2")}>
              <AvailabilityCalendar
                value={form.preferred_time}
                onChange={(v) => update("preferred_time", v)}
              />

              <div className="flex gap-2 pt-1">
                <Button type="button" variant="outline" size="default" className="h-10" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Назад
                </Button>
                <Button type="submit" size="default" className="flex-1 h-10" disabled={loading}>
                  {loading ? "Отправка..." : "Отправить заявку"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;
