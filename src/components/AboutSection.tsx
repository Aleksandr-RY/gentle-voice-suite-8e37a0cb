import { Award, Heart, BookOpen, Users } from "lucide-react";

const features = [
  { icon: Award, title: "Квалификация", desc: "Дипломированный логопед-дефектолог с многолетним опытом" },
  { icon: Heart, title: "Бережный подход", desc: "Создаём комфортную атмосферу для каждого ребёнка" },
  { icon: BookOpen, title: "Проверенные методики", desc: "Современные и классические методы коррекции речи" },
  { icon: Users, title: "Индивидуально", desc: "Программа занятий под уникальные потребности ребёнка" },
];

const AboutSection = () => (
  <section id="about" className="py-20 bg-warm">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Почему выбирают нас</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Профессиональная помощь детям с нарушениями речи в тёплой и дружественной обстановке
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div
            key={f.title}
            className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="w-12 h-12 rounded-lg bg-coral-light flex items-center justify-center mb-4">
              <f.icon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display font-bold text-lg mb-2 text-foreground">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default AboutSection;
