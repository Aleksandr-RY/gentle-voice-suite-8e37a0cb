import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isRegister) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        toast({ title: "Ошибка регистрации", description: error.message, variant: "destructive" });
      } else {
        toast({
          title: "Регистрация успешна",
          description: "Проверьте почту для подтверждения email.",
        });
        setIsRegister(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Ошибка входа", description: error.message, variant: "destructive" });
      } else {
        navigate("/admin");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Логопед<span className="text-primary"> Голицыно</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            {isRegister ? "Регистрация администратора" : "Вход в панель управления"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-sm border border-border space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@logopedpro.ru" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" minLength={6} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Загрузка..." : isRegister ? "Зарегистрироваться" : "Войти"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {isRegister ? "Уже есть аккаунт?" : "Нет аккаунта?"}{" "}
            <button type="button" className="text-primary underline" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? "Войти" : "Зарегистрироваться"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
