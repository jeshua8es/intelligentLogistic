# Contexto del Proyecto - Intelligent Logistic

## 🎯 Visión del Proyecto
Sistema integral de gestión logística e inventario con enfoque en trazabilidad, cadena de frío y control de stock por sucursales. Diseñado para empresas que necesitan gestionar productos sensibles a temperatura con múltiples puntos de distribución.

## 🏗️ Arquitectura Tecnológica
- **Backend**: Django (Python 58.5%) - API REST
- **Base de Datos**: Supabase (PostgreSQL 15+)
- **Autenticación**: Supabase Auth (JWT)
- **Frontend**: React 18+ con TypeScript (27.3%)
- **Build Tool**: Vite
- **Estado**: Zustand
- **UI Components**: Lucide React
- **Cliente Supabase**: @supabase/supabase-js v2
- **Enrutamiento**: React Router DOM

## 🔐 Configuración Supabase
- **URL**: `https://qgndelvjwlttmjeldulzz.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Headers Requeridos**:
  - `apikey`: anon key
  - `Authorization`: Bearer <token>
  - `Content-Type`: application/json
  - `Prefer`: return=representation

## 📂 Estructura del Frontend
![alt text](image.png)


## 🔑 Datos de Referencia Críticos
- **Branch ID Principal**: `0faa341d-6729-4ced-92e7-fa76d70e6e3d` (Sucursal Costa Pacífica Norte)
- **Producto TEST-001 ID**: `500963a9-3d84-4064-a141-545e6590bec3`
- **Producto TEST-002 ID**: `7ffea32e-caf9-499e-acff-481f0b8e3edc`

### Usuarios de Prueba
```javascript
{
  email: 'prueba@correo.com',
  password: '123456',
  name: 'Usuario Prueba',
  role: 'admin',
  branch_id: '0faa341d-6729-4ced-92e7-fa76d70e6e3d'
}

## Endpoints:

/login - Login

/dashboard - Dashboard principal

/inventory - Gestión de inventario

/shipments - Gestión de envíos

## frontend estructure
src/
├── components/
│ ├── auth/
│ │ └── ProtectedRoute.tsx
│ ├── ui/
│ │ ├── Button.tsx
│ │ ├── Card.tsx
│ │ └── Modal.tsx
│ ├── InventoryCRUD.jsx
│ └── Sidebar.tsx
├── layouts/
│ └── DashboardLayout.tsx
├── lib/
│ └── supabase.ts
├── pages/
│ ├── Dashboard.tsx
│ ├── Inventory.tsx
│ ├── Login.tsx
│ └── Shipments.tsx
├── services/
│ └── supabase.ts
├── stores/
│ └── authStore.ts
├── types/
│ └── dashboard.ts
└── utils/
└── helpers.ts
