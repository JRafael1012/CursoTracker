# Diseño — paleta de colores (CursoTracker)

Fuente única de tokens de color para todo el SaaS.

## Logotipo (assets)

- Original: `public/logo/logo.jpeg` (1408×768, solo fuente).
- Recortado (UI): `public/logo/logor.png` — **fondo transparente**, usado en login y cabecera. Respaldo sin transparencia: `logor-original.png`.
- Favicon/iconos: `app/favicon.ico`, `app/icon.png` (transparentes), `app/apple-icon.png` (fondo blanco).
- Regenerar: `& "$env:TEMP\opencode\transparent.ps1"`.

| Uso | Color | HEX |
|---|---|---|
| Primario | Azul institucional | `#2563EB` |
| Primario oscuro | Azul profundo | `#1D4ED8` |
| Secundario | Índigo | `#4F46E5` |
| Éxito | Verde | `#16A34A` |
| Advertencia | Ámbar | `#F59E0B` |
| Error | Rojo | `#DC2626` |
| Fondo | Gris muy claro | `#F8FAFC` |
| Cards | Blanco | `#FFFFFF` |
| Texto | Slate oscuro | `#0F172A` |
| Texto secundario | Gris | `#64748B` |
| Bordes | Gris claro | `#E2E8F0` |

## Uso

- Primario: botones principales, enlaces, cabeceras.
- Primario oscuro: hover de primario.
- Secundario: acentos, íconos secundarios.
- Éxito/Advertencia/Error: estados (aprobado, pendiente, suspenso, errores).
- Fondo en `<body>`; cards blancas con borde `#E2E8F0`.

## Implementación

Tailwind 4: definidos en `app/globals.css` bajo `@theme` como
`--color-primary`, `--color-primary-dark`, `--color-accent`,
`--color-success`, `--color-warning`, `--color-danger`, `--color-bg`,
`--color-card`, `--color-text`, `--color-text-sec`, `--color-border`.
Usar siempre estas clases (`bg-primary`, `text-text-sec`…), no hex sueltos.
