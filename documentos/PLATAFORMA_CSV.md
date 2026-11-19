# Plataforma CSV: implementación y límites actuales

## Cambio de arquitectura

La raíz `/` usa `platform.html`, `platform.js`, `platform.css` y `server/platform.cjs`. Ya no depende de localStorage para los registros de negocio: estos se guardan en CSV en el servidor. Las preferencias visuales sí permanecen locales. El prototipo previo está disponible en `/demo/` con sus propios datos locales; no hay migración automática.

## Funcionalidad operativa dentro del portal

- Registro de candidatos/empresas e inicio/cierre de sesión.
- Derivación de contraseñas con scrypt y sal individual; cookies HttpOnly/SameSite, Secure en producción y sesiones de ocho horas mantenidas en memoria.
- Límite básico por IP de conexión para intentos de registro/login. Detrás del proxy puede agrupar usuarios por la misma IP: es una defensa básica, no un servicio antiabuso completo.
- Validación de permisos en servidor, tamaños de solicitud y origen de escrituras.
- Perfil y ajustes privados; la copia de postulación excluye ajustes salvo autorización expresa. En esta primera interfaz los ajustes son texto libre y la autorización comparte todo ese campo, no elementos individuales del catálogo anterior.
- Empresas publican, editan y retiran sus propias vacantes.
- Búsqueda, modalidad, guardados persistentes y explicación de coincidencias exactas de competencias. No es IA semántica ni predice éxito laboral.
- Candidatos registran/retiran postulaciones. Empresas consultan únicamente las recibidas y cambian sus estados.
- Mensajes persistentes entre los dos participantes de cada postulación. Solo se ven tras consultar/recargar la bandeja; no hay correo ni actualización en tiempo real.
- Solicitudes persistentes y bandeja de revisores provisionados por el operador; resolución visible al solicitante.
- Diez preferencias visuales nativas. Su accesibilidad integral necesita auditoría; no se presume equivalente a la validación del panel antiguo.
- Persistencia después de reiniciar el servidor; las sesiones se invalidan al reinicio.

## Formato de almacenamiento

Un único archivo `platform.csv`, cabecera `record` y una columna de registros JSON entre comillas CSV. Tipos: user, job, application, message, review y saved. Identificadores UUID. El adaptador no ejecuta fórmulas ni evalúa contenido. El CSV completo es privado; ninguna API lo descarga.

Escrituras de reemplazo atómico desde **un único proceso**, en almacenamiento local persistente. Cada escritura reescribe todo el archivo. No sirve para cargas elevadas, volúmenes de red con garantías desconocidas, múltiples réplicas ni alta disponibilidad. No hay bloqueo distribuido ni detección de segundo proceso: respetar la configuración de una instancia. Migrar a una base transaccional antes de escalar.

Los hashes no son contraseñas en claro, pero perfiles, mensajes y ajustes sí son texto: proteger el disco y las copias, restringir permisos y usar cifrado de volumen según el alojamiento.

## Pruebas

`tests/platform.cjs` verifica:

- Registro y autenticación por cookie.
- Rechazo del rol revisor en el registro público.
- Restricción de publicación a empresas.
- Privacidad entre candidatos y exclusión de ajustes sin consentimiento.
- Prevención de postulaciones duplicadas activas.
- Entrega interna de mensajes, aislamiento y comillas/saltos de línea conservados en CSV.
- Cambio de estado por empresa y consulta por candidato.
- Aislamiento de solicitudes, permiso de revisión y resolución por cuenta revisora.
- Rechazo de escritura con origen ajeno y bloqueo HTTP del archivo CSV.
- Recorrido de login, vacantes y conversaciones en Chromium.
- Persistencia de usuarios, vacantes y mensajes después de reiniciar.

No son pruebas de penetración ni pruebas de carga. El Dockerfile requiere verificación en un entorno con Docker.

## Pendientes que impiden afirmar «todo listo para producción»

1. Especificación oficial completa de RF y aprobación de los cambios respecto al catálogo de ajustes del prototipo.
2. Política legal, consentimiento informado, conservación y borrado de cuenta/datos.
3. Verificación de correo e identidad empresarial, recuperación/rotación de credenciales y MFA cuando corresponda.
4. Carga y custodia multimedia en servidor (no implementada en la plataforma nueva; solo existe en el prototipo local).
5. Consentimiento granular por ajuste, exportación privada de cuenta y gestión de borradores en la interfaz nueva.
6. Auditoría de seguridad, dependencias e imagen; auditoría WCAG y pruebas con personas.
7. Copias cifradas, restauración ensayada, monitorización y respuesta a incidentes a cargo del operador.
8. Equipo humano y plazos de respuesta reales. La existencia de una bandeja no garantiza atención.
9. Auditoría de operaciones y política de estados empresariales más detallada.
10. Afinidad semántica validada solo si se aprueba como requisito; actualmente se usan reglas explícitas.

Los documentos anteriores describen la fase local y su evidencia. Esta nota actualiza el estado de backend/cuentas/mensajes para la nueva plataforma; no convierte automáticamente en completos los demás pendientes de esos documentos.
