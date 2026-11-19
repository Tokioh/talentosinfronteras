# Matriz de cumplimiento y trazabilidad

> Esta matriz registra la fase local del prototipo, conservada en `/demo/`. Para la plataforma nueva en `/`, con backend CSV, consultar `PLATAFORMA_CSV.md`: cuentas, mensajes y solicitudes ya tienen servidor, pero varias funciones del prototipo no se han trasladado todavía. No interpretar esta matriz histórica como cobertura completa de la nueva interfaz.

## Alcance y fuentes

Fuentes: libro `Talento_Sin_Barreras_Analisis_de_Tareas.xlsx`, su generador `generar_excel.py`, `../ACCESSIBILITY.md`, `../PLAN_PROYECTO.md` y README original. No se encontró una especificación oficial de RF numerados. Los identificadores Tn-Un corresponden a las tareas del libro, no a nuevos RF oficiales.

**Implementado local** significa que el usuario puede completar la tarea en este navegador; no implica envío, soporte conectado ni operación multiusuario. **Pendiente de validación** significa que falta evidencia con personas reales aunque exista la interfaz.

| Tarea | Requisito observado | Implementación | Evidencia automatizada / límite |
| --- | --- | --- | --- |
| T1-U1 | Configurar accesibilidad | Panel de diez preferencias | `tests/accessibility.cjs`; falta validación de lectura con personas. |
| T2-U1 | Completar perfil | Perfil editable y guardado | `tests/flows.cjs`; persistencia y validación. |
| T3-U1 | Buscar y filtrar | Buscador, modalidad, condiciones, jornada | `tests/flows.cjs`; búsqueda, vacío y restablecimiento. |
| T4-U1 | Consultar vacante | Diálogo nombrado, funciones, entorno y afinidad | `tests/flows.cjs`; falta evaluar comprensión. |
| T5-U1 | Guardar oportunidades | Favoritos y filtro | `tests/flows.cjs`. |
| T6-U1 | Postular y elegir ajustes | Registro local y consentimiento por ajuste | `tests/flows.cjs`; no envío a empresa. |
| T7-U1 | Consultar/retirar postulaciones | Vista de registros y retirada con confirmación | `tests/flows.cjs`; consulta y retirada comprobadas. |
| T1-U2 | Acceder por teclado | Enlaces, formularios nativos, salto al contenido y foco | Suite de accesibilidad cubre panel; recorrido integral manual pendiente. |
| T2-U2 | Foco y movimiento reducido | Preferencias, respeto al sistema | `tests/accessibility.cjs`. |
| T3-U2 | Actualizar competencias | Perfil con validación y equivalencias de texto | `tests/flows.cjs`. |
| T4-U2 | Ajustes y visibilidad | Notas, privado por defecto y compartir con confirmación | `tests/flows.cjs`. |
| T5-U2 | Buscar/revisar oportunidades | Mismos controles de vacantes | Suites de flujos y accesibilidad; falta teclado adaptado real. |
| T6-U2 | Postular con ajustes | Copia del perfil y ajustes seleccionados | `tests/flows.cjs`; simulación explícita. |
| T7-U2 | Solicitar ayuda por barrera | Solicitudes locales y exportación | `tests/flows.cjs`; no hay recepción ni respuesta humana. |
| T1-U3 | Acceso empresarial | Enlace en escritorio y móvil | `tests/flows.cjs`. |
| T2-U3 | Datos de una vacante | Empresa, cargo, ciudad, modalidad, jornada y salario | `tests/flows.cjs`; publicación local. |
| T3-U3 | Funciones/competencias | Campos obligatorios, competencias por comas | `tests/flows.cjs`. |
| T4-U3 | Entorno y ajustes | Descripción y selección de ajustes ofrecidos | Interfaz implementada; veracidad requiere revisión de la empresa. |
| T5-U3 | Publicar demostración | Publicación visible en catálogo local | `tests/flows.cjs`. |
| T6-U3 | Revisar publicación | Catálogo, detalle y nueva edición sin duplicación | `tests/local-tools.cjs`. |
| T7-U3 | Retirar vacante | Confirmación y limpieza de favoritos | `tests/flows.cjs`. |

## Pendientes técnicos del plan incorporados

- Edición de vacantes locales preservando el identificador y los vínculos de postulaciones.
- Recuperación de formularios al navegar dentro de la aplicación. Los borradores permanecen solo en memoria de la pestaña; recargar o cerrarla los descarta. No incluye selección de archivos ni consentimiento de postulación.
- Exportación/importación de datos de texto con versión de formato, límite de 5 MB, comprobación estructural, confirmación de reemplazo y advertencia de contenido privado sin cifrado. No incluye archivos multimedia.
- Separación de estas funciones en `local-tools.js`.
- Aviso de cambios de almacenamiento desde otras pestañas; no se sobrescribe en silencio el formulario abierto. No hay resolución automática de conflictos entre escrituras concurrentes.
- Pruebas de cuota simulada y borrado fallido.
- Comprobación de sintaxis compatible con Bun y Node, sin ejecutar código del navegador en el servidor.

## Requisitos que NO están cumplidos como plataforma real

1. Registro/inicio de sesión, recuperación de cuenta y autorización por rol.
2. Backend, base de datos multiusuario, sincronización, copias y recuperación de servidor.
3. Custodia privada y análisis de seguridad de archivos.
4. Entrega de mensajes y postulaciones a destinatarios reales.
5. Equipo de revisión humana, plazos, resolución y notificaciones.
6. IA semántica validada; la afinidad actual usa reglas explicadas y no evalúa datos sensibles.
7. Aprobación de políticas de privacidad, conservación y base legal.
8. Auditoría WCAG, pruebas con participantes y evidencias de equidad.
9. Despliegue productivo, HTTPS, monitorización y respuesta a incidentes.

No se sustituyen estos requisitos por botones simulados ni se marcan como hechos. Requieren una fase de desarrollo y validación distinta. Los escenarios académicos de Ecuador y las vacantes de Colombia siguen siendo ejemplos hasta que el equipo acuerde el mercado.
