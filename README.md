# TalentoSinBarreras

Prototipo académico de empleo inclusivo. Aplicación estática en español con vacantes ficticias y almacenamiento exclusivo en el navegador.

## Ejecutar

Requiere Node.js 22 o posterior recomendado:

```sh
npm ci
npm start
```

Abrir **http://127.0.0.1:8000**. Detener con Ctrl+C. Se puede cambiar el puerto con la variable `PORT`. No usar el servidor de desarrollo para producción.

## Con Bun

```sh
bun install
bun run --bun start
```

Pruebas: `bun run --bun test` (requiere Chromium de Playwright). Si el puerto 8000 ya está ocupado, detén la instancia anterior con Ctrl+C antes de arrancar otra.

## Pruebas

```sh
npx playwright install chromium
npm test
```

- `npm run check`: sintaxis.
- `tests/accessibility.cjs`: preferencias, teclado, persistencia y reflujo.
- `tests/flows.cjs`: búsqueda, perfil, archivos locales, postulaciones, consentimiento, mensajes, solicitudes, empresas y recuperación de datos inválidos.
- `tests/local-tools.cjs`: recuperación de borradores, exportación/importación, edición sin duplicados y errores de almacenamiento.

Opcional: `CHROMIUM_PATH` para un navegador compatible ya instalado. Las dependencias son herramientas de desarrollo: la interfaz no necesita paquetes JavaScript en tiempo de ejecución.

## Funciones

- Perfil, currículum descargable y presentación multimedia con transcripción; video con subtítulos WebVTT.
- Vacantes, filtros, guardados y explicación de afinidad por reglas de competencias/intereses.
- Ajustes privados por defecto y confirmación individual para compartirlos al postular.
- Postulaciones, mensajes y solicitudes de revisión **locales y simulados**.
- Publicación, edición y retirada de vacantes de demostración.
- Borradores de formularios en memoria al cambiar de sección (no sobreviven a recargas).
- Exportación/importación de copias JSON de datos de texto, con advertencia de privacidad. No incluyen multimedia.
- Diez preferencias de accesibilidad con persistencia y respeto a la reducción de movimiento del sistema.

## Datos y límites

No hay cuentas, backend, envío a empresas, soporte humano conectado ni sincronización. `localStorage` contiene los registros de texto e IndexedDB la presentación. Al borrar el almacenamiento del navegador se pierden los datos. Si se bloquea el guardado, los cambios quedan solo en memoria y se informa al usuario. No introducir datos sensibles en un dispositivo compartido.

El borrado se puede solicitar desde el pie de página; si el navegador impide completarlo, usar su configuración de datos del sitio. Las fuentes de Google son opcionales; sin conexión se utiliza Arial. La afinidad no es IA entrenada ni decide contrataciones. Las pruebas automáticas no certifican conformidad WCAG.

## Despliegue en Dokploy

Usar el `Dockerfile` de la raíz, contexto de construcción raíz y puerto interno **80**. No usar el servidor local de Node/Bun en producción. Instrucciones completas en **[DESPLIEGUE_DOKPLOY.md](DESPLIEGUE_DOKPLOY.md)**.

## Documentación

- **[PLAN_PROYECTO.md](PLAN_PROYECTO.md)**: análisis, inventario, trabajo realizado, pendientes y ruta hacia una versión operativa.
- **[ACCESSIBILITY.md](ACCESSIBILITY.md)**: panel y verificación manual pendiente.
- **[Matriz de cumplimiento](documentos/MATRIZ_CUMPLIMIENTO.md)**: trazabilidad de las 21 tareas y límites reales.
- **[Protocolo de evaluación](documentos/PROTOCOLO_EVALUACION.md)**: sesiones, métricas y registro de barreras; pendiente de ejecutar.
- `documentos/Talento_Sin_Barreras_Analisis_de_Tareas.xlsx`: tres perfiles hipotéticos con siete tareas cada uno.
- `documentos/generar_excel.py`: regenerar el libro con Python y `openpyxl` (`python -m pip install -r documentos/requirements.txt`, después `python documentos/generar_excel.py`). Sobrescribe el Excel existente; conservar una copia si se hicieron cambios manuales.
