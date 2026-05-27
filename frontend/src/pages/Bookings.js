import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Calendar, Clock, DoorOpen, X } from 'lucide-react';
import { toast } from 'sonner';

const Bookings = () => {
  const { api, isAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await api.get('/bookings/my');
      setBookings(response.data);
    } catch (error) {
      toast.error('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta reserva?')) return;
    
    try {
      await api.delete(`/bookings/${bookingId}`);
      toast.success('Reserva cancelada com sucesso!');
      loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao cancelar reserva');
    }
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const isUpcoming = (data, hora_inicio) => {
    const bookingDateTime = new Date(`${data}T${hora_inicio}`);
    return bookingDateTime > new Date();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="bookings-page">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-primary">Minhas Reservas</h1>
          <p className="text-slate-600 mt-1">Gerencie suas reservas de salas</p>
        </div>

        {/* Bookings List */}
        {loading ? (
          <p className="text-center text-slate-500 py-8">Carregando...</p>
        ) : bookings.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="mx-auto h-16 w-16 text-slate-400 mb-4" />
            <p className="text-slate-600 text-lg mb-2">Você não possui reservas</p>
            <p className="text-sm text-slate-500">Comece reservando uma sala na página de Salas</p>
          </Card>
        ) : (
          <div className="space-y-4" data-testid="bookings-list">
            {bookings.map((booking) => (
              <Card 
                key={booking.id} 
                className="p-6 hover:shadow-md transition-shadow"
                data-testid={`booking-card-${booking.id}`}
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
                          <Calendar size={14} />
                          <span>{formatDate(booking.data)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{booking.hora_inicio} - {booking.hora_fim}</span>
                        </div>
                      </div>
                      {isUpcoming(booking.data, booking.hora_inicio) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200 mt-2">
                          Próxima
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    onClick={() => handleCancelBooking(booking.id)}
                    className="text-error hover:bg-error/10"
                    data-testid={`cancel-booking-${booking.id}`}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Bookings;