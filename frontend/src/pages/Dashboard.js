import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  DoorOpen, 
  Calendar, 
  Clock,
  TrendingUp,
  Users,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    rooms_available: 0,
    bookings_today: 0,
    my_bookings: 0,
    total_users: 0,
    upcoming_bookings: []
  });
  const [todayBookings, setTodayBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const todayFormatted = `${weekDays[today.getDay()]}, ${today.getDate()} de ${months[today.getMonth()]}`;

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, roomsRes, myBookingsRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/rooms'),
        api.get('/bookings/my')
      ]);

      setStats(statsRes.data);
      setRooms(roomsRes.data);
      
      const todayStr = today.toISOString().split('T')[0];
      const todayBookingsList = myBookingsRes.data.filter(b => b.data === todayStr);
      setTodayBookings(todayBookingsList);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeStr) => {
    return timeStr;
  };

  const getRoomStatus = (roomId) => {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const todayStr = now.toISOString().split('T')[0];

    // Verifica se há reserva ativa agora para esta sala
    const hasActiveBooking = stats.upcoming_bookings?.some(booking => 
      booking.room_id === roomId && 
      booking.data === todayStr &&
      booking.hora_inicio <= currentTime &&
      booking.hora_fim >= currentTime
    );

    return hasActiveBooking ? 'OCUPADA' : 'LIVRE';
  };

  const StatCard = ({ icon: Icon, value, label, bgColor, iconColor }) => (
    <Card className="p-6 hover:shadow-md transition-all">
      <div className="flex flex-col gap-4">
        <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
          <Icon className={iconColor} size={24} />
        </div>
        <div>
          <p className="text-3xl font-bold text-slate-900">{value}</p>
          <p className="text-sm text-slate-600 mt-1">{label}</p>
        </div>
      </div>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="space-y-8" data-testid="dashboard">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-slate-500 text-sm mb-2">{todayFormatted}</p>
            <h1 className="text-4xl font-bold text-slate-900">
              Olá, {user?.nome.split(' ')[0]} 👋
            </h1>
          </div>
          <Button 
            onClick={() => navigate('/rooms')}
            className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white"
            data-testid="new-booking-button"
          >
            <Plus className="mr-2 h-5 w-5" />
            Nova Reserva
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={DoorOpen}
            value={stats.rooms_available}
            label="Salas Disponíveis"
            bgColor="bg-blue-50"
            iconColor="text-blue-600"
          />
          <StatCard
            icon={Calendar}
            value={stats.bookings_today}
            label="Reservas Hoje"
            bgColor="bg-emerald-50"
            iconColor="text-emerald-600"
          />
          <StatCard
            icon={Clock}
            value={todayBookings.length}
            label="Minhas Reservas Hoje"
            bgColor="bg-amber-50"
            iconColor="text-amber-600"
          />
          <StatCard
            icon={TrendingUp}
            value={stats.my_bookings}
            label="Total Ativas"
            bgColor="bg-purple-50"
            iconColor="text-purple-600"
          />
        </div>

        {/* Reservas de Hoje & Próximas Reservas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Reservas de Hoje */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Reservas de Hoje</h2>
              <span className="text-2xl font-bold text-blue-600">{todayBookings.length}</span>
            </div>

            {todayBookings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                <p className="text-slate-500">Nenhuma reserva hoje</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todayBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{booking.room_name}</p>
                        <p className="text-sm text-slate-600 mt-1">
                          {formatTime(booking.hora_inicio)} - {formatTime(booking.hora_fim)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Reservado por: <span className="font-medium text-slate-700">{booking.user_name}</span>
                        </p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                        Confirmada
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Minhas Próximas Reservas */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Minhas Próximas Reservas</h2>
              <button
                onClick={() => navigate('/bookings')}
                className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1"
              >
                Ver todas
                <ArrowRight size={16} />
              </button>
            </div>

            {stats.upcoming_bookings && stats.upcoming_bookings.length === 0 ? (
              <div className="text-center py-12">
                <Users className="mx-auto h-16 w-16 text-slate-300 mb-4" />
                <p className="text-slate-500 mb-3">Você não tem reservas ativas</p>
                <button
                  onClick={() => navigate('/rooms')}
                  className="text-blue-600 text-sm font-medium hover:text-blue-700"
                >
                  Fazer uma reserva
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.upcoming_bookings?.slice(0, 3).map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{booking.room_name}</p>
                        <p className="text-sm text-slate-600 mt-1">
                          {booking.data.split('-').reverse().join('/')} • {formatTime(booking.hora_inicio)} - {formatTime(booking.hora_fim)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Reservado por: <span className="font-medium text-slate-700">{booking.user_name}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Visão Geral das Salas */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">Visão Geral das Salas</h2>
          
          {loading ? (
            <p className="text-center text-slate-500 py-8">Carregando...</p>
          ) : rooms.length === 0 ? (
            <Card className="p-12 text-center">
              <DoorOpen className="mx-auto h-16 w-16 text-slate-400 mb-4" />
              <p className="text-slate-600 text-lg">Nenhuma sala cadastrada</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => {
                const status = getRoomStatus(room.id);
                const isAvailable = status === 'LIVRE';

                return (
                  <Card 
                    key={room.id} 
                    className="p-6 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate('/rooms')}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {room.nome}
                        </h3>
                        <p className="text-sm text-slate-600">{room.localizacao}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isAvailable 
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                          : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}>
                        {status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users size={16} />
                      <span>{room.capacidade} pessoas</span>
                    </div>

                    {room.amenidades && room.amenidades.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {room.amenidades.slice(0, 3).map((amenidade, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded"
                          >
                            {amenidade}
                          </span>
                        ))}
                        {room.amenidades.length > 3 && (
                          <span className="px-2 py-1 text-slate-500 text-xs">
                            +{room.amenidades.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
