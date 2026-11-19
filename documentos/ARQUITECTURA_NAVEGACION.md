# Arquitectura de información y navegación

## Problemas corregidos

- La portada era un login rodeado por menús privados que aún no se podían utilizar.
- Candidatos, empresas y revisores veían enlaces que no correspondían a su trabajo.
- Mis vacantes mezclaba búsqueda general, recomendaciones y formulario de publicación.
- Postulaciones y mensajes mostraban prácticamente el mismo contenido.
- No existía una página de resumen ni un siguiente paso claro después del acceso.

## Web pública

| Ruta | Objetivo |
| --- | --- |
| `#home` | Explicar la propuesta, mostrar últimas oportunidades y orientar a candidatos/empresas. |
| `#jobs` | Explorar, buscar y filtrar vacantes activas sin registro. |
| `#how` | Explicar el proceso en tres pasos. |
| `#company` | Explicar el servicio empresarial sin mostrar controles privados. |
| `#login` | Iniciar sesión; tarjetas de prueba solo cuando están habilitadas. |
| `#register` | Crear cuenta y elegir candidato o empresa. |

La cabecera pública sustituye al menú lateral. Los detalles de una vacante pueden consultarse sin cuenta; postular requiere autenticación. La API pública solo devuelve vacantes publicadas, no perfiles ni postulaciones. No se incluyen identificadores privados de propietario en esa respuesta.

## Espacio de candidato

- **Mi resumen:** indicadores y próximos pasos.
- **Explorar vacantes:** búsqueda, afinidad y guardados.
- **Mis postulaciones:** estados y enlaces a cada conversación.
- **Mensajes:** selector de conversación, historial y envío; conserva la conversación seleccionada al actualizar.
- **Perfil y currículum:** presentación profesional.
- **Ajustes privados:** configuración separada del perfil compartible.
- **Ayuda y revisión:** solicitudes al equipo revisor.

## Espacio de empresa

- **Resumen de empresa:** vacantes activas, candidaturas recibidas y pendientes.
- **Mis vacantes:** publicaciones propias y edición/retirada. No contiene el formulario de alta ni recomendaciones de candidato.
- **Publicar vacante:** formulario dedicado, con volver/cancelar y retorno a Mis vacantes tras publicar.
- **Candidaturas recibidas:** perfiles autorizados y cambios de estado.
- **Mensajes:** conversaciones con candidatos de sus postulaciones.
- **Perfil de empresa** y **Ayuda**.

## Espacio de revisor

- **Resumen de revisión:** pendientes/resueltas.
- **Solicitudes de revisión:** bandeja y respuesta.
- **Mi perfil**.

## Reglas de orientación

- Acceso y registro conducen al resumen del rol.
- Cerrar sesión vuelve a la portada pública.
- El logotipo lleva al inicio público o al resumen privado según sesión.
- Ruta activa, breadcrumb y título de documento identifican la ubicación.
- Rutas privadas sin sesión conducen al login; rutas ajenas al rol conducen a su resumen. La autorización de datos sigue aplicándose en el backend: ocultar enlaces no es un control de seguridad suficiente.
- El historial por fragmentos permite volver/avanzar y recargar enlaces sin configuración adicional del proxy.
- Las publicaciones se gestionan desde un único punto; no se mezclan con creación de cuenta ni con perfil.

## Implementación

`navigation.js` define la navegación, páginas públicas y resúmenes. `platform.js` conserva los flujos de negocio conectados al backend CSV. `styles.css` y `accessibility.css` siguen siendo la base visual original; `platform.css` solo añade composición pública, indicadores y ajustes específicos.

La nueva estructura no añade verificación de empresas, correo, notificaciones automáticas, custodia multimedia ni otros requisitos pendientes. Tampoco convierte las pruebas automatizadas en validación de usabilidad con personas; utilizar el protocolo de evaluación existente para contrastar esta arquitectura.
