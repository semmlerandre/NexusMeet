# 🎯 GUIA COMPLETO - Sistema NexusMeet

## ✅ TODAS AS FUNCIONALIDADES SOLICITADAS FORAM IMPLEMENTADAS!

---

## 1️⃣ MENU DE RELATÓRIOS 📊

### Localização
- **Usuários**: Dashboard → Salas → Minhas Reservas → **Relatórios**
- **Admins**: Todos os menus acima + Calendário, Usuários, Configurações, Logs

### Funcionalidades do Menu Relatórios

#### Para Usuários Comuns:
- ✅ Ver apenas SUAS próprias reservas
- ✅ Filtrar por data início e data fim
- ✅ Exportar para Excel suas reservas
- ✅ Visualização em tabela com todas as informações:
  - ID da reserva
  - Nome da sala
  - Usuário que reservou
  - Data da reserva
  - Horário (início - fim)
  - Status (confirmada/cancelada)

#### Para Administradores:
- ✅ Ver TODAS as reservas do sistema
- ✅ Filtros avançados:
  - Data início
  - Data fim
  - Filtrar por usuário específico
  - Filtrar por sala específica
- ✅ Exportar relatório completo para Excel
- ✅ Total de reservas no período

#### Para Usuários com Permissão Especial:
- ✅ Admins podem marcar usuários comuns para terem "Relatórios Completos"
- ✅ Quando marcado, usuário comum pode ver relatórios de TODOS
- ✅ Configurado na página "Usuários" (Admin only)
- ✅ Toggle visual ao lado de cada usuário

**Como marcar um usuário para Relatórios Completos:**
1. Admin → Menu Usuários
2. Localizar o usuário na tabela
3. Ativar o toggle "Relatórios Completos"
4. Usuário agora pode ver relatórios de todos!

---

## 2️⃣ AGENDAMENTO DE MÚLTIPLOS DIAS / RANGE DE DATAS 📅

### Como Funciona:

#### Reservar 1 Dia:
1. Ir em "Salas"
2. Clicar em "Reservar Sala"
3. Preencher:
   - **Data Início**: 2024-03-10
   - **Data Fim**: (deixar em branco)
   - Hora início: 14:00
   - Hora fim: 16:00
4. Sistema cria 1 reserva

#### Reservar Múltiplos Dias (Range):
1. Ir em "Salas"
2. Clicar em "Reservar Sala"
3. Preencher:
   - **Data Início**: 2024-03-10
   - **Data Fim**: 2024-03-15 (6 dias!)
   - Hora início: 14:00
   - Hora fim: 16:00
4. Sistema cria automaticamente 6 reservas (uma para cada dia)
5. Verifica disponibilidade de TODOS os dias
6. Se algum dia estiver ocupado, reserva é recusada
7. Email de confirmação informa o período completo

**Campos no Formulário:**
- ✅ Data Início (obrigatório)
- ✅ Data Fim (opcional - para range)
- ✅ Hora Início
- ✅ Hora Fim
- ✅ Dica visual: "Deixe em branco para reservar apenas 1 dia"

---

## 3️⃣ MENU DE CONFIGURAÇÕES DO SISTEMA ⚙️ (ADMIN ONLY)

### Localização
**Apenas Admins**: Dashboard → ... → **Configurações**

### Aba 1: VISUAL 🎨

#### Upload de Logo:
- ✅ Botão "Fazer Upload do Logo"
- ✅ Aceita: PNG, JPG, SVG
- ✅ Recomendação: Fundo transparente, até 2MB
- ✅ Preview do logo carregado
- ✅ Logo aparece no sistema após upload

#### Upload de Fundo da Tela de Login:
- ✅ Botão "Fazer Upload do Fundo"
- ✅ Aceita imagens de alta qualidade
- ✅ Recomendação: 1920x1080, até 5MB
- ✅ Preview da imagem carregada
- ✅ Fundo aparece na tela de login após upload

### Aba 2: E-MAIL (SMTP) 📧

#### Configurações Disponíveis:
- ✅ **Ativar/Desativar** notificações por email (Toggle)
- ✅ **Servidor SMTP**: Ex: smtp.gmail.com
- ✅ **Porta SMTP**: Ex: 587
- ✅ **Usuário SMTP**: Seu email
- ✅ **Senha SMTP**: Senha de app (não a senha normal!)
- ✅ **Email Remetente**: Email que aparece como remetente
- ✅ **Nome Remetente**: Nome que aparece no email

#### Dicas para Gmail:
✅ Texto explicativo incluído:
> "Use uma 'Senha de App' ao invés da senha normal.  
> Gere em: Configurações do Google → Segurança → Verificação em duas etapas → Senhas de app"

#### Botão de Teste:
- ✅ Campo para inserir email de teste
- ✅ Botão "Testar"
- ✅ Envia email de teste imediatamente
- ✅ Confirma se configuração está funcionando

#### Quando os Emails São Enviados:
1. **Ao criar reserva**: Email de confirmação com detalhes
   - Se 1 dia: "Sua reserva foi confirmada"
   - Se múltiplos dias: "Suas reservas foram confirmadas (X dias)"
2. **Ao cancelar reserva**: Email de cancelamento
3. ✅ Sistema verifica se SMTP está configurado antes de enviar
4. ✅ Se não configurado, apenas registra no log (não gera erro)

---

## 4️⃣ CONTROLE DE MENUS POR PERFIL 🔐

### Usuários Comuns:
- ✅ Dashboard
- ✅ Salas
- ✅ Minhas Reservas
- ✅ Relatórios (apenas suas reservas)

### Usuários com "Relatórios Completos":
- ✅ Dashboard
- ✅ Salas
- ✅ Minhas Reservas
- ✅ Relatórios (TODAS as reservas!)

### Administradores:
- ✅ Dashboard
- ✅ Salas
- ✅ Minhas Reservas
- ✅ Relatórios (todos)
- ✅ **Calendário**
- ✅ **Usuários**
- ✅ **Configurações**
- ✅ **Logs**

---

## 5️⃣ SCRIPT DOCKER COM DETECÇÃO AUTOMÁTICA DE PORTAS 🐳

### Localização:
`/app/scripts/deploy-auto-port.sh`

### O que o Script Faz:

1. **Verifica Dependências**:
   - Instala Docker se não existir
   - Instala Docker Compose se não existir
   - Instala Git se não existir

2. **Detecção Automática de Portas**:
   ✅ Verifica se porta 3000 está livre
   ✅ Se ocupada, testa 3001, 3002, 3003...
   ✅ Faz o mesmo para porta 8001 (backend)
   ✅ Faz o mesmo para porta 27017 (MongoDB)
   ✅ **Exemplo**: Se 3000 estiver ocupada, usa 3001

3. **Configuração Automática**:
   - Gera docker-compose.yml com portas detectadas
   - Gera .env com configurações
   - Gera JWT secret automaticamente
   - Cria Dockerfiles se não existirem

4. **Construção e Deploy**:
   - `docker-compose build`
   - `docker-compose up -d`
   - Mostra portas utilizadas ao final

### Como Usar:

```bash
# 1. Dar permissão de execução
chmod +x /app/scripts/deploy-auto-port.sh

# 2. Executar como root
sudo ./deploy-auto-port.sh

# 3. Seguir as instruções na tela
```

### Saída do Script:
```
=========================================================
  NexusMeet - Deploy Automatizado com Docker
  Detecção Automática de Portas Disponíveis
=========================================================

=== Detecção Automática de Portas ===
Procurando porta livre para o Frontend (padrão: 3000)...
✓ Frontend: Porta 3000 disponível

Procurando porta livre para o Backend (padrão: 8001)...
✓ Backend: Porta 8001 disponível

Procurando porta livre para o MongoDB (padrão: 27017)...
✓ MongoDB: Porta 27017 disponível

Deseja usar as portas detectadas automaticamente? (S/n): 
```

---

## 6️⃣ COMO TESTAR TUDO

### Teste 1: Login e Menus
1. Acessar: https://sala-reserve-1.preview.emergentagent.com
2. Login: admin@sistema.com / admin123
3. Verificar menus disponíveis (Dashboard, Salas, Reservas, Relatórios, Calendário, Usuários, Configurações, Logs)

### Teste 2: Agendamento de Range de Datas
1. Ir em "Salas"
2. Clicar "Reservar Sala" em qualquer sala
3. Preencher:
   - Data Início: Amanhã
   - Data Fim: Daqui 5 dias
   - Horário: 10:00 - 12:00
4. Confirmar
5. Verificar mensagem: "5 reserva(s) criada(s) com sucesso!"

### Teste 3: Relatórios
1. Ir em "Relatórios"
2. Definir filtros:
   - Data início: Última semana
   - Data fim: Hoje
   - Sala: Todas
   - Usuário: Todos (se admin)
3. Clicar "Gerar Relatório"
4. Ver tabela com todas as reservas
5. Clicar "Exportar Excel"
6. Baixar arquivo Excel formatado

### Teste 4: Configurações - Upload de Logo
1. Ir em "Configurações"
2. Aba "Visual"
3. Clicar "Fazer Upload do Logo"
4. Selecionar imagem PNG
5. Ver preview
6. Verificar logo no sistema

### Teste 5: Configurações - SMTP
1. Ir em "Configurações"
2. Aba "E-mail"
3. Ativar toggle "Ativar Notificações"
4. Preencher:
   - Servidor: smtp.gmail.com
   - Porta: 587
   - Usuário: seu@gmail.com
   - Senha: (senha de app gerada no Google)
   - Email remetente: seu@gmail.com
5. Salvar
6. Testar com seu email
7. Verificar recebimento

### Teste 6: Marcar Usuário para Relatórios Completos
1. Criar um usuário comum (ou usar existente)
2. Ir em "Usuários"
3. Localizar usuário na tabela
4. Ativar toggle "Relatórios Completos"
5. Fazer logout
6. Login com o usuário comum
7. Ir em "Relatórios"
8. Verificar filtros de "Usuário" e "Sala" disponíveis
9. Poder ver relatórios de todos!

---

## 📦 ARQUIVOS IMPORTANTES

### Backend:
- `/app/backend/server.py` - API completa com todas as rotas
- `/app/backend/uploads/` - Pasta para logos e imagens de fundo

### Frontend:
- `/app/frontend/src/pages/Reports.js` - Página de Relatórios
- `/app/frontend/src/pages/Settings.js` - Página de Configurações
- `/app/frontend/src/pages/Rooms.js` - Atualizado com range de datas
- `/app/frontend/src/pages/Users.js` - Atualizado com toggle de relatórios
- `/app/frontend/src/components/DashboardLayout.js` - Menus por perfil

### Scripts Docker:
- `/app/scripts/deploy.sh` - Deploy básico
- `/app/scripts/deploy-complete.sh` - Deploy com clone
- `/app/scripts/deploy-auto-port.sh` - **Deploy com detecção automática de portas**

---

## 🎯 RESUMO DO QUE FOI IMPLEMENTADO

✅ 1. Menu de Relatórios (usuários veem seus, admins veem tudo)
✅ 2. Exportação de relatórios para Excel
✅ 3. Permissão especial "Relatórios Completos" para usuários
✅ 4. Agendamento de 1 dia ou múltiplos dias (range)
✅ 5. Menu Configurações (Visual + SMTP)
✅ 6. Upload de logo personalizado
✅ 7. Upload de fundo de login personalizado
✅ 8. Configuração completa de SMTP para emails
✅ 9. Teste de envio de email
✅ 10. Emails automáticos (criação e cancelamento)
✅ 11. Menus diferenciados por perfil
✅ 12. Script Docker com detecção automática de portas
✅ 13. Toggle para marcar usuários com relatórios completos

---

## 🚀 TUDO PRONTO E FUNCIONANDO!

Acesse: https://sala-reserve-1.preview.emergentagent.com
Login: admin@sistema.com / admin123

**Todos os requisitos foram implementados com sucesso!** 🎉
