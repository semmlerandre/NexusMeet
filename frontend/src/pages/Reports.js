import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { BarChart3, Download, Filter, Calendar } from 'lucide-react';
import { toast } from 'sonner';

const Reports = () => {
  const { api, isAdmin, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    user_id: '',
    room_id: ''
  });
  const [reportData, setReportData] = useState(null);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);

  const podeVerTodos = isAdmin || user?.relatorios_completos;

  useEffect(() => {
    if (podeVerTodos) {
      loadUsersAndRooms();
    }
  }, [podeVerTodos]);

  const loadUsersAndRooms = async () => {
    try {
      const [usersRes, roomsRes] = await Promise.all([
        api.get('/users'),
        api.get('/rooms')
      ]);
      setUsers(usersRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleGenerateReport = async () => {
    if (!filters.start_date || !filters.end_date) {
      toast.error('Selecione as datas de in\u00edcio e fim para gerar o relat\u00f3rio.');
      return;
    }

    if (filters.start_date > filters.end_date) {
      toast.error('A data in\u00edcio n\u00e3o pode ser maior que a data fim.');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('start_date', filters.start_date);
      params.append('end_date', filters.end_date);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.room_id) params.append('room_id', filters.room_id);

      const response = await api.get(`/reports/bookings?${params.toString()}`);
      setReportData(response.data);
      toast.success('Relat\u00f3rio gerado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar relat\u00f3rio');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!filters.start_date || !filters.end_date) {
      toast.error('Selecione as datas de in\u00edcio e fim para exportar o relat\u00f3rio.');
      return;
    }

    if (filters.start_date > filters.end_date) {
      toast.error('A data in\u00edcio n\u00e3o pode ser maior que a data fim.');
      return;
    }

    try {
      const params = new URLSearchParams();
      params.append('start_date', filters.start_date);
      params.append('end_date', filters.end_date);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.room_id) params.append('room_id', filters.room_id);

      const response = await api.get(`/reports/export?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'relatorio_reservas.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('Relat\u00f3rio exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar relat\u00f3rio');
    }
  };

  const formatDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="reports-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary">{'Relat\u00f3rios'}</h1>
            <p className="text-slate-600 mt-1">
              {podeVerTodos 
                ? 'Gere relat\u00f3rios completos de uso das salas' 
                : 'Visualize relat\u00f3rios das suas reservas'}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={20} className="text-slate-600" />
            <h2 className="text-xl font-semibold text-primary">Filtros</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">{'Data In\u00edcio'}</Label>
              <Input
                id="start_date"
                type="date"
                value={filters.start_date}
                onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                data-testid="filter-start-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">Data Fim</Label>
              <Input
                id="end_date"
                type="date"
                value={filters.end_date}
                onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                data-testid="filter-end-date"
              />
            </div>

            {podeVerTodos && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="user_filter">{'Usu\u00e1rio'}</Label>
                  <select
                    id="user_filter"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    value={filters.user_id}
                    onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
                    data-testid="filter-user"
                  >
                    <option value="">{'Todos os usu\u00e1rios'}</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="room_filter">Sala</Label>
                  <select
                    id="room_filter"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    value={filters.room_id}
                    onChange={(e) => setFilters({ ...filters, room_id: e.target.value })}
                    data-testid="filter-room"
                  >
                    <option value="">Todas as salas</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nome}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleGenerateReport}
              disabled={loading}
              data-testid="generate-report-button"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              {loading ? 'Gerando...' : 'Gerar Relat\u00f3rio'}
            </Button>

            {reportData && (
              <Button
                onClick={handleExportExcel}
                variant="outline"
                data-testid="export-excel-button"
              >
                <Download className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
            )}
          </div>
        </Card>

        {/* Resultados */}
        {reportData && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-primary">Resultados</h2>
              <div className="text-right">
                <p className="text-sm text-slate-600">Total de Reservas</p>
                <p className="text-3xl font-bold text-accent" data-testid="total-bookings">
                  {reportData.total_reservas}
                </p>
              </div>
            </div>

            {reportData.reservas.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-16 w-16 text-slate-400 mb-4" />
                <p className="text-slate-600">Nenhuma reserva encontrada com os filtros selecionados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="report-table">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Sala</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">{'Usu\u00e1rio'}</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Justificativa</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Data</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">{'Hor\u00e1rio'}</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {reportData.reservas.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50" data-testid={`report-row-${booking.id}`}>
                        <td className="px-4 py-3 text-sm text-slate-900">{booking.id}</td>
                        <td className="px-4 py-3 text-sm text-slate-900">{booking.room_name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{booking.user_name}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{booking.justificativa || '-'}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatDate(booking.data)}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {booking.hora_inicio} - {booking.hora_fim}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 border border-emerald-200">
                            {booking.status === 'confirmed' ? 'Confirmada' : 'Cancelada'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reports;
