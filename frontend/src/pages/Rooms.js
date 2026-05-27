import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { DoorOpen, Plus, MapPin, Users, Calendar, Trash2, Edit } from 'lucide-react';
import { toast } from 'sonner';

const Rooms = () => {
  const { api, isAdmin } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  const [roomForm, setRoomForm] = useState({
    nome: '',
    localizacao: '',
    capacidade: ''
  });

  const [bookingForm, setBookingForm] = useState({
    data_inicio: '',
    data_fim: '',
    hora_inicio: '',
    hora_fim: '',
    justificativa: ''
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data);
    } catch (error) {
      toast.error('Erro ao carregar salas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/rooms', {
        ...roomForm,
        capacidade: parseInt(roomForm.capacidade)
      });
      toast.success('Sala criada com sucesso!');
      setDialogOpen(false);
      setRoomForm({ nome: '', localizacao: '', capacidade: '' });
      loadRooms();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar sala');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Tem certeza que deseja desativar esta sala?')) return;
    
    try {
      await api.delete(`/rooms/${roomId}`);
      toast.success('Sala desativada com sucesso!');
      loadRooms();
    } catch (error) {
      toast.error('Erro ao desativar sala');
    }
  };

  const handleBookRoom = async (e) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    const endDate = bookingForm.data_fim || bookingForm.data_inicio;

    if (!bookingForm.justificativa.trim()) {
      toast.error('Informe um titulo ou justificativa para a reserva.');
      return;
    }

    if (bookingForm.data_inicio < todayStr || endDate < todayStr) {
      toast.error('Nao e permitido reservar datas anteriores ao dia atual.');
      return;
    }

    if (endDate < bookingForm.data_inicio) {
      toast.error('A data de inicio nao pode ser maior que a data fim.');
      return;
    }

    if (bookingForm.hora_fim <= bookingForm.hora_inicio) {
      toast.error('A hora fim deve ser maior que a hora inicio.');
      return;
    }

    try {
      const response = await api.post('/bookings', {
        room_id: selectedRoom.id,
        ...bookingForm
      });
      const result = response.data;
      toast.success(`${result.total} reserva(s) criada(s) com sucesso!`);
      setBookingDialogOpen(false);
      setBookingForm({ data_inicio: '', data_fim: '', hora_inicio: '', hora_fim: '', justificativa: '' });
      setSelectedRoom(null);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar reserva');
    }
  };

  const openBookingDialog = (room) => {
    setSelectedRoom(room);
    setBookingDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="rooms-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary">Salas de Reunião</h1>
            <p className="text-slate-600 mt-1">Gerencie e reserve salas disponíveis</p>
          </div>
          
          {isAdmin && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-12" data-testid="create-room-button">
                  <Plus className="mr-2 h-5 w-5" />
                  Criar Sala
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Sala</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome da Sala</Label>
                    <Input
                      id="nome"
                      value={roomForm.nome}
                      onChange={(e) => setRoomForm({ ...roomForm, nome: e.target.value })}
                      placeholder="Ex: Sala de Reunião 1"
                      required
                      data-testid="room-name-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="localizacao">Localização</Label>
                    <Input
                      id="localizacao"
                      value={roomForm.localizacao}
                      onChange={(e) => setRoomForm({ ...roomForm, localizacao: e.target.value })}
                      placeholder="Ex: 2º Andar - Ala A"
                      required
                      data-testid="room-location-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacidade">Capacidade (pessoas)</Label>
                    <Input
                      id="capacidade"
                      type="number"
                      value={roomForm.capacidade}
                      onChange={(e) => setRoomForm({ ...roomForm, capacidade: e.target.value })}
                      placeholder="Ex: 10"
                      min="1"
                      required
                      data-testid="room-capacity-input"
                    />
                  </div>
                  <Button type="submit" className="w-full" data-testid="submit-room-button">
                    Criar Sala
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Rooms Grid */}
        {loading ? (
          <p className="text-center text-slate-500 py-8">Carregando...</p>
        ) : rooms.length === 0 ? (
          <Card className="p-12 text-center">
            <DoorOpen className="mx-auto h-16 w-16 text-slate-400 mb-4" />
            <p className="text-slate-600 text-lg">Nenhuma sala cadastrada</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="rooms-grid">
            {rooms.map((room) => (
              <Card 
                key={room.id} 
                className="p-6 hover:shadow-lg transition-all hover:border-accent"
                data-testid={`room-card-${room.id}`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                      <DoorOpen className="text-accent" size={24} />
                    </div>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRoom(room.id)}
                        className="text-error hover:bg-error/10"
                        data-testid={`delete-room-${room.id}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold text-primary mb-1">{room.nome}</h3>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} />
                        <span>{room.localizacao}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users size={14} />
                        <span>Capacidade: {room.capacidade} pessoas</span>
                      </div>
                    </div>
                  </div>

                  <Button 
                    className="w-full"
                    onClick={() => openBookingDialog(room)}
                    data-testid={`book-room-${room.id}`}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Reservar Sala
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Booking Dialog */}
        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reservar {selectedRoom?.nome}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleBookRoom} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="data_inicio">Data Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={bookingForm.data_inicio}
                  onChange={(e) => setBookingForm({ ...bookingForm, data_inicio: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  data-testid="booking-date-inicio-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_fim">Data Fim (Opcional - Para múltiplos dias)</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={bookingForm.data_fim}
                  onChange={(e) => setBookingForm({ ...bookingForm, data_fim: e.target.value })}
                  min={bookingForm.data_inicio || new Date().toISOString().split('T')[0]}
                  data-testid="booking-date-fim-input"
                />
                <p className="text-xs text-slate-500">
                  Deixe em branco para reservar apenas 1 dia. Preencha para reservar um período.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="justificativa">Titulo ou justificativa</Label>
                <Input
                  id="justificativa"
                  type="text"
                  value={bookingForm.justificativa}
                  onChange={(e) => setBookingForm({ ...bookingForm, justificativa: e.target.value })}
                  placeholder="Ex: Reuniao de planejamento semanal"
                  required
                  data-testid="booking-justificativa-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hora_inicio">Hora Início</Label>
                  <Input
                    id="hora_inicio"
                    type="time"
                    value={bookingForm.hora_inicio}
                    onChange={(e) => setBookingForm({ ...bookingForm, hora_inicio: e.target.value })}
                    required
                    data-testid="booking-start-time-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora_fim">Hora Fim</Label>
                  <Input
                    id="hora_fim"
                    type="time"
                    value={bookingForm.hora_fim}
                    onChange={(e) => setBookingForm({ ...bookingForm, hora_fim: e.target.value })}
                    required
                    data-testid="booking-end-time-input"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" data-testid="submit-booking-button">
                Confirmar Reserva
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Rooms;
