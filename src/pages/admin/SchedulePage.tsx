import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";

const DAY_NAMES = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];

interface ScheduleRow {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_working_day: boolean;
  slot_duration_minutes: number;
}

const SchedulePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setRows] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/admin/login");
    });
  }, [navigate]);

  useEffect(() => {
    supabase
      .from("work_schedule")
      .select("*")
      .order("day_of_week")
      .then(({ data }) => {
        if (data) setRows(data as ScheduleRow[]);
        setLoading(false);
      });
  }, []);

  const updateRow = (idx: number, field: keyof ScheduleRow, value: any) => {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: value } : r)));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const row of rows) {
        const { error } = await supabase
          .from("work_schedule")
          .update({
            start_time: row.start_time,
            end_time: row.end_time,
            is_working_day: row.is_working_day,
            slot_duration_minutes: row.slot_duration_minutes,
          })
          .eq("id", row.id);
        if (error) throw error;
      }
      toast({ title: "Расписание сохранено!" });
    } catch (err: any) {
      toast({ title: "Ошибка", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="font-display text-xl font-bold text-foreground">
          Логопед<span className="text-primary">Про</span>
          <span className="text-sm font-body font-normal text-muted-foreground ml-3">Расписание</span>
        </Link>
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin")}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Назад
        </Button>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-2xl font-bold mb-6 text-foreground">Настройка расписания</h1>

        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          {rows.map((row, idx) => (
            <div
              key={row.id}
              className={cn(
                "flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border border-border",
                !row.is_working_day && "opacity-50"
              )}
            >
              <div className="flex items-center gap-3 min-w-[160px]">
                <Switch
                  checked={row.is_working_day}
                  onCheckedChange={(v) => updateRow(idx, "is_working_day", v)}
                />
                <Label className="font-medium text-foreground">{DAY_NAMES[row.day_of_week]}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={row.start_time}
                  onChange={(e) => updateRow(idx, "start_time", e.target.value)}
                  className="w-28"
                  disabled={!row.is_working_day}
                />
                <span className="text-muted-foreground">—</span>
                <Input
                  type="time"
                  value={row.end_time}
                  onChange={(e) => updateRow(idx, "end_time", e.target.value)}
                  className="w-28"
                  disabled={!row.is_working_day}
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={row.slot_duration_minutes}
                  onChange={(e) => updateRow(idx, "slot_duration_minutes", parseInt(e.target.value) || 45)}
                  className="w-20"
                  disabled={!row.is_working_day}
                  min={15}
                  max={120}
                />
                <span className="text-xs text-muted-foreground">мин</span>
              </div>
            </div>
          ))}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Сохранение..." : "Сохранить расписание"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SchedulePage;
