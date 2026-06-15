import { useState, useEffect } from 'react';
import { 
  Users, Calendar, Stethoscope, Building2, Settings, 
  Layout, X, Plus, Search, Edit, Trash2, CheckCircle, 
  Clock, AlertCircle, Phone, Mail, MapPin, DollarSign,
  TrendingUp, Activity, BarChart3, Download, Filter
} from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  consultationFee: number;
  isAvailable: boolean;
  email?: string;
  phone?: string;
  qualifications?: string[];
}

interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  age: number;
  gender: string;
  clinicId: string;
}

interface Appointment {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  status: string;
}

interface ClinicDashboardProps {
  clinicId: string;
}

const ClinicDashboard: React.FC<ClinicDashboardProps> = ({ clinicId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDoctor, setShowAddDoctor] = useState(false);
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load data from localStorage only - NO API CALLS
  useEffect(() => {
    loadLocalData();
  }, [clinicId]);

  const loadLocalData = () => {
    setLoading(true);
    try {
      // Load doctors from localStorage
      const storedDoctors = localStorage.getItem(`clinic_${clinicId}_doctors`);
      if (storedDoctors) {
        setDoctors(JSON.parse(storedDoctors));
      } else {
        // Initialize with mock doctors
        const mockDoctors: Doctor[] = [
          {
            id: 'doc_1',
            name: 'Dr. Sarah Wilson',
            specialization: 'General Physician',
            experience: 8,
            consultationFee: 500,
            isAvailable: true,
            phone: '+91 98765 43210',
            email: 'sarah.wilson@clinic.com'
          },
          {
            id: 'doc_2',
            name: 'Dr. James Chen',
            specialization: 'Orthopedic',
            experience: 12,
            consultationFee: 800,
            isAvailable: true,
            phone: '+91 98765 43211',
            email: 'james.chen@clinic.com'
          },
          {
            id: 'doc_3',
            name: 'Dr. Priya Sharma',
            specialization: 'Cardiologist',
            experience: 15,
            consultationFee: 1200,
            isAvailable: false,
            phone: '+91 98765 43212',
            email: 'priya.sharma@clinic.com'
          }
        ];
        setDoctors(mockDoctors);
        localStorage.setItem(`clinic_${clinicId}_doctors`, JSON.stringify(mockDoctors));
      }

      // Load patients from localStorage
      const storedPatients = localStorage.getItem(`clinic_${clinicId}_patients`);
      if (storedPatients) {
        setPatients(JSON.parse(storedPatients));
      } else {
        // Initialize with mock patients
        const mockPatients: Patient[] = [
          {
            id: 'pat_1',
            name: 'Rajesh Kumar',
            phone: '+91 99887 66554',
            email: 'rajesh.kumar@email.com',
            age: 35,
            gender: 'Male',
            clinicId: clinicId
          },
          {
            id: 'pat_2',
            name: 'Priya Singh',
            phone: '+91 98765 12345',
            email: 'priya.singh@email.com',
            age: 28,
            gender: 'Female',
            clinicId: clinicId
          },
          {
            id: 'pat_3',
            name: 'Amit Patel',
            phone: '+91 87654 32109',
            email: 'amit.patel@email.com',
            age: 42,
            gender: 'Male',
            clinicId: clinicId
          }
        ];
        setPatients(mockPatients);
        localStorage.setItem(`clinic_${clinicId}_patients`, JSON.stringify(mockPatients));
      }

      // Load appointments from localStorage
      const storedAppointments = localStorage.getItem(`clinic_${clinicId}_appointments`);
      if (storedAppointments) {
        setAppointments(JSON.parse(storedAppointments));
      } else {
        // Initialize with mock appointments
        const mockAppointments: Appointment[] = [
          {
            id: 'apt_1',
            doctorId: 'doc_1',
            patientId: 'pat_1',
            patientName: 'Rajesh Kumar',
            doctorName: 'Dr. Sarah Wilson',
            date: new Date().toISOString().split('T')[0],
            time: '10:00 AM',
            status: 'confirmed'
          },
          {
            id: 'apt_2',
            doctorId: 'doc_2',
            patientId: 'pat_2',
            patientName: 'Priya Singh',
            doctorName: 'Dr. James Chen',
            date: new Date().toISOString().split('T')[0],
            time: '11:30 AM',
            status: 'pending'
          }
        ];
        setAppointments(mockAppointments);
        localStorage.setItem(`clinic_${clinicId}_appointments`, JSON.stringify(mockAppointments));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveDoctors = (newDoctors: Doctor[]) => {
    setDoctors(newDoctors);
    localStorage.setItem(`clinic_${clinicId}_doctors`, JSON.stringify(newDoctors));
  };

  const savePatients = (newPatients: Patient[]) => {
    setPatients(newPatients);
    localStorage.setItem(`clinic_${clinicId}_patients`, JSON.stringify(newPatients));
  };

  const saveAppointments = (newAppointments: Appointment[]) => {
    setAppointments(newAppointments);
    localStorage.setItem(`clinic_${clinicId}_appointments`, JSON.stringify(newAppointments));
  };

  const addDoctor = (doctor: Omit<Doctor, 'id'>) => {
    const newDoctor = {
      ...doctor,
      id: 'doc_' + Date.now(),
    };
    const updatedDoctors = [...doctors, newDoctor];
    saveDoctors(updatedDoctors);
    setShowAddDoctor(false);
    alert('Doctor added successfully!');
  };

  const updateDoctor = (id: string, doctorData: Partial<Doctor>) => {
    const updatedDoctors = doctors.map(d => 
      d.id === id ? { ...d, ...doctorData } : d
    );
    saveDoctors(updatedDoctors);
    setEditingDoctor(null);
    alert('Doctor updated successfully!');
  };

  const deleteDoctor = (id: string) => {
    if (confirm('Are you sure you want to delete this doctor?')) {
      const updatedDoctors = doctors.filter(d => d.id !== id);
      saveDoctors(updatedDoctors);
      alert('Doctor deleted successfully!');
    }
  };

  const addPatient = (patient: Omit<Patient, 'id' | 'clinicId'>) => {
    const newPatient = {
      ...patient,
      id: 'pat_' + Date.now(),
      clinicId: clinicId
    };
    const updatedPatients = [...patients, newPatient];
    savePatients(updatedPatients);
    setShowAddPatient(false);
    alert('Patient added successfully!');
  };

  const updatePatient = (id: string, patientData: Partial<Patient>) => {
    const updatedPatients = patients.map(p => 
      p.id === id ? { ...p, ...patientData } : p
    );
    savePatients(updatedPatients);
    setEditingPatient(null);
    alert('Patient updated successfully!');
  };

  const deletePatient = (id: string) => {
    if (confirm('Are you sure you want to delete this patient?')) {
      const updatedPatients = patients.filter(p => p.id !== id);
      savePatients(updatedPatients);
      alert('Patient deleted successfully!');
    }
  };

  const updateAppointmentStatus = (id: string, status: string) => {
    const updatedAppointments = appointments.map(apt =>
      apt.id === id ? { ...apt, status } : apt
    );
    saveAppointments(updatedAppointments);
    alert(`Appointment ${status}!`);
  };

  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date).toDateString();
    const today = new Date().toDateString();
    return aptDate === today;
  });

  const stats = {
    totalPatients: patients.length,
    totalDoctors: doctors.length,
    totalAppointments: appointments.length,
    todayAppointments: todayAppointments.length,
    availableDoctors: doctors.filter(d => d.isAvailable).length,
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Loading clinic dashboard...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>
          <Building2 size={28} color="#10b981" />
          <span>Clinic Dashboard</span>
        </div>
        
        <nav style={styles.nav}>
          <button 
            onClick={() => setActiveTab('overview')} 
            style={{...styles.navItem, ...(activeTab === 'overview' ? styles.navItemActive : {})}}
          >
            <BarChart3 size={18} />
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('doctors')} 
            style={{...styles.navItem, ...(activeTab === 'doctors' ? styles.navItemActive : {})}}
          >
            <Stethoscope size={18} />
            Doctors
          </button>
          <button 
            onClick={() => setActiveTab('patients')} 
            style={{...styles.navItem, ...(activeTab === 'patients' ? styles.navItemActive : {})}}
          >
            <Users size={18} />
            Patients
          </button>
          <button 
            onClick={() => setActiveTab('appointments')} 
            style={{...styles.navItem, ...(activeTab === 'appointments' ? styles.navItemActive : {})}}
          >
            <Calendar size={18} />
            Appointments
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.header}>
          <h2>Clinic Management</h2>
          <div style={styles.headerActions}>
            <button onClick={() => setShowAddDoctor(true)} style={styles.primaryButton}>
              <Plus size={16} /> Add Doctor
            </button>
            <button onClick={() => setShowAddPatient(true)} style={styles.secondaryButton}>
              <Plus size={16} /> Add Patient
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={{...styles.statIcon, background: '#e0f2fe'}}>
                  <Users size={24} color="#0284c7" />
                </div>
                <div style={styles.statInfo}>
                  <h3>{stats.totalPatients}</h3>
                  <p>Total Patients</p>
                </div>
              </div>
              
              <div style={styles.statCard}>
                <div style={{...styles.statIcon, background: '#dcfce7'}}>
                  <Stethoscope size={24} color="#16a34a" />
                </div>
                <div style={styles.statInfo}>
                  <h3>{stats.totalDoctors}</h3>
                  <p>Active Doctors</p>
                </div>
              </div>
              
              <div style={styles.statCard}>
                <div style={{...styles.statIcon, background: '#fef3c7'}}>
                  <Calendar size={24} color="#d97706" />
                </div>
                <div style={styles.statInfo}>
                  <h3>{stats.totalAppointments}</h3>
                  <p>Total Appointments</p>
                </div>
              </div>
              
              <div style={styles.statCard}>
                <div style={{...styles.statIcon, background: '#fce7f3'}}>
                  <Clock size={24} color="#db2777" />
                </div>
                <div style={styles.statInfo}>
                  <h3>{stats.todayAppointments}</h3>
                  <p>Today's Appointments</p>
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <h3>Today's Appointments</h3>
              <div style={styles.appointmentsList}>
                {todayAppointments.length === 0 ? (
                  <p style={styles.emptyState}>No appointments for today</p>
                ) : (
                  todayAppointments.map(apt => (
                    <div key={apt.id} style={styles.appointmentCard}>
                      <div style={styles.appointmentTime}>
                        <Clock size={16} />
                        <span>{apt.time}</span>
                      </div>
                      <div style={styles.appointmentInfo}>
                        <strong>{apt.patientName}</strong>
                        <span>with {apt.doctorName}</span>
                      </div>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        background: apt.status === 'confirmed' ? '#d1fae5' : '#fef3c7',
                        color: apt.status === 'confirmed' ? '#065f46' : '#92400e'
                      }}>
                        {apt.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={styles.section}>
              <h3>Recent Patients</h3>
              <div style={styles.patientsList}>
                {patients.slice(0, 5).map(patient => (
                  <div key={patient.id} style={styles.patientCard}>
                    <div style={styles.patientAvatar}>
                      {patient.name.charAt(0)}
                    </div>
                    <div style={styles.patientInfo}>
                      <strong>{patient.name}</strong>
                      <span>{patient.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div>
            <div style={styles.searchBar}>
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search doctors..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            
            <div style={styles.doctorsGrid}>
              {filteredDoctors.map(doctor => (
                <div key={doctor.id} style={styles.doctorCard}>
                  <div style={styles.doctorHeader}>
                    <div style={styles.doctorAvatar}>
                      {doctor.name.charAt(0)}
                    </div>
                    <div style={styles.doctorHeaderInfo}>
                      <h4>{doctor.name}</h4>
                      <p>{doctor.specialization}</p>
                    </div>
                    <span style={{
                      ...styles.availabilityBadge,
                      ...(doctor.isAvailable ? styles.available : styles.unavailable)
                    }}>
                      {doctor.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                  <div style={styles.doctorDetails}>
                    <p><strong>Experience:</strong> {doctor.experience} years</p>
                    <p><strong>Fee:</strong> ₹{doctor.consultationFee}</p>
                    {doctor.phone && <p><strong>Phone:</strong> {doctor.phone}</p>}
                  </div>
                  <div style={styles.doctorActions}>
                    <button onClick={() => setEditingDoctor(doctor)} style={styles.editButton}>
                      <Edit size={14} /> Edit
                    </button>
                    <button onClick={() => deleteDoctor(doctor.id)} style={styles.deleteButton}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div>
            <div style={styles.searchBar}>
              <Search size={18} />
              <input 
                type="text" 
                placeholder="Search patients by name, phone, or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={styles.searchInput}
              />
            </div>
            
            <div style={styles.patientsGrid}>
              {filteredPatients.map(patient => (
                <div key={patient.id} style={styles.patientCardFixed}>
                  <div style={styles.patientHeaderFixed}>
                    <div style={styles.patientAvatarLarge}>
                      {patient.name.charAt(0)}
                    </div>
                    <div style={styles.patientInfoFixed}>
                      <h4 style={styles.patientName}>{patient.name}</h4>
                      <div style={styles.patientBadges}>
                        <span style={styles.patientBadge}>{patient.age} years</span>
                        <span style={styles.patientBadge}>{patient.gender}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={styles.patientContactInfo}>
                    <div style={styles.contactItem}>
                      <Phone size={14} color="#10b981" />
                      <span>{patient.phone}</span>
                    </div>
                    <div style={styles.contactItem}>
                      <Mail size={14} color="#3b82f6" />
                      <span style={styles.emailText}>{patient.email}</span>
                    </div>
                  </div>
                  
                  <div style={styles.patientActionsFixed}>
                    <button onClick={() => setEditingPatient(patient)} style={styles.editButton}>
                      <Edit size={14} /> Edit
                    </button>
                    <button onClick={() => deletePatient(patient.id)} style={styles.deleteButton}>
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
              {filteredPatients.length === 0 && (
                <div style={styles.emptyState}>
                  <Users size={48} stroke="#cbd5e1" />
                  <p>No patients found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            <div style={styles.appointmentsTable}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Doctor</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map(apt => (
                    <tr key={apt.id}>
                      <td>{apt.patientName}</td>
                      <td>{apt.doctorName}</td>
                      <td>{new Date(apt.date).toLocaleDateString()}</td>
                      <td>{apt.time}</td>
                      <td>
                        <select 
                          value={apt.status}
                          onChange={(e) => updateAppointmentStatus(apt.id, e.target.value)}
                          style={styles.statusSelect}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={() => updateAppointmentStatus(apt.id, 'cancelled')} style={styles.cancelButton}>
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddDoctor && (
        <AddDoctorModal onClose={() => setShowAddDoctor(false)} onSave={addDoctor} />
      )}
      {editingDoctor && (
        <EditDoctorModal doctor={editingDoctor} onClose={() => setEditingDoctor(null)} onSave={updateDoctor} />
      )}
      {showAddPatient && (
        <AddPatientModal onClose={() => setShowAddPatient(false)} onSave={addPatient} />
      )}
      {editingPatient && (
        <EditPatientModal patient={editingPatient} onClose={() => setEditingPatient(null)} onSave={updatePatient} />
      )}
    </div>
  );
};

// Modal Components
const AddDoctorModal = ({ onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    experience: 0,
    consultationFee: 0,
    isAvailable: true,
    phone: '',
    email: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3>Add New Doctor</h3>
          <button onClick={onClose} style={styles.modalClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Doctor Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.modalInput} required />
          <input type="text" placeholder="Specialization" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} style={styles.modalInput} required />
          <input type="number" placeholder="Experience (years)" value={formData.experience} onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value)})} style={styles.modalInput} required />
          <input type="number" placeholder="Consultation Fee (₹)" value={formData.consultationFee} onChange={(e) => setFormData({...formData, consultationFee: parseInt(e.target.value)})} style={styles.modalInput} required />
          <input type="text" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={styles.modalInput} />
          <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={styles.modalInput} />
          <label style={styles.checkboxLabel}>
            <input type="checkbox" checked={formData.isAvailable} onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})} />
            Available for consultations
          </label>
          <button type="submit" style={styles.modalSubmit}>Add Doctor</button>
        </form>
      </div>
    </div>
  );
};

const EditDoctorModal = ({ doctor, onClose, onSave }: any) => {
  const [formData, setFormData] = useState(doctor);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(doctor.id, formData);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3>Edit Doctor</h3>
          <button onClick={onClose} style={styles.modalClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Doctor Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.modalInput} required />
          <input type="text" placeholder="Specialization" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} style={styles.modalInput} required />
          <input type="number" placeholder="Experience (years)" value={formData.experience} onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value)})} style={styles.modalInput} required />
          <input type="number" placeholder="Consultation Fee (₹)" value={formData.consultationFee} onChange={(e) => setFormData({...formData, consultationFee: parseInt(e.target.value)})} style={styles.modalInput} required />
          <label style={styles.checkboxLabel}>
            <input type="checkbox" checked={formData.isAvailable} onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})} />
            Available for consultations
          </label>
          <button type="submit" style={styles.modalSubmit}>Update Doctor</button>
        </form>
      </div>
    </div>
  );
};

const AddPatientModal = ({ onClose, onSave }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    age: 0,
    gender: 'Male'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3>Add New Patient</h3>
          <button onClick={onClose} style={styles.modalClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Patient Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.modalInput} required />
          <input type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={styles.modalInput} required />
          <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={styles.modalInput} required />
          <input type="number" placeholder="Age" value={formData.age} onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})} style={styles.modalInput} required />
          <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} style={styles.modalInput}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <button type="submit" style={styles.modalSubmit}>Add Patient</button>
        </form>
      </div>
    </div>
  );
};

const EditPatientModal = ({ patient, onClose, onSave }: any) => {
  const [formData, setFormData] = useState(patient);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(patient.id, formData);
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h3>Edit Patient</h3>
          <button onClick={onClose} style={styles.modalClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Patient Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.modalInput} required />
          <input type="tel" placeholder="Phone Number" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={styles.modalInput} required />
          <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={styles.modalInput} required />
          <input type="number" placeholder="Age" value={formData.age} onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})} style={styles.modalInput} required />
          <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} style={styles.modalInput}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <button type="submit" style={styles.modalSubmit}>Update Patient</button>
        </form>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-primary)',
  },
  sidebar: {
    width: '260px',
    background: 'var(--bg-card)',
    borderRight: '1px solid var(--border-color)',
    padding: '24px 16px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: 'var(--text-primary)',
    marginBottom: '32px',
    padding: '0 12px',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
    transition: 'all 0.2s',
  },
  navItemActive: {
    background: 'rgba(16, 185, 129, 0.1)',
    color: '#10b981',
  },
  mainContent: {
    flex: 1,
    padding: '24px 32px',
    overflow: 'auto' as const,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
  },
  primaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
  secondaryButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: 'var(--bg-card)',
    borderRadius: '12px',
    border: '1px solid var(--border-color)',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {
    flex: 1,
  },
  section: {
    background: 'var(--bg-card)',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '24px',
    border: '1px solid var(--border-color)',
  },
  appointmentsList: {
    marginTop: '16px',
  },
  appointmentCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px',
    borderBottom: '1px solid var(--border-color)',
  },
  appointmentTime: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-secondary)',
    fontSize: '14px',
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: '20px',
  },
  patientsList: {
    marginTop: '16px',
  },
  patientCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderBottom: '1px solid var(--border-color)',
  },
  patientAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#10b981',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
  },
  patientInfo: {
    flex: 1,
  },
  doctorsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  doctorCard: {
    background: 'var(--bg-card)',
    borderRadius: '12px',
    padding: '16px',
    border: '1px solid var(--border-color)',
  },
  doctorHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
  },
  doctorAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  doctorHeaderInfo: {
    flex: 1,
  },
  availabilityBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
  },
  available: {
    background: '#d1fae5',
    color: '#065f46',
  },
  unavailable: {
    background: '#fee2e2',
    color: '#991b1b',
  },
  doctorDetails: {
    marginBottom: '12px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
  },
  doctorActions: {
    display: 'flex',
    gap: '8px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '12px',
  },
  editButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: '#e0f2fe',
    color: '#0284c7',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  cancelButton: {
    padding: '4px 12px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--bg-card)',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    marginBottom: '20px',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    background: 'transparent',
    color: 'var(--text-primary)',
  },
  appointmentsTable: {
    background: 'var(--bg-card)',
    borderRadius: '12px',
    overflow: 'auto' as const,
    border: '1px solid var(--border-color)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  statusSelect: {
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '16px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(16, 185, 129, 0.2)',
    borderTopColor: '#10b981',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px',
    color: 'var(--text-secondary)',
  },
  modalOverlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'var(--bg-card)',
    borderRadius: '12px',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto' as const,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-color)',
  },
  modalClose: {
    background: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
  },
  modalInput: {
    width: 'calc(100% - 32px)',
    margin: '12px 16px',
    padding: '10px 12px',
    border: '1px solid var(--border-color)',
    borderRadius: '6px',
    fontSize: '14px',
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: '12px 16px',
    fontSize: '14px',
    color: 'var(--text-primary)',
  },
  modalSubmit: {
    width: 'calc(100% - 32px)',
    margin: '16px',
    padding: '10px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
  },
  patientsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '20px',
    marginTop: '20px',
  },
  patientCardFixed: {
    background: 'var(--bg-card)',
    borderRadius: '16px',
    padding: '20px',
    border: '1px solid var(--border-color)',
    transition: 'all 0.3s ease',
  },
  patientHeaderFixed: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid var(--border-color)',
  },
  patientAvatarLarge: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    flexShrink: 0,
  },
  patientInfoFixed: {
    flex: 1,
    minWidth: 0,
  },
  patientName: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: '0 0 8px 0',
  },
  patientBadges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap' as const,
  },
  patientBadge: {
    padding: '4px 12px',
    background: 'var(--badge-bg)',
    borderRadius: '20px',
    fontSize: '12px',
    color: 'var(--badge-text)',
    fontWeight: '500',
  },
  patientContactInfo: {
    marginBottom: '16px',
    padding: '12px 0',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  contactItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '14px',
    color: 'var(--text-secondary)',
    overflow: 'hidden',
  },
  emailText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  patientActionsFixed: {
    display: 'flex',
    gap: '12px',
    paddingTop: '12px',
    borderTop: '1px solid var(--border-color)',
  },
};

// Add spin animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ClinicDashboard;