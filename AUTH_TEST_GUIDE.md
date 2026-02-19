# 🔐 Guia de Teste - Autenticação API Clipper

## ✅ Status do Sistema de Autenticação

**O sistema de autenticação está PRONTO e FUNCIONAL!**

### Configurações Implementadas:

✅ JWT Authentication configurado
✅ ASP.NET Core Identity configurado
✅ AuthRepository registrado no DI
✅ AuthController implementado
✅ CORS configurado
✅ Roles (Admin, BarberShopOwner, Barber, Customer)
✅ Seeder de dados inicial
✅ Banco de dados criado e atualizado

---

## 🚀 Como Iniciar a API

```powershell
cd C:\Users\gbigu\RiderProjects\Clipper\Clipper.Api
dotnet run
```

A API estará disponível em:
- **HTTP**: http://localhost:5000
- **HTTPS**: https://localhost:7220
- **Swagger**: https://localhost:7220/swagger

---

## 📝 Endpoints Disponíveis

### 1. **Registro de Usuário**
**POST** `/api/Auth/register`

**Body (JSON):**
```json
{
  "fullName": "João Silva",
  "email": "joao@example.com",
  "password": "Senha123!",
  "confirmPassword": "Senha123!",
  "role": "Customer"
}
```

**Roles disponíveis:**
- `Customer` - Cliente
- `Barber` - Barbeiro
- `BarberShopOwner` - Proprietário de Barbearia
- `Admin` - Administrador (criado automaticamente pelo seeder)

**Resposta de Sucesso (200 OK):**
```json
{
  "isSuccess": true,
  "message": "User registered successfully.",
  "token": ""
}
```

---

### 2. **Login**
**POST** `/api/Auth/login`

**Body (JSON):**
```json
{
  "email": "joao@example.com",
  "password": "Senha123!"
}
```

**Resposta de Sucesso (200 OK):**
```json
{
  "isSuccess": true,
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**O token JWT retornado deve ser usado em requisições autenticadas.**

---

## 🧪 Testando com cURL

### Registrar um novo usuário:
```powershell
curl -X POST "https://localhost:7220/api/Auth/register" `
  -H "Content-Type: application/json" `
  -d '{
    "fullName": "Maria Santos",
    "email": "maria@example.com",
    "password": "Senha123!",
    "confirmPassword": "Senha123!",
    "role": "Customer"
  }'
```

### Fazer Login:
```powershell
curl -X POST "https://localhost:7220/api/Auth/login" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "maria@example.com",
    "password": "Senha123!"
  }'
```

### Usar o token em requisições autenticadas:
```powershell
curl -X GET "https://localhost:7220/api/BarberShop" `
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 🧪 Testando com Postman

1. **Importe a coleção** (se tiver) ou crie manualmente
2. **Registre um usuário** via `/api/Auth/register`
3. **Faça login** via `/api/Auth/login` e copie o token
4. **Adicione o token** nas requisições:
   - Vá em **Authorization**
   - Escolha **Bearer Token**
   - Cole o token recebido no login

---

## 🔒 Usuário Admin Padrão

O sistema cria automaticamente um usuário Admin ao iniciar:

**Email:** `admin@clipper.com`
**Senha:** `Admin123!`
**Role:** `Admin`

Use essas credenciais para acessar funcionalidades administrativas.

---

## 🛡️ CORS Configurado

O CORS está configurado para permitir requisições de:
- `http://localhost:5000`
- `https://localhost:7220`

Para ambientes de desenvolvimento, você pode usar a política `DevCors` que permite credenciais.

---

## ⚙️ Configuração JWT (appsettings.json)

```json
"Jwt": {
  "Key": "aa96e975080f9d1f53ef2d53b616fe1c_this_is_a_very_secure_secret_key_for_jwt_tokens",
  "Issuer": "ClipperApi",
  "Audience": "ClipperClient"
}
```

**Token expira em:** 1 hora

---

## 🎯 Próximos Passos

1. ✅ Sistema de autenticação está pronto
2. 🔄 Adicione `[Authorize]` nos controllers que precisam de autenticação
3. 🔄 Use `[Authorize(Roles = "Admin")]` para restringir por role
4. 🔄 Implemente refresh tokens (opcional)
5. 🔄 Configure HTTPS em produção (`RequireHttpsMetadata = true`)

---

## 🐛 Troubleshooting

### Erro: "Cannot find the object 'AspNetUsers'"
**Solução:** Execute `dotnet ef database update`

### Erro: "The service collection cannot be modified"
**Solução:** Verifique se não há chamadas duplicadas de `AddSwaggerGen` ou configurações após `app.Build()`

### Token não é aceito
**Solução:** Verifique se:
- O token está sendo enviado no header: `Authorization: Bearer {token}`
- O token não expirou (válido por 1 hora)
- As configurações de `Issuer` e `Audience` estão corretas

---

## 📚 Estrutura do Projeto

```
Clipper.Api/
├── Controllers/
│   └── AuthController.cs          ✅ Endpoints de auth
├── Repositories/
│   └── AuthRepository.cs          ✅ Lógica de autenticação
├── Interfaces/
│   └── IAuthRepository.cs         ✅ Interface do repositório
├── Models/
│   ├── Entities/
│   │   └── ApplicationUser.cs     ✅ Usuário (herda IdentityUser)
│   └── Dto/Auth/
│       ├── LoginDto.cs            ✅ DTO de login
│       ├── RegisterDto.cs         ✅ DTO de registro
│       └── AuthResponseDto.cs     ✅ DTO de resposta
├── Data/
│   ├── ApplicationDbContext.cs    ✅ Contexto do EF Core
│   └── DbSeeder.cs                ✅ Seeder de roles e admin
└── Program.cs                     ✅ Configuração completa

```

---

**Status:** ✅ **PRONTO PARA USO!**

