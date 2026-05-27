import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Calendar as CalendarIcon, DoorOpen, Clock, User } from 'lucide-react';
import { toast } from 'sonner';

const CalendarView = () => {
  const { api } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsRes, roomsRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/rooms')
      ]);
      setBookings(bookingsRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const bookingsForDate = bookings.filter(b => b.data === selectedDate);

  const getDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const dates = getDates();

  const getDayName = (dateStr) => {
    const date = new Date(dateStr);
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[date.getDay()];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="calendar-page">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-primary">Calendário de Reservas</h1>
          <p className="text-slate-600 mt-1">Visualize todas as reservas em um calendário</p>
        </div>

        {/* Date Selector */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          {dates.map((date) => {
            const isSelected = date === selectedDate;
            const dayNum = new Date(date).getDate();
            const dayName = getDayName(date);
            
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={`
                  flex flex-col items-center justify-center min-w-[80px] p-4 rounded-lg border-2 transition-all
                  ${isSelected 
                    ? 'bg-accent text-white border-accent shadow-md' 
                    : 'bg-white text-slate-700 border-slate-200 hover:border-accent hover:bg-accent/5'
                  }
                `}
                data-testid={`date-selector-${date}`}
              >
                <span className="text-sm font-medium">{dayName}</span>
                <span className="text-2xl font-bold mt-1">{dayNum}</span>
              </button>
            );
          })}
        </div>

        {/* Bookings for Selected Date */}
        {loading ? (
          <p className="text-center text-slate-500 py-8">Carregando...</p>
        ) : bookingsForDate.length === 0 ? (
          <Card className="p-12 text-center">
            <CalendarIcon className="mx-auto h-16 w-16 text-slate-400 mb-4" />
            <p className="text-slate-600 text-lg">Nenhuma reserva para {formatDate(selectedDate)}</p>
          </Card>
        ) : (
          <div className="space-y-4" data-testid="bookings-for-date">
            <h2 className="text-2xl font-semibold text-primary">
              Reservas para {formatDate(selectedDate)}
            </h2>
            
            {bookingsForDate.map((booking) => (
              <Card 
                key={booking.id} 
                className="p-6 hover:shadow-md transition-shadow"
                data-testid={`calendar-booking-${booking.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center">
                      <DoorOpen className="text-accent" size={28} />
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-primary mb-1">{booking.room_name}</h3>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{booking.hora_inicio} - {booking.hora_fim}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User size={14} />
                          <span>{booking.user_name}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                    Confirmada
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Rooms Summary */}
        <Card className="p-6">
          <h2 className="text-2xl font-semibold text-primary mb-4">Salas Disponíveis</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {rooms.map((room) => {
              const roomBookings = bookingsForDate.filter(b => b.room_id === room.id);
              const isAvailable = roomBookings.length === 0;
              
              return (
                <div 
                  key={room.id}
                  className={`p-4 rounded-lg border-2 ${
                    isAvailable 
                      ? 'bg-emerald-50 border-emerald-200' 
                      : 'bg-rose-50 border-rose-200'
                  }`}
                  data-testid={`room-summary-${room.id}`}
                >
                  <h4 className="font-semibold text-primary mb-1">{room.nome}</h4>
                  <p className="text-sm text-slate-600 mb-2">{room.localizacao}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isAvailable
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-100 text-rose-700 border border-rose-200'
                  }`}>
                    {isAvailable ? 'Disponível' : `${roomBookings.length} reserva(s)`}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CalendarView;
