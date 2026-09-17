import React, { useState, useEffect, createContext, useContext, Component, useRef } from 'react';
import { 
  Home, 
  Receipt, 
  Refrigerator, 
  Package, 
  Wrench, 
  Plus, 
  Trash2, 
  Edit2,
  ChevronDown,
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  Settings as SettingsIcon,
  Palette,
  Check,
  X,
  Calendar as CalendarIcon,
  Minus,
  LogIn,
  LogOut,
  User as UserIcon,
  Apple,
  Coffee,
  Milk,
  Beef,
  Fish,
  Carrot,
  Egg,
  Soup,
  Pizza,
  Cake,
  IceCream,
  Beer,
  Wine,
  Utensils,
  ShoppingBag,
  Pill,
  Heart,
  Stethoscope,
  Dog,
  Cat,
  Baby,
  Shirt,
  Watch,
  Smartphone,
  Laptop,
  Tv,
  Gamepad,
  Headphones,
  Camera,
  Printer,
  Car,
  Umbrella,
  Sun,
  Lamp,
  Bed,
  Bath,
  Brush,
  Paintbrush,
  Hammer,
  Lightbulb,
  Plug,
  Trash,
  Flower,
  Dumbbell,
  Gift,
  Search,
  Bell
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  format, 
  isSameMonth, 
  isSameYear,
  parseISO,
  addMonths,
  subMonths,
  addYears,
  subYears,
  subDays,
  isWithinInterval,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  subWeeks,
  addWeeks
} from 'date-fns';
import { th } from 'date-fns/locale';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  onSnapshot, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  doc, 
  query, 
  where,
  getDocFromServer
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  setPersistence,
  browserLocalPersistence,
  User
} from 'firebase/auth';
import { db, auth } from './firebase';
import { cn } from './lib/utils';
import { 
  Expense, 
  FridgeItem, 
  SupplyItem, 
  MaintenanceTask, 
  UserSettings, 
  Category,
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_FRIDGE_CATEGORIES,
  DEFAULT_SUPPLY_CATEGORIES
} from './types';

// --- Icon Library ---
const ICON_MAP: Record<string, any> = {
  Refrigerator, Package, Wrench, Apple, Coffee, Milk, Beef, Fish, Carrot, Egg, Soup, Pizza, Cake, IceCream, Beer, Wine, Utensils, ShoppingBag, Pill, Heart, Stethoscope, Dog, Cat, Baby, Shirt, Watch, Smartphone, Laptop, Tv, Gamepad, Headphones, Camera, Printer, Car, Umbrella, Sun, Lamp, Bed, Bath, Brush, Paintbrush, Hammer, Lightbulb, Plug, Trash, Flower, Dumbbell, Gift
};

const ICON_OPTIONS = Object.keys(ICON_MAP).map(key => ({
  id: key,
  Icon: ICON_MAP[key]
}));

function getIcon(id: string | undefined, size = 24, className = "") {
  const IconComponent = id && ICON_MAP[id] ? ICON_MAP[id] : Home;
  return <IconComponent size={size} className={className} />;
}

function IconPicker({ selected, onSelect, compact = false }: { selected: string | undefined, onSelect: (id: string) => void, compact?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const filtered = ICON_OPTIONS.filter(opt => opt.id.toLowerCase().includes(search.toLowerCase()));
  const SelectedIcon = ICON_OPTIONS.find(opt => opt.id === selected)?.Icon || Package;

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center justify-between bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all",
          compact ? "w-14 h-14 rounded-2xl justify-center" : "w-full p-4 rounded-2xl"
        )}
      >
        {compact ? (
          <div className="text-indigo-600">
            <SelectedIcon size={28} />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                <SelectedIcon size={28} />
              </div>
              <span className="font-bold text-slate-700 text-lg">{selected || 'เลือกไอคอน'}</span>
            </div>
            <ChevronDown className={cn("text-slate-400 transition-transform", isOpen && "rotate-180")} size={24} />
          </>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">เลือกไอคอน</h3>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                <X size={16} />
              </button>
            </div>
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="ค้นหาไอคอน..." 
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 font-bold"
                />
              </div>
            </div>
            <div className="p-4 overflow-y-auto grid grid-cols-4 gap-3">
              {filtered.map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onSelect(opt.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "aspect-square rounded-2xl flex items-center justify-center transition-all border",
                    selected === opt.id 
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200" 
                      : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-indigo-50 hover:text-indigo-600"
                  )}
                  title={opt.id}
                >
                  <opt.Icon size={32} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// --- B.E. Year Helpers ---
const toBE = (date: Date | string | number) => {
  const d = new Date(date);
  return d.getFullYear() + 543;
};

const formatBE = (date: Date | string, formatStr: string) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  let formatted = format(d, formatStr, { locale: th });
  // Replace year with B.E. year if it contains yyyy
  const year = d.getFullYear().toString();
  const beYear = (d.getFullYear() + 543).toString();
  return formatted.replace(new RegExp(year, 'g'), beYear);
};

// --- Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  toast.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
  throw new Error(JSON.stringify(errInfo));
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let message = "ขออภัย เกิดข้อผิดพลาดบางอย่าง";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error.includes("insufficient permissions")) {
          message = "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้ กรุณาตรวจสอบการเข้าสู่ระบบ";
        }
      } catch (e) {
        // Not a JSON error
      }
      return (
        <div className="min-h-screen flex items-center justify-center bg-sky-50 p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center">
            <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-2xl font-serif italic mb-4 text-sky-900">เกิดข้อผิดพลาด</h2>
            <p className="text-slate-600 mb-6">{message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-sky-600 text-white px-6 py-2 rounded-xl"
            >
              โหลดหน้าใหม่
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Auth Context ---
const AuthContext = createContext<{ 
  user: User | null, 
  loading: boolean,
  settings: UserSettings | null,
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>
}>({ 
  user: null, 
  loading: true,
  settings: null,
  updateSettings: async () => {}
});

import { Toaster, toast } from 'sonner';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState<UserSettings | null>(null);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!user) return;
    const updated = { ...settings, ...newSettings } as UserSettings;
    setSettings(updated);
    try {
      await updateDoc(doc(db, 'users', user.uid), { settings: updated });
    } catch (err) {
      console.error("Failed to update settings", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Create/Update user document
        try {
          const userRef = doc(db, 'users', u.uid);
          // Use getDocFromServer to avoid cache issues
          const userSnap = await getDocFromServer(userRef);
          if (!userSnap.exists()) {
            const initialSettings: UserSettings = {
              expenseCategories: DEFAULT_EXPENSE_CATEGORIES,
              fridgeCategories: DEFAULT_FRIDGE_CATEGORIES,
              supplyCategories: DEFAULT_SUPPLY_CATEGORIES
            };
            await setDoc(userRef, {
              uid: u.uid,
              displayName: u.displayName,
              email: u.email,
              photoURL: u.photoURL,
              role: 'user', // Default role
              createdAt: new Date().toISOString(),
              settings: initialSettings
            });
            setSettings(initialSettings);
          } else {
            const data = userSnap.data();
            setSettings(data.settings || {
              expenseCategories: DEFAULT_EXPENSE_CATEGORIES,
              fridgeCategories: DEFAULT_FRIDGE_CATEGORIES,
              supplyCategories: DEFAULT_SUPPLY_CATEGORIES
            });
          }
        } catch (err) {
          // Ignore if it fails (might be permission issue if not owner, but here it's the owner)
          console.warn("Could not sync user profile", err);
        }
      } else {
        setSettings(null);
      }
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Test connection
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sky-50">
        <div className="animate-pulse text-sky-600 font-serif italic text-xl">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ user, loading, settings, updateSettings }}>
        <Toaster position="top-center" richColors />
        {user ? <MainApp /> : <LoginScreen />}
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}

function LoginScreen() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setErrorMsg(null);
    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Login failed", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setErrorMsg("การล็อกอินถูกยกเลิก หรือเบราว์เซอร์บล็อกหน้าต่างป๊อปอัป หากคุณใช้งานผ่านมือถือ (เช่น เปิดจากแอปอื่น) แนะนำให้กด 'เปิดในเบราว์เซอร์' (Safari/Chrome) แล้วลองใหม่อีกครั้งครับ");
      } else {
        setErrorMsg("เกิดข้อผิดพลาดในการล็อกอิน: " + (error.message || "Unknown error"));
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-sky-50 flex items-center justify-center p-4">
      <div className="bg-white p-12 rounded-[40px] shadow-2xl shadow-sky-200/50 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-sky-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-sky-200">
          <Home size={40} />
        </div>
        <h1 className="text-4xl font-serif font-bold italic text-sky-900 mb-4">บ้านของเรา</h1>
        <p className="text-slate-500 mb-10">แอพบันทึกรายจ่ายและจัดการของใช้ในบ้าน สำหรับครอบครัว</p>
        
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-2xl border border-red-100">
            {errorMsg}
          </div>
        )}

        <button 
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full bg-white border-2 border-sky-100 text-slate-700 font-medium py-4 rounded-2xl flex items-center justify-center gap-3 hover:bg-sky-50 transition-all shadow-sm disabled:opacity-50"
        >
          {isLoggingIn ? (
            <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          )}
          {isLoggingIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}
        </button>

        <footer className="mt-8 text-center text-xs text-slate-400">
          เวอร์ชั่น 5.2 17/09/69 10.01
        </footer>
      </div>
    </div>
  );
}

function QuickDatePicker({ value, onChange }: { value: string, onChange: (date: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const displayDate = value ? new Date(value) : new Date();
  const [day, setDay] = useState(displayDate.getDate().toString());
  const [month, setMonth] = useState((displayDate.getMonth() + 1).toString());
  const [year, setYear] = useState(displayDate.getFullYear().toString());

  const months = [
    { v: '1', l: 'เดือน 1 ม.ค.' }, { v: '2', l: 'เดือน 2 ก.พ.' }, { v: '3', l: 'เดือน 3 มี.ค.' }, { v: '4', l: 'เดือน 4 เม.ย.' },
    { v: '5', l: 'เดือน 5 พ.ค.' }, { v: '6', l: 'เดือน 6 มิ.ย.' }, { v: '7', l: 'เดือน 7 ก.ค.' }, { v: '8', l: 'เดือน 8 ส.ค.' },
    { v: '9', l: 'เดือน 9 ก.ย.' }, { v: '10', l: 'เดือน 10 ต.ค.' }, { v: '11', l: 'เดือน 11 พ.ย.' }, { v: '12', l: 'เดือน 12 ธ.ค.' }
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear - 2 + i); // Allow 2 years in the past, 12 in the future

  const handleApply = () => {
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    // Adjust for timezone offset to avoid date shifting
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d.getTime() - offset)).toISOString().split('T')[0];
    onChange(localISOTime);
    setIsOpen(false);
  };

  return (
    <>
      <button 
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-colors"
      >
        <span className="font-bold text-slate-700">
          {displayDate.getDate()} {months[displayDate.getMonth()].l.split(' ')[2]} {displayDate.getFullYear() + 543}
        </span>
        <CalendarIcon className="w-5 h-5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">เลือกวันที่</h3>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
                <X size={16} />
              </button>
            </div>

            <div className="flex gap-2 mb-6">
              <select value={day} onChange={e => setDay(e.target.value)} className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-100 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <select value={month} onChange={e => setMonth(e.target.value)} className="flex-[2] p-3 rounded-xl bg-slate-50 border border-slate-100 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                {months.map(m => (
                  <option key={m.v} value={m.v}>{m.l}</option>
                ))}
              </select>
              <select value={year} onChange={e => setYear(e.target.value)} className="flex-[2] p-3 rounded-xl bg-slate-50 border border-slate-100 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                {years.map(y => (
                  <option key={y} value={y}>{y + 543} ({y})</option>
                ))}
              </select>
            </div>

            <button onClick={handleApply} className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
              ตกลง
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}

function MainApp() {
  const { user, settings } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'expenses' | 'fridge' | 'supplies' | 'maintenance' | 'settings'>(() => {
    const saved = localStorage.getItem('activeTab');
    return (saved as any) || 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);
  
  // Data States
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fridgeItems, setFridgeItems] = useState<FridgeItem[]>([]);
  const [supplies, setSupplies] = useState<SupplyItem[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceTask[]>([]);
  const hasNotifiedMaintenance = useRef(false);

  // Real-time listeners
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'expenses'), where('uid', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expense));
      setExpenses(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'expenses'));
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'fridgeItems'), where('uid', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FridgeItem));
      setFridgeItems(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'fridgeItems'));
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'supplies'), where('uid', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SupplyItem));
      setSupplies(data);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'supplies'));
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'maintenanceTasks'), where('uid', '==', user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceTask));
      setMaintenance(data);

      if (!hasNotifiedMaintenance.current && data.length > 0) {
        hasNotifiedMaintenance.current = true;
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        data.forEach(task => {
          if (!task.alertType || task.alertType === 'none' || !task.nextDue) return;

          let alertDate = new Date(task.nextDue);
          if (task.alertType === 'specific_date' && task.alertValue) {
            alertDate = new Date(task.alertValue as string);
          } else if (task.alertType === 'days_before') {
            alertDate.setDate(alertDate.getDate() - (task.alertValue as number));
          } else if (task.alertType === 'weeks_before') {
            alertDate.setDate(alertDate.getDate() - ((task.alertValue as number) * 7));
          } else if (task.alertType === 'months_before') {
            alertDate.setMonth(alertDate.getMonth() - (task.alertValue as number));
          }
          
          alertDate.setHours(0, 0, 0, 0);

          if (now.getTime() >= alertDate.getTime() && now.getTime() <= new Date(task.nextDue).getTime()) {
            toast.warning(`แจ้งเตือนดูแลบ้าน: ${task.title}`, {
              description: `กำหนดการ: ${format(parseISO(task.nextDue), 'd MMM yyyy', { locale: th })}`,
              duration: 10000,
            });
          }
        });
      }
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'maintenanceTasks'));
    return () => unsub();
  }, [user]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard expenses={expenses} fridgeItems={fridgeItems} supplies={supplies} maintenance={maintenance} onNavigate={setActiveTab} />;
      case 'expenses': return <ExpenseTracker expenses={expenses} />;
      case 'fridge': return <FridgeManager items={fridgeItems} />;
      case 'supplies': return <SuppliesManager items={supplies} />;
      case 'maintenance': return <MaintenanceLog tasks={maintenance} />;
      case 'settings': return <SettingsPage />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <nav className="w-full md:w-64 bg-white/80 backdrop-blur-md border-b md:border-b-0 md:border-r border-slate-200 p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible sticky top-0 z-10 shadow-sm">
        <div className="hidden md:flex items-center gap-3 mb-10 px-2">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200 rotate-3">
            <Home size={28} />
          </div>
          <h1 className="font-serif text-2xl font-bold italic text-slate-900">บ้านของเรา</h1>
        </div>
        
        <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={getIcon(settings?.navIcons?.dashboard || 'Home', 20)} label="ภาพรวม" />
        <NavItem active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={getIcon(settings?.navIcons?.expenses || 'Receipt', 20)} label="รายจ่าย" />
        <NavItem active={activeTab === 'fridge'} onClick={() => setActiveTab('fridge')} icon={getIcon(settings?.navIcons?.fridge || 'Refrigerator', 20)} label="ตู้เย็น" />
        <NavItem active={activeTab === 'supplies'} onClick={() => setActiveTab('supplies')} icon={getIcon(settings?.navIcons?.supplies || 'Package', 20)} label="ของใช้ & ของกิน" />
        <NavItem active={activeTab === 'maintenance'} onClick={() => setActiveTab('maintenance')} icon={getIcon(settings?.navIcons?.maintenance || 'Wrench', 20)} label="ดูแลบ้าน" />
        <div className="md:hidden">
          <NavItem active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<SettingsIcon size={20} />} label="ตั้งค่า" />
        </div>
        <div className="md:hidden">
          <NavItem active={false} onClick={() => signOut(auth)} icon={<LogOut size={20} />} label="ออก" />
        </div>

        <div className="mt-auto hidden md:block px-2 pb-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-[24px] mb-4 border border-slate-100">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 border border-slate-200 shadow-sm overflow-hidden">
              {user?.photoURL ? <img src={user.photoURL} alt="User" /> : <UserIcon size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{user?.displayName || 'User'}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => setActiveTab('settings')}
              className={cn(
                "flex items-center justify-center gap-2 p-3 rounded-xl transition-all",
                activeTab === 'settings' ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-400 hover:bg-slate-100"
              )}
            >
              <SettingsIcon size={20} />
              <span className="text-sm font-bold">ตั้งค่า</span>
            </button>
            <button 
              onClick={() => signOut(auth)}
              className="flex items-center justify-center gap-2 p-3 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
            >
              <LogOut size={20} />
              <span className="text-sm font-bold">ออก</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 max-w-7xl mx-auto w-full flex flex-col justify-between">
        <div className="flex-1">
          {renderContent()}
        </div>
        <footer className="mt-12 py-4 text-center text-xs text-slate-400">
          เวอร์ชั่น 5.3 17/09/69 10.13
        </footer>
      </main>
    </div>
  );
}

function NavItem({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap",
        active 
          ? "bg-sky-600 text-white shadow-md shadow-sky-200" 
          : "text-slate-400 hover:bg-sky-50 hover:text-sky-600"
      )}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
}

function DashboardSummaryCard({ 
  title, 
  icon, 
  stats, 
  status, 
  alerts,
  onClick
}: { 
  title: string, 
  icon: React.ReactNode, 
  stats: string, 
  status: string, 
  alerts?: React.ReactNode,
  onClick?: () => void
}) {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-100/20 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-center gap-5 mb-8">
        <div className="w-16 h-16 bg-indigo-50 rounded-[24px] flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
          <p className="text-slate-400 font-medium">{stats}</p>
        </div>
      </div>
      
      <div className="mb-6 p-6 bg-slate-50/50 rounded-[24px] border border-slate-100">
        <div className="text-base md:text-lg font-bold text-slate-400 uppercase tracking-widest mb-3">สถานะภาพรวม</div>
        <div className="text-slate-700 font-bold text-xl">{status}</div>
      </div>

      {alerts}
    </div>
  );
}

// --- Dashboard Component ---
function Dashboard({ 
  expenses, 
  fridgeItems, 
  supplies, 
  maintenance,
  onNavigate 
}: { 
  expenses: Expense[], 
  fridgeItems: FridgeItem[], 
  supplies: SupplyItem[], 
  maintenance: MaintenanceTask[],
  onNavigate: (tab: any) => void
}) {
  const { settings } = useContext(AuthContext);
  const now = new Date();
  const monthExpenses = expenses.filter(e => isSameMonth(parseISO(e.date), now));
  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category for pie chart
  const categoryData = monthExpenses.reduce((acc: any, e) => {
    const cat = settings?.expenseCategories.find(c => c.name === e.category) || { name: e.category, color: '#94a3b8', icon: 'Package' };
    if (!acc[cat.name]) acc[cat.name] = { name: cat.name, value: 0, color: cat.color, icon: cat.icon };
    acc[cat.name].value += e.amount;
    return acc;
  }, {});

  const pieData = Object.values(categoryData);

  // Fridge Stats
  const expired = fridgeItems.filter(item => {
    if (!item.expiryDate || item.expiryType === 'none') return false;
    const diff = (parseISO(item.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff < 0;
  });

  const expiringSoon = fridgeItems.filter(item => {
    if (!item.expiryDate || item.expiryType === 'none') return false;
    const diff = (parseISO(item.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 3 && diff >= 0;
  });

  const outOfStockFridge = fridgeItems.filter(item => Number(item.quantity) <= 0);

  const totalFridgeQty = fridgeItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const fridgeStatus = outOfStockFridge.length > 0
    ? `มีของหมด ${outOfStockFridge.length} รายการ!`
    : expired.length > 0 
    ? `มีของหมดอายุ ${expired.length} รายการ!` 
    : expiringSoon.length > 0 
    ? `มีของใกล้หมดอายุ ${expiringSoon.length} รายการ` 
    : "ของในตู้เย็นปกติดี";

  // Supplies Stats
  const lowSupplies = supplies.filter(s => Number(s.quantity) <= Number(s.minThreshold));
  const totalSuppliesQty = supplies.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
  const suppliesStatus = lowSupplies.length > 0 
    ? `มีของต้องซื้อเพิ่ม ${lowSupplies.length} รายการ` 
    : "ของใช้ในบ้านเพียงพอ";

  // Maintenance Stats
  const upcomingTasks = maintenance.filter(task => {
    const diff = (parseISO(task.nextDue).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 14; // Within 2 weeks
  });
  const maintenanceStatus = upcomingTasks.length > 0 
    ? `มีงานต้องดูแล ${upcomingTasks.length} รายการเร็วๆ นี้` 
    : "บ้านอยู่ในสภาพดี";

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-5xl font-serif font-bold text-slate-900 mb-3 italic tracking-tight">สวัสดีตอนเช้า</h2>
          <p className="text-slate-400 text-lg font-medium">มาดูความเคลื่อนไหวในบ้านวันนี้กัน</p>
        </div>
        <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-3">
          <CalendarIcon size={20} />
          {formatBE(now, 'd MMMM yyyy')}
        </div>
      </header>

      {/* Row 1: Expenses Summary & Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div 
          onClick={() => onNavigate('expenses')}
          className="lg:col-span-1 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex flex-col justify-between h-full group hover:shadow-xl hover:shadow-indigo-100/20 transition-all duration-300 cursor-pointer"
        >
          <div className="flex justify-between items-start mb-10">
            <div className="w-16 h-16 bg-indigo-50 rounded-[24px] flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform duration-500">
              <Receipt size={32} />
            </div>
            <span className="text-xs md:text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full uppercase tracking-widest">เดือนนี้</span>
          </div>
          <div>
            <div className="text-slate-400 font-bold text-sm md:text-base uppercase tracking-widest mb-2">ยอดใช้จ่ายรวม</div>
            <div className="text-5xl font-bold text-slate-900 flex items-baseline gap-3 tabular-nums">
              <span className="text-2xl font-medium text-slate-300">฿</span>
              {total.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10">
          <div className="w-full md:w-1/2 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.length > 0 ? pieData : [{ name: 'ไม่มีข้อมูล', value: 1, color: '#f1f5f9' }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={pieData.length > 0 ? 8 : 0}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.length > 0 ? pieData.map((entry: any, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  )) : <Cell fill="#f1f5f9" />}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '16px' }}
                  formatter={(value: number) => [`฿${value.toLocaleString()}`, 'ยอดรวม']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 mb-4">สัดส่วนค่าใช้จ่าย</h3>
            <div className="grid grid-cols-1 gap-3 max-h-[200px] overflow-y-auto pr-2">
              {pieData.length > 0 ? pieData.map((item: any) => (
                <div key={item.name} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                    {getIcon(item.icon, 16)}
                  </div>
                  <span className="text-sm md:text-base font-bold text-slate-600 truncate">{item.name}</span>
                  <span className="text-sm md:text-base font-bold ml-auto text-slate-900">{total > 0 ? Math.round((item.value / total) * 100) : 0}%</span>
                </div>
              )) : (
                <div className="text-slate-400 text-sm md:text-base italic">ยังไม่มีข้อมูลการใช้จ่ายในเดือนนี้</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Summaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Fridge Summary */}
        <DashboardSummaryCard 
          title="ตู้เย็น"
          icon={<Refrigerator size={32} />}
          stats={`${fridgeItems.length} รายการ | ${totalFridgeQty} ชิ้น`}
          status={fridgeStatus}
          onClick={() => onNavigate('fridge')}
          alerts={(expired.length > 0 || expiringSoon.length > 0 || outOfStockFridge.length > 0) && (
            <div className="space-y-3 mt-6 pt-6 border-t border-slate-100">
              {outOfStockFridge.map(item => (
                <div key={item.id} className="flex items-center gap-3 text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
                  <AlertCircle size={16} className="shrink-0" />
                  <span className="text-xs md:text-sm font-bold truncate">{item.name} (ของหมด!)</span>
                </div>
              ))}
              {expired.map(item => (
                <div key={item.id} className="flex items-center gap-3 text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
                  <AlertCircle size={16} className="shrink-0" />
                  <span className="text-xs md:text-sm font-bold truncate">{item.name} (หมดอายุ!)</span>
                </div>
              ))}
              {expiringSoon.map(item => (
                <div key={item.id} className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span className="text-xs md:text-sm font-bold truncate">{item.name} (ใกล้หมดอายุ)</span>
                </div>
              ))}
            </div>
          )}
        />

        {/* Supplies Summary */}
        <DashboardSummaryCard 
          title="ของใช้ & ของกิน"
          icon={<Package size={32} />}
          stats={`${supplies.length} รายการ | ${totalSuppliesQty} ชิ้น`}
          status={suppliesStatus}
          onClick={() => onNavigate('supplies')}
          alerts={lowSupplies.length > 0 && (
            <div className="space-y-3 mt-6 pt-6 border-t border-slate-100">
              {lowSupplies.map(item => (
                <div key={item.id} className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100">
                  <TrendingUp size={16} className="shrink-0 rotate-180" />
                  <span className="text-xs md:text-sm font-bold truncate">{item.name} (เหลือ {item.quantity} {item.unit})</span>
                </div>
              ))}
            </div>
          )}
        />

        {/* Maintenance Summary */}
        <DashboardSummaryCard 
          title="ดูแลบ้าน"
          icon={<Wrench size={32} />}
          stats={`${maintenance.length} รายการดูแล`}
          status={maintenanceStatus}
          onClick={() => onNavigate('maintenance')}
          alerts={upcomingTasks.length > 0 && (
            <div className="space-y-3 mt-6 pt-6 border-t border-slate-100">
              {upcomingTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 text-indigo-600 bg-indigo-50 p-3 rounded-xl border border-indigo-100">
                  <CalendarIcon size={16} className="shrink-0" />
                  <span className="text-xs md:text-sm font-bold truncate">{task.title} ({formatBE(parseISO(task.nextDue), 'd MMM')})</span>
                </div>
              ))}
            </div>
          )}
        />
      </div>
    </div>
  );
}

// --- Settings Page Component ---
function SettingsPage() {
  const { settings, updateSettings } = useContext(AuthContext);
  const [activeSection, setActiveSection] = useState<'expenses' | 'fridge' | 'supplies' | 'navigation'>('expenses');

  const categories = activeSection === 'expenses' ? settings?.expenseCategories : 
                    activeSection === 'fridge' ? settings?.fridgeCategories : 
                    activeSection === 'supplies' ? settings?.supplyCategories : [];

  const handleAddCategory = () => {
    const newCat: Category = { id: Date.now().toString(), name: 'หมวดหมู่ใหม่', color: '#6366f1', icon: 'Package' };
    const key = activeSection === 'expenses' ? 'expenseCategories' : 
                activeSection === 'fridge' ? 'fridgeCategories' : 
                'supplyCategories';
    updateSettings({ [key]: [...(categories || []), newCat] });
  };

  const handleUpdateCategory = (id: string, updates: Partial<Category>) => {
    const key = activeSection === 'expenses' ? 'expenseCategories' : 
                activeSection === 'fridge' ? 'fridgeCategories' : 
                'supplyCategories';
    const updated = categories?.map(c => c.id === id ? { ...c, ...updates } : c) || [];
    updateSettings({ [key]: updated });
  };

  const handleDeleteCategory = (id: string) => {
    const key = activeSection === 'expenses' ? 'expenseCategories' : 
                activeSection === 'fridge' ? 'fridgeCategories' : 
                'supplyCategories';
    const updated = categories?.filter(c => c.id !== id) || [];
    updateSettings({ [key]: updated });
  };

  const handleUpdateNavIcon = (key: string, icon: string) => {
    const navIcons = { ...(settings?.navIcons || {}), [key]: icon };
    updateSettings({ navIcons });
  };

  const navItems = [
    { key: 'dashboard', label: 'ภาพรวม', defaultIcon: 'Home' },
    { key: 'expenses', label: 'รายจ่าย', defaultIcon: 'Receipt' },
    { key: 'fridge', label: 'ตู้เย็น', defaultIcon: 'Refrigerator' },
    { key: 'supplies', label: 'ของใช้ & ของกิน', defaultIcon: 'Package' },
    { key: 'maintenance', label: 'ดูแลบ้าน', defaultIcon: 'Wrench' },
    { key: 'settings', label: 'ตั้งค่า', defaultIcon: 'SettingsIcon' },
  ];

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <header>
        <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">ตั้งค่า</h2>
        <p className="text-slate-400">จัดการหมวดหมู่และรูปแบบการใช้งาน</p>
      </header>

      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100 overflow-x-auto">
          <button onClick={() => setActiveSection('expenses')} className={cn("flex-1 py-6 px-4 font-bold transition-all whitespace-nowrap", activeSection === 'expenses' ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30" : "text-slate-400 hover:bg-slate-50")}>รายจ่าย</button>
          <button onClick={() => setActiveSection('fridge')} className={cn("flex-1 py-6 px-4 font-bold transition-all whitespace-nowrap", activeSection === 'fridge' ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30" : "text-slate-400 hover:bg-slate-50")}>ตู้เย็น</button>
          <button onClick={() => setActiveSection('supplies')} className={cn("flex-1 py-6 px-4 font-bold transition-all whitespace-nowrap", activeSection === 'supplies' ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30" : "text-slate-400 hover:bg-slate-50")}>ของใช้/กิน</button>
          <button onClick={() => setActiveSection('navigation')} className={cn("flex-1 py-6 px-4 font-bold transition-all whitespace-nowrap", activeSection === 'navigation' ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30" : "text-slate-400 hover:bg-slate-50")}>เมนูนำทาง</button>
        </div>

        <div className="p-10 space-y-6">
          {activeSection !== 'navigation' ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">จัดการหมวดหมู่</h3>
                <button onClick={handleAddCategory} className="flex items-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 px-4 py-2 rounded-xl transition-colors">
                  <Plus size={20} />
                  <span>เพิ่มหมวดหมู่</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {categories?.map(cat => (
                  <div key={cat.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={cat.color} 
                        onChange={e => handleUpdateCategory(cat.id, { color: e.target.value })}
                        className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent"
                      />
                      <input 
                        type="text" 
                        value={cat.name} 
                        onChange={e => handleUpdateCategory(cat.id, { name: e.target.value })}
                        className="flex-1 bg-transparent font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 rounded-lg px-2"
                      />
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-slate-300 hover:text-red-500 transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">ไอคอนหมวดหมู่</label>
                      <IconPicker selected={cat.icon} onSelect={(icon) => handleUpdateCategory(cat.id, { icon })} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {navItems.map(item => (
                <div key={item.key} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                      {getIcon(settings?.navIcons?.[item.key] || item.defaultIcon, 20)}
                    </div>
                    <span className="font-bold text-slate-700">{item.label}</span>
                  </div>
                  <IconPicker 
                    selected={settings?.navIcons?.[item.key] || item.defaultIcon} 
                    onSelect={(icon) => handleUpdateNavIcon(item.key, icon)} 
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Expense Tracker Component ---
function ExpenseTracker({ expenses }: { expenses: Expense[] }) {
  const { user, settings } = useContext(AuthContext);
  const [viewMode, setViewMode] = useState<'week' | 'month' | 'year' | 'range'>('month');
  const [viewDate, setViewDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: format(subDays(new Date(), 7), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Expense>>({
    date: format(new Date(), 'yyyy-MM-dd'),
    category: settings?.expenseCategories[0]?.name || 'อาหาร',
    amount: 0,
    description: ''
  });

  const filteredExpenses = expenses.filter(e => {
    const d = parseISO(e.date);
    if (viewMode === 'week') {
      return isWithinInterval(d, {
        start: startOfWeek(viewDate, { weekStartsOn: 1 }),
        end: endOfWeek(viewDate, { weekStartsOn: 1 })
      });
    }
    if (viewMode === 'month') return isSameMonth(d, viewDate);
    if (viewMode === 'year') return isSameYear(d, viewDate);
    if (viewMode === 'range') {
      return isWithinInterval(d, {
        start: startOfDay(parseISO(dateRange.start)),
        end: endOfDay(parseISO(dateRange.end))
      });
    }
    return true;
  }).sort((a, b) => {
    const dateDiff = parseISO(b.date).getTime() - parseISO(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleSave = async () => {
    console.log('Expense handleSave triggered', { formData, user: !!user });
    if ((formData.amount === undefined || formData.amount === null) || !formData.description || !formData.date || !user) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      console.warn('Expense handleSave validation failed');
      return;
    }
    
    try {
      const data = {
        ...formData,
        amount: Number(formData.amount) || 0,
        uid: user.uid,
        createdAt: formData.createdAt || Date.now()
      };

      if (editingId) {
        // Remove id from data to avoid redundancy/errors
        const { id, ...updateData } = data as any;
        await updateDoc(doc(db, 'expenses', editingId), updateData);
      } else {
        await addDoc(collection(db, 'expenses'), data);
      }
      closeModal();
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, 'expenses');
    }
  };

  const openModal = (expense?: Expense) => {
    if (expense) {
      setEditingId(expense.id);
      setFormData({ ...expense });
    } else {
      setEditingId(null);
      setFormData({ 
        date: format(new Date(), 'yyyy-MM-dd'), 
        category: settings?.expenseCategories[0]?.name || 'อาหาร',
        amount: 0,
        description: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('ยืนยันการลบรายการนี้?')) {
      try {
        await deleteDoc(doc(db, 'expenses', id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'expenses');
      }
    }
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-8">
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">บันทึกรายจ่าย</h2>
          <p className="text-slate-400">ติดตามและจัดการค่าใช้จ่ายในบ้าน</p>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          <div className="flex bg-white rounded-2xl p-1.5 border border-slate-100 shadow-sm overflow-x-auto">
            {(['week', 'month', 'year', 'range'] as const).map((mode) => (
              <button 
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "px-4 md:px-5 py-2 rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap flex-1 md:flex-none", 
                  viewMode === mode ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {mode === 'week' ? 'รายสัปดาห์' : mode === 'month' ? 'รายเดือน' : mode === 'year' ? 'รายปี' : 'เลือกช่วง'}
              </button>
            ))}
          </div>
          
          {viewMode !== 'range' ? (
            <div className="flex items-center justify-between md:justify-start gap-2 md:gap-4 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
              <button 
                onClick={() => setViewDate(new Date())}
                className="px-3 md:px-4 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-all"
              >
                วันนี้
              </button>
              <div className="flex items-center gap-1 md:gap-2">
                <button 
                  onClick={() => setViewDate(
                    viewMode === 'week' ? subWeeks(viewDate, 1) : 
                    viewMode === 'month' ? subMonths(viewDate, 1) : 
                    subYears(viewDate, 1)
                  )} 
                  className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <ChevronLeft size={20}/>
                </button>
                <span className="font-bold text-slate-700 min-w-[100px] md:min-w-[120px] text-center text-xs md:text-sm">
                  {viewMode === 'week' 
                    ? `${formatBE(startOfWeek(viewDate, { weekStartsOn: 1 }), 'd MMM')} - ${formatBE(endOfWeek(viewDate, { weekStartsOn: 1 }), 'd MMM yyyy')}`
                    : formatBE(viewDate, viewMode === 'month' ? 'MMMM yyyy' : 'yyyy')
                  }
                </span>
                <button 
                  onClick={() => setViewDate(
                    viewMode === 'week' ? addWeeks(viewDate, 1) : 
                    viewMode === 'month' ? addMonths(viewDate, 1) : 
                    addYears(viewDate, 1)
                  )} 
                  className="p-1.5 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  <ChevronRight size={20}/>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 md:gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
              <input 
                type="date" 
                value={dateRange.start} 
                onChange={e => setDateRange({...dateRange, start: e.target.value})}
                className="bg-transparent text-xs md:text-sm font-bold text-slate-700 focus:outline-none"
              />
              <span className="text-slate-300 text-xs md:text-sm">ถึง</span>
              <input 
                type="date" 
                value={dateRange.end} 
                onChange={e => setDateRange({...dateRange, end: e.target.value})}
                className="bg-transparent text-xs md:text-sm font-bold text-slate-700 focus:outline-none"
              />
            </div>
          )}
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:scale-105 transition-all font-bold w-full lg:w-auto shrink-0"
        >
          <Plus size={24} />
          <span>เพิ่มรายการ</span>
        </button>
      </header>

      {/* Total Summary */}
      <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl hover:shadow-indigo-50 transition-all duration-500">
        <div>
          <div className="text-sm md:text-base font-bold text-slate-400 mb-2 uppercase tracking-wider">
            ยอดรวม{viewMode === 'week' ? 'สัปดาห์นี้' : viewMode === 'month' ? 'เดือนนี้' : viewMode === 'year' ? 'ปีนี้' : 'ช่วงที่เลือก'}
          </div>
          <div className="text-5xl font-bold text-slate-900 flex items-baseline gap-4 tabular-nums">
            <span className="text-3xl font-medium text-slate-300">฿</span>
            {total.toLocaleString()}
          </div>
        </div>
        <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
          <TrendingUp size={40} />
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-lg rounded-[48px] p-12 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            <h3 className="text-3xl font-serif font-bold mb-10 text-slate-900">{editingId ? 'แก้ไขรายการ' : 'เพิ่มรายการจ่าย'}</h3>
            <div className="space-y-8 overflow-y-auto pr-2 flex-1 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block">วันที่</label>
                  <QuickDatePicker 
                    value={formData.date} 
                    onChange={(date) => setFormData({...formData, date: date})} 
                  />
                </div>
                <div>
                  <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block">หมวดหมู่</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all font-bold text-slate-700 appearance-none"
                  >
                    {settings?.expenseCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block">รายการ</label>
                <input 
                  type="text" 
                  placeholder="เช่น ซื้อของเข้าบ้าน"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all font-bold text-slate-700"
                />
              </div>
              <div>
                <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block">จำนวนเงิน (฿)</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  value={formData.amount || ''}
                  onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                  className="w-full p-6 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all text-3xl font-bold text-slate-900"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-6 border-t border-slate-50 mt-4">
              <button onClick={closeModal} className="flex-1 py-5 rounded-2xl border border-slate-100 text-slate-400 font-bold hover:bg-slate-50 transition-colors">ยกเลิก</button>
              <button onClick={handleSave} className="flex-1 py-5 rounded-2xl bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">บันทึกรายการ</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Expense List */}
      <div className="bg-white rounded-[40px] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
          <table className="w-full text-left relative">
            <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm shadow-sm">
              <tr>
                <th className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest w-24 md:w-32">วันที่</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">รายการ</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest w-32 md:w-48">หมวดหมู่</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest text-right w-32 md:w-40">จำนวนเงิน</th>
                <th className="px-3 md:px-6 py-3 md:py-4 text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest text-center w-20 md:w-24">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredExpenses.map(e => {
                const cat = settings?.expenseCategories.find(c => c.name === e.category);
                return (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="text-sm md:text-base font-bold text-slate-700">{formatBE(e.date, 'd MMM')}</div>
                      <div className="text-[10px] md:text-xs text-slate-400 font-bold">{formatBE(e.date, 'yyyy')}</div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="font-bold text-slate-900 text-sm md:text-base">{e.description}</div>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <span 
                        className="px-3 md:px-4 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-bold"
                        style={{ backgroundColor: `${cat?.color}15`, color: cat?.color }}
                      >
                        {e.category}
                      </span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right font-bold text-slate-900 tabular-nums text-sm md:text-base">
                      ฿{e.amount.toLocaleString()}
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <div className="flex items-center justify-center gap-1 md:gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => openModal(e)} className="p-1.5 md:p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(e.id)} className="p-1.5 md:p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold">ไม่มีรายการในช่วงเวลานี้</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// --- Fridge Manager Component ---
function FridgeManager({ items }: { items: FridgeItem[] }) {
  const { user, settings } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<FridgeItem>>({
    name: '',
    category: settings?.fridgeCategories[0]?.name || 'ของสด',
    expiryDate: format(new Date(), 'yyyy-MM-dd'),
    expiryType: 'expiry',
    quantity: 1,
    unit: 'ชิ้น'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterQuantity, setFilterQuantity] = useState('all');

  const handleSave = async () => {
    console.log('Fridge handleSave triggered', { formData, user: !!user });
    if (!formData.name || !user) {
      toast.error('กรุณากรอกชื่อรายการ');
      console.warn('Fridge handleSave validation failed');
      return;
    }
    try {
      const data = {
        ...formData,
        quantity: Number(formData.quantity) || 0,
        uid: user.uid,
        createdAt: formData.createdAt || Date.now()
      };
      if (editingId) {
        const { id, ...updateData } = data as any;
        await updateDoc(doc(db, 'fridgeItems', editingId), updateData);
      } else {
        await addDoc(collection(db, 'fridgeItems'), data);
      }
      closeModal();
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, 'fridgeItems');
    }
  };

  const openModal = (item?: FridgeItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({ 
        name: '',
        category: settings?.fridgeCategories[0]?.name || 'ของสด', 
        expiryDate: format(new Date(), 'yyyy-MM-dd'), 
        expiryType: 'expiry',
        quantity: 1,
        unit: 'ชิ้น',
        icon: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const updateQty = async (id: string, currentQty: number, delta: number, name: string) => {
    const next = Math.max(0, currentQty + delta);
    try {
      await updateDoc(doc(db, 'fridgeItems', id), { quantity: next });
      if (next === 0 && currentQty > 0) {
        toast.error(`ของหมดแล้ว! ${name} หมดจากตู้เย็นแล้ว`);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'fridgeItems');
    }
  };

  const filteredItems = items.filter(item => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    
    const expiryDate = item.expiryDate ? parseISO(item.expiryDate) : null;
    const expiry = (expiryDate && !isNaN(expiryDate.getTime())) ? expiryDate : null;
    const diff = expiry ? (expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) : null;
    const isExpired = diff !== null && diff < 0 && item.expiryType !== 'none';
    const isExpiringSoon = diff !== null && diff <= 3 && diff >= 0 && item.expiryType !== 'none';
    
    if (filterStatus === 'expired' && !isExpired) return false;
    if (filterStatus === 'expiring_soon' && !isExpiringSoon) return false;
    if (filterStatus === 'good' && (isExpired || isExpiringSoon)) return false;

    if (filterQuantity === 'out_of_stock' && Number(item.quantity) > 0) return false;
    if (filterQuantity === 'in_stock' && Number(item.quantity) <= 0) return false;

    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => a.name.localeCompare(b.name, 'th'));

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">ของในตู้เย็น</h2>
          <p className="text-slate-400">จัดการวัตถุดิบและของสดในบ้าน</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:scale-105 transition-all font-bold w-full md:w-auto"
        >
          <Plus size={24} />
          <span>เพิ่มรายการ</span>
        </button>
      </header>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-lg rounded-[48px] p-12 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            <h3 className="text-3xl font-serif font-bold mb-10 text-slate-900">{editingId ? 'แก้ไขรายการ' : 'เพิ่มของในตู้เย็น'}</h3>
            <div className="space-y-8 overflow-y-auto pr-2 flex-1 scrollbar-hide">
              <div className="flex gap-3">
                <div className="shrink-0">
                  <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block text-center">ไอคอน</label>
                  <IconPicker selected={formData.icon} onSelect={(icon) => setFormData({...formData, icon})} compact />
                </div>
                <div className="flex-1">
                  <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block">ชื่อของ</label>
                  <input 
                    type="text" 
                    placeholder="เช่น นมสด, ไข่ไก่"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all font-bold text-slate-700 h-14"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block">หมวดหมู่</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all font-bold text-slate-700 appearance-none"
                  >
                    {settings?.fridgeCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest block">จำนวน</label>
                  <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl focus-within:ring-4 focus-within:ring-indigo-600/10 transition-all overflow-hidden">
                    <input 
                      type="number" 
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                      className="w-24 p-4 bg-transparent focus:outline-none font-bold text-slate-700 text-center"
                    />
                    <div className="w-px h-8 bg-slate-200"></div>
                    <input 
                      type="text" 
                      placeholder="หน่วย (เช่น ชิ้น)"
                      value={formData.unit}
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                      className="flex-1 p-4 bg-transparent focus:outline-none font-bold text-slate-700"
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest block">การแจ้งเตือนวันหมดอายุ</label>
                <div className="flex bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
                  {(['none', 'expiry', 'bbf'] as const).map((type) => (
                    <button 
                      key={type}
                      onClick={() => setFormData({...formData, expiryType: type})}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-sm font-bold transition-all", 
                        formData.expiryType === type ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {type === 'none' ? 'ไม่มี' : type === 'expiry' ? 'วันหมดอายุ' : 'Best Before (BBF)'}
                    </button>
                  ))}
                </div>
                
                {formData.expiryType !== 'none' && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <QuickDatePicker 
                      value={formData.expiryDate} 
                      onChange={(date) => setFormData({...formData, expiryDate: date})} 
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4 pt-6 border-t border-slate-50 mt-4">
              <button onClick={closeModal} className="flex-1 py-5 rounded-2xl border border-slate-100 text-slate-400 font-bold hover:bg-slate-50 transition-colors">ยกเลิก</button>
              <button onClick={handleSave} className="flex-1 py-5 rounded-2xl bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">บันทึกรายการ</button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="bg-white p-3 md:p-6 rounded-2xl md:rounded-[32px] shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-2 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อ..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/10 font-bold text-slate-700 text-sm md:text-base"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 md:flex md:gap-4">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="py-2 px-2 md:py-3 md:px-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 text-xs md:text-base appearance-none text-center md:text-left">
            <option value="all">หมวดหมู่</option>
            {settings?.fridgeCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="py-2 px-2 md:py-3 md:px-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 text-xs md:text-base appearance-none text-center md:text-left">
            <option value="all">สถานะ</option>
            <option value="good">ปกติ</option>
            <option value="expiring_soon">ใกล้หมด</option>
            <option value="expired">หมดอายุ</option>
          </select>
          <select value={filterQuantity} onChange={e => setFilterQuantity(e.target.value)} className="py-2 px-2 md:py-3 md:px-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 text-xs md:text-base appearance-none text-center md:text-left">
            <option value="all">จำนวน</option>
            <option value="in_stock">มีของ</option>
            <option value="out_of_stock">หมด</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sortedItems.map((item, index) => {
          const qty = Number(item.quantity) || 0;
          const isOutOfStock = qty <= 0;
          const expiryDate = item.expiryDate ? parseISO(item.expiryDate) : null;
          const expiry = (expiryDate && !isNaN(expiryDate.getTime())) ? expiryDate : null;
          const diff = expiry ? (expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) : null;
          const isExpired = diff !== null && diff < 0 && item.expiryType !== 'none';
          const isExpiringSoon = diff !== null && diff <= 3 && diff >= 0 && item.expiryType !== 'none';
          const cat = settings?.fridgeCategories.find(c => c.name === item.category);
          const itemIcon = item.icon || cat?.icon || 'Refrigerator';

          return (
            <div key={item.id} className="bg-white p-3 md:p-4 rounded-[20px] shadow-sm border border-slate-100 relative group hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-slate-300 font-bold text-base w-6 text-center">{index + 1}</span>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  isOutOfStock ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                )}>
                  {getIcon(itemIcon, 20)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base text-slate-900 truncate">{item.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat?.color }}></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">{item.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-4 ml-9 md:ml-0">
                <div className="flex items-center justify-between bg-slate-50 p-1 rounded-xl w-28 shrink-0">
                  <button onClick={() => updateQty(item.id, qty, -1, item.name)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><Minus size={14}/></button>
                  <span className={cn("text-sm font-bold text-center flex-1", isOutOfStock ? "text-rose-600" : "text-slate-700")}>{qty} {item.unit}</span>
                  <button onClick={() => updateQty(item.id, qty, 1, item.name)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><Plus size={14}/></button>
                </div>

                <div className="w-36 shrink-0 hidden md:flex justify-center">
                  {isOutOfStock ? (
                    <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold w-full bg-rose-50 text-rose-600">
                      <AlertCircle size={12} className="shrink-0" />
                      <span className="truncate">ของหมด!</span>
                    </div>
                  ) : item.expiryType !== 'none' && expiry ? (
                    <div className={cn(
                      "flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold w-full",
                      isExpired ? "bg-rose-50 text-rose-600" : isExpiringSoon ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      <CalendarIcon size={12} className="shrink-0" />
                      <span className="truncate">
                        {isExpired ? 'หมดอายุแล้ว' : isExpiringSoon ? `อีก ${Math.ceil(diff!)} วัน` : formatBE(item.expiryDate, 'd MMM yyyy')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold w-full bg-slate-50 text-slate-400">
                      <CalendarIcon size={12} className="shrink-0" />
                      <span className="truncate">ไม่มีวันหมดอายุ</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => openModal(item)} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={async () => { if(confirm('ลบรายการนี้?')) { try { await deleteDoc(doc(db, 'fridgeItems', item.id)); } catch(err) { handleFirestoreError(err, OperationType.DELETE, 'fridgeItems'); } } }} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-100 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              {/* Mobile Expiry Status */}
              <div className="md:hidden ml-9">
                {item.expiryType !== 'none' && expiry ? (
                  <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold w-fit",
                    isExpired ? "bg-rose-50 text-rose-600" : isExpiringSoon ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    <CalendarIcon size={12} className="shrink-0" />
                    <span>
                      {isExpired ? 'หมดอายุแล้ว' : isExpiringSoon ? `อีก ${Math.ceil(diff!)} วัน` : formatBE(item.expiryDate, 'd MMM yyyy')}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold w-fit bg-slate-50 text-slate-400">
                    <CalendarIcon size={12} className="shrink-0" />
                    <span>ไม่มีวันหมดอายุ</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="py-32 text-center text-slate-400 bg-white rounded-[40px] border-2 border-dashed border-slate-100 font-bold">
            ตู้เย็นว่างเปล่า... เพิ่มของกินกันเถอะ!
          </div>
        )}
        {items.length > 0 && sortedItems.length === 0 && (
          <div className="py-20 text-center text-slate-400 bg-white rounded-[32px] border-2 border-dashed border-slate-100 font-bold">
            ไม่พบรายการที่ค้นหา
          </div>
        )}
      </div>
    </div>
  );
}

// --- Supplies Manager Component ---
function SuppliesManager({ items }: { items: SupplyItem[] }) {
  const { user, settings } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<SupplyItem>>({
    name: '',
    category: settings?.supplyCategories[0]?.name || 'ของใช้',
    quantity: 1,
    minThreshold: 1,
    expiryDate: format(new Date(), 'yyyy-MM-dd'),
    expiryType: 'none',
    unit: 'ชิ้น'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterQuantity, setFilterQuantity] = useState('all');

  const filteredItems = items.filter(item => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    
    const expiryDate = item.expiryDate ? parseISO(item.expiryDate) : null;
    const expiry = (expiryDate && !isNaN(expiryDate.getTime())) ? expiryDate : null;
    const diff = expiry ? (expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) : null;
    const isExpired = diff !== null && diff < 0 && item.expiryType !== 'none';
    const isExpiringSoon = diff !== null && diff <= 3 && diff >= 0 && item.expiryType !== 'none';
    
    if (filterStatus === 'expired' && !isExpired) return false;
    if (filterStatus === 'expiring_soon' && !isExpiringSoon) return false;
    if (filterStatus === 'good' && (isExpired || isExpiringSoon)) return false;

    const qty = Number(item.quantity) || 0;
    const threshold = Number(item.minThreshold) || 0;
    const isLow = qty <= threshold;
    if (filterQuantity === 'low' && !isLow) return false;
    if (filterQuantity === 'normal' && isLow) return false;

    return true;
  });

  const sortedItems = [...filteredItems].sort((a, b) => a.name.localeCompare(b.name, 'th'));

  const handleSave = async () => {
    console.log('Supply handleSave triggered', { formData, user: !!user });
    if (!formData.name || !user) {
      toast.error('กรุณากรอกชื่อรายการ');
      console.warn('Supply handleSave validation failed');
      return;
    }
    try {
      const data = {
        ...formData,
        quantity: Number(formData.quantity) || 0,
        minThreshold: Number(formData.minThreshold) || 0,
        uid: user.uid,
        createdAt: formData.createdAt || Date.now()
      };
      if (editingId) {
        const { id, ...updateData } = data as any;
        await updateDoc(doc(db, 'supplies', editingId), updateData);
      } else {
        await addDoc(collection(db, 'supplies'), data);
      }
      closeModal();
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, 'supplies');
    }
  };

  const openModal = (item?: SupplyItem) => {
    if (item) {
      setEditingId(item.id);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({ 
        name: '',
        category: settings?.supplyCategories[0]?.name || 'ของใช้',
        quantity: 1, 
        minThreshold: 1, 
        expiryDate: format(new Date(), 'yyyy-MM-dd'),
        expiryType: 'none',
        unit: 'ชิ้น',
        icon: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const updateQty = async (id: string, currentQty: number, delta: number, name: string) => {
    const next = Math.max(0, currentQty + delta);
    try {
      await updateDoc(doc(db, 'supplies', id), { quantity: next });
      if (next === 0 && currentQty > 0) {
        toast.error(`ของหมดแล้ว! ${name} หมดจากสต็อกแล้ว`);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'supplies');
    }
  };

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">ของใช้ & ของกิน</h2>
          <p className="text-slate-400">จัดการสต็อกของใช้จำเป็นในบ้าน</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:scale-105 transition-all font-bold w-full md:w-auto"
        >
          <Plus size={24} />
          <span>เพิ่มรายการ</span>
        </button>
      </header>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-lg rounded-[48px] p-12 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
            <h3 className="text-3xl font-serif font-bold mb-10 text-slate-900">{editingId ? 'แก้ไขรายการ' : 'เพิ่มของใช้/ของกิน'}</h3>
            <div className="space-y-8 overflow-y-auto pr-2 flex-1 scrollbar-hide">
              <div className="flex gap-3">
                <div className="shrink-0">
                  <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block text-center">ไอคอน</label>
                  <IconPicker selected={formData.icon} onSelect={(icon) => setFormData({...formData, icon})} compact />
                </div>
                <div className="flex-1">
                  <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block">ชื่อรายการ</label>
                  <input 
                    type="text" 
                    placeholder="เช่น ทิชชู่, น้ำยาล้างจาน"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all font-bold text-slate-700 h-14"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block">หมวดหมู่</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all font-bold text-slate-700 appearance-none"
                  >
                    {settings?.supplyCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest block">จำนวนปัจจุบัน</label>
                  <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl focus-within:ring-4 focus-within:ring-indigo-600/10 transition-all overflow-hidden">
                    <input 
                      type="number" 
                      value={formData.quantity}
                      onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}
                      className="w-24 p-4 bg-transparent focus:outline-none font-bold text-slate-700 text-center"
                    />
                    <div className="w-px h-8 bg-slate-200"></div>
                    <input 
                      type="text" 
                      placeholder="หน่วย (เช่น ม้วน)"
                      value={formData.unit}
                      onChange={e => setFormData({...formData, unit: e.target.value})}
                      className="flex-1 p-4 bg-transparent focus:outline-none font-bold text-slate-700"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block">แจ้งเตือนเมื่อเหลือน้อยกว่า</label>
                  <input 
                    type="number" 
                    value={formData.minThreshold}
                    onChange={e => setFormData({...formData, minThreshold: Number(e.target.value)})}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest block">การแจ้งเตือนวันหมดอายุ</label>
                <div className="flex bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
                  {(['none', 'expiry', 'bbf'] as const).map((type) => (
                    <button 
                      key={type}
                      onClick={() => setFormData({...formData, expiryType: type})}
                      className={cn(
                        "flex-1 py-3 rounded-xl text-sm font-bold transition-all", 
                        formData.expiryType === type ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {type === 'none' ? 'ไม่มี' : type === 'expiry' ? 'วันหมดอายุ' : 'Best Before (BBF)'}
                    </button>
                  ))}
                </div>
                
                {formData.expiryType !== 'none' && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <QuickDatePicker 
                      value={formData.expiryDate} 
                      onChange={(date) => setFormData({...formData, expiryDate: date})} 
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-4 pt-6 border-t border-slate-50 mt-4">
              <button onClick={closeModal} className="flex-1 py-5 rounded-2xl border border-slate-100 text-slate-400 font-bold hover:bg-slate-50 transition-colors">ยกเลิก</button>
              <button onClick={handleSave} className="flex-1 py-5 rounded-2xl bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">บันทึกรายการ</button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="bg-white p-3 md:p-6 rounded-2xl md:rounded-[32px] shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row gap-2 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="ค้นหาชื่อ..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/10 font-bold text-slate-700 text-sm md:text-base"
          />
        </div>
        <div className="grid grid-cols-3 gap-2 md:flex md:gap-4">
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="py-2 px-2 md:py-3 md:px-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 text-xs md:text-base appearance-none text-center md:text-left">
            <option value="all">หมวดหมู่</option>
            {settings?.supplyCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="py-2 px-2 md:py-3 md:px-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 text-xs md:text-base appearance-none text-center md:text-left">
            <option value="all">สถานะ</option>
            <option value="good">ปกติ</option>
            <option value="expiring_soon">ใกล้หมด</option>
            <option value="expired">หมดอายุ</option>
          </select>
          <select value={filterQuantity} onChange={e => setFilterQuantity(e.target.value)} className="py-2 px-2 md:py-3 md:px-4 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 text-xs md:text-base appearance-none text-center md:text-left">
            <option value="all">จำนวน</option>
            <option value="normal">ปกติ</option>
            <option value="low">ใกล้หมด</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sortedItems.map((item, index) => {
          const qty = Number(item.quantity) || 0;
          const threshold = Number(item.minThreshold) || 0;
          const isLow = qty <= threshold;
          const cat = settings?.supplyCategories.find(c => c.name === item.category);
          const expiryDate = item.expiryDate ? parseISO(item.expiryDate) : null;
          const expiry = (expiryDate && !isNaN(expiryDate.getTime())) ? expiryDate : null;
          const diff = expiry ? (expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) : null;
          const isExpired = diff !== null && diff < 0 && item.expiryType !== 'none';
          const isExpiringSoon = diff !== null && diff <= 3 && diff >= 0 && item.expiryType !== 'none';

          return (
            <div key={item.id} className="bg-white p-3 md:p-4 rounded-[20px] shadow-sm border border-slate-100 relative group hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <div className="flex items-center gap-3 flex-1">
                <span className="text-slate-300 font-bold text-base w-6 text-center">{index + 1}</span>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  isLow ? "bg-rose-50 text-rose-600" : "bg-indigo-50 text-indigo-600"
                )}>
                  {getIcon(item.icon || cat?.icon || 'Package', 20)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base text-slate-900 truncate">{item.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat?.color }}></div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">{item.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 md:gap-4 ml-9 md:ml-0">
                <div className="flex items-center justify-between bg-slate-50 p-1 rounded-xl w-28 shrink-0">
                  <button onClick={() => updateQty(item.id, qty, -1, item.name)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><Minus size={14}/></button>
                  <span className={cn("text-sm font-bold text-center flex-1", isLow ? "text-rose-600" : "text-slate-700")}>{qty} {item.unit}</span>
                  <button onClick={() => updateQty(item.id, qty, 1, item.name)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg text-slate-400 hover:text-indigo-600 shadow-sm transition-all"><Plus size={14}/></button>
                </div>

                <div className="w-36 shrink-0 hidden md:flex justify-center">
                  {item.expiryType !== 'none' && expiry ? (
                    <div className={cn(
                      "flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold w-full",
                      isExpired ? "bg-rose-50 text-rose-600" : isExpiringSoon ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                    )}>
                      <CalendarIcon size={12} className="shrink-0" />
                      <span className="truncate">
                        {isExpired ? 'หมดอายุแล้ว' : isExpiringSoon ? `อีก ${Math.ceil(diff!)} วัน` : (expiry ? formatBE(item.expiryDate!, 'd MMM yyyy') : 'ไม่ระบุ')}
                      </span>
                    </div>
                  ) : isLow ? (
                    <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold w-full bg-rose-50 text-rose-600">
                      <AlertTriangle size={12} className="shrink-0" />
                      <span className="truncate">ใกล้หมด (ขั้นต่ำ {threshold})</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold w-full bg-slate-50 text-slate-400">
                      <Package size={12} className="shrink-0" />
                      <span className="truncate">สต็อกปกติ</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => openModal(item)} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={async () => { if(confirm('ลบรายการนี้?')) { try { await deleteDoc(doc(db, 'supplies', item.id)); } catch(err) { handleFirestoreError(err, OperationType.DELETE, 'supplies'); } } }} className="w-8 h-8 flex items-center justify-center bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-100 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              {/* Mobile Expiry Status */}
              <div className="md:hidden ml-9">
                {item.expiryType !== 'none' && expiry ? (
                  <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold w-fit",
                    isExpired ? "bg-rose-50 text-rose-600" : isExpiringSoon ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                  )}>
                    <CalendarIcon size={12} className="shrink-0" />
                    <span>
                      {isExpired ? 'หมดอายุแล้ว' : isExpiringSoon ? `อีก ${Math.ceil(diff!)} วัน` : (expiry ? formatBE(item.expiryDate!, 'd MMM yyyy') : 'ไม่ระบุ')}
                    </span>
                  </div>
                ) : isLow ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold w-fit bg-rose-50 text-rose-600">
                    <AlertTriangle size={12} className="shrink-0" />
                    <span>ใกล้หมด (ขั้นต่ำ {threshold})</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold w-fit bg-slate-50 text-slate-400">
                    <Package size={12} className="shrink-0" />
                    <span>สต็อกปกติ</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="py-32 text-center text-slate-400 bg-white rounded-[40px] border-2 border-dashed border-slate-100 font-bold">ยังไม่มีรายการของใช้</div>
        )}
        {items.length > 0 && sortedItems.length === 0 && (
          <div className="py-20 text-center text-slate-400 bg-white rounded-[32px] border-2 border-dashed border-slate-100 font-bold">
            ไม่พบรายการที่ค้นหา
          </div>
        )}
      </div>
    </div>
  );
}
// --- Maintenance Log Component ---
function MaintenanceLog({ tasks }: { tasks: MaintenanceTask[] }) {
  const { user } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<MaintenanceTask>>({
    lastDone: format(new Date(), 'yyyy-MM-dd'),
    nextDue: format(addMonths(new Date(), 6), 'yyyy-MM-dd'),
    icon: 'Wrench'
  });

  const handleSave = async () => {
    console.log('Maintenance handleSave triggered', { formData, user: !!user });
    if (!formData.title || !formData.lastDone || !formData.nextDue || !user) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      console.warn('Maintenance handleSave validation failed');
      return;
    }
    if (formData.alertType === 'specific_date' && !formData.alertValue) {
      toast.error('กรุณาระบุวันที่แจ้งเตือน');
      return;
    }
    try {
      const data = {
        ...formData,
        uid: user.uid,
        createdAt: editingId ? (formData as any).createdAt : new Date().toISOString()
      };
      if (editingId) {
        const { id, ...updateData } = data as any;
        await updateDoc(doc(db, 'maintenanceTasks', editingId), updateData);
      } else {
        await addDoc(collection(db, 'maintenanceTasks'), data);
      }
      closeModal();
    } catch (err) {
      handleFirestoreError(err, editingId ? OperationType.UPDATE : OperationType.CREATE, 'maintenanceTasks');
    }
  };

  const openModal = (task?: MaintenanceTask) => {
    if (task) {
      setEditingId(task.id);
      setFormData(task);
    } else {
      setEditingId(null);
      setFormData({ 
        lastDone: format(new Date(), 'yyyy-MM-dd'), 
        nextDue: format(addMonths(new Date(), 6), 'yyyy-MM-dd'),
        icon: 'Wrench'
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900 mb-2">ดูแลบ้าน</h2>
          <p className="text-slate-400">บันทึกและแจ้งเตือนการดูแลบ้าน</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-indigo-600 text-white px-8 py-4 rounded-[24px] flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:scale-105 transition-all font-bold w-full md:w-auto"
        >
          <Plus size={24} />
          <span>เพิ่มรายการ</span>
        </button>
      </header>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden"
          >
            <h3 className="text-2xl font-serif italic mb-6 text-sky-900">{editingId ? 'แก้ไขบันทึก' : 'เพิ่มบันทึกการดูแล'}</h3>
            <div className="space-y-4 overflow-y-auto pr-2 flex-1 scrollbar-hide">
              <div className="flex gap-3">
                <div className="shrink-0">
                  <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block text-center">ไอคอน</label>
                  <IconPicker selected={formData.icon} onSelect={(icon) => setFormData({...formData, icon})} compact />
                </div>
                <div className="flex-1">
                  <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block">หัวข้อ</label>
                  <input 
                    type="text" 
                    placeholder="เช่น ล้างแอร์, เปลี่ยนไส้กรองน้ำ"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all font-bold text-slate-700 h-14"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block">ทำล่าสุดเมื่อ</label>
                  <QuickDatePicker 
                    value={formData.lastDone} 
                    onChange={(date) => setFormData({...formData, lastDone: date})} 
                  />
                </div>
                <div className="relative">
                  <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block">กำหนดครั้งถัดไป</label>
                  <QuickDatePicker 
                    value={formData.nextDue} 
                    onChange={(date) => setFormData({...formData, nextDue: date})} 
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest block">การแจ้งเตือนล่วงหน้า</label>
                <select
                  value={formData.alertType || 'none'}
                  onChange={e => setFormData({...formData, alertType: e.target.value as any, alertValue: e.target.value === 'specific_date' ? format(new Date(), 'yyyy-MM-dd') : 1})}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all font-bold text-slate-700 appearance-none"
                >
                  <option value="none">ไม่มีการแจ้งเตือนล่วงหน้า</option>
                  <option value="specific_date">ระบุวันที่แจ้งเตือน</option>
                  <option value="days_before">กี่วันก่อนครบกำหนด</option>
                  <option value="weeks_before">กี่สัปดาห์ก่อนครบกำหนด</option>
                  <option value="months_before">กี่เดือนก่อนครบกำหนด</option>
                </select>

                {formData.alertType === 'specific_date' && (
                  <QuickDatePicker 
                    value={formData.alertValue as string || format(new Date(), 'yyyy-MM-dd')} 
                    onChange={(date) => setFormData({...formData, alertValue: date})} 
                  />
                )}
                
                {(formData.alertType === 'days_before' || formData.alertType === 'weeks_before' || formData.alertType === 'months_before') && (
                  <div className="flex items-center gap-4">
                    <input 
                      type="number" 
                      min="1"
                      value={formData.alertValue as number || 1}
                      onChange={e => setFormData({...formData, alertValue: parseInt(e.target.value) || 1})}
                      className="w-24 p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all font-bold text-slate-700 text-center"
                    />
                    <span className="font-bold text-slate-600">
                      {formData.alertType === 'days_before' ? 'วัน' : formData.alertType === 'weeks_before' ? 'สัปดาห์' : 'เดือน'} ก่อนครบกำหนด
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 block">บันทึกเพิ่มเติม</label>
                <textarea 
                  rows={3}
                  placeholder="เบอร์ช่าง, รายละเอียด..."
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all font-bold text-slate-700 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-6 border-t border-slate-50 mt-4">
              <button onClick={closeModal} className="flex-1 py-5 rounded-2xl border border-slate-100 text-slate-400 font-bold hover:bg-slate-50 transition-colors">ยกเลิก</button>
              <button onClick={handleSave} className="flex-1 py-5 rounded-2xl bg-indigo-600 text-white font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">บันทึกรายการ</button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {tasks.map((task, index) => (
          <div key={task.id} className="bg-white p-3 md:p-4 rounded-[20px] border border-sky-100 shadow-sm relative group flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-6 text-center font-mono text-slate-300 font-bold text-base">{index + 1}</div>
              <div className="w-10 h-10 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 shrink-0">
                {getIcon(task.icon || 'Wrench', 20)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-base md:text-lg font-bold text-slate-800 truncate">{task.title}</h4>
                <p className="text-slate-400 text-xs md:text-sm">ทำล่าสุด: {format(parseISO(task.lastDone), 'd MMM yyyy', { locale: th })}</p>
                {task.alertType && task.alertType !== 'none' && (
                  <p className="text-amber-500 text-xs md:text-sm font-bold mt-1 flex items-center gap-1">
                    <Bell size={12} />
                    {task.alertType === 'specific_date' ? `เตือน: ${format(parseISO(task.alertValue as string), 'd MMM yyyy', { locale: th })}` :
                     task.alertType === 'days_before' ? `เตือนล่วงหน้า ${task.alertValue} วัน` :
                     task.alertType === 'weeks_before' ? `เตือนล่วงหน้า ${task.alertValue} สัปดาห์` :
                     `เตือนล่วงหน้า ${task.alertValue} เดือน`}
                  </p>
                )}
                {task.notes && (
                  <div className="text-xs md:text-sm text-slate-500 italic mt-0.5 truncate">
                    "{task.notes}"
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 md:w-auto w-full pl-9 md:pl-0">
              <div className="bg-sky-50/50 px-3 py-1.5 rounded-xl border border-sky-100 flex-1 md:flex-none">
                <div className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider mb-0.5">กำหนดครั้งต่อไป</div>
                <div className="flex items-center gap-1.5 text-sky-600 font-bold text-xs md:text-sm">
                  <CalendarIcon size={14} />
                  <span className="truncate">{format(parseISO(task.nextDue), 'd MMM yyyy', { locale: th })}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button onClick={() => openModal(task)} className="w-8 h-8 flex items-center justify-center bg-sky-50 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-100 transition-all">
                  <Edit2 size={14} />
                </button>
                <button onClick={async () => { if(confirm('ลบรายการนี้?')) { try { await deleteDoc(doc(db, 'maintenanceTasks', task.id)); } catch(err) { handleFirestoreError(err, OperationType.DELETE, 'maintenanceTasks'); } } }} className="w-8 h-8 flex items-center justify-center bg-sky-50 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-100 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="py-20 text-center text-slate-400 bg-white rounded-[32px] border-2 border-dashed border-sky-100 font-bold">
            ยังไม่มีบันทึกการดูแลบ้าน
          </div>
        )}
      </div>
    </div>
  );
}
