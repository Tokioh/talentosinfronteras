# TalentoSinBarreras

Plataforma de empleo inclusivo con backend Bun/Node y persistencia privada en CSV. Cuentas, vacantes, postulaciones, mensajes y solicitudes se comparten entre los usuarios autorizados de una misma instalación.

## Ejecutar

```sh
bun install
bun run --bun start
```

Abrir **http://127.0.0.1:8000**. Datos: `data/platform.csv`, ignorado por Git. No ejecutar dos instancias sobre el mismo directorio. Ctrl+C detiene el servidor.

Alternativa con Node.js 22 o posterior: `npm ci` y `npm start`.

## Pruebas

```sh
bunx playwright install chromium
bun run --bun test
```

Incluye sintaxis, tres suites del prototipo y una suite de plataforma: autenticación, permisos, aislamiento, CSV, mensajes, revisión y persistencia tras reinicio. Solo plataforma: `bun run --bun test:platform`.

## Navegación

La portada es pública: inicio, vacantes, cómo funciona y empresas. Login y registro tienen páginas separadas. Tras acceder se muestra un resumen y menú adaptados al rol: candidato, empresa o revisor. Publicación, gestión de vacantes, postulaciones y mensajes son destinos separados.

Mapa y decisiones: **[ARQUITECTURA_NAVEGACION.md](documentos/ARQUITECTURA_NAVEGACION.md)**.

## Funciones de plataforma

- Cuentas de candidatos y empresas con contraseña derivada mediante scrypt.
- Perfil y ajustes privados; confirmación al compartirlos en una postulación.
- Vacantes publicadas por empresas, edición, retirada, búsqueda, modalidad y guardados.
- Postulaciones con copia del perfil y cambios de estado autorizados.
- Mensajería interna entre candidato y empresa de la postulación.
- Solicitudes de revisión con bandeja para revisores provisionados por el operador.
- Diez preferencias visuales. Afinidad explicada por coincidencias de competencias, no IA entrenada.

Los mensajes se entregan dentro del portal; no hay correo ni notificaciones externas. El operador debe asignar personas al rol revisor. Los perfiles empresariales son autodeclarados, no verificados.

## Despliegue Dokploy — configuración actualizada

Usar `Dockerfile`, contexto raíz, **puerto interno 8000** y **volumen persistente en `/app/data`**. Una sola réplica, sin escritores simultáneos. Definir `PUBLIC_ORIGIN=https://tu-dominio` y `COOKIE_SECURE=true`; configurar el dominio con HTTPS.

Guía: **[DESPLIEGUE_DOKPLOY.md](DESPLIEGUE_DOKPLOY.md)**. La configuración antigua de Nginx/puerto 80 ya no aplica al Dockerfile nuevo.

## Accesibilidad y usabilidad

Objetivo WCAG 2.2 AA: estructura semántica, navegación por rol, teclado, errores enlazados por campo, instrucciones, avisos accesibles y borradores en memoria. Pruebas axe: `bun run --bun test:a11y`.

La auditoría automática cubre **29 casos de vistas/roles/estados**, conserva los resultados que requieren revisión manual y comprueba reflujo. No es una certificación WCAG. Evidencia y lista pendiente: **[ACCESIBILIDAD_USABILIDAD.md](documentos/ACCESIBILIDAD_USABILIDAD.md)**.

## Usuarios de prueba

El login incluye tarjetas de **Candidata**, **Empresa** y **Revisor** que completan correo y contraseña sin iniciar sesión automáticamente. En desarrollo están habilitadas por defecto; para desactivarlas: `ENABLE_DEMO_ACCOUNTS=false`.

En producción no se crean ni se muestran por defecto. Para una instalación aislada de demostración se pueden habilitar con `ENABLE_DEMO_ACCOUNTS=true` y reiniciar. Son cuentas compartidas con credenciales públicas: **no habilitarlas donde haya información real**. Al deshabilitarlas se bloquea también su inicio de sesión.

## Poblar datos de demostración

Con el servidor detenido:

```sh
bun run --bun seed:demo
bun run --bun start
```

La carga crea 10 vacantes ficticias de Ecuador, 7 postulaciones, 9 mensajes, 4 solicitudes, 6 guardados y perfiles relacionados: 7 cuentas demo en total. No sobrescribe registros existentes ni duplica los que ya cargó. El comando guarda una copia previa del CSV en `DATA_DIR/backups`. No ejecutar mientras otro proceso use el mismo directorio de datos.

En Dokploy, para una instalación aislada de demostración, usar **ambas** variables `ENABLE_DEMO_ACCOUNTS=true` y `SEED_DEMO_DATA=true`. La carga se ejecuta antes de aceptar conexiones. Revisar primero la copia del volumen. Las escrituras manuales en los registros de ejemplo se conservan; registros físicamente eliminados pueden recrearse en otra carga. No es un reseteo de datos.

Las vacantes están identificadas mediante cuentas de demostración; no representan ofertas ni empresas reales. El CSV y sus copias son privados y no se suben a Git.

## Revisor

En las variables del servidor, configurar `REVIEWER_EMAIL` y `REVIEWER_PASSWORD` (mínimo 12 caracteres, secreto único). Se crea la cuenta si no existe. No se permite registrarse públicamente como revisor. Reiniciar cierra sesiones, no elimina registros.

## Alcance y límites

Esta implementación hace operativos los flujos internos, pero no constituye una certificación de producción. CSV requiere una sola instancia y reescribe el archivo completo; no sustituye una base transaccional para escalar. El disco contiene información privada: restringir acceso, cifrar y respaldar. No cargar datos sensibles de personas reales sin validación del operador.

Faltan, entre otros: recuperación y verificación de cuentas, eliminación de cuenta, custodia multimedia de servidor, consentimiento granular por ajuste, auditorías y validación con usuarios. Detalles y evidencia: **[PLATAFORMA_CSV.md](documentos/PLATAFORMA_CSV.md)**.

## Prototipo anterior

Disponible en `/demo/` o con `bun run --bun start:demo`. Conserva su multimedia, copias JSON y simulaciones locales, sin conectarlas a las cuentas del servidor. Los datos antiguos no se migran automáticamente. Su documentación y pruebas no deben interpretarse como cumplimiento íntegro de la plataforma nueva.

## Documentación académica

- `PLAN_PROYECTO.md`: plan y evidencia de la etapa de prototipo.
- `documentos/MATRIZ_CUMPLIMIENTO.md`: 21 tareas originales y alcance local de referencia.
- `documentos/PROTOCOLO_EVALUACION.md`: protocolo pendiente de ejecutar con participantes.
- `ACCESSIBILITY.md`: panel de accesibilidad del prototipo anterior.
- `documentos/Talento_Sin_Barreras_Analisis_de_Tareas.xlsx`: tres perfiles hipotéticos.
- `documentos/generar_excel.py`: generador; requiere Python y `documentos/requirements.txt`.
