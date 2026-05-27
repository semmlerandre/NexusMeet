import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Users as UsersIcon, Upload, Download, AlertCircle, BarChart3, Plus, KeyRound, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const Users = () => {
  const { api } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUserForm, setNewUserForm] = useState({
    nome: '',
    email: '',
    departamento: '',
    senha: '',
    perfil: 'user'
  });
  const [newPassword, setNewPassword] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/users/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const result = response.data;
      toast.success(
        `Importação concluída! ${result.usuarios_criados} usuários criados, ${result.usuarios_duplicados} duplicados.`
      );

      if (result.erros.length > 0) {
        console.log('Erros de importação:', result.erros);
      }

      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao importar usuários');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleToggleRelatorios = async (userId, currentValue) => {
    try {
      await api.put(`/users/${userId}`, {
        relatorios_completos: !currentValue
      });
      toast.success('Permissões atualizadas!');
      loadUsers();
    } catch (error) {
      toast.error('Erro ao atualizar permissões');
    }
  };

  const handleDownloadTemplate = () => {
    window.open('/template_usuarios.xlsx', '_blank');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/create-manual', newUserForm);
      toast.success('Usuário criado com sucesso!');
      setCreateDialogOpen(false);
      setNewUserForm({ nome: '', email: '', departamento: '', senha: '', perfil: 'user' });
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar usuário');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      await api.post(`/users/${selectedUser.id}/reset-password`, { nova_senha: newPassword });
      toast.success('Senha resetada com sucesso!');
      setResetDialogOpen(false);
      setSelectedUser(null);
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao resetar senha');
    }
  };

  const openResetDialog = (user) => {
    setSelectedUser(user);
    setNewPassword('Sala@123');
    setResetDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="users-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary">Usuários</h1>
            <p className="text-slate-600 mt-1">Gerencie usuários do sistema</p>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              data-testid="download-template-button"
            >
              <Download className="mr-2 h-4 w-4" />
              Template
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              data-testid="upload-users-button"
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? 'Importando...' : 'Importar'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              data-testid="file-input"
            />
            
            {/* Dialog Criar Usuário */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button data-testid="create-user-button">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar Usuário
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Usuário</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <Input
                      id="nome"
                      value={newUserForm.nome}
                      onChange={(e) => setNewUserForm({ ...newUserForm, nome: e.target.value })}
                      placeholder="João Silva"
                      required
                      data-testid="new-user-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUserForm.email}
                      onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                      placeholder="joao@empresa.com"
                      required
                      data-testid="new-user-email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="departamento">Departamento</Label>
                    <Input
                      id="departamento"
                      value={newUserForm.departamento}
                      onChange={(e) => setNewUserForm({ ...newUserForm, departamento: e.target.value })}
                      placeholder="TI, RH, Financeiro..."
                      required
                      data-testid="new-user-dept"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="senha">Senha Inicial</Label>
                    <Input
                      id="senha"
                      type="password"
                      value={newUserForm.senha}
                      onChange={(e) => setNewUserForm({ ...newUserForm, senha: e.target.value })}
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                      data-testid="new-user-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="perfil">Perfil</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="perfil"
                          value="user"
                          checked={newUserForm.perfil === 'user'}
                          onChange={(e) => setNewUserForm({ ...newUserForm, perfil: e.target.value })}
                          className="w-4 h-4 text-accent"
                        />
                        <span className="text-sm">Usuário</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="perfil"
                          value="admin"
                          checked={newUserForm.perfil === 'admin'}
                          onChange={(e) => setNewUserForm({ ...newUserForm, perfil: e.target.value })}
                          className="w-4 h-4 text-accent"
                        />
                        <span className="text-sm">Administrador</span>
                      </label>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" data-testid="submit-create-user">
                    Criar Usuário
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Info Card */}
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-accent mt-0.5" size={20} />
            <div className="text-sm text-slate-700">
              <p className="font-medium mb-1">Importação em Massa</p>
              <p>Faça o download do template Excel, preencha com os dados (Nome, Email, Departamento) e faça o upload. A senha padrão será <strong>Sala@123</strong> para todos os usuários importados.</p>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        {loading ? (
          <p className="text-center text-slate-500 py-8">Carregando...</p>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="users-table">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Nome</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Departamento</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Perfil</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Relatórios Completos</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors" data-testid={`user-row-${user.id}`}>
                      <td className="px-6 py-4 text-sm text-slate-900">{user.nome}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{user.departamento}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.perfil === 'admin' 
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : 'bg-blue-100 text-blue-700 border border-blue-200'
                        }`}>
                          {user.perfil === 'admin' ? 'Administrador' : 'Usuário'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.ativo 
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-100 text-rose-700 border border-rose-200'
                        }`}>
                          {user.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Switch
                            checked={user.relatorios_completos || false}
                            onCheckedChange={() => handleToggleRelatorios(user.id, user.relatorios_completos)}
                            disabled={user.perfil === 'admin'}
                            data-testid={`toggle-reports-${user.id}`}
                          />
                          <div className="flex items-center gap-1">
                            <BarChart3 size={14} className={user.relatorios_completos ? 'text-accent' : 'text-slate-400'} />
                            <span className="text-xs text-slate-600">
                              {user.perfil === 'admin' ? 'Admin (sempre ativo)' : user.relatorios_completos ? 'Ativo' : 'Desativado'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openResetDialog(user)}
                          data-testid={`reset-password-${user.id}`}
                        >
                          <KeyRound size={14} className="mr-1" />
                          Resetar Senha
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Dialog Reset Senha */}
        <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resetar Senha - {selectedUser?.nome}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  A senha será resetada e o usuário deverá alterá-la no próximo login.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="nova-senha">Nova Senha</Label>
                <Input
                  id="nova-senha"
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  required
                  minLength={6}
                  data-testid="reset-password-input"
                />
                <p className="text-xs text-slate-500">Senha padrão sugerida: Sala@123</p>
              </div>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResetDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1" data-testid="submit-reset-password">
                  Resetar Senha
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Users;