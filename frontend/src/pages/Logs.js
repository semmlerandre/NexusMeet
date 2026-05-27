import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { FileText, Search, RefreshCw, User, Clock, Activity } from 'lucide-react';
import { toast } from 'sonner';

const Logs = () => {
  const { api } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/logs');
      setLogs(response.data);
    } catch (error) {
      toast.error('Erro ao carregar logs');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionColor = (acao) => {
    const colors = {
      'LOGIN': 'bg-blue-100 text-blue-700 border-blue-200',
      'LOGOUT': 'bg-slate-100 text-slate-700 border-slate-200',
      'REGISTRO': 'bg-green-100 text-green-700 border-green-200',
      'CRIAR_SALA': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'DELETAR_SALA': 'bg-rose-100 text-rose-700 border-rose-200',
      'ATUALIZAR_SALA': 'bg-amber-100 text-amber-700 border-amber-200',
      'CRIAR_RESERVA': 'bg-purple-100 text-purple-700 border-purple-200',
      'CANCELAR_RESERVA': 'bg-red-100 text-red-700 border-red-200',
      'CRIAR_USUARIO': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'ATUALIZAR_USUARIO': 'bg-orange-100 text-orange-700 border-orange-200',
      'IMPORTACAO_USUARIOS': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'RESETAR_SENHA': 'bg-pink-100 text-pink-700 border-pink-200',
      'ALTERAR_SENHA': 'bg-teal-100 text-teal-700 border-teal-200',
      'ATUALIZAR_TEMA': 'bg-violet-100 text-violet-700 border-violet-200',
      'ATUALIZAR_SMTP': 'bg-sky-100 text-sky-700 border-sky-200',
      'UPLOAD_LOGO': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
      'UPLOAD_LOGIN_BG': 'bg-lime-100 text-lime-700 border-lime-200',
    };
    return colors[acao] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const getActionLabel = (acao) => {
    const labels = {
      'LOGIN': 'Login',
      'LOGOUT': 'Logout',
      'REGISTRO': 'Registro',
      'CRIAR_SALA': 'Criar Sala',
      'DELETAR_SALA': 'Deletar Sala',
      'ATUALIZAR_SALA': 'Atualizar Sala',
      'CRIAR_RESERVA': 'Criar Reserva',
      'CANCELAR_RESERVA': 'Cancelar Reserva',
      'CRIAR_USUARIO': 'Criar Usuário',
      'ATUALIZAR_USUARIO': 'Atualizar Usuário',
      'IMPORTACAO_USUARIOS': 'Importar Usuários',
      'RESETAR_SENHA': 'Resetar Senha',
      'ALTERAR_SENHA': 'Alterar Senha',
      'ATUALIZAR_TEMA': 'Atualizar Tema',
      'ATUALIZAR_SMTP': 'Atualizar SMTP',
      'UPLOAD_LOGO': 'Upload Logo',
      'UPLOAD_LOGIN_BG': 'Upload Fundo Login',
    };
    return labels[acao] || acao;
  };

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    return (
      log.acao?.toLowerCase().includes(term) ||
      log.user_name?.toLowerCase().includes(term) ||
      log.detalhes?.toLowerCase().includes(term)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="logs-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary">Logs de Auditoria</h1>
            <p className="text-slate-600 mt-1">Acompanhe todas as ações realizadas no sistema</p>
          </div>
          
          <Button
            onClick={loadLogs}
            disabled={loading}
            variant="outline"
            data-testid="refresh-logs-button"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Search */}
        <Card className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <Input
              placeholder="Buscar por ação, usuário ou detalhes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-logs-input"
            />
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Activity className="text-blue-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{logs.length}</p>
                <p className="text-sm text-slate-600">Total de Registros</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <User className="text-green-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {logs.filter(l => l.acao === 'LOGIN').length}
                </p>
                <p className="text-sm text-slate-600">Logins Hoje</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Clock className="text-purple-600" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {logs.filter(l => l.acao === 'CRIAR_RESERVA').length}
                </p>
                <p className="text-sm text-slate-600">Reservas Criadas</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Logs Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-500">Carregando logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="mx-auto h-16 w-16 text-slate-400 mb-4" />
            <p className="text-slate-600 text-lg">
              {searchTerm ? 'Nenhum log encontrado para a busca' : 'Nenhum log registrado'}
            </p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="logs-table">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Data/Hora</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Usuário</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Ação</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors" data-testid={`log-row-${index}`}>
                      <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">
                        {log.user_name || 'Sistema'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getActionColor(log.acao)}`}>
                          {getActionLabel(log.acao)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-md truncate">
                        {log.detalhes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Logs;
