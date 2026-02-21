import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground py-12">
    <div className="container mx-auto px-4">
      <div className="grid sm:grid-cols-3 gap-8 text-background/80">
        <div>
          <h3 className="font-display font-bold text-lg text-background mb-3">Логопед Голицыно</h3>
          <p className="text-sm">Профессиональная помощь детям с нарушениями речи</p>
        </div>
        <div>
          <h4 className="font-semibold text-background mb-3">Контакты</h4>
          <div className="space-y-2 text-sm">
            <a href="tel:+79061316205" className="flex items-center gap-2 hover:text-background transition-colors">
              <Phone className="w-4 h-4" /> +7 (906) 131-62-05
            </a>
            <a href="mailto:info@logopedpro.ru" className="flex items-center gap-2 hover:text-background transition-colors">
              <Mail className="w-4 h-4" /> info@logopedpro.ru
            </a>
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-background mb-3">Навигация</h4>
          <div className="space-y-2 text-sm">
            <button onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })} className="block hover:text-background transition-colors">О нас</button>
            <button onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })} className="block hover:text-background transition-colors">Услуги</button>
            <button onClick={() => document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" })} className="block hover:text-background transition-colors">Записаться</button>
          </div>
        </div>
      </div>
      <div className="border-t border-background/10 mt-8 pt-6 text-center text-background/50 text-sm">
        © 2025 Логопед Голицыно. Все права защищены.
      </div>
    </div>
  </footer>
);

export default Footer;
