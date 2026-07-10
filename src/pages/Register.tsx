import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        name,
        email,
        role: 'student',
        createdAt: new Date().toISOString()
      });
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions')) {
        setError('Error de permisos en Firebase. Asegúrate de configurar las reglas de Firestore para permitir la escritura a los usuarios.');
      } else {
        setError(err.message || 'Error al registrarse');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-marfil px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-[32px] border-[8px] border-white bg-arena shadow-xl p-8 md:p-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-bl-full pointer-events-none"></div>
        
        <div className="mb-10 text-center relative z-10">
          <span className="mb-2 block text-[10px] font-bold tracking-[0.3em] uppercase text-terracota">Kukut Yoga</span>
          <h1 className="mb-3 font-serif text-4xl font-medium text-gris">Comienza</h1>
          <p className="text-sm text-gris/70">Crea tu cuenta en la comunidad</p>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-xs font-medium text-red-600 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6 relative z-10">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80">Nombre completo</Label>
            <Input 
              id="name" 
              required 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-2xl border-none bg-white px-6 py-6 text-sm shadow-inner focus-visible:ring-1 focus-visible:ring-salvia"
              placeholder="Tu nombre"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80">Correo electrónico</Label>
            <Input 
              id="email" 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-2xl border-none bg-white px-6 py-6 text-sm shadow-inner focus-visible:ring-1 focus-visible:ring-salvia"
              placeholder="tu@email.com"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80">Contraseña</Label>
            <Input 
              id="password" 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-2xl border-none bg-white px-6 py-6 text-sm shadow-inner focus-visible:ring-1 focus-visible:ring-salvia"
              placeholder="••••••••"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full rounded-full bg-salvia py-6 text-xs font-bold tracking-widest uppercase text-white hover:bg-salvia/90 shadow-md mt-6"
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>

        <p className="mt-8 text-center text-xs text-gris/70 relative z-10">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-bold text-salvia hover:text-salvia/80 transition-colors">
            INICIA SESIÓN
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
