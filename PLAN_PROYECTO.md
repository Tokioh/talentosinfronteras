# TalentoSinBarreras — análisis y plan de trabajo

## 1. Alcance y diagnóstico

Portal académico de empleo inclusivo en español, implementado con HTML, CSS y JavaScript sin framework. Es una aplicación estática con siete vistas por fragmentos de URL. No existe servidor de negocio, autenticación, base de datos remota, mensajería real ni revisión humana conectada.

**Objetivo de esta intervención:** dejar el prototipo local más robusto, accesible y comprobable, sin inventar servicios ni presentar simulaciones como funciones reales. Las tareas marcadas como pendientes necesitan decisiones de producto, infraestructura o participación de usuarios. Este documento no es una certificación WCAG ni un compromiso de lanzamiento a producción.

### Inventario revisado

| Archivo | Función / observaciones |
| --- | --- |
| `index.html` | Estructura, navegación, preferencias y diálogo de vacante. |
| `styles.css` | Diseño y adaptación; fuentes de Google opcionales con alternativa Arial. |
| `accessibility.css` | Diez preferencias, foco, reflujo y movimiento reducido. |
| `app.js` | Catálogo de seis vacantes ficticias, afinidad por reglas, vistas, eventos y persistencia. |
| `ACCESSIBILITY.md` | Uso del panel y lista de verificaciones manuales. |
| `tests/accessibility.cjs` | Suite de navegador existente para preferencias y teclado. |
| `documentos/generar_excel.py` | Generación con openpyxl de tres perfiles hipotéticos y siete tareas por perfil. |
| `documentos/Talento_Sin_Barreras_Analisis_de_Tareas.xlsx` | Libro existente de tres hojas y tres tablas; estructura ZIP comprobada. No se modificó. |
| `../README.md` | Documentación original: confirma el carácter local y las limitaciones del prototipo. |

### Usuarios y tareas identificados

- **María, candidata con baja visión:** personalizar lectura, completar perfil, buscar, consultar, guardar y gestionar postulaciones.
- **Andrés, candidato con movilidad reducida:** operar con teclado, orientar el foco, configurar ajustes y reportar barreras.
- **Daniela, representante empresarial:** publicar funciones y competencias claras, informar condiciones, comprobar y retirar vacantes.

Son perfiles ficticios; las frecuencias y necesidades del libro deben contrastarse con personas reales. Las vacantes de ejemplo usan ciudades colombianas y COP, mientras los escenarios académicos se sitúan en Ecuador: acordar el mercado objetivo antes de cambiar datos o moneda.

## 2. Trabajo completado

### P0 — Integridad, privacidad y mensajes fiables

- [x] Restaurar el estado local con valores predeterminados por campo y validación de estructuras. Un perfil parcial o listas con registros inválidos ya no bloquean las vistas.
- [x] Recuperar el funcionamiento ante JSON corrupto o almacenamiento inaccesible.
- [x] Informar cuando un guardado queda solo en memoria, en vez de afirmar persistencia sin advertencia.
- [x] No afirmar que todos los datos se borraron si falla localStorage o IndexedDB; ofrecer instrucciones alternativas.
- [x] Mantener el consentimiento individual al compartir ajustes y verificar que los privados no aparecen en el formulario de postulación.
- [x] Escapar identificadores restaurados usados en atributos y limitar el color de vacantes restauradas a un valor conocido.
- [x] Liberar URL de archivos al cambiar de vista o eliminar contenido; descartar resultados multimedia asincrónicos de vistas anteriores.

### P1 — Usabilidad y accesibilidad

- [x] Dar nombre accesible al diálogo con `aria-labelledby` y foco inicial en el título de la vacante.
- [x] Conservar foco al guardar vacantes, filtrar o volver a dibujar controles; usar el contenido principal si desaparece el control.
- [x] Hacer visible el acceso empresarial en la navegación móvil.
- [x] Corregir desbordamiento horizontal de campos del perfil en móvil, detectado al ampliar las pruebas a todas las vistas.
- [x] Rechazar competencias y transcripciones compuestas solo por espacios o separadores.
- [x] Validar enlaces de portafolio HTTP/HTTPS y limpiar espacios del perfil.
- [x] Rechazar campos empresariales obligatorios que solo contengan espacios.
- [x] Quitar de guardadas las vacantes locales retiradas. Conservar los registros históricos de postulación.
- [x] Limpiar la transcripción visible al eliminar la presentación.

### P1 — Entorno y pruebas

- [x] Crear `package.json` y lockfile para instalar las herramientas de pruebas.
- [x] Añadir `npm start`: servidor estático ligado a la interfaz local y con lista explícita de recursos públicos. No expone `.git`, documentos ni dependencias.
- [x] Añadir comprobaciones de sintaxis y suite de flujos en `tests/flows.cjs`.
- [x] Añadir `.gitignore` para dependencias, resultados y cachés.
- [x] Documentar instalación, límites y criterios de entrega en `README.md`.

## 3. Verificación y criterios de aceptación

Comandos desde esta carpeta:

```sh
npm ci
npx playwright install chromium
npm test
npm start
```

Abrir `http://127.0.0.1:8000`. `PORT` permite cambiar el puerto; `CHROMIUM_PATH` permite usar otro ejecutable compatible para las pruebas. Node.js 22 o posterior recomendado. La instalación y las fuentes opcionales requieren Internet; el servidor no convierte el prototipo en un sistema multiusuario.

### Cobertura automatizada

- Sintaxis JavaScript.
- Diez preferencias, persistencia, restablecimiento, navegación por teclado y Escape.
- Animaciones, cambios rápidos y respeto al movimiento reducido del sistema.
- Reflujo con preferencias activadas a 320, 375, 768 y 1280 px en la vista principal.
- Búsqueda vacía, limpieza de filtros, guardados y continuidad del foco.
- Perfil persistente, rechazo de competencias vacías y texto con etiquetas sin ejecución HTML.
- Presentación de audio de prueba: guardado y eliminación en IndexedDB, recuperación de transcripción. No demuestra calidad de reproducción.
- Consentimiento de ajustes al postular, mensajes, exportación de solicitud y publicación/retirada empresarial.
- Acceso empresarial móvil y ausencia de desbordamiento en las siete vistas a 375 px con estado vacío.
- Recuperación de datos malformados, fallo de escritura y borrado local.
- Ausencia de excepciones JavaScript en los recorridos probados.

**Resultado verificado en este entorno:** `npm test` completó las comprobaciones de sintaxis y ambas suites con resultado PASS en Chromium. `npm audit --omit=dev` informó cero vulnerabilidades. Consultar la salida de `npm test` para comprobar el estado en cada entorno. Las pruebas no sustituyen una auditoría de seguridad, accesibilidad o usabilidad.

## 4. Pendientes del prototipo y entrega académica

### P1 — Validación con personas (no automatizable)

- [ ] Reclutar participantes con consentimiento, incluyendo baja visión, uso de lector de pantalla y navegación con teclado adaptado.
- [ ] Validar los tres perfiles y las 21 tareas del Excel; documentar cambios y evidencias sin datos sensibles.
- [ ] Medir éxito por tarea, tiempo, errores, necesidad de ayuda y satisfacción; registrar barreras por gravedad.
- [ ] Probar lector de pantalla NVDA + Firefox/Chrome y VoiceOver + Safari.
- [ ] Verificar contraste en todas las vistas y estados, zoom real 200 %/400 %, colores forzados y foco no oculto.
- [ ] Comprobar calidad de subtítulos, transcripciones y reproducción con archivos reales de audio/video.
- [ ] Ejecutar pruebas en Firefox, Safari y dispositivos táctiles reales.
- [ ] Documentar resultados, priorizar hallazgos, aplicar ajustes y repetir pruebas antes de afirmar conformidad.

### P2 — Producto y mantenimiento

- [ ] Acordar mercado, ciudades, moneda y terminología con el equipo académico.
- [x] Recuperar formularios al navegar dentro de la aplicación y editar vacantes locales sin duplicarlas. Los borradores son en memoria; no sobreviven a recargas ni cierre.
- [x] Exportar/importar copia de datos de texto con advertencia de privacidad y confirmación de reemplazo. No incluye archivos multimedia.
- [x] Iniciar separación progresiva en `local-tools.js` para borradores, copias y edición; la modularización completa sigue siendo trabajo de mantenimiento.
- [x] Añadir pruebas de cuota simulada y borrado fallido, y aviso de cambios entre pestañas.
- [ ] Completar pruebas de límites multimedia y resolución de conflictos entre escrituras simultáneas.
- [ ] Generar el Excel si se actualizan perfiles; requiere Python y openpyxl. Python no está disponible en este entorno, por lo que no se regeneró ni se ejecutó ese script.

### Evidencia adicional

`bun run --bun test` ejecuta comprobación de sintaxis y tres suites: accesibilidad, flujos y herramientas locales. La matriz tarea por tarea está en `documentos/MATRIZ_CUMPLIMIENTO.md`; el protocolo de evaluación pendiente está en `documentos/PROTOCOLO_EVALUACION.md`. Estos documentos no reemplazan la participación de usuarios ni una especificación formal de RF.

## 5. Trabajo necesario para una versión real (no implementado)

Estas funciones no se pueden completar únicamente con los archivos actuales ni deben activarse con datos de candidatos sin aprobación y controles.

| Prioridad | Trabajo | Criterio mínimo de aceptación |
| --- | --- | --- |
| P0 | Definir requisitos, responsables, presupuesto y arquitectura | Contratos de API, esquema de datos y alcance aprobados. |
| P0 | Identidad y permisos por rol | Candidatos, empresas y revisores aislados; pruebas de acceso indebido y recuperación de cuenta. |
| P0 | Backend y base de datos | Validación en servidor, migraciones, transacciones y copias recuperables. |
| P0 | Protección de datos | Minimización, consentimiento, plazos de conservación, eliminación verificable y normativa aplicable revisada. |
| P0 | Archivos privados | Validación real de tipo/tamaño, análisis de archivos, cifrado y acceso temporal autorizado. |
| P0 | Seguridad | HTTPS, cabeceras y CSP compatibles, límites de abuso, gestión de secretos, auditoría y respuesta a incidentes. |
| P1 | Vacantes y postulaciones reales | Edición, estados, retirada e historial con permisos y trazabilidad. |
| P1 | Mensajería y notificaciones | Entrega real, estados, consentimiento y prevención de abuso. |
| P1 | Revisión humana | Equipo responsable, plazos, asignación, resolución, apelación e historial. |
| P1 | Afinidad semántica opcional | Evidencia de competencias, incertidumbre y validación; nunca puntuar diagnósticos, ajustes, rostro, voz o emociones. |
| P1 | Accesibilidad y equidad | Auditoría WCAG 2.2 AA y evaluación con personas, métricas de sesgo y corrección de barreras. |
| P2 | Operación | Despliegue, observabilidad sin datos sensibles, alertas, recuperación y mantenimiento. |

### Orden recomendado

1. Validar el prototipo local y cerrar las evidencias académicas.
2. Aprobar requisitos y política de datos.
3. Construir identidad, permisos y persistencia de servidor.
4. Conectar vacantes, postulaciones y archivos de forma segura.
5. Conectar mensajería y revisión humana con responsables reales.
6. Auditar accesibilidad y seguridad; evaluar afinidad avanzada solo si aporta valor comprobado.
7. Realizar un piloto controlado antes de admitir candidaturas reales.
