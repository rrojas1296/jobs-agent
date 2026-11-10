# Nexo · plataforma de empleo

Primera fase funcional: infraestructura, autenticación real, onboarding persistente y dashboard. Interfaz en español, responsive y con temas claro, oscuro y sistema. El diseño sigue la referencia suministrada: marco gris frío, sidebar y paneles blancos redondeados, bordes discretos y acento violeta.

**No se conectan portales de empleo ni servicios de IA.** Las ofertas están identificadas como demostración; estadísticas reales en cero y actividad vacía. No se crean estadísticas, postulaciones ni actividad ficticia en PostgreSQL.

## Requisitos

- Node.js **24 LTS** y pnpm **12.18.0** (`corepack enable` si tu instalación incluye Corepack, o instala pnpm desde su documentación oficial).
- Docker Engine + Docker Compose v2.
- Puertos disponibles: web `3000`, API `4000`, PostgreSQL publicado en `5434` por defecto.

## Inicio local

Desde la raíz:

```bash
# Solo la primera vez: cada aplicación mantiene su propio entorno.
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Opcional, para personalizar Docker Compose:
cp .env.example .env

pnpm install
docker compose -f compose.dev.yaml up -d --wait
pnpm db:migrate
pnpm dev
```

Abre **http://localhost:3000** y crea una cuenta. El registro inicia sesión y lleva al onboarding; los cuatro pasos guardan datos al continuar. Al recargar se recupera el último paso pendiente **guardado** (no los cambios todavía sin enviar). Los enlaces profesionales son opcionales. Al finalizar se habilita el dashboard.

También puedes usar `docker compose -f compose.dev.yaml up -d`; espera a que PostgreSQL esté healthy antes de ejecutar migraciones. No hay usuario ni contraseña de aplicación preconfigurados.

```bash
docker compose -f compose.dev.yaml ps
docker compose -f compose.dev.yaml logs postgres
docker compose -f compose.dev.yaml down       # Conserva datos
# down -v elimina permanentemente el volumen y todos los datos
```

## Comandos

| Comando                 | Descripción                                              |
| ----------------------- | -------------------------------------------------------- |
| `pnpm dev`              | Next.js + NestJS en desarrollo, mediante Turborepo       |
| `pnpm build`            | Compilación de producción de ambas aplicaciones          |
| `pnpm typecheck`        | Generación de tipos de rutas Next y TypeScript estricto  |
| `pnpm lint`             | oxlint, sin advertencias permitidas                      |
| `pnpm format`           | oxfmt desde la raíz                                      |
| `pnpm format:check`     | Comprueba formato sin modificar archivos                 |
| `pnpm test`             | Pruebas unitarias de API y políticas de navegación       |
| `pnpm test:integration` | Flujo HTTP real contra PostgreSQL migrado                |
| `pnpm db:generate`      | Genera una nueva migración versionada desde los esquemas |
| `pnpm db:migrate`       | Aplica migraciones pendientes, sin `push`                |

Las pruebas de integración crean un usuario con correo aleatorio, ejecutan el flujo y eliminan ese usuario con sus datos relacionados al terminar. Usan `apps/api/.env`: se recomienda una base de datos de pruebas separada; nunca ejecutar contra producción.

Para compilar sin interferir con un `next dev` activo:

```bash
NEXT_DIST_DIR=.next-production pnpm build
NEXT_DIST_DIR=.next-production pnpm --filter @jobs/web start --port 3001
```

Sin esa variable, `pnpm build` y `pnpm --filter @jobs/web start` utilizan `.next`. No ejecutes build y dev simultáneamente sobre ese mismo directorio.

## Variables de entorno

### Raíz: Docker Compose

| Variable            | Valor local por defecto             |
| ------------------- | ----------------------------------- |
| `POSTGRES_USER`     | `jobs`                              |
| `POSTGRES_PASSWORD` | `jobs_local_only` (solo desarrollo) |
| `POSTGRES_DB`       | `jobs_agent`                        |
| `POSTGRES_PORT`     | `5434`                              |

El puerto se publica únicamente en `127.0.0.1`. NestJS corre en el host y se conecta por `localhost`, **no** mediante el nombre del contenedor. Si cambias credenciales o puerto, actualiza también `DATABASE_URL`. Cambiar las variables no modifica credenciales de un volumen PostgreSQL ya inicializado.

### `apps/api/.env`

| Variable           | Uso                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------ |
| `NODE_ENV`         | `development`, `test` o `production`                                                 |
| `PORT`             | Puerto HTTP, por defecto `4000`                                                      |
| `DATABASE_URL`     | Conexión `pg`, ejemplo `postgresql://jobs:jobs_local_only@localhost:5434/jobs_agent` |
| `WEB_ORIGIN`       | Origen exacto del navegador autorizado, `http://localhost:3000`                      |
| `JWT_SECRET`       | Secreto HS256, mínimo 32 caracteres; generar uno aleatorio para despliegue           |
| `COOKIE_SECURE`    | `false` local HTTP; obligatorio `true` en producción                                 |
| `COOKIE_SAME_SITE` | `lax` por defecto; `strict` o `none` según despliegue (`none` exige Secure)          |

No utilizar el secreto de ejemplo en producción. Generación sugerida: `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`.

### `apps/web/.env`

| Variable              | Uso                                              |
| --------------------- | ------------------------------------------------ |
| `API_URL`             | URL privada de NestJS, `http://localhost:4000`   |
| `NEXT_PUBLIC_API_URL` | `/api`, misma procedencia que el frontend        |
| `NEXT_DIST_DIR`       | Opcional: salida aislada para build/verificación |

`NEXT_PUBLIC_API_URL` se incorpora al build. Mantén `/api` para conservar la estrategia de cookies. `API_URL` también se usa al construir los rewrites: reconstruye la web si cambia el destino. Los archivos `.env` y secretos están excluidos de Git; solo se versionan `.env.example`.

## Estructura

```text
apps/
  web/
    src/
      app/                 # App Router, layouts de servidor y límites de error/carga
      features/
        auth/              # Formularios, schemas, hooks Query y servicios HTTP
        onboarding/        # Wizard de cuatro pasos y persistencia por grupos
        dashboard/         # Navegación, paneles, preferencias y datos demo tipados
      components/
        ui/                # Primitivas estilo shadcn/ui: Radix, cva, Tailwind
        shared/            # ThemeProvider propio, campos y selector de etiquetas
      lib/                 # Axios centralizado, política de rutas, acceso servidor
      stores/              # Solo estado de UI con Zustand
    public/fonts/          # Inter autoalojada, licencia SIL OFL incluida
  api/
    src/
      config/
      database/drizzle/    # Esquemas por entidad, relaciones, conexión pg
      modules/
        auth/              # Domain, application, infrastructure, presentation
        users/             # Contrato e implementación del repositorio
        onboarding/        # Reglas de completitud, repositorio y endpoints
        dashboard/         # Resumen inicial real, sin integraciones externas
      common/              # Validación Zod y protección CSRF
      tests/
    drizzle/               # SQL y metadatos de migraciones versionadas
```

No hay `packages/`, librerías internas ni dependencias compartidas entre aplicaciones. Cada app mantiene dependencias, configuración y entorno propios. Los contratos de dominio no importan Nest, Drizzle ni PostgreSQL. Se usan tokens de clase abstracta y `useClass` para repositorios, hashing y JWT. Los controllers no acceden a Drizzle. Las validaciones de entrada están en presentación; las reglas de completitud del onboarding en dominio.

En frontend, los layouts y páginas son Server Components salvo las islas interactivas. React Query es la fuente de datos remotos; Zustand conserva únicamente preferencias de tema y navegación. Las llamadas HTTP están en servicios, no en componentes de presentación. El tema se aplica antes de hidratar, detecta `prefers-color-scheme` y persiste solo la preferencia visual.

## Autenticación y seguridad

- Contraseñas con **Argon2id** y sal aleatoria; validación de complejidad y confirmación con Zod.
- JWT firmados/verificados mediante **jose**, con emisor, audiencia, algoritmo y propósito verificados. Access token de **15 minutos**; refresh token de **30 días**.
- Cookies host-only, `HttpOnly`, `Path=/`, `SameSite` configurable y `Secure` obligatorio en producción. No se devuelven tokens en JSON ni se almacenan en localStorage, sessionStorage o Zustand.
- Solo se guarda el hash SHA-256 del refresh de alta entropía. La rotación usa un compare-and-swap atómico en PostgreSQL; reutilizar un refresh invalida toda esa sesión. El vencimiento de la sesión es absoluto a 30 días, no deslizante.
- Logout revoca la sesión y borra ambas cookies. Incluso un access token previamente emitido deja de funcionar: el guard comprueba la sesión persistida.
- Axios coordina renovaciones simultáneas **dentro de la pestaña** con una única promesa, reintenta una vez y evita recursión en endpoints de autenticación.
- El proxy de Next renueva cookies cuando hace falta antes de renderizar. La protección no depende solo del cliente/proxy: los layouts de servidor consultan usuario y los endpoints tienen guard de autenticación. El dashboard de API exige además onboarding finalizado.
- Las solicitudes mutantes exigen `Origin` exacto y `X-Requested-With: jobs-web`. Junto con CORS de origen explícito y cookies SameSite, esto bloquea formularios y llamadas cross-origin no autorizadas. No hay mutaciones por GET.
- Rate limiting en memoria (120/min general; límites más estrictos para registro/login), Helmet y respuestas API `no-store`. No se ha añadido Redis.

### Estrategia de despliegue

Publicar **un único origen HTTPS** para Next.js y `/api` (rewrite a NestJS privado). El navegador nunca llama a otro dominio de API. Configurar `WEB_ORIGIN` con ese origen exacto, `COOKIE_SECURE=true` y credenciales de producción; usar `SameSite=lax` salvo necesidad justificada. Mantener la API privada, terminar TLS en un proxy de confianza y no cachear respuestas autenticadas ni `Set-Cookie`.

Esta fase ejecuta Nest en `127.0.0.1`. Para contenedores separados habría que configurar la interfaz de escucha y la red del despliegue. Con varias réplicas, el rate limit en memoria no es global: aplicar límites en el ingress o implementar almacenamiento compartido en una fase posterior. No habilitar `trust proxy` indiscriminadamente; configurar solo proxies de confianza para evitar falsificación de IP.

La política de replay es deliberadamente estricta: dos pestañas o instancias que renueven exactamente el mismo refresh al mismo tiempo pueden cerrar la sesión y requerir login. El single-flight del cliente evita la carrera más común en una pestaña, pero no es un coordinador distribuido. Antes de escalar, valorar coordinación inter-pestaña y una estrategia acotada de idempotencia sin debilitar detección de replay. No hay limpieza programada de sesiones expiradas en esta fase.

## Endpoints

Todas las rutas mutantes requieren los encabezados CSRF descritos. Las respuestas de usuario excluyen `passwordHash`.

```http
POST  /auth/register
POST  /auth/login
POST  /auth/refresh
POST  /auth/logout
GET   /auth/me

GET   /onboarding
PATCH /onboarding/profile
PATCH /onboarding/skills
PATCH /onboarding/preferences
PATCH /onboarding/links
POST  /onboarding/complete

GET   /dashboard
```

`/onboarding/links` permite guardar separadamente los enlaces opcionales sin sobrescribir la información profesional. `complete` valida los datos requeridos persistidos antes de habilitar el dashboard. Las secciones Explorar empleos, Mis postulaciones, Mis CV, Ofertas guardadas y Configuración tienen rutas funcionales; las funcionalidades futuras muestran estados vacíos explícitos (Configuración muestra el perfil actual, tema y logout).

## Verificación

Pruebas con el runner nativo de Node 24: complejidad de contraseña, Argon2id, JWT inválido/expirado/propósito incorrecto, políticas de ruta sin bucles y reglas de completitud. Integración HTTP contra PostgreSQL: CSRF, registro/duplicados, cookies y secretos no expuestos, login, guard del dashboard, persistencia de cada paso, rechazo de finalización incompleta, rotación/replay y revocación al salir.

Además se verificó manualmente en navegador: registro → cuatro pasos → recarga con recuperación → dashboard → logout, navegación móvil, ausencia de overflow horizontal, tema persistido y renovación desde el servidor. No se ha instalado Playwright como dependencia del proyecto.

## Documentación oficial consultada

- [Next.js](https://nextjs.org/docs) y documentación incluida en la versión instalada.
- [NestJS](https://docs.nestjs.com/), [Drizzle PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql) y [migraciones](https://orm.drizzle.team/docs/migrations).
- [Tailwind CSS con Next](https://tailwindcss.com/docs/installation/framework-guides/nextjs), [shadcn/ui](https://ui.shadcn.com/docs/installation/next).
- [jose](https://github.com/panva/jose), [Turborepo](https://turborepo.com/docs), [pnpm workspaces](https://pnpm.io/workspaces), [oxlint](https://oxc.rs/docs/guide/usage/linter) y [oxfmt](https://oxc.rs/docs/guide/usage/formatter).

Las dependencias están fijadas y `pnpm-lock.yaml` versiona la resolución completa. No se incluyen OAuth, scraping, colas, Redis, motores de IA, generación de CV ni conexión a portales: pertenecen a fases posteriores.
