# FitnessApp FrontEnd (Vite + React)

- Uses SBAdmin2 theme via CDN
- Auth via fetch to `/api/auth/login` with `application/x-www-form-urlencoded`
- JWT stored in localStorage
- React Router for navigation, hooks for state

## Quick Start

```powershell
cd "c:\Users\MSI\Desktop\FitnessApp\FrontEnd"
npm install
npm run dev
```

Open `http://localhost:5173`.

Default login fields are prefilled with `admin/adminpass`.

Configure API base URL in `.env`:

```
VITE_API_BASE_URL=https://localhost:7179
```
