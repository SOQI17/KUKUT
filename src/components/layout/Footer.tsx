import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="shrink-0 border-t border-arena bg-white/50 px-4 py-8 md:px-12 md:h-48 md:flex md:gap-8">
      <div className="mb-8 md:mb-0 md:w-1/4 space-y-4">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 text-gris">Clases Destacadas</h3>
        <Link to="/schedule" className="flex items-center gap-4 group cursor-pointer">
          <div className="w-16 h-16 bg-salvia/20 rounded-xl overflow-hidden shrink-0 relative">
            <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=200&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-50" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gris">Vinyasa Flow</p>
            <p className="text-xs text-gris/60">Intermedio • 60 min</p>
          </div>
        </Link>
      </div>
      <div className="mb-8 md:mb-0 md:w-1/4 space-y-4">
        <div className="hidden md:block invisible text-[10px] uppercase tracking-widest opacity-40">-</div>
        <Link to="/schedule" className="flex items-center gap-4 group cursor-pointer">
          <div className="w-16 h-16 bg-terracota/20 rounded-xl overflow-hidden shrink-0 relative">
             <img src="https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?q=80&w=200&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-50" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gris">Meditación Zen</p>
            <p className="text-xs text-gris/60">Todos los niveles • 30 min</p>
          </div>
        </Link>
      </div>
      <div className="md:w-2/4 bg-salvia/10 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 md:gap-6">
          <div className="w-12 h-12 bg-salvia rounded-full flex shrink-0 items-center justify-center text-white text-xl">◈</div>
          <div>
            <h4 className="font-serif text-lg text-gris">Próximo Retiro: Valle Sagrado</h4>
            <p className="text-xs text-gris/60">Cusco, Perú • 12 - 18 de Octubre, 2024</p>
          </div>
        </div>
        <Link to="/retreats" className="shrink-0 bg-white text-salvia px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm hover:shadow-md transition-shadow">
          Reservar Cupo
        </Link>
      </div>
    </footer>
  );
}
