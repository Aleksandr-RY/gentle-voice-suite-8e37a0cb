import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, FileText, Settings, Users, Calendar } from "lucide-react";
import HeroImageManager from "@/components/admin/HeroImageManager";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAdmin = async (userId: string) => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle();
      if (data) {
        setIsAdmin(true);
      } else {
        navigate("/admin/login");
      }
      setChecking(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate("/admin/login");
      } else {
        setUser(session.user);
        checkAdmin(session.user.id);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/admin/login");
      } else {
        setUser(session.user);
        checkAdmin(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (checking || !user || !isAdmin) return null;

  const cards = [
    { title: "Заявки", desc: "Управление входящими заявками", icon: FileText, color: "bg-coral-light text-primary", link: "/admin/applications" },
    { title: "Клиенты", desc: "База клиентов и история", icon: Users, color: "bg-sky-light text-accent" },
    { title: "Расписание", desc: "Настройка рабочих часов", icon: Calendar, color: "bg-coral-light text-primary", link: "/admin/schedule" },
    { title: "Настройки", desc: "Telegram, MAX, Email", icon: Settings, color: "bg-secondary text-secondary-foreground", link: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="font-display text-xl font-bold text-foreground">
          Логопед<span className="text-primary">Про</span>
          <span className="text-sm font-body font-normal text-muted-foreground ml-3">Админ</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Выйти
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-foreground">Панель управления</h1>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((c) => (
            <Link
              key={c.title}
              to={c.link || "/admin"}
              className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-lg ${c.color} flex items-center justify-center mb-4`}>
                <c.icon className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold mb-1 text-foreground">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </Link>
          ))}
        </div>

        <div className="mt-10">
          <HeroImageManager />
        </div>

        <div className="mt-6 bg-card rounded-xl border border-border p-6">
          <h2 className="font-display font-bold text-lg mb-4 text-foreground">Последние заявки</h2>
          <p className="text-muted-foreground text-sm">Заявки появятся здесь после создания таблицы в базе данных. Отправьте первую заявку через форму на сайте.</p>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
