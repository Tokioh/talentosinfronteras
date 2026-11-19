# Desplegar TalentoSinBarreras en Dokploy

## Qué se publica

Sitio estático con Nginx en contenedor Docker. No necesita Bun, Node, Python, base de datos ni variables secretas dentro del contenedor. Bun se utiliza para desarrollo y pruebas locales.

**Importante:** publicar el sitio no activa cuentas, mensajería real ni revisión humana. Cada visitante conserva sus propios datos en el navegador. No usar candidaturas reales ni anunciar soporte conectado. Revisar `documentos/MATRIZ_CUMPLIMIENTO.md`.

## 1. Requisitos

- Servidor con Dokploy operativo y acceso administrativo.
- Acceso de Dokploy al repositorio `https://github.com/Tokioh/talentosinfronteras`, rama `main`. Si es privado, autorizar el proveedor GitHub o configurar un acceso Git de solo lectura admitido por tu instalación; no guardar tokens en el repositorio.
- Dominio/subdominio disponible, por ejemplo `talento.ejemplo.com`.
- DNS A del subdominio dirigido a la IP pública del servidor. Si existe AAAA, también debe apuntar al servidor y tener conectividad IPv6; en caso contrario, corregirlo o retirarlo.
- Puertos públicos 80/443 permitidos para el proxy y los certificados. No abrir públicamente el puerto de la aplicación mediante un mapeo adicional.

Los nombres exactos de botones pueden variar según la versión de Dokploy.

## 2. Crear la aplicación

1. Entrar a Dokploy y crear o abrir un proyecto.
2. Crear un servicio de tipo **Application / Aplicación** (no una base de datos).
3. En el proveedor de código, seleccionar GitHub o Git según la conexión disponible.
4. Seleccionar el repositorio `Tokioh/talentosinfronteras` y la rama `main`.
5. Elegir **Dockerfile** como método de construcción, no Nixpacks ni Buildpacks.
6. Configurar:

   | Campo | Valor |
   | --- | --- |
   | Contexto/ruta de construcción | `.` o `/` según el campo: raíz del repositorio |
   | Ruta del Dockerfile | `Dockerfile` (o `/Dockerfile` si la interfaz pide ruta absoluta al repositorio) |
   | Etapa de construcción | Predeterminada; no hay múltiples etapas |
   | Puerto interno del contenedor | `80` |
   | Variables de entorno | Ninguna necesaria |
   | Volúmenes persistentes | Ninguno necesario |

   **No usar `dist/` como contexto:** aunque la carpeta local se llama `dist`, este repositorio tiene `index.html` y `Dockerfile` directamente en su raíz.

7. No añadir comandos de instalación, build ni start personalizados. La imagen de Nginx aporta el arranque.
8. Guardar y ejecutar **Deploy / Desplegar**. Revisar los logs de construcción y de ejecución.

## 3. Dominio y HTTPS

1. En **Domains / Dominios**, añadir `talento.ejemplo.com`, sustituyéndolo por el dominio real.
2. Ruta pública: `/`. Puerto del contenedor: **80**. Si pide protocolo del servicio interno, seleccionar HTTP: el proxy termina TLS.
3. Habilitar HTTPS con el proveedor de certificados disponible, habitualmente Let's Encrypt.
4. Guardar los cambios y desplegar de nuevo si la interfaz lo requiere.
5. Esperar propagación DNS y emisión del certificado. Verificar que el dominio abre por HTTPS sin advertencias; configurar redirección HTTP → HTTPS en el proxy si no se activa automáticamente.

Si usas un proxy DNS externo, diagnosticar primero con resolución DNS directa cuando haya problemas de emisión. No desactivar verificaciones TLS como solución.

## 4. Comprobación posterior

Visitar:

- `https://talento.ejemplo.com/` → portada.
- `https://talento.ejemplo.com/health` → `ok`.
- `https://talento.ejemplo.com/#perfil` → perfil, también después de recargar.
- `https://talento.ejemplo.com/app.js` y `/local-tools.js` → HTTP 200, tipo JavaScript.
- `https://talento.ejemplo.com/.git/config`, `/package.json` y `/documentos/` → HTTP 404.

Probar manualmente:

- Accesibilidad, navegación móvil y diálogo de vacante.
- Perfil, postulaciones locales y consentimiento de ajustes.
- Edición de vacante y copia JSON.
- Archivo de audio/video con transcripción y subtítulos en HTTPS.
- Ausencia de errores JavaScript o bloqueos inesperados de CSP en la consola.

La imagen incluye `HEALTHCHECK` sobre `/health`. Si tu versión de Dokploy admite comprobaciones adicionales, usar HTTP en puerto 80 y ruta `/health`. No confundir el healthcheck del contenedor con la comprobación pública de DNS/TLS.

## 5. Datos, privacidad y caché

- **No hay base de datos remota:** recrear el contenedor no borra los datos que cada usuario tiene en su navegador.
- Los datos están asociados al origen (protocolo, dominio y puerto). Los datos de `localhost` no aparecen automáticamente en el dominio de producción. Cambiar de dominio o HTTP a HTTPS también cambia el origen.
- Para trasladar texto, usar exportación/importación desde el perfil. La copia no incluye audio/video, no está cifrada y contiene ajustes privados.
- El borrado se realiza en cada navegador. Borrar un contenedor no elimina los datos de los visitantes.
- Los recursos usan `Cache-Control: no-cache` porque no tienen nombres con hash; el navegador revalida para evitar versiones mezcladas.
- No montar un volumen sobre `/usr/share/nginx/html`: ocultaría los archivos publicados.
- Las fuentes de Google son opcionales. Si no cargan, se usa Arial. Los navegadores podrían realizar solicitudes externas de fuentes; valorar alojarlas localmente antes de un uso con políticas de privacidad más estrictas.

## 6. Actualizar y revertir

1. Ejecutar pruebas locales: `bun run --bun test`.
2. Hacer commit y push a `main`.
3. Desplegar manualmente en Dokploy, o activar despliegue automático/webhook si el proveedor está conectado y autorizado.
4. Repetir la comprobación de `/health` y los flujos principales.
5. Si hay un fallo, usar la opción de rollback de tu instalación si está disponible o seleccionar un commit conocido y volver a construirlo. No es necesario hacer `force push`.

Conservar el hash del commit desplegado. Fijar la imagen base por digest y revisar sus actualizaciones/vulnerabilidades antes de una operación sensible; la etiqueta actual `nginx:1.28-alpine` permite actualizaciones dentro de esa versión.

## 7. Prueba Docker local opcional

Con Docker instalado y en ejecución:

```sh
docker build -t talentos-inclusivos .
docker run --rm --name talentos-inclusivos -p 8080:80 talentos-inclusivos
```

Abrir `http://localhost:8080` y `/health`. Ctrl+C detiene el contenedor. En otra terminal se puede comprobar la configuración con:

```sh
docker run --rm talentos-inclusivos nginx -t
```

## Solución de problemas

| Síntoma | Comprobar |
| --- | --- |
| No encuentra Dockerfile o archivos COPY | Contexto raíz del repositorio, no `dist/`. |
| Error 502/504 | Contenedor iniciado, logs y dominio apuntando al puerto interno 80. |
| Certificado no emitido | A/AAAA, puertos 80/443, propagación y proxy DNS externo. |
| Datos no aparecen | Mismo navegador y origen; no existe sincronización. |
| Interfaz antigua o error al cargar script | Revisar commit desplegado y recargar; confirmar `/local-tools.js`. |
| Puerto local 8000 ocupado | Otro servidor de desarrollo ya está abierto; detenerlo. No afecta al puerto interno 80 de Dokploy. |

## Límite de verificación

Las pruebas de interfaz pueden ejecutarse localmente, pero la publicación en tu instancia de Dokploy requiere acceso al servidor, dominio y proveedor Git. La inclusión de estos archivos no significa que ya se haya desplegado ni que se haya emitido un certificado.
