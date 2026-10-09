import {useEffect,useState} from 'react';
import {useAppointments} from '../contexts/AppointmentsContext';
import {waitlistService} from '../lib/scheduling';
import type {WaitlistEntry} from '../lib/scheduling';
export function AgendaResults(){
 const{currentTenant,appointments}=useAppointments();const[entries,setEntries]=useState<WaitlistEntry[]>([]);const[error,setError]=useState('');
 useEffect(()=>{let stale=false;setEntries([]);setError('');void waitlistService.list(currentTenant.id).then(rows=>{if(!stale)setEntries(rows);}).catch(()=>{if(!stale)setError('Não foi possível carregar os resultados da fila.');});return()=>{stale=true;};},[currentTenant.id,appointments]);
 const booked=entries.filter(e=>e.status==='booked');const completed=booked.filter(e=>appointments.some(a=>a.id===e.appointment_id&&a.status==='completed'));
 const stats=[['Cancelados registrados',appointments.filter(a=>a.status==='canceled').length],['Reservas pela lista de espera',booked.length],['Concluídos após reserva pela fila',completed.length]] as const;
 return <section className="border border-stone-200 dark:border-stone-800 rounded-2xl p-6 bg-white dark:bg-stone-900 space-y-3"><h3 className="font-bold text-lg">Resultados da recuperação de agenda</h3><p className="text-sm text-stone-500">Contagem dos registros existentes desde o início. Reservas e atendimentos concluídos não significam pagamento recebido.</p>{error?<p role="alert">{error}</p>:<div className="grid sm:grid-cols-3 gap-3">{stats.map(([label,value])=><div key={label} className="rounded-xl bg-stone-50 dark:bg-stone-950 p-4"><p className="text-sm">{label}</p><strong className="text-2xl">{value}</strong></div>)}</div>}</section>;
}
