# Dokploy — plataforma con backend y CSV

> Esta configuración reemplaza la publicación estática anterior. Ahora se ejecuta Bun y el puerto interno es **8000**, no 80. `deploy/nginx.conf` pertenece al despliegue anterior y no se usa en el Dockerfile actual.

## Configuración

1. Crear/editar Application y seleccionar repositorio `Tokioh/talentosinfronteras`, rama del commit que incluya estos cambios.
2. Método **Dockerfile**; contexto raíz (`.` o `/` según el campo), archivo `Dockerfile`. No seleccionar `dist/`.
3. Mantener **una sola réplica**. Desactivar autoscaling y cualquier despliegue con dos instancias escribiendo simultáneamente sobre el mismo volumen. Preferir parar/recrear la instancia; aceptar una breve interrupción. CSV no admite escritores concurrentes de distintos procesos.
4. Añadir volumen persistente en **`/app/data`**. Debe ser escribible por el usuario `bun` de la imagen. No exponer esta carpeta por HTTP ni montarla sobre `/app`.
5. Definir variables:

```text
NODE_ENV=production
HOST=0.0.0.0
PORT=8000
DATA_DIR=/app/data
COOKIE_SECURE=true
PUBLIC_ORIGIN=https://talento.tudominio.com
REVIEWER_EMAIL=correo-del-revisor@tudominio.com
REVIEWER_PASSWORD=UNA_CONTRASENA_LARGA_UNICA_Y_SECRETA
```

Sustituir dominio y credenciales. `PUBLIC_ORIGIN` no lleva barra final ni ruta; debe coincidir exactamente con el dominio público HTTPS. No copiar literalmente el ejemplo de contraseña. Guardar los secretos solo en Dokploy, nunca en Git.

La cuenta revisora se provisiona al arrancar si ese correo no existe. No hay registro público de revisores. Si el correo ya pertenece a otra cuenta, no se eleva su rol automáticamente. Cambiar la variable no cambia contraseñas de cuentas existentes. No hay todavía un flujo de recuperación o rotación desde la interfaz: resolverlo antes de admitir usuarios reales.

## Tarjetas de usuarios de prueba en el login

En desarrollo aparecen por defecto tres tarjetas: candidata, empresa y revisor. Al seleccionarlas solo se rellenan correo y contraseña; no se inicia sesión automáticamente. Se crean cuentas compartidas de prueba persistentes en el CSV.

En Dokploy/producción están desactivadas por defecto. Para una instalación **exclusivamente de demostración**, añadir `ENABLE_DEMO_ACCOUNTS=true` y redesplegar. No activar en una instancia con datos reales: cualquier visitante podría utilizar esos perfiles, incluido el revisor. Para deshabilitarlas, configurar `ENABLE_DEMO_ACCOUNTS=false` y reiniciar; desaparecen los cuadros y se rechaza el login de las cuentas marcadas como demo, aunque sus registros se conservan.

Las tarjetas solo publican credenciales de las cuentas demo creadas por el servidor; nunca muestran las de `REVIEWER_EMAIL` ni cuentas normales. Las cuentas demo usan correos del dominio reservado `demo.example` y no envían correo.

## Poblar la demostración en el servidor

Para cargar ejemplos en una instalación sin datos reales, añadir:

```text
ENABLE_DEMO_ACCOUNTS=true
SEED_DEMO_DATA=true
```

Revisar la copia del volumen antes de desplegar. Se cargan automáticamente 10 vacantes, 7 postulaciones, 9 mensajes, 4 solicitudes, 6 guardados y los perfiles necesarios antes de aceptar conexiones. La carga no duplica registros con identificador de ejemplo ni sobrescribe sus modificaciones. Los registros físicamente eliminados pueden recrearse al volver a cargar; las vacantes retiradas y los estados cambiados se conservan.

Se requiere una sola instancia. El comando manual `bun run --bun seed:demo` requiere detener el servidor y crea una copia previa del CSV. No ejecutar el comando manual dentro de un contenedor que ya esté sirviendo tráfico.

Los ejemplos incluyen cuentas compartidas y solicitudes visibles al revisor demo. Nunca habilitar estos indicadores en una plataforma con información personal real.

## Dominio

- Registro DNS A hacia la IP pública del servidor; corregir AAAA si existe.
- Host en Dokploy: `talento.tudominio.com`, sin protocolo.
- Path `/`, puerto interno **8000**, protocolo interno HTTP.
- HTTPS/Let's Encrypt habilitado en el proxy. Puertos públicos 80/443 disponibles.
- No publicar directamente el puerto 8000 hacia Internet.
- Desplegar y comprobar logs. Producción se niega a arrancar sin origen HTTPS y cookies seguras configuradas.

## Comprobación

- `/health` devuelve JSON `{"ok":true}`.
- `/` muestra inicio de sesión y registro.
- Crear un candidato y una empresa de prueba en navegadores/perfiles separados.
- Empresa publica, candidato postula, empresa ve perfil compartido y ambos intercambian mensajes.
- El candidato solo comparte ajustes si marca la autorización; probar ambos casos.
- Iniciar sesión como revisor, responder una solicitud y comprobar que el solicitante ve la respuesta.
- Reiniciar contenedor: cuentas y registros deben persistir. Las sesiones están en memoria y se cierran al reiniciar.
- `/data/platform.csv`, `/.git/config`, `/package.json` devuelven 404.
- `/demo/` conserva la demostración anterior, aislada y sin conexión a las cuentas del servidor.

## Persistencia y copias

`/app/data/platform.csv` tiene una cabecera y una columna `record` con JSON escapado según CSV. Es una base de registros, no una hoja de cálculo de campos planos. No abrir/editar con Excel para evitar conversiones destructivas y exposición de contenido introducido por usuarios.

Las escrituras usan archivo temporal, sincronización y reemplazo atómico. Esto evita publicar un CSV parcialmente escrito en el funcionamiento normal, pero **no convierte CSV en una base transaccional ni garantiza recuperación ante todo fallo de disco**.

Para una copia coherente, detener temporalmente la instancia, respaldar el volumen completo y volver a arrancar. Cifrar copias y limitar permisos; contienen perfiles, ajustes, conversaciones y hashes de contraseñas. Probar restauración en una instancia aislada. Nunca subir el CSV a Git.

No editar el CSV con el servidor activo. No compartir volumen entre réplicas ni iniciar dos procesos con el mismo directorio. Si el CSV está corrupto, el servidor falla al arrancar en lugar de sobrescribirlo silenciosamente.

## Desarrollo

```sh
bun install
bunx playwright install chromium
bun run --bun test
bun run --bun start
```

Abrir `http://127.0.0.1:8000`. En desarrollo no activar `COOKIE_SECURE` sobre HTTP. El servidor usa `data/` (ignorado por Git).

Prototipo anterior: `bun run --bun start:demo` (no puede usar el mismo puerto al mismo tiempo).

## Límites antes de una operación pública sensible

La implementación entrega registros y mensajes dentro del portal, no correo ni notificaciones externas. El operador debe asignar revisores reales. No hay verificación de correo/identidad empresarial, recuperación de cuenta, política legal aprobada, eliminación de cuenta, carga multimedia privada en servidor, registro de auditoría completo ni evaluación de penetración. La versión nueva no migra los datos privados del prototipo automáticamente. Revisar `documentos/PLATAFORMA_CSV.md`.

No declarar conformidad WCAG ni producción certificada por pasar las pruebas automatizadas. Docker no está disponible en el entorno de desarrollo usado para esta intervención; construir y verificar la imagen en Dokploy.
