import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { motion } from 'framer-motion';

const DEFAULT_SETTINGS = {
  heroTitle: 'Respira, conecta y transforma',
  heroSubtitle: 'Una experiencia de bienestar integral diseñada para elevar tu energía y encontrar la calma en el centro de tu ser. Bienvenidos a la comunidad Kukut.',
  heroImage: 'https://images.unsplash.com/photo-1599901860904-17e08c3a4cb1?q=80&w=2070&auto=format&fit=crop',
  philosophyTitle: 'Nuestra Filosofía',
  philosophyText: 'En Kukut Yoga, creemos que el verdadero bienestar nace de la perfecta armonía entre el cuerpo, la mente y el entorno. Hemos creado un santuario digital y físico donde el diseño minimalista se encuentra con prácticas milenarias.\n\nNuestra misión es acompañarte en tu viaje hacia el equilibrio interior, ofreciéndote herramientas y espacios que inspiran calma y elegancia.',
  philosophyImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1840&auto=format&fit=crop'
};

interface AdminHomeSettingsProps {
  onSuccess: () => void;
}

export function AdminHomeSettings({ onSuccess }: AdminHomeSettingsProps) {
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [heroImage, setHeroImage] = useState('');
  const [philosophyTitle, setPhilosophyTitle] = useState('');
  const [philosophyText, setPhilosophyText] = useState('');
  const [philosophyImage, setPhilosophyImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        const docRef = doc(db, 'settings', 'home');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setHeroTitle(data.heroTitle || DEFAULT_SETTINGS.heroTitle);
          setHeroSubtitle(data.heroSubtitle || DEFAULT_SETTINGS.heroSubtitle);
          setHeroImage(data.heroImage || DEFAULT_SETTINGS.heroImage);
          setPhilosophyTitle(data.philosophyTitle || DEFAULT_SETTINGS.philosophyTitle);
          setPhilosophyText(data.philosophyText || DEFAULT_SETTINGS.philosophyText);
          setPhilosophyImage(data.philosophyImage || DEFAULT_SETTINGS.philosophyImage);
        } else {
          setHeroTitle(DEFAULT_SETTINGS.heroTitle);
          setHeroSubtitle(DEFAULT_SETTINGS.heroSubtitle);
          setHeroImage(DEFAULT_SETTINGS.heroImage);
          setPhilosophyTitle(DEFAULT_SETTINGS.philosophyTitle);
          setPhilosophyText(DEFAULT_SETTINGS.philosophyText);
          setPhilosophyImage(DEFAULT_SETTINGS.philosophyImage);
        }
      } catch (err) {
        console.error("Error loading home settings:", err);
      } finally {
        setFetching(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const settingsData = {
      heroTitle,
      heroSubtitle,
      heroImage,
      philosophyTitle,
      philosophyText,
      philosophyImage,
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(doc(db, 'settings', 'home'), settingsData);
      alert("¡Ajustes de inicio guardados correctamente!");
      onSuccess();
    } catch (err: any) {
      console.error("Error saving home settings:", err);
      setError(err.message || 'Error al guardar los ajustes.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-salvia"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* HERO SECTION */}
        <div className="bg-marfil/40 p-6 rounded-3xl border border-arena/30 space-y-4">
          <h4 className="font-serif text-lg text-gris font-medium border-b border-arena pb-2">Sección Principal (Hero)</h4>
          
          <div className="space-y-1">
            <Label htmlFor="heroTitle" className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80">Título Principal (Home)</Label>
            <Input
              id="heroTitle"
              required
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              className="rounded-2xl border-none bg-white px-4 py-3 text-sm shadow-inner focus-visible:ring-1 focus-visible:ring-salvia"
              placeholder="Ej. Respira, conecta y transforma"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="heroSubtitle" className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80">Subtítulo Descriptivo</Label>
            <textarea
              id="heroSubtitle"
              required
              rows={3}
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              className="flex w-full rounded-2xl border-none bg-white px-4 py-3 text-sm shadow-inner focus-visible:ring-1 focus-visible:ring-salvia focus:outline-none"
              placeholder="Escribe la descripción corta del santuario..."
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="heroImage" className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80">URL Imagen de Fondo (Hero Wallpaper)</Label>
            <Input
              id="heroImage"
              required
              value={heroImage}
              onChange={(e) => setHeroImage(e.target.value)}
              className="rounded-2xl border-none bg-white px-4 py-3 text-sm shadow-inner focus-visible:ring-1 focus-visible:ring-salvia"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
        </div>

        {/* PHILOSOPHY SECTION */}
        <div className="bg-marfil/40 p-6 rounded-3xl border border-arena/30 space-y-4">
          <h4 className="font-serif text-lg text-gris font-medium border-b border-arena pb-2">Sección Filosofía</h4>
          
          <div className="space-y-1">
            <Label htmlFor="philosophyTitle" className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80">Título de la Sección</Label>
            <Input
              id="philosophyTitle"
              required
              value={philosophyTitle}
              onChange={(e) => setPhilosophyTitle(e.target.value)}
              className="rounded-2xl border-none bg-white px-4 py-3 text-sm shadow-inner focus-visible:ring-1 focus-visible:ring-salvia"
              placeholder="Ej. Nuestra Filosofía"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="philosophyText" className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80">Contenido del Texto</Label>
            <textarea
              id="philosophyText"
              required
              rows={4}
              value={philosophyText}
              onChange={(e) => setPhilosophyText(e.target.value)}
              className="flex w-full rounded-2xl border-none bg-white px-4 py-3 text-sm shadow-inner focus-visible:ring-1 focus-visible:ring-salvia focus:outline-none"
              placeholder="Escribe la filosofía de Kukut Yoga..."
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="philosophyImage" className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80">URL de la Imagen de Filosofía</Label>
            <Input
              id="philosophyImage"
              required
              value={philosophyImage}
              onChange={(e) => setPhilosophyImage(e.target.value)}
              className="rounded-2xl border-none bg-white px-4 py-3 text-sm shadow-inner focus-visible:ring-1 focus-visible:ring-salvia"
              placeholder="https://images.unsplash.com/..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="rounded-full bg-salvia px-8 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-salvia/90 shadow-md"
          >
            {loading ? 'Guardando Ajustes...' : 'Guardar Todos los Ajustes'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
