import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';

interface Retreat {
  id: string;
  title: string;
  location: string;
  date: string;
  price: string;
  image: string;
  description: string;
}

const DEFAULT_RETREATS = [
  {
    title: 'Retiro de Silencio en la Montaña',
    location: 'Valle de Bravo, México',
    date: '15-18 Noviembre',
    price: '$450 USD',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop',
    description: 'Desconecta del ruido y reconecta con tu esencia en este retiro inmersivo de 4 días.'
  },
  {
    title: 'Yoga & Surf Camp',
    location: 'Sayulita, Nayarit',
    date: '5-10 Diciembre',
    price: '$850 USD',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop',
    description: 'Combina la energía del océano con la fluidez del vinyasa yoga.'
  }
];

export function Retreats() {
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRetreats() {
      try {
        const snapshot = await getDocs(collection(db, 'retreats'));
        if (snapshot.empty) {
          // Seed default retreats
          const seeded: Retreat[] = [];
          for (const r of DEFAULT_RETREATS) {
            const docRef = await addDoc(collection(db, 'retreats'), r);
            seeded.push({ id: docRef.id, ...r });
          }
          setRetreats(seeded);
        } else {
          const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Retreat));
          setRetreats(fetched);
        }
      } catch (err) {
        console.error("Error loading retreats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRetreats();
  }, []);

  return (
    <div className="min-h-screen bg-marfil py-16">
      <div className="container mx-auto px-4 md:px-12">
        <div className="mb-16 text-center">
          <span className="mb-4 block text-[10px] font-bold tracking-[0.3em] uppercase text-terracota">Explora</span>
          <h1 className="mb-6 font-serif text-5xl font-medium text-gris md:text-6xl">Salidas y Retiros</h1>
          <p className="mx-auto max-w-2xl text-lg text-gris/80 leading-relaxed">
            Experiencias inmersivas diseñadas para profundizar tu práctica y conectar con la naturaleza de forma auténtica.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-salvia"></div>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-2">
            {retreats.map((retreat, i) => (
              <motion.div
                key={retreat.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
              >
                <Card className="overflow-hidden rounded-[40px] border-[12px] border-white bg-arena shadow-2xl">
                  <div className="relative h-64 md:h-80 overflow-hidden rounded-t-[28px]">
                    <img src={retreat.image} alt={retreat.title} className="h-full w-full object-cover hover:scale-105 transition-transform duration-1000" />
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-salvia shadow-sm">
                      {retreat.price}
                    </div>
                  </div>
                  <CardHeader className="px-8 pt-8 pb-4">
                    <CardTitle className="font-serif text-3xl text-gris">{retreat.title}</CardTitle>
                    <p className="text-terracota font-medium text-sm tracking-wide uppercase mt-2">{retreat.location} • {retreat.date}</p>
                  </CardHeader>
                  <CardContent className="px-8 pb-8 space-y-8">
                    <p className="text-gris/70 leading-relaxed text-lg">
                      {retreat.description}
                    </p>
                    <Button className="w-full rounded-full bg-salvia py-6 text-xs font-bold uppercase tracking-widest text-white hover:bg-gris transition-colors shadow-lg">
                      Ver Detalles y Reservar
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
