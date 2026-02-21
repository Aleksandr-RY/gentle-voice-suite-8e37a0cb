import { MessageCircle, Brain, Mic, Puzzle } from "lucide-react";

const services = [
  { icon: MessageCircle, title: "Коррекция звукопроизношения", desc: "Постановка и автоматизация звуков, работа с дислалией" },
  { icon: Brain, title: "Развитие речи", desc: "Расширение словарного запаса, развитие связной речи" },
  { icon: Mic, title: "Логопедический массаж", desc: "Нормализация мышечного тонуса артикуляционного аппарата" },
  { icon: Puzzle, title: "Подготовка к школе", desc: "Обучение чтению, развитие фонематического слуха" },
];

const ServicesSection = () => (
  <section id="services" className="py-20">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Наши услуги</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Комплексная диагностика и коррекция речевых нарушений у детей
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {services.map((s) => (
          <div key={s.title} className="flex gap-4 p-6 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 shrink-0 rounded-lg bg-sky-light flex items-center justify-center">
              <s.icon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="font-display font-bold mb-1 text-foreground">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
