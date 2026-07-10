import { useAuthStore, UserData } from '../store/authStore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { AdminClassForm } from '../components/AdminClassForm';
import { AdminRetreatForm } from '../components/AdminRetreatForm';
import { AdminHomeSettings } from '../components/AdminHomeSettings';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface YogaClass {
  id: string;
  title: string;
  instructor: string;
  level: string;
  capacity: number;
  date: string; // ISO string
  duration: number; // minutes
  featured?: boolean;
}

interface Retreat {
  id: string;
  title: string;
  location: string;
  date: string;
  price: string;
  image: string;
  description: string;
}

export function Dashboard() {
  const { user, userData, loading } = useAuthStore();
  const navigate = useNavigate();
  
  // State for Classes
  const [classes, setClasses] = useState<YogaClass[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [classToEdit, setClassToEdit] = useState<YogaClass | null>(null);

  // State for Retreats
  const [retreats, setRetreats] = useState<Retreat[]>([]);
  const [retreatsLoading, setRetreatsLoading] = useState(false);
  const [isRetreatFormOpen, setIsRetreatFormOpen] = useState(false);
  const [retreatToEdit, setRetreatToEdit] = useState<Retreat | null>(null);

  // State for Collaborators
  const [users, setUsers] = useState<UserData[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Active Admin Tab
  const [activeTab, setActiveTab] = useState<'classes' | 'retreats' | 'home' | 'users'>('classes');

  useEffect(() => {
    if (user) {
      console.log("Logged in user email:", user.email);
    }
  }, [user]);

  const fetchClasses = async () => {
    if (!userData || userData.role !== 'admin') return;
    setAdminLoading(true);
    try {
      const q = query(collection(db, 'classes'), orderBy('date'));
      const snapshot = await getDocs(q);
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as YogaClass));
      setClasses(fetched);
    } catch (err) {
      console.error("Error fetching classes for admin:", err);
    } finally {
      setAdminLoading(false);
    }
  };

  const fetchRetreats = async () => {
    if (!userData || userData.role !== 'admin') return;
    setRetreatsLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'retreats'));
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Retreat));
      setRetreats(fetched);
    } catch (err) {
      console.error("Error fetching retreats for admin:", err);
    } finally {
      setRetreatsLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (!userData || userData.role !== 'admin') return;
    setUsersLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const fetched = snapshot.docs.map(doc => doc.data() as UserData);
      setUsers(fetched);
    } catch (err) {
      console.error("Error fetching users for admin:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: 'student' | 'instructor' | 'admin') => {
    if (userId === userData.uid) {
      alert("No puedes cambiar tu propio rol.");
      return;
    }
    try {
      await setDoc(doc(db, 'users', userId), { role: newRole }, { merge: true });
      fetchUsers();
    } catch (err) {
      console.error("Error updating user role:", err);
      alert("No se pudo actualizar el rol del usuario.");
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (userData?.role === 'admin') {
      fetchClasses();
      fetchUsers();
      fetchRetreats();
    }
  }, [userData]);

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleDeleteClass = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta clase?")) return;
    try {
      await deleteDoc(doc(db, 'classes', id));
      fetchClasses();
    } catch (err) {
      console.error("Error deleting class:", err);
      alert("No se pudo eliminar la clase.");
    }
  };

  const handleDeleteRetreat = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este retiro?")) return;
    try {
      await deleteDoc(doc(db, 'retreats', id));
      fetchRetreats();
    } catch (err) {
      console.error("Error deleting retreat:", err);
      alert("No se pudo eliminar el retiro.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-marfil flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-salvia"></div>
          <p className="text-sm text-gris/70 font-medium font-serif">Cargando tu santuario...</p>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-marfil py-12 relative">
      {/* MODAL PARA CREAR/EDITAR CLASES */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <AdminClassForm
            classToEdit={classToEdit}
            onSuccess={() => {
              setIsFormOpen(false);
              setClassToEdit(null);
              fetchClasses();
            }}
            onCancel={() => {
              setIsFormOpen(false);
              setClassToEdit(null);
            }}
          />
        </div>
      )}

      {/* MODAL PARA CREAR/EDITAR RETIROS */}
      {isRetreatFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <AdminRetreatForm
            retreatToEdit={retreatToEdit}
            onSuccess={() => {
              setIsRetreatFormOpen(false);
              setRetreatToEdit(null);
              fetchRetreats();
            }}
            onCancel={() => {
              setIsRetreatFormOpen(false);
              setRetreatToEdit(null);
            }}
          />
        </div>
      )}

      <div className="container mx-auto px-4 md:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end"
        >
          <div>
            <span className="mb-2 block text-[10px] font-bold tracking-[0.3em] uppercase text-terracota">
              {userData.role === 'admin' ? 'Consola de Control' : 'Tu Santuario'}
            </span>
            <h1 className="mb-2 font-serif text-5xl font-medium text-gris">
              {userData.role === 'admin' ? 'Administración' : 'Mi Espacio'}
            </h1>
            <p className="text-lg text-gris/70">Hola, <span className="italic font-serif">{userData.name}</span>. Bienvenido a tu panel de control.</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="rounded-full border border-arena px-6 py-2 text-xs font-bold uppercase tracking-widest text-gris hover:bg-arena">
            Cerrar Sesión
          </Button>
        </motion.div>

        {/* TABS DE ADMINISTRACIÓN (SOLO ADMIN) */}
        {userData.role === 'admin' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 border-b border-arena/30 pb-6 mb-10 text-xs font-bold uppercase tracking-widest"
          >
            <button
              onClick={() => setActiveTab('classes')}
              className={`rounded-full px-8 py-3 transition-all ${
                activeTab === 'classes' ? 'bg-salvia text-white shadow-md' : 'bg-arena/40 text-gris/70 hover:bg-arena'
              }`}
            >
              Horarios & Clases
            </button>
            <button
              onClick={() => setActiveTab('retreats')}
              className={`rounded-full px-8 py-3 transition-all ${
                activeTab === 'retreats' ? 'bg-salvia text-white shadow-md' : 'bg-arena/40 text-gris/70 hover:bg-arena'
              }`}
            >
              Retiros
            </button>
            <button
              onClick={() => setActiveTab('home')}
              className={`rounded-full px-8 py-3 transition-all ${
                activeTab === 'home' ? 'bg-salvia text-white shadow-md' : 'bg-arena/40 text-gris/70 hover:bg-arena'
              }`}
            >
              Personalizar Inicio
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`rounded-full px-8 py-3 transition-all ${
                activeTab === 'users' ? 'bg-salvia text-white shadow-md' : 'bg-arena/40 text-gris/70 hover:bg-arena'
              }`}
            >
              Colaboradores
            </button>
          </motion.div>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          {/* COLUMNA PERFIL */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-1 space-y-8"
          >
            <Card className="rounded-[32px] border-[8px] border-white bg-arena shadow-xl">
              <CardHeader className="px-8 pt-8 pb-4 border-b border-white/50">
                <CardTitle className="font-serif text-2xl text-salvia">Mi Perfil</CardTitle>
              </CardHeader>
              <CardContent className="px-8 py-6 space-y-6 text-gris/80">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80 mb-1">Nombre</p>
                  <p className="font-medium text-lg">{userData.name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80 mb-1">Email</p>
                  <p className="font-medium">{userData.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-terracota opacity-80 mb-1">Rol de Cuenta</p>
                  <p className="font-medium capitalize">{userData.role}</p>
                </div>
                <Button className="w-full mt-4 rounded-full bg-salvia py-6 text-xs font-bold uppercase tracking-widest text-white hover:bg-salvia/90 shadow-md">
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>

            {userData.role !== 'admin' && (
              <Card className="rounded-[32px] border-[8px] border-white bg-terracota/10 shadow-xl overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-terracota/5 rounded-bl-full"></div>
                 <CardContent className="p-8 text-center relative z-10">
                     <h3 className="font-serif text-2xl font-bold text-terracota mb-8">Mi Progreso</h3>
                     <div className="flex justify-around">
                         <div className="space-y-2">
                             <p className="text-5xl font-light text-gris">12</p>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-terracota">Clases</p>
                         </div>
                         <div className="w-px bg-terracota/20"></div>
                         <div className="space-y-2">
                             <p className="text-5xl font-light text-gris">24</p>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-terracota">Horas</p>
                         </div>
                     </div>
                 </CardContent>
              </Card>
            )}
          </motion.div>

          {/* COLUMNA GESTIONES / CONTENIDOS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-2 space-y-8"
          >
            {/* TABS DE ADMINISTACIÓN CONTENIDO CONTRASTADO */}
            {userData.role === 'admin' && (
              <>
                {/* 1. GESTIÓN DE CLASES */}
                {activeTab === 'classes' && (
                  <Card className="rounded-[32px] border-[8px] border-white bg-white shadow-xl overflow-hidden">
                    <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="font-serif text-2xl text-gris">Gestión de Clases</CardTitle>
                        <p className="text-xs text-gris/60">Crea, edita, duplica o elimina horarios de yoga</p>
                      </div>
                      <Button 
                        onClick={() => {
                          setClassToEdit(null);
                          setIsFormOpen(true);
                        }}
                        className="rounded-full bg-salvia px-6 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-salvia/90 shadow-md"
                      >
                        Crear Clase
                      </Button>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                      {adminLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-salvia"></div>
                        </div>
                      ) : classes.length > 0 ? (
                        <div className="divide-y divide-gris/10 max-h-[450px] overflow-y-auto pr-2">
                          {classes.map((c) => (
                            <div key={c.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-serif text-lg text-gris font-medium">{c.title}</h4>
                                  {c.featured && (
                                    <span className="bg-salvia/20 text-salvia px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider">
                                      Destacada
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gris/70">
                                  <span className="font-bold text-terracota">{c.level}</span> • Guiado por {c.instructor} • {c.duration} min
                                </p>
                                <p className="text-xs text-gris/60 mt-1">
                                  {format(new Date(c.date), "EEEE d MMMM, HH:mm 'hs'", { locale: es })}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setClassToEdit(c);
                                    setIsFormOpen(true);
                                  }}
                                  className="rounded-full border border-arena px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gris hover:bg-arena"
                                >
                                  Editar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    const duplicate = { ...c, id: undefined } as any;
                                    setClassToEdit(duplicate);
                                    setIsFormOpen(true);
                                  }}
                                  className="rounded-full border border-arena px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gris hover:bg-arena"
                                >
                                  Duplicar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => handleDeleteClass(c.id)}
                                  className="rounded-full border border-red-200 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50"
                                >
                                  Eliminar
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gris/60 text-sm">
                          No hay clases creadas. Presiona "Crear Clase" para añadir una.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 2. GESTIÓN DE RETIROS */}
                {activeTab === 'retreats' && (
                  <Card className="rounded-[32px] border-[8px] border-white bg-white shadow-xl overflow-hidden">
                    <CardHeader className="px-8 pt-8 pb-4 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="font-serif text-2xl text-gris">Gestión de Retiros</CardTitle>
                        <p className="text-xs text-gris/60">Crea, edita o elimina salidas y retiros</p>
                      </div>
                      <Button 
                        onClick={() => {
                          setRetreatToEdit(null);
                          setIsRetreatFormOpen(true);
                        }}
                        className="rounded-full bg-salvia px-6 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-salvia/90 shadow-md"
                      >
                        Crear Retiro
                      </Button>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                      {retreatsLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-salvia"></div>
                        </div>
                      ) : retreats.length > 0 ? (
                        <div className="divide-y divide-gris/10 max-h-[450px] overflow-y-auto pr-2">
                          {retreats.map((r) => (
                            <div key={r.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div className="flex gap-4 items-center">
                                <img src={r.image} alt={r.title} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-arena" />
                                <div>
                                  <h4 className="font-serif text-lg text-gris font-medium">{r.title}</h4>
                                  <p className="text-xs text-gris/70">
                                    <span className="font-bold text-terracota">{r.location}</span> • {r.date} • <span className="text-salvia font-bold">{r.price}</span>
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  onClick={() => {
                                    setRetreatToEdit(r);
                                    setIsRetreatFormOpen(true);
                                  }}
                                  className="rounded-full border border-arena px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gris hover:bg-arena"
                                >
                                  Editar
                                </Button>
                                <Button 
                                  variant="outline" 
                                  onClick={() => handleDeleteRetreat(r.id)}
                                  className="rounded-full border border-red-200 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-50"
                                >
                                  Eliminar
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gris/60 text-sm">
                          No hay retiros registrados. Presiona "Crear Retiro" para añadir uno.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 3. PERSONALIZACIÓN DE INICIO */}
                {activeTab === 'home' && (
                  <Card className="rounded-[32px] border-[8px] border-white bg-white shadow-xl overflow-hidden">
                    <CardHeader className="px-8 pt-8 pb-4">
                      <CardTitle className="font-serif text-2xl text-gris">Diseño y Personalización de Inicio</CardTitle>
                      <p className="text-xs text-gris/60">Edita títulos, imágenes de fondo y descripciones principales de tu Home</p>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                      <AdminHomeSettings onSuccess={() => {}} />
                    </CardContent>
                  </Card>
                )}

                {/* 4. GESTIÓN DE COLABORADORES */}
                {activeTab === 'users' && (
                  <Card className="rounded-[32px] border-[8px] border-white bg-white shadow-xl overflow-hidden">
                    <CardHeader className="px-8 pt-8 pb-4">
                      <CardTitle className="font-serif text-2xl text-gris">Gestión de Colaboradores</CardTitle>
                      <p className="text-xs text-gris/60">Asigna roles administrativos a tus colaboradores</p>
                    </CardHeader>
                    <CardContent className="px-8 pb-8">
                      {usersLoading ? (
                        <div className="flex justify-center py-8">
                          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-salvia"></div>
                        </div>
                      ) : users.length > 0 ? (
                        <div className="divide-y divide-gris/10 max-h-[450px] overflow-y-auto pr-2">
                          {users.map((u) => (
                            <div key={u.uid} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                <h4 className="font-serif text-lg text-gris font-medium">{u.name || 'Usuario'}</h4>
                                <p className="text-xs text-gris/60">{u.email}</p>
                              </div>
                              <div>
                                <select
                                  value={u.role || 'student'}
                                  disabled={u.uid === userData.uid}
                                  onChange={(e) => handleUpdateRole(u.uid, e.target.value as 'student' | 'instructor' | 'admin')}
                                  className="rounded-full border border-arena bg-arena text-gris px-4 py-2 text-xs font-bold uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-salvia disabled:opacity-50"
                                >
                                  <option value="student">Alumno</option>
                                  <option value="instructor">Instructor</option>
                                  <option value="admin">Administrador</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gris/60 text-sm">
                          No hay usuarios registrados.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* VISTA ESTÁNDAR PARA ALUMNOS */}
            {userData.role !== 'admin' && (
              <>
                <Card className="rounded-[32px] border-[8px] border-white bg-white shadow-xl">
                  <CardHeader className="px-8 pt-8 pb-4">
                    <CardTitle className="font-serif text-2xl text-gris">Próximas Reservas</CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <div className="flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-arena bg-marfil/30 p-12 text-center text-gris/60">
                      <div className="w-16 h-16 rounded-full bg-arena flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-salvia">calendar_month</span>
                      </div>
                      <p className="text-lg">No tienes reservas próximas.</p>
                      <Button className="mt-6 rounded-full border border-salvia bg-transparent px-8 py-3 text-xs font-bold uppercase tracking-widest text-salvia hover:bg-salvia hover:text-white transition-colors" onClick={() => navigate('/schedule')}>
                        Explorar Clases
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="rounded-[32px] border-[8px] border-white bg-white shadow-xl">
                  <CardHeader className="px-8 pt-8 pb-4">
                    <CardTitle className="font-serif text-2xl text-gris">Biblioteca de Bienestar</CardTitle>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="group rounded-[24px] bg-arena p-8 cursor-pointer hover:bg-salvia/10 transition-colors border border-transparent hover:border-salvia/20">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4 text-salvia group-hover:scale-110 transition-transform">
                              ▶
                            </div>
                            <h4 className="font-serif text-xl text-gris mb-2">Meditación Guiada</h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-terracota">15 min • Calma</p>
                        </div>
                        <div className="group rounded-[24px] bg-arena p-8 cursor-pointer hover:bg-salvia/10 transition-colors border border-transparent hover:border-salvia/20">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-4 text-salvia group-hover:scale-110 transition-transform">
                              ▶
                            </div>
                            <h4 className="font-serif text-xl text-gris mb-2">Yoga para dormir</h4>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-terracota">30 min • Relajación</p>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
