import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Send } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SettingsPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) navigate("/admin/login");
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-4">
        <Link to="/admin">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Назад</Button>
        </Link>
        <h1 className="font-display font-bold text-foreground">Настройки уведомлений</h1>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <Tabs defaultValue="telegram">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="telegram">Telegram</TabsTrigger>
            <TabsTrigger value="max">MAX</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
          </TabsList>

          <TabsContent value="telegram" className="bg-card rounded-xl border border-border p-6 mt-4 space-y-5">
            <h2 className="font-display font-bold text-lg text-foreground">Telegram Bot</h2>
            <div className="space-y-2">
              <Label>Bot Token</Label>
              <Input placeholder="123456789:ABCdefGhIjKlMnOpQrStUvWxYz" />
            </div>
            <div className="space-y-2">
              <Label>Chat ID</Label>
              <Input placeholder="-1001234567890" />
            </div>
            <div className="flex items-center gap-3">
              <Switch />
              <Label>Уведомления включены</Label>
            </div>
            <div className="flex gap-3">
              <Button><Send className="w-4 h-4 mr-1" /> Проверить подключение</Button>
              <Button variant="outline">Сохранить</Button>
            </div>
          </TabsContent>

          <TabsContent value="max" className="bg-card rounded-xl border border-border p-6 mt-4 space-y-5">
            <h2 className="font-display font-bold text-lg text-foreground">Мессенджер MAX</h2>
            <div className="space-y-2">
              <Label>API Token</Label>
              <Input placeholder="Токен доступа MAX API" />
            </div>
            <div className="space-y-2">
              <Label>ID чата</Label>
              <Input placeholder="ID чата для уведомлений" />
            </div>
            <div className="flex items-center gap-3">
              <Switch />
              <Label>Уведомления включены</Label>
            </div>
            <div className="flex gap-3">
              <Button><Send className="w-4 h-4 mr-1" /> Тест отправки</Button>
              <Button variant="outline">Сохранить</Button>
            </div>
          </TabsContent>

          <TabsContent value="email" className="bg-card rounded-xl border border-border p-6 mt-4 space-y-5">
            <h2 className="font-display font-bold text-lg text-foreground">Email уведомления</h2>
            <div className="space-y-2">
              <Label>Email администратора</Label>
              <Input type="email" placeholder="admin@logopedpro.ru" />
            </div>
            <div className="space-y-2">
              <Label>SMTP сервер</Label>
              <Input placeholder="smtp.mail.ru" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Порт</Label>
                <Input placeholder="587" />
              </div>
              <div className="space-y-2">
                <Label>Логин</Label>
                <Input placeholder="admin@logopedpro.ru" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Пароль SMTP</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="flex items-center gap-3">
              <Switch />
              <Label>Автоответ клиенту</Label>
            </div>
            <div className="flex gap-3">
              <Button><Send className="w-4 h-4 mr-1" /> Тест отправки</Button>
              <Button variant="outline">Сохранить</Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SettingsPage;
