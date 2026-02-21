import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-xl font-bold text-foreground">Логопед <span className="text-primary">Голицыно</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => scrollTo("about")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">О нас</button>
          <button onClick={() => scrollTo("services")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Услуги</button>
          <button onClick={() => scrollTo("booking")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Записаться</button>
          <a href="tel:+79061316205" className="flex items-center gap-1.5 text-sm font-medium text-primary">
            <Phone className="w-4 h-4" />
            +7 (906) 131-62-05
          </a>
          <Button size="sm" onClick={() => scrollTo("booking")}>Записаться</Button>
        </div>

        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-background border-b border-border px-4 pb-4 space-y-3">
          <button onClick={() => scrollTo("about")} className="block text-sm font-medium text-muted-foreground">О нас</button>
          <button onClick={() => scrollTo("services")} className="block text-sm font-medium text-muted-foreground">Услуги</button>
          <button onClick={() => scrollTo("booking")} className="block text-sm font-medium text-muted-foreground">Записаться</button>
          <Button size="sm" className="w-full" onClick={() => scrollTo("booking")}>Записаться</Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
