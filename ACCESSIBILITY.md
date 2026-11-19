# Preferencias de accesibilidad

> Este documento describe el panel del prototipo original. Para la plataforma con backend, las correcciones de formularios, las pruebas axe y los pendientes de WCAG 2.2 AA, consultar **[Accesibilidad y usabilidad](documentos/ACCESIBILIDAD_USABILIDAD.md)**. No se declara conformidad completa a partir de las pruebas automáticas.

El panel es una sección desplegable **no modal**, no un menú ARIA (`role="menu"`). Sus controles son casillas nativas y botones con nombres visibles. No bloquea el resto de la página ni atrapa el foco.

## Uso

- Activar **Accesibilidad** con Enter o Espacio. `aria-expanded` refleja la apertura.
- Tab y Mayús+Tab recorren los controles en orden de documento.
- Escape desde el panel, o el botón de cierre, lo cierra y devuelve el foco al disparador.
- Diez preferencias, agrupadas en **Lectura y comprensión**, **Visibilidad y orientación** y **Movimiento y distracciones**:
  1. Contenido ampliado al 125 %.
  2. Espaciado entre líneas, letras y palabras.
  3. Tipografía sencilla (Arial).
  4. Alineación de bloques de texto a la izquierda.
  5. Líneas de lectura de hasta 60 caracteres aproximados en párrafos y descripciones.
  6. Alto contraste.
  7. Enlaces subrayados.
  8. Foco de teclado reforzado (el foco normal siempre está disponible).
  9. Ocultar la ilustración decorativa de bienvenida, sin ocultar contenido informativo.
  10. Reducción de movimiento.
- Las preferencias se guardan junto con los datos locales existentes. Si el navegador bloquea el almacenamiento, siguen funcionando durante la sesión y se informa del problema.
- Restablecer solo elimina las preferencias de visualización, no el perfil ni otros datos.
- La preferencia del sistema `prefers-reduced-motion` se respeta incluso después de restablecer. Los colores forzados del sistema no se desactivan.
- El panel entra con una transición de opacidad y desplazamiento de 6 px (220 ms) y sale en 140 ms. Los fondos, bordes y colores cambian en 180 ms. No se animan el tamaño de texto, la ampliación, el espaciado ni los indicadores de foco.
- Con movimiento reducido, las transiciones se desactivan y cualquier animación del panel se cancela inmediatamente. El cierre retira los controles del orden de interacción mediante `inert`, devuelve el foco y finalmente oculta el panel. Las aperturas y cierres rápidos cancelan la animación anterior.

## Relación con WCAG 2.2

Se han considerado los criterios 1.3.1 (estructura y relaciones), 1.4.1 (no depender solo del color), 1.4.3 y 1.4.11 (contraste del panel), 1.4.10 (reflujo), 1.4.12 (espaciado), 2.1.1 y 2.1.2 (teclado y ausencia de trampas), 2.4.7 (foco visible), 2.5.8 (tamaño de objetivos), 3.2.2 (no cambiar de contexto al ajustar controles), 4.1.2 (nombre, función y valor) y 4.1.3 (mensajes de estado).

Esto **no constituye una declaración de conformidad WCAG de la aplicación**. Un panel opcional no sustituye la accesibilidad de la presentación predeterminada ni corrige automáticamente las demás pantallas.

## Verificación

Prueba automatizada con Playwright disponible en Node:

```sh
node tests/accessibility.cjs
```

Requiere el paquete `playwright` y su Chromium instalado. Opcionalmente se puede indicar un navegador compatible mediante `CHROMIUM_PATH`.

Comprobado en Chromium: apertura y cierre por teclado, orden inicial de foco, devolución de foco con Escape, las diez preferencias, persistencia tras recargar, restablecimiento, tipografía y ocultación decorativa, animación de entrada, cancelación al reducir movimiento, aperturas y cierres rápidos, preferencia del sistema, funcionamiento sin almacenamiento y ausencia de desbordamiento horizontal a 320, 375, 768 y 1280 píxeles con todas las preferencias activadas.

Antes de declarar conformidad AA, verificar manualmente:

- Todas las rutas, formularios, errores y diálogos, sin activar ninguna preferencia.
- Contrastes de todos los estados en la presentación normal y de alto contraste.
- Zoom real del navegador al 200 % y 400 %, ampliación solo de texto y espaciado personalizado.
- Lectura y anuncios con NVDA + Firefox/Chrome y VoiceOver + Safari.
- Foco visible y no oculto, interacción táctil y colores forzados de Windows.
- Calidad y equivalencia de transcripciones y subtítulos.
- Pruebas con personas usuarias de tecnologías de asistencia.
