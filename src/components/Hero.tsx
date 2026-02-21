import { useEffect, useState } from "react";
import heroImage from "@/assets/hero-image.jpg";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Hero = () => {
  const [images, setImages] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase
      .from("hero_images")
      .select("image_url")
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          setImages(data.map((d) => d.image_url));
        }
      });
  }, []);

  const displayImages = images.length > 0 ? images : [heroImage];

  const prev = () => setCurrent((c) => (c === 0 ? displayImages.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === displayImages.length - 1 ? 0 : c + 1));

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 bg-background overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
              Поможем вашему ребёнку говорить{" "}
              <span className="text-primary">уверенно</span> и правильно
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
              Индивидуальные занятия с дипломированным логопедом-дефектологом. Бережный подход и проверенные методики.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={() => scrollTo("booking")}>
                Записаться на диагностику
              </Button>
              <Button size="lg" variant="outline" onClick={() => {
                window.dispatchEvent(new CustomEvent("select-problem", { detail: "Консультация" }));
                scrollTo("booking");
              }}>
                Получить консультацию
              </Button>
            </div>
          </div>
          <div className="relative animate-fade-in mt-8 md:mt-0">
            <div className="rounded-2xl overflow-hidden shadow-2xl relative">
              <img
                src={displayImages[current]}
                alt="Логопедический кабинет"
                className="w-full h-auto object-cover aspect-[3/2] md:aspect-[4/5] transition-opacity duration-500"
              />
              {displayImages.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 rounded-full p-2 transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-foreground" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 hover:bg-background/90 rounded-full p-2 transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-foreground" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                    {displayImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrent(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${
                          i === current ? "bg-primary" : "bg-background/60"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
