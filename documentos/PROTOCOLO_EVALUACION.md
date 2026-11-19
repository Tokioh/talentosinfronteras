# Protocolo de evaluación de usabilidad y accesibilidad

**Estado: protocolo preparado, evaluación no ejecutada.** No contiene participantes ni resultados inventados.

## Preparación

1. Designar responsable, moderador y observador. Acordar alcance y autorización académica.
2. Invitar a personas con baja visión, uso habitual de lector de pantalla y movilidad reducida, y representantes empresariales. No asumir que una persona representa a toda una discapacidad.
3. Explicar que se evalúa el sistema, no sus capacidades; participación voluntaria, pausas y retirada sin consecuencias. Solicitar consentimiento separado para notas, audio o video.
4. No recopilar diagnósticos ni currículos reales. Usar nombres y empresas ficticios; no grabar datos personales sin autorización.
5. Usar el navegador y ayudas técnicas habituales del participante cuando sea posible. Registrar versión, tamaño de pantalla, zoom y entrada utilizada, sin información identificativa.
6. Preparar `bun install`, Chromium para pruebas automatizadas y `bun run --bun start`. Comprobar el servidor. Borrar datos de demostración entre sesiones, con permiso de su propietario.

## Guion

- Introducción: «Este portal es una demostración; no enviará candidaturas ni mensajes a empresas. Puedes detener la prueba cuando quieras».
- Pedir pensar en voz alta solo si resulta cómodo. No exigirlo si interfiere con su tecnología de asistencia.
- Presentar las tareas con el objetivo, sin indicar los controles exactos.
- No ayudar salvo bloqueo o petición; registrar cuándo y qué ayuda se dio.
- Realizar pausas y ajustar la duración con el participante.

## Escenarios

| Grupo | Consigna | Evidencia de éxito |
| --- | --- | --- |
| Candidato | Ajusta la lectura a tu preferencia y vuelve a entrar al sitio | Encuentra preferencias y comprueba persistencia. |
| Candidato | Presenta tus competencias y guarda tu perfil | Datos correctos después de recargar. |
| Candidato | Encuentra una oportunidad remota y explica por qué aparece para ti | Interpreta funciones y límites de afinidad. |
| Candidato | Guarda una oportunidad y vuelve a encontrarla | Recupera la vacante guardada. |
| Candidato | Configura dos ajustes, uno privado y otro compartible | Distingue visibilidad y control de consentimiento. |
| Candidato | Postula compartiendo solo el ajuste autorizado | Registro contiene únicamente el ajuste confirmado. |
| Candidato | Retira esa postulación | Comprende la confirmación y desaparición del registro. |
| Candidato | Registra una barrera y descarga la solicitud | Obtiene archivo y entiende que no llega a soporte. |
| Candidato | Navega a otra sección mientras editas y regresa | Recupera el borrador sin confundirlo con un guardado persistente. |
| Empresa | Publica funciones, competencias y condiciones de una vacante | Datos completos en catálogo local. |
| Empresa | Corrige la vacante y retírala | Cambia el mismo registro y confirma la retirada. |
| Ambos | Exporta y restaura una copia ficticia | Comprende privacidad, reemplazo y exclusión de multimedia. |

Consultar la matriz de cumplimiento para las 21 tareas originales. No es necesario que una sesión cubra todas; distribuir escenarios según rol y fatiga.

## Registro por tarea

| Campo | Valor por completar |
| --- | --- |
| Sesión anónima y tarea | |
| Entorno / ayuda técnica | |
| Inicio / fin / duración | |
| Éxito sin ayuda / con ayuda / no completada | |
| Errores y recuperaciones | |
| Ayuda proporcionada | |
| Satisfacción de tarea (1–7) y comentario opcional | |
| Barrera observada y pasos para reproducir | |
| Gravedad y justificación | |

Gravedad sugerida: crítica (impide tarea o expone datos), alta (requiere ayuda o alternativa), media (provoca error recuperable), baja (fricción sin bloqueo). No confundir una preferencia estética con una barrera sin analizar su efecto.

## Auditoría manual complementaria

- Recorrer todas las vistas, validaciones y diálogos con Tab, Mayús+Tab, Enter, Espacio y Escape.
- Comprobar orden, visibilidad y devolución de foco; ausencia de trampas y contenido oculto enfocable.
- NVDA + Firefox/Chrome y VoiceOver + Safari: nombres, encabezados, regiones y anuncios de errores/estado.
- Contraste de texto, controles, foco y estados con herramienta de medición; documentar pares de colores y ratios.
- Zoom real 200 %/400 %, solo texto y espaciado personalizado, colores forzados y pantallas táctiles.
- Probar subtítulos y transcripciones equivalentes con multimedia real; no basta con aceptar extensión `.vtt`.
- Verificar avisos de almacenamiento bloqueado, exportación sensible y fallos de borrado.

## Informe y repetición

Presentar resultados agregados: tareas intentadas, tasa de éxito, mediana de tiempo cuando sea comparable, errores, ayuda y barreras por gravedad. No publicar identidades ni inferir representatividad estadística de una muestra pequeña. Asociar cada hallazgo con evidencia, criterio WCAG cuando corresponda, corrección propuesta y responsable. Repetir las tareas afectadas después de corregir. No declarar conformidad WCAG ni cumplimiento total únicamente por pasar pruebas automáticas.
