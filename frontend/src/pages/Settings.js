import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Upload, Image, Mail, TestTube, Palette, Type, Save, Check } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const { api } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('theme');
  
  // Config state
  const [logoUrl, setLogoUrl] = useState(null);
  const [loginBgUrl, setLoginBgUrl] = useState(null);
  
  // Theme state
  const [systemName, setSystemName] = useState('NexusMeet');
  const [primaryColor, setPrimaryColor] = useState('#1e293b');
  const [secondaryColor, setSecondaryColor] = useState('#f1f5f9');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  
  // SMTP state
  const [smtpEnabled, setSmtpEnabled] = useState(false);
  const [smtpServer, setSmtpServer] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpFromEmail, setSmtpFromEmail] = useState('');
  const [smtpFromName, setSmtpFromName] = useState('Sistema de Reservas');
  const [testEmail, setTestEmail] = useState('');

  const logoInputRef = useRef(null);
  const bgInputRef = useRef(null);

  useEffect(() => {
    loadAllConfig();
  }, []);

  const loadAllConfig = async () => {
    try {
      // Load visual config
      const configRes = await api.get('/config');
      if (configRes.data) {
        setLogoUrl(configRes.data.logo_url || null);
        setLoginBgUrl(configRes.data.login_bg_url || null);
      }
      
      // Load theme config
      const themeRes = await api.get('/config/theme');
      if (themeRes.data) {
        setSystemName(themeRes.data.system_name || 'NexusMeet');
        setPrimaryColor(themeRes.data.primary_color || '#1e293b');
        setSecondaryColor(themeRes.data.secondary_color || '#f1f5f9');
        setAccentColor(themeRes.data.accent_color || '#3b82f6');
      }
      
      // Load SMTP config
      const smtpRes = await api.get('/config/smtp');
      if (smtpRes.data && Object.keys(smtpRes.data).length > 0) {
        setSmtpEnabled(smtpRes.data.smtp_enabled || false);
        setSmtpServer(smtpRes.data.smtp_server || '');
        setSmtpPort(smtpRes.data.smtp_port || 587);
        setSmtpUser(smtpRes.data.smtp_user || '');
        setSmtpFromEmail(smtpRes.data.smtp_from_email || '');
        setSmtpFromName(smtpRes.data.smtp_from_name || 'Sistema de Reservas');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleSaveTheme = async () => {
    setLoading(true);
    try {
      await api.put('/config/theme', {
        system_name: systemName,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor
      });
      toast.success('Tema salvo com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar tema');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await api.post('/config/upload/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLogoUrl(response.data.url);
      toast.success('Logo atualizado!');
    } catch (error) {
      toast.error('Erro ao fazer upload do logo');
      console.error(error);
    } finally {
      setLoading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleBgUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await api.post('/config/upload/login_bg', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setLoginBgUrl(response.data.url);
      toast.success('Fundo de login atualizado!');
    } catch (error) {
      toast.error('Erro ao fazer upload');
      console.error(error);
    } finally {
      setLoading(false);
      if (bgInputRef.current) bgInputRef.current.value = '';
    }
  };

  const handleSaveSmtp = async () => {
    setLoading(true);
    try {
      await api.put('/config/smtp', {
        smtp_enabled: smtpEnabled,
        smtp_server: smtpServer,
        smtp_port: smtpPort,
        smtp_user: smtpUser,
        smtp_password: smtpPassword,
        smtp_from_email: smtpFromEmail,
        smtp_from_name: smtpFromName
      });
      toast.success('Configurações SMTP salvas!');
    } catch (error) {
      toast.error('Erro ao salvar SMTP');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast.error('Digite um email para teste');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/config/smtp/test?email=${encodeURIComponent(testEmail)}`);
      toast.success('Email de teste enviado!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao enviar email');
    } finally {
      setLoading(false);
    }
  };

  const backendUrl = process.env.REACT_APP_BACKEND_URL || '';

  return (
    <DashboardLayout>
      <div className="space-y-6" data-testid="settings-page">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-primary">Configurações</h1>
          <p className="text-slate-600 mt-1">Personalize o sistema</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('theme')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'theme'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
              data-testid="tab-theme"
            >
              <Palette size={18} />
              Tema
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'images'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
              data-testid="tab-images"
            >
              <Image size={18} />
              Imagens
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`px-4 py-3 font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'email'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
              data-testid="tab-email"
            >
              <Mail size={18} />
              E-mail
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* TEMA */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Type size={20} className="text-slate-600" />
                  <h2 className="text-xl font-semibold">Nome do Sistema</h2>
                </div>
                <div className="max-w-md">
                  <Label htmlFor="system-name">Nome exibido</Label>
                  <Input
                    id="system-name"
                    value={systemName}
                    onChange={(e) => setSystemName(e.target.value)}
                    placeholder="NexusMeet"
                    className="mt-2"
                    data-testid="system-name-input"
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Aparece no cabeçalho e na tela de login
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Palette size={20} className="text-slate-600" />
                  <h2 className="text-xl font-semibold">Cores do Tema</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <Label>Cor Primária</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-14 h-14 rounded-lg cursor-pointer border-2 border-slate-200"
                        data-testid="primary-color-input"
                      />
                      <div>
                        <Input
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-28 font-mono text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-1">Cabeçalho e textos</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Cor Secundária</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-14 h-14 rounded-lg cursor-pointer border-2 border-slate-200"
                        data-testid="secondary-color-input"
                      />
                      <div>
                        <Input
                          value={secondaryColor}
                          onChange={(e) => setSecondaryColor(e.target.value)}
                          className="w-28 font-mono text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-1">Fundos e cards</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Cor de Destaque</Label>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-14 h-14 rounded-lg cursor-pointer border-2 border-slate-200"
                        data-testid="accent-color-input"
                      />
                      <div>
                        <Input
                          value={accentColor}
                          onChange={(e) => setAccentColor(e.target.value)}
                          className="w-28 font-mono text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-1">Botões e links</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="mt-8 p-4 bg-slate-100 rounded-lg">
                  <p className="text-sm text-slate-600 mb-3">Pré-visualização:</p>
                  <div className="flex flex-wrap gap-3">
                    <div 
                      className="px-4 py-2 rounded-lg text-white font-medium"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Primária
                    </div>
                    <div 
                      className="px-4 py-2 rounded-lg font-medium border"
                      style={{ backgroundColor: secondaryColor, color: primaryColor }}
                    >
                      Secundária
                    </div>
                    <div 
                      className="px-4 py-2 rounded-lg text-white font-medium"
                      style={{ backgroundColor: accentColor }}
                    >
                      Destaque
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleSaveTheme}
                  disabled={loading}
                  className="mt-6"
                  data-testid="save-theme-button"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? 'Salvando...' : 'Salvar Tema'}
                </Button>
              </Card>
            </div>
          )}

          {/* IMAGENS */}
          {activeTab === 'images' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Logo do Sistema</h2>
                
                {logoUrl && (
                  <div className="mb-4 p-4 bg-slate-50 rounded-lg border inline-block">
                    <img 
                      src={`${backendUrl}${logoUrl}`}
                      alt="Logo atual"
                      className="max-h-20 object-contain"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}

                <div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => logoInputRef.current?.click()}
                    disabled={loading}
                    variant="outline"
                    data-testid="upload-logo-button"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {logoUrl ? 'Trocar Logo' : 'Upload Logo'}
                  </Button>
                  <p className="text-sm text-slate-500 mt-2">PNG ou SVG, até 2MB</p>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Fundo da Tela de Login</h2>
                
                {loginBgUrl && (
                  <div className="mb-4 rounded-lg border overflow-hidden" style={{maxWidth: '400px'}}>
                    <img 
                      src={`${backendUrl}${loginBgUrl}`}
                      alt="Fundo de login"
                      className="w-full h-40 object-cover"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                )}

                <div>
                  <input
                    ref={bgInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBgUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => bgInputRef.current?.click()}
                    disabled={loading}
                    variant="outline"
                    data-testid="upload-bg-button"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {loginBgUrl ? 'Trocar Fundo' : 'Upload Fundo'}
                  </Button>
                  <p className="text-sm text-slate-500 mt-2">Recomendado: 1920x1080, até 5MB</p>
                </div>
              </Card>
            </div>
          )}

          {/* EMAIL */}
          {activeTab === 'email' && (
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Mail size={20} className="text-slate-600" />
                <h2 className="text-xl font-semibold">Configurações SMTP</h2>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 mb-6">
                <div>
                  <p className="font-medium">Ativar Notificações por E-mail</p>
                  <p className="text-sm text-slate-600">
                    Envia emails de confirmação e cancelamento de reservas
                  </p>
                </div>
                <Switch
                  checked={smtpEnabled}
                  onCheckedChange={setSmtpEnabled}
                  data-testid="smtp-enabled-switch"
                />
              </div>

              {smtpEnabled && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Servidor SMTP</Label>
                      <Input
                        value={smtpServer}
                        onChange={(e) => setSmtpServer(e.target.value)}
                        placeholder="smtp.gmail.com"
                        className="mt-1"
                        data-testid="smtp-server-input"
                      />
                    </div>
                    <div>
                      <Label>Porta</Label>
                      <Input
                        type="number"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(parseInt(e.target.value) || 587)}
                        placeholder="587"
                        className="mt-1"
                        data-testid="smtp-port-input"
                      />
                    </div>
                    <div>
                      <Label>Usuário</Label>
                      <Input
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        placeholder="seu.email@gmail.com"
                        className="mt-1"
                        data-testid="smtp-user-input"
                      />
                    </div>
                    <div>
                      <Label>Senha</Label>
                      <Input
                        type="password"
                        value={smtpPassword}
                        onChange={(e) => setSmtpPassword(e.target.value)}
                        placeholder="Senha de app"
                        className="mt-1"
                        data-testid="smtp-password-input"
                      />
                    </div>
                    <div>
                      <Label>E-mail Remetente</Label>
                      <Input
                        value={smtpFromEmail}
                        onChange={(e) => setSmtpFromEmail(e.target.value)}
                        placeholder="noreply@empresa.com"
                        className="mt-1"
                        data-testid="smtp-from-email-input"
                      />
                    </div>
                    <div>
                      <Label>Nome Remetente</Label>
                      <Input
                        value={smtpFromName}
                        onChange={(e) => setSmtpFromName(e.target.value)}
                        placeholder="Sistema de Reservas"
                        className="mt-1"
                        data-testid="smtp-from-name-input"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <strong>Gmail:</strong> Use "Senha de App" em vez da senha normal. 
                      Gere em: Google → Segurança → Verificação em duas etapas → Senhas de app
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={handleSaveSmtp} disabled={loading} data-testid="save-smtp-button">
                      <Save className="mr-2 h-4 w-4" />
                      Salvar SMTP
                    </Button>
                    
                    <div className="flex gap-2">
                      <Input
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="email@teste.com"
                        className="w-48"
                        data-testid="test-email-input"
                      />
                      <Button onClick={handleTestEmail} variant="outline" disabled={loading} data-testid="test-email-button">
                        <TestTube className="mr-2 h-4 w-4" />
                        Testar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
