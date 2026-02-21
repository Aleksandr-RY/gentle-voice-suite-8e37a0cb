import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
    } catch (err: any) {
      toast({ title: "Ошибка при отправке", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="booking" className="py-20 bg-warm">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Записаться на приём</h2>
            <p className="text-muted-foreground">Оставьте заявку, и мы свяжемся с вами для подтверждения</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="parent_name">Имя родителя *</Label>
                <Input id="parent_name" value={form.parent_name} onChange={(e) => update("parent_name", e.target.value)} placeholder="Анна" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон *</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">+7</span>
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
                    className="rounded-l-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="anna@mail.ru" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="child_age">Возраст ребёнка</Label>
                <Input id="child_age" inputMode="numeric" value={form.child_age} onChange={(e) => update("child_age", e.target.value.replace(/\D/g, ""))} placeholder="5" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Проблема *</Label>
              <Select value={form.problem} onValueChange={(v) => update("problem", v)}>
                <SelectTrigger><SelectValue placeholder="Выберите проблему" /></SelectTrigger>
                <SelectContent>
                  {problems.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Предпочитаемое время</Label>
              <AvailabilityCalendar
                value={form.preferred_time}
                onChange={(v) => update("preferred_time", v)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Комментарий</Label>
              <Textarea id="comment" value={form.comment} onChange={(e) => update("comment", e.target.value)} placeholder="Дополнительная информация..." rows={3} />
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? "Отправка..." : "Отправить заявку"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;
