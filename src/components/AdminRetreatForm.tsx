import { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { motion } from 'framer-motion';

interface Retreat {
  id?: string;
  title: string;
  location: string;
  date: string;
  price: string;
  image: string;
  description: string;
}

interface AdminRetreatFormProps {
  retreatToEdit?: Retreat | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AdminRetreatForm({ retreatToEdit, onSuccess, onCancel }: AdminRetreatFormProps) {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (retreatToEdit) {
      setTitle(retreatToEdit.title);
      setLocation(retreatToEdit.location);
      setDate(retreatToEdit.date);
      setPrice(retreatToEdit.price);
      setImage(retreatToEdit.image);
      setDescription(retreatToEdit.description);
    } else {
      setTitle('');
      setLocation('');
      setDate('');
      setPrice('');
      setImage('');
      setDescription('');
    }
  }, [retreatToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const retreatData = {
      title,
      location,
      date,
      price,
      image: image || 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070',
      description,
    };

    try {
      if (retreatToEdit && retreatToEdit.id) {
        const retreatRef = doc(db, 'retreats', retreatToEdit.id);
        await updateDoc(retreatRef, retreatData);
      } else {
        await addDoc(collection(db, 'retreats'), retreatData);
      }
      onSuccess();
    } catch (err: any) {
      console.error("Error saving retreat:", err);
      setError(err.message || 'Error al guardar el retiro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg rounded-[32px] border-[8px] border-white bg-arena shadow-xl p-8 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-bl-full pointer-events-none"></div>
      
      <h3 className="font-serif text-3xl text-gris mb-6 relative z-10">
        {retreatToEdit ? 'Editar Retiro' : 'Crear Nuevo Retiro'}
      </h3>

      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
        <div className="space-y-1">
          <Label htmlFor="title" className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80">Título del Retiro</Label>
          <Input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-2xl border-none bg-white px-4 py-3 text-sm shadow-inner focus-visible:ring-1 focus-visible:ring-salvia"
            placeholder="Ej. Retiro de Silencio en la Montaña"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="location" className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80">Ubicación</Label>
            <Input
              id="location"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-2xl border-none bg-white px-4 py-3 text-sm shadow-inner focus-visible:ring-1 focus-visible:ring-salvia"
              placeholder="Ej. Valle de Bravo, México"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="date" className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80">Fecha / Temporada</Label>
            <Input
              id="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-2xl border-none bg-white px-4 py-3 text-sm shadow-inner focus-visible:ring-1 focus-visible:ring-salvia"
              placeholder="Ej. 15-18 Noviembre"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label htmlFor="price" className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80">Precio</Label>
            <Input
              id="price"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="rounded-2xl border-none bg-white px-4 py-3 text-sm shadow-inner focus-visible:ring-1 focus-visible:ring-salvia"
              placeholder="Ej. $450 USD"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="image" className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80">URL de la Imagen</Label>
            <Input
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="rounded-2xl border-none bg-white px-4 py-3 text-sm shadow-inner focus-visible:ring-1 focus-visible:ring-salvia"
              placeholder="Ej. https://images.unsplash.com/..."
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80">Descripción</Label>
          <textarea
            id="description"
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex w-full rounded-2xl border-none bg-white px-4 py-3 text-sm shadow-inner focus-visible:ring-1 focus-visible:ring-salvia focus:outline-none"
            placeholder="Escribe los detalles y beneficios de este retiro..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="rounded-full border border-gris/20 px-6 py-2 text-xs font-bold uppercase tracking-widest text-gris hover:bg-white/50"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="rounded-full bg-salvia px-6 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-salvia/90 shadow-md"
          >
            {loading ? 'Guardando...' : 'Guardar Retiro'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
