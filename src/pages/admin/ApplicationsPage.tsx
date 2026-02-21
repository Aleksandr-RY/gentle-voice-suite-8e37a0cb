import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, Mail, MessageSquare, Clock, Baby, AlertCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppStatus = Database["public"]["Enums"]["app_status"];
type Application = Database["public"]["Tables"]["applications"]["Row"];

const statusLabels: Record<AppStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  completed: "Завершена",
  rejected: "Отказ",
};

const statusColors: Record<AppStatus, string> = {
  new: "bg-sky-light text-accent",
  in_progress: "bg-coral-light text-primary",
  completed: "bg-secondary text-secondary-foreground",
  rejected: "bg-destructive/10 text-destructive",
};

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [commentDraft, setCommentDraft] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/admin/login");
    });
  }, [navigate]);

  const fetchApps = async () => {
    const { data } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setApps(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const updateStatus = async (id: string, status: AppStatus) => {
    await supabase.from("applications").update({ status }).eq("id", id);
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const saveComment = async (id: string) => {
    await supabase.from("applications").update({ admin_comment: commentDraft }).eq("id", id);
    setApps((prev) => prev.map((a) => (a.id === id ? { ...a, admin_comment: commentDraft } : a)));
    setCommentDraft("");
  };

  const toggleExpand = (id: string, currentComment: string | null) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      setCommentDraft(currentComment || "");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Загрузка...</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin"><ArrowLeft className="w-4 h-4 mr-1" /> Назад</Link>
        </Button>
        <h1 className="font-display font-bold text-lg text-foreground">Заявки ({apps.length})</h1>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-4">
        {apps.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Заявок пока нет</p>
        )}

        {apps.map((app) => (
          <div key={app.id} className="bg-card rounded-xl border border-border p-4 md:p-6 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-foreground text-lg">{app.parent_name}</h3>
                <p className="text-xs text-muted-foreground">{formatDate(app.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColors[app.status]}>{statusLabels[app.status]}</Badge>
                <Select value={app.status} onValueChange={(v) => updateStatus(app.id, v as AppStatus)}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(statusLabels) as AppStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center gap-2 text-foreground">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                <a href={`tel:${app.phone}`} className="hover:underline">{app.phone}</a>
              </div>
              {app.email && (
                <div className="flex items-center gap-2 text-foreground">
                  <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                  <a href={`mailto:${app.email}`} className="hover:underline">{app.email}</a>
                </div>
              )}
              <div className="flex items-center gap-2 text-foreground">
                <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                {app.problem}
              </div>
              {app.child_age && (
                <div className="flex items-center gap-2 text-foreground">
                  <Baby className="w-4 h-4 text-muted-foreground shrink-0" />
                  Возраст: {app.child_age}
                </div>
              )}
              {app.preferred_time && (
                <div className="flex items-center gap-2 text-foreground">
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  {app.preferred_time}
                </div>
              )}
              {app.comment && (
                <div className="flex items-center gap-2 text-foreground sm:col-span-2 lg:col-span-3">
                  <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                  {app.comment}
                </div>
              )}
            </div>

            <button
              onClick={() => toggleExpand(app.id, app.admin_comment)}
              className="text-xs text-primary hover:underline"
            >
              {expandedId === app.id ? "Скрыть" : "Комментарий администратора"}
            </button>

            {expandedId === app.id && (
              <div className="space-y-2 pt-2 border-t border-border">
                <Textarea
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Комментарий..."
                  rows={2}
                />
                <Button size="sm" onClick={() => saveComment(app.id)}>Сохранить</Button>
              </div>
            )}
          </div>
        ))}
      </main>
    </div>
  );
};

export default ApplicationsPage;
