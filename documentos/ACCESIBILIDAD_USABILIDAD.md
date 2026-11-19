# Accesibilidad y usabilidad — estado verificable

## Objetivo, no certificación

Objetivo: WCAG 2.2 nivel AA y una navegación comprensible y consistente. Esta implementación tiene evidencia automática y verificaciones de teclado concretas; **no es una declaración de conformidad completa**. Quedan comprobaciones manuales, pruebas con tecnologías de asistencia y evaluación con participantes.

## Cambios implementados

| Área | Implementación | Referencias orientativas |
| --- | --- | --- |
| Estructura | HTML en español, regiones, título por ruta, un encabezado principal, orden de encabezados corregido en login | 1.3.1, 2.4.2, 2.4.6, 3.1.1 |
| Orientación | Separación pública/privada, navegación por rol, menú activo y ubicación; destinos diferentes para publicación, postulaciones y mensajes | 3.2.3, 3.2.4 |
| Teclado | Controles nativos, salto al contenido, foco visible, foco al título del diálogo, Escape y devolución al disparador | 2.1.1, 2.1.2, 2.4.1, 2.4.3, 2.4.7 |
| Formularios | Etiquetas asociadas, campos obligatorios indicados, instrucciones y autocompletado de correo/contraseña; registro usa new-password | 1.3.5, 3.3.2, 3.3.8 |
| Errores | Resumen persistente con foco y enlaces a campos; mensajes visibles por campo y aria-invalid/aria-describedby; no depender solo del color | 1.4.1, 3.3.1, 3.3.3 |
| Estado | Avisos anunciados; estado ocupado durante envío y bloqueo de duplicados; confirmación persistente al guardar perfil | 4.1.2, 4.1.3 |
| Control y recuperación | Confirmaciones de retirada/cambios de estado; borradores en memoria para perfil, publicación, edición, mensajes y solicitudes | 3.3.4 cuando corresponda; prevención y recuperación de errores |
| Pérdida de datos | Aviso antes de cerrar con borradores; confirmación al cerrar sesión si se perderían; refrescar mensajes conserva el borrador | Control del usuario y recuperación |
| Visibilidad | El aviso flotante se retira si coincide con el elemento que recibe foco; foco reforzado opcional | Apoyo a 2.4.11; requiere comprobar todos los casos manualmente |
| Reflujo y personalización | Diez preferencias, reducción de movimiento del sistema, colores forzados respetados, reflujo y espaciado; enlaces de error con objetivo de 44 px | 1.4.10, 1.4.12, 2.5.8; comprobar zoom real |
| Contraste | Corrección de enlaces tipo botón en modo de contraste; pruebas de contraste con axe en estados auditados | 1.4.3 y 1.4.11, todavía con revisión manual pendiente |

Los borradores no se escriben en una segunda base local ni guardan contraseñas. Se mantienen en memoria de la pestaña por usuario, ruta y formulario. No sobreviven a recargar/cerrar. Al cerrar sesión se descartan con confirmación si existen. La selección de archivos no forma parte de este mecanismo.

## Pruebas reproducibles

```sh
bun install
bunx playwright install chromium
bun run --bun test:a11y
bun run --bun test
```

`tests/wcag.cjs` crea datos ficticios en un directorio temporal y lo elimina al terminar. No necesita datos de producción. axe-core es una dependencia de desarrollo: no se incluye en la imagen de ejecución.

### Cobertura automática actual

- 23 combinaciones de vista/rol: seis públicas, siete de candidato, siete de empresa y tres de revisor.
- Dos estados adicionales: errores del login y diálogo de oportunidad.
- Cuatro estados con todas las preferencias activadas: última vista de cada rol.
- **29 casos auditados** con etiquetas axe WCAG A/AA aplicables hasta 2.2 y buenas prácticas.
- Cero infracciones automáticas reportadas en la ejecución verificada; esto no significa que todos los criterios sean automáticamente evaluables.
- Reflujo sin desbordamiento horizontal a 320/375 px en las vistas base y a 320/375/768 px en los cuatro casos de preferencias combinadas.
- Error del login: resumen enfocado, dos campos marcados y enlace que lleva al campo.
- Diálogo: apertura con Enter, foco inicial, recorrido Tab sin pasar a controles de fondo, Escape y devolución del foco.
- Las suites complementarias comprueban aislamiento de datos, consentimiento, persistencia y recuperación de borradores.

El informe detallado se genera en **`test-results/wcag-report.json`** (no se versiona porque es un resultado generado). Conserva tanto `violations` como `incomplete`: no se ignoran los casos que axe no puede decidir.

### Limitaciones conocidas de la evidencia

axe solicita revisión manual de algunos contrastes, especialmente adornos/iconos y partes de la ilustración de bienvenida. Que un elemento esté marcado como decorativo no demuestra que todos los contrastes informativos sean correctos. El emulador de ancho no sustituye el zoom real del navegador, una pantalla táctil ni un lector de pantalla. Tampoco se auditan todas las combinaciones posibles de preferencias, contenido o errores.

## Verificaciones necesarias antes de declarar conformidad

- [ ] Recorrido completo con NVDA + Firefox/Chrome y VoiceOver + Safari: lectura, nombres, estados y errores sin anuncios duplicados o confusos.
- [ ] Contraste medido manualmente de todos los estados e iconos informativos, incluidos los `incomplete` del informe.
- [ ] Zoom real 200 % y 400 %, ampliación solo de texto y espaciado personalizado, sin pérdida de información o funcionalidad.
- [ ] Foco visible y no oculto durante navegación, errores, avisos, panel y diálogo, en todas las resoluciones y con colores forzados.
- [ ] Navegación integral por teclado, táctil y dispositivos adaptados, no solo las secuencias automatizadas.
- [ ] Calidad de redacción, comprensión de consentimiento y facilidad de completar tareas con personas de los perfiles definidos.
- [ ] Comportamiento ante interrupciones, red lenta, expiración de sesión, datos extensos y recuperación de errores de servidor.
- [ ] Si se traslada multimedia al servidor, equivalencia de subtítulos/transcripción y reproductor accesible; no está implementado en la plataforma nueva.
- [ ] Revisar recuperación de cuenta y gestión accesible de autenticación antes de admitir usuarios reales.

## Evaluación de usabilidad

Utilizar `PROTOCOLO_EVALUACION.md` para medir éxito por tarea, errores, ayuda, tiempo y satisfacción. Mantener los hallazgos, gravedad y evidencias; no inventar participantes ni sustituir sus resultados por la opinión del equipo. El mapa de navegación está en `ARQUITECTURA_NAVEGACION.md`.
