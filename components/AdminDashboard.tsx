
import React, { useState, useMemo } from 'react';
import { User, EmergencyAlert, Inpatient, ScheduleItem, PharmacyItem, Prescription, MedicalRecord, AdmissionStatus, MedicalBoardMeeting, HistoryItem } from '../types';
import { 
  ShieldCheck, LayoutDashboard, ShoppingBag, Pill, FileText, 
  Settings, Search, Plus, Trash2, Edit, Save, X, RefreshCw, 
  CheckCircle, AlertCircle, ChevronRight, Activity, Users, Clock, Hospital,
  User as UserIcon, Filter, Megaphone, Briefcase, Bell, Calendar, Fingerprint,
  HeartPulse, Thermometer, ShieldAlert, ClipboardList, SortAsc, SortDesc, UserPlus, CalendarDays,
  CreditCard, Check
} from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  activeAlerts: EmergencyAlert[];
  inpatients: Inpatient[];
  schedules: ScheduleItem[];
  boardMeetings: MedicalBoardMeeting[];
  pharmacyStock: PharmacyItem[];
  allPrescriptions: Prescription[];
  onUpdateStock: (stock: PharmacyItem[]) => void;
  onUpdatePrescriptionStatus: (id: string, status: Prescription['status']) => void;
  onUpdatePatientRecord: (patientId: string, record: MedicalRecord) => void;
  onDeleteEmergency: (id: string) => void;
  onDeleteInpatient: (id: string) => void;
  onDeleteMeeting: (id: string) => void;
  onCreateEmergency: (data: Omit<EmergencyAlert, 'id' | 'status' | 'timestamp' | 'medicalSummary'>) => void;
  onRegisterPatient?: (data: { name: string, status: AdmissionStatus, ward: string, bloodType: string, allergies: string, dob?: string, id?: string }) => void;
}

type AdminTab = 'OVERVIEW' | 'PHARMACY' | 'PRESCRIPTIONS' | 'PATIENTS' | 'LOGISTICS';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  user, activeAlerts, inpatients, schedules, boardMeetings, pharmacyStock, 
  allPrescriptions, onUpdateStock, onUpdatePrescriptionStatus, onUpdatePatientRecord,
  onDeleteEmergency, onDeleteInpatient, onDeleteMeeting, onCreateEmergency,
  onRegisterPatient
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AdmissionStatus | 'ALL'>('ALL');
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  
  // Patient Detail & Edit State
  const [selectedPatient, setSelectedPatient] = useState<Inpatient | null>(null);
  const [isEditingRecord, setIsEditingRecord] = useState(false);
  const [editRecordForm, setEditRecordForm] = useState<MedicalRecord | null>(null);

  // Form States
  const [regPatient, setRegPatient] = useState({ name: '', dob: '', id: '', ward: 'Admission Hub', status: AdmissionStatus.ADMITTED });
  const [emergencyReport, setEmergencyReport] = useState<Omit<EmergencyAlert, 'id' | 'status' | 'timestamp' | 'medicalSummary'>>({ 
    patientName: '', 
    age: '', 
    sex: 'M', 
    incidentType: '', 
    patientId: 'GUEST' 
  });

  // Memoized Advanced Filtering for Patients
  const filteredPatients = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return inpatients
      .filter(p => {
        const matchesSearch = query === '' || 
          p.patientName.toLowerCase().includes(query) || 
          p.id.toLowerCase().includes(query) ||
          p.ward.toLowerCase().includes(query) ||
          p.status.toLowerCase().replace(/_/g, ' ').includes(query);

        const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        const timeA = new Date(a.admissionDate).getTime();
        const timeB = new Date(b.admissionDate).getTime();
        return sortOrder === 'DESC' ? timeB - timeA : timeA - timeB;
      });
  }, [inpatients, searchQuery, statusFilter, sortOrder]);

  const handleToggleStock = (id: string) => {
    const updated = pharmacyStock.map(item => item.id === id ? { ...item, available: !item.available } : item);
    onUpdateStock(updated);
  };

  const handleEmergencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateEmergency(emergencyReport);
    setShowEmergencyModal(false);
    setEmergencyReport({ patientName: '', age: '', sex: 'M', incidentType: '', patientId: 'GUEST' });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onRegisterPatient) {
      onRegisterPatient({
        name: regPatient.name,
        dob: regPatient.dob,
        id: regPatient.id,
        ward: regPatient.ward,
        status: regPatient.status,
        bloodType: 'Pending',
        allergies: 'None recorded'
      });
      setShowRegisterModal(false);
      setRegPatient({ name: '', dob: '', id: '', ward: 'Admission Hub', status: AdmissionStatus.ADMITTED });
    }
  };

  const openPatientDetails = (patient: Inpatient) => {
    setSelectedPatient(patient);
    setEditRecordForm(patient.medicalSummary);
    setIsEditingRecord(false);
  };

  const handleSaveRecord = () => {
    if (selectedPatient && editRecordForm) {
      onUpdatePatientRecord(selectedPatient.id, {
        ...editRecordForm,
        lastUpdated: new Date().toISOString()
      });
      setIsEditingRecord(false);
      setSelectedPatient({
        ...selectedPatient,
        medicalSummary: { ...editRecordForm, lastUpdated: new Date().toISOString() }
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 space-y-6 md:space-y-8 animate-in fade-in slide-in-from-top-4 duration-700 pb-20">
      
      {/* Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-royal-blue/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowRegisterModal(false)} />
          <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3"><UserPlus className="text-royal-blue w-8 h-8" /> Patient Registration</h3>
                <p className="text-slate-500 font-medium mt-1">Enroll a new patient node into the system.</p>
              </div>
              <button onClick={() => setShowRegisterModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                <div className="relative">
                  <input type="text" placeholder="John Doe" required className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={regPatient.name} onChange={e => setRegPatient({...regPatient, name: e.target.value})} />
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Birth Date</label>
                  <input type="date" required className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={regPatient.dob} onChange={e => setRegPatient({...regPatient, dob: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Patient ID</label>
                  <input type="text" placeholder="MP-0000" required className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-blue-100 transition-all" value={regPatient.id} onChange={e => setRegPatient({...regPatient, id: e.target.value})} />
                </div>
              </div>
              <button type="submit" className="w-full py-5 gradient-blue text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-900/30 hover:-translate-y-1 transition-all">
                Add to Census
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Emergency Broadcast Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-red-900/60 backdrop-blur-sm animate-in fade-in" onClick={() => setShowEmergencyModal(false)} />
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3"><Megaphone className="text-red-500 w-8 h-8" /> SOS Broadcast</h3>
                <p className="text-slate-500 font-medium mt-1">Initialize a system-wide emergency alert.</p>
              </div>
              <button onClick={() => setShowEmergencyModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-6 h-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleEmergencySubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Patient Identity</label>
                <input type="text" placeholder="Name or 'Unidentified'" required className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-red-100 transition-all" value={emergencyReport.patientName} onChange={e => setEmergencyReport({...emergencyReport, patientName: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Patient Age</label>
                  <input type="number" placeholder="Estimated Age" required className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-red-100 transition-all" value={emergencyReport.age} onChange={e => setEmergencyReport({...emergencyReport, age: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Sex</label>
                  <select className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-red-100 transition-all" value={emergencyReport.sex} onChange={e => setEmergencyReport({...emergencyReport, sex: e.target.value as any})}>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Incident Type</label>
                <input type="text" placeholder="Stroke, Trauma, Cardiac..." required className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold outline-none focus:ring-4 focus:ring-red-100 transition-all" value={emergencyReport.incidentType} onChange={e => setEmergencyReport({...emergencyReport, incidentType: e.target.value})} />
              </div>
              <button type="submit" className="w-full py-5 bg-red-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl shadow-red-900/20 hover:-translate-y-1 transition-all">
                Emit SOS Signal
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
             <div className="w-2 h-2 rounded-full bg-royal-blue animate-pulse shadow-[0_0_10px_rgba(0,35,102,0.5)]" />
             <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Administrator Command Console</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-tight">System Oversight</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium">Logged in as: <span className="text-royal-blue font-bold">{user.name}</span></p>
        </div>
        
        <div className="flex justify-center">
          <button onClick={() => setShowEmergencyModal(true)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-red-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/10 hover:scale-105 transition-all">
            <Megaphone className="w-4 h-4 md:w-5 md:h-5" /> Manual SOS
          </button>
        </div>
      </header>

      {/* Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 overflow-x-auto no-scrollbar scroll-smooth">
        <NavBtn active={activeTab === 'OVERVIEW'} onClick={() => setActiveTab('OVERVIEW')} icon={<LayoutDashboard className="w-4 h-4" />} label="Metrics" />
        <NavBtn active={activeTab === 'PATIENTS'} onClick={() => setActiveTab('PATIENTS')} icon={<Users className="w-4 h-4" />} label="Census" />
        <NavBtn active={activeTab === 'PHARMACY'} onClick={() => setActiveTab('PHARMACY')} icon={<ShoppingBag className="w-4 h-4" />} label="Inventory" />
        <NavBtn active={activeTab === 'PRESCRIPTIONS'} onClick={() => setActiveTab('PRESCRIPTIONS')} icon={<Pill className="w-4 h-4" />} label="RX Buffer" />
        <NavBtn active={activeTab === 'LOGISTICS'} onClick={() => setActiveTab('LOGISTICS')} icon={<Briefcase className="w-4 h-4" />} label="Logistics" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
          <div className="lg:col-span-12 space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatCard title="Active Signals" value={activeAlerts.length} icon={<AlertCircle />} color="text-red-600" bg="bg-red-50" />
              <StatCard title="Inpatients" value={inpatients.length} icon={<Users />} color="text-royal-blue" bg="bg-blue-50" />
              <StatCard title="Stock Items" value={pharmacyStock.length} icon={<ShoppingBag />} color="text-emerald-600" bg="bg-emerald-50" />
              <StatCard title="RX Queue" value={allPrescriptions.length} icon={<Pill />} color="text-orange-600" bg="bg-orange-50" />
            </div>

            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm">
               <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3"><Bell className="text-red-500 w-5 h-5" /> System Alerts</h3>
               <div className="space-y-4">
                 {activeAlerts.map(alert => (
                   <div key={alert.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div>
                       <h5 className="font-black text-slate-900">{alert.patientName} <span className="text-slate-400 font-bold ml-1 text-xs">{alert.age}yr • {alert.sex}</span></h5>
                       <p className="text-[10px] text-red-600 font-black uppercase tracking-widest mt-1 flex items-center gap-2"><AlertCircle className="w-3 h-3" /> {alert.incidentType}</p>
                     </div>
                     <button onClick={() => onDeleteEmergency(alert.id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                   </div>
                 ))}
                 {activeAlerts.length === 0 && <p className="text-slate-400 italic text-center py-10 text-sm">Signal buffer clear. No active emergencies.</p>}
               </div>
            </div>
          </div>
        )}

        {/* PATIENTS TAB */}
        {activeTab === 'PATIENTS' && (
          <div className="lg:col-span-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-500">
             <div className="p-6 md:p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-4 max-w-4xl">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight whitespace-nowrap">Clinical Census</h3>
                  <div className="relative flex-1 group">
                    <input type="text" placeholder="Search by name, ID, or ward..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-slate-100 font-bold text-sm focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                  </div>
                  <button onClick={() => setShowRegisterModal(true)} className="px-6 py-3 bg-royal-blue text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-all">
                    <UserPlus className="w-4 h-4" /> Register Patient
                  </button>
                </div>
             </div>
             <div className="p-6 md:p-8 space-y-3">
               {filteredPatients.map(p => (
                 <div key={p.id} className="p-5 rounded-3xl bg-slate-50 flex items-center justify-between group hover:bg-white border border-transparent hover:border-slate-100 transition-all shadow-sm">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><UserIcon className="text-slate-300 w-5 h-5" /></div>
                     <div>
                       <h5 className="font-black text-slate-900 text-sm md:text-base">{p.patientName}</h5>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">ID: {p.id.slice(0, 8)} • {p.ward}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-4">
                     <StatusBadge status={p.status} />
                     <button onClick={() => onDeleteInpatient(p.id)} className="p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                   </div>
                 </div>
               ))}
               {filteredPatients.length === 0 && <p className="text-slate-400 italic text-center py-20 text-sm">No clinical records found.</p>}
             </div>
          </div>
        )}

        {/* PHARMACY TAB */}
        {activeTab === 'PHARMACY' && (
          <div className="lg:col-span-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in duration-500 overflow-hidden">
             <div className="p-6 md:p-8 border-b border-slate-50 bg-slate-50/30">
               <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Inventory Management</h3>
             </div>
             <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pharmacyStock.map(item => (
                    <div key={item.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                         <div>
                           <h5 className="font-black text-slate-900">{item.name}</h5>
                           <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{item.category}</p>
                         </div>
                         <button onClick={() => handleToggleStock(item.id)} className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${item.available ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-500 border border-red-100'}`}>
                           {item.available ? 'In Stock' : 'Out of Stock'}
                         </button>
                      </div>
                      <div className="flex items-center justify-between text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                        <span>Ref: {item.id}</span>
                        <span>Sync: {new Date(item.lastRestocked).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}

        {/* PRESCRIPTIONS TAB */}
        {activeTab === 'PRESCRIPTIONS' && (
          <div className="lg:col-span-12 bg-white rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in duration-500 overflow-hidden">
             <div className="p-6 md:p-8 border-b border-slate-50 bg-slate-50/30">
               <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Prescription Fulfillment Queue</h3>
             </div>
             <div className="p-6 md:p-8 space-y-4">
                {allPrescriptions.map(px => (
                  <div key={px.id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm"><Pill className="text-royal-blue w-5 h-5" /></div>
                      <div>
                        <h5 className="font-black text-slate-900">{px.medication} <span className="text-slate-400 font-bold text-xs ml-1">• {px.dosage}</span></h5>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Patient: {px.patientName || 'Anonymous'} • Prescribed by: {px.prescribedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <select 
                         className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-[9px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-100"
                         value={px.status}
                         onChange={(e) => onUpdatePrescriptionStatus(px.id, e.target.value as any)}
                       >
                         <option value="ORDERED">Ordered</option>
                         <option value="APPROVED">Approved</option>
                         <option value="READY_FOR_PICKUP">Ready for Pickup</option>
                       </select>
                       <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${px.status === 'READY_FOR_PICKUP' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-royal-blue'}`}>
                         {px.status.replace(/_/g, ' ')}
                       </span>
                    </div>
                  </div>
                ))}
                {allPrescriptions.length === 0 && <p className="text-slate-400 italic text-center py-20 text-sm">RX queue is currently empty.</p>}
             </div>
          </div>
        )}

        {/* LOGISTICS TAB */}
        {activeTab === 'LOGISTICS' && (
          <div className="lg:col-span-12 space-y-6 animate-in fade-in duration-500">
             <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-sm">
               <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-6 tracking-tight">Clinical Board Agenda</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {boardMeetings.map(m => (
                   <div key={m.id} className="p-6 rounded-[1.5rem] bg-slate-50 border border-transparent hover:border-royal-blue/20 transition-all flex items-center justify-between gap-4">
                     <div>
                       <span className="text-[9px] font-black text-royal-blue uppercase tracking-widest">{m.date} • {m.time}</span>
                       <h4 className="text-lg font-black text-slate-900 mt-1 leading-tight">{m.title}</h4>
                       <p className="text-[10px] text-slate-500 font-medium">{m.specialty}</p>
                     </div>
                     <button onClick={() => onDeleteMeeting(m.id)} className="p-3 text-slate-300 hover:text-red-500 transition-all"><Trash2 className="w-5 h-5" /></button>
                   </div>
                 ))}
                 {boardMeetings.length === 0 && <p className="text-slate-400 italic py-10 text-center text-sm col-span-2">No upcoming board reviews.</p>}
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Internal Layout Components
const NavBtn: React.FC<{active: boolean; onClick: () => void; icon: React.ReactNode; label: string}> = ({active, onClick, icon, label}) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${active ? 'bg-white text-royal-blue shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{icon} {label}</button>
);

const StatCard: React.FC<{title: string; value: number | string; icon: React.ReactNode; color: string; bg: string}> = ({title, value, icon, color, bg}) => (
  <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:shadow-xl transition-all">
    <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform`}>{React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' }) : icon}</div>
    <div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{title}</p>
      <p className={`text-3xl font-black ${color} tracking-tighter`}>{value}</p>
    </div>
  </div>
);

const StatusBadge: React.FC<{status: AdmissionStatus}> = ({status}) => {
  const styles = { 
    [AdmissionStatus.ON_THE_WAY]: "bg-blue-50 text-royal-blue border-blue-100", 
    [AdmissionStatus.ADMITTED]: "bg-emerald-50 text-emerald-600 border-emerald-100", 
    [AdmissionStatus.DISCHARGED]: "bg-slate-100 text-slate-400 border-slate-200" 
  };
  return <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${styles[status]}`}>{status.replace(/_/g, ' ')}</span>;
};

export default AdminDashboard;
