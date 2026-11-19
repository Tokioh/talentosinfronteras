from pathlib import Path
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Alignment, Font, PatternFill, Border, Side
from openpyxl.worksheet.table import Table, TableStyleInfo
from openpyxl.worksheet.pagebreak import Break

OUT = Path(__file__).with_name('Talento_Sin_Barreras_Analisis_de_Tareas.xlsx')
HEADERS = [
    'N.º', 'Tarea', 'Frecuencia\nDiaria / Semanal / Mensual / Ocasional',
    'Importancia\nAlta / Media / Baja', 'Recursos que utiliza',
    'Problemas o errores posibles', 'Resultado esperado',
]
USERS = [
    {
        'sheet': 'U1 - María',
        'role': 'María Fernanda Zambrano — Candidata con baja visión.',
        'goal': 'Encontrar oportunidades laborales relacionadas con sus competencias y necesidades, consultar sus condiciones y registrar postulaciones manteniendo el control sobre la información que comparte.',
        'context': 'María utiliza la plataforma principalmente desde su domicilio en Manta, mediante una computadora portátil con Windows 11 y Google Chrome. Usa ampliación de pantalla y, cuando lo necesita, un lector de pantalla. Dispone de conectividad media y puede experimentar fatiga visual durante sesiones prolongadas.',
        'tasks': [
            ['Configurar las preferencias de accesibilidad.', 'Ocasional', 'Alta', 'Panel de accesibilidad, ampliación del contenido, alto contraste, espaciado y tipografía sencilla.', 'No identificar los controles; activar una opción distinta de la deseada; no poder guardar las preferencias por restricciones del navegador.', 'Visualización adaptada a sus preferencias, sin perder acceso al contenido.'],
            ['Completar y actualizar su perfil profesional.', 'Mensual', 'Alta', 'Formulario «Mi perfil y currículum», información de experiencia, competencias e intereses.', 'Omitir competencias; introducir información incorrecta; no guardar los cambios; dificultades para leer los campos.', 'Perfil profesional actualizado y almacenado en el navegador.'],
            ['Buscar y filtrar oportunidades laborales.', 'Diaria', 'Alta', 'Buscador de vacantes, selector de modalidad y filtros disponibles.', 'Escribir términos demasiado específicos; combinar filtros sin resultados; no identificar cómo limpiar los filtros.', 'Lista de oportunidades relacionada con los criterios de búsqueda.'],
            ['Consultar el detalle de una vacante.', 'Diaria', 'Alta', 'Botón «Ver oportunidad», detalle de funciones, competencias, salario y condiciones laborales.', 'Dificultades de lectura al ampliar; confundir las condiciones del puesto; no comprender la explicación de afinidad.', 'Comprensión de la oportunidad para decidir si desea postularse.'],
            ['Guardar vacantes de interés.', 'Semanal', 'Media', 'Botón para guardar vacantes y filtro «Guardadas».', 'No reconocer si la vacante quedó guardada; quitarla accidentalmente; borrar los datos locales.', 'Vacantes seleccionadas disponibles para revisarlas posteriormente en el mismo navegador.'],
            ['Registrar una postulación y seleccionar los ajustes que desea compartir.', 'Semanal', 'Alta', 'Formulario de postulación local, perfil profesional y ajustes previamente configurados.', 'Compartir un ajuste por equivocación; no revisar sus condiciones; interpretar que la postulación se envía realmente a una empresa.', 'Postulación de demostración registrada con los ajustes expresamente autorizados.'],
            ['Consultar o retirar sus postulaciones.', 'Semanal', 'Alta', 'Sección «Mis postulaciones», información de los registros y botón para retirar.', 'Confundir una postulación con otra; retirar un registro por error; interpretar el registro local como un estado real de selección.', 'Consulta de sus postulaciones locales y retirada de las que ya no le interesen.'],
        ],
    },
    {
        'sheet': 'U2 - Andrés',
        'role': 'Andrés Javier Vera — Candidato con movilidad reducida en las manos.',
        'goal': 'Gestionar su búsqueda laboral principalmente mediante el teclado, registrar sus necesidades de ajuste y postularse a oportunidades compatibles con sus competencias.',
        'context': 'Andrés accede desde su domicilio en Portoviejo, utilizando una computadora con Windows 11, Microsoft Edge y un teclado externo adaptado. Evita el uso prolongado del ratón y realiza pausas por fatiga física. Su conexión doméstica es media y presenta interrupciones ocasionales.',
        'tasks': [
            ['Acceder a las secciones del sistema mediante teclado.', 'Diaria', 'Alta', 'Teclado adaptado, enlace «Saltar al contenido», navegación principal y teclas Tab, Mayús+Tab, Enter y Espacio.', 'Perder la ubicación del foco; realizar recorridos extensos; encontrar controles que no respondan al teclado.', 'Acceso a las funciones necesarias sin depender del ratón.'],
            ['Activar foco reforzado y reducción de movimiento.', 'Ocasional', 'Media', 'Panel de accesibilidad y preferencias del sistema operativo.', 'Confundir las opciones; no identificar el control seleccionado; intentar desactivar una reducción de movimiento establecida por el sistema.', 'Interacción visual más fácil de seguir y movimiento reducido según sus preferencias.'],
            ['Registrar y actualizar sus competencias profesionales.', 'Mensual', 'Alta', 'Formulario de perfil, teclado y datos de experiencia laboral.', 'Errores de escritura; omisión de campos obligatorios; salir sin guardar los cambios.', 'Perfil almacenado con competencias e intereses que representen su experiencia.'],
            ['Configurar sus ajustes razonables y su visibilidad.', 'Ocasional', 'Alta', 'Sección «Mis ajustes razonables», casillas, campos de descripción y selectores de visibilidad.', 'Activar el ajuste incorrecto; redactar una necesidad de manera poco clara; confundir «Solo yo» con «Compartir al postular».', 'Ajustes guardados con una descripción y una visibilidad elegidas conscientemente.'],
            ['Buscar y revisar oportunidades laborales.', 'Diaria', 'Alta', 'Buscador, filtros, tarjetas de vacantes y detalle de cada oportunidad.', 'Aplicar filtros incorrectos; no encontrar resultados; tener dificultades para recorrer los controles mediante teclado.', 'Identificación de vacantes compatibles con sus habilidades y condiciones requeridas.'],
            ['Registrar una postulación con los ajustes seleccionados.', 'Semanal', 'Alta', 'Detalle de vacante, formulario de postulación y ajustes disponibles para compartir.', 'Seleccionar un ajuste por error; confirmar sin revisar; confundir el registro local con un envío real.', 'Postulación de demostración almacenada con los ajustes autorizados.'],
            ['Registrar una solicitud por una barrera de accesibilidad.', 'Ocasional', 'Alta', 'Sección «Ayuda y revisión humana», formulario de solicitud y descarga del registro.', 'Describir la barrera de forma insuficiente; elegir una vacante equivocada; esperar una respuesta de soporte que el prototipo no ofrece.', 'Solicitud local registrada y disponible para descargar, comprendiendo que no se envía a un equipo de soporte.'],
        ],
    },
    {
        'sheet': 'U3 - Daniela',
        'role': 'Daniela Alejandra Cedeño — Representante de una empresa.',
        'goal': 'Publicar oportunidades laborales con información clara sobre las funciones, competencias y condiciones del puesto, incluyendo los ajustes disponibles para las personas candidatas.',
        'context': 'Daniela utiliza la plataforma desde una oficina en Manta, mediante una computadora con Windows 11 y Google Chrome. Cuenta con conectividad alta, pero recibe llamadas e interrupciones durante su jornada. Tiene conocimientos básicos sobre inclusión laboral y necesita instrucciones claras para completar las publicaciones.',
        'tasks': [
            ['Acceder al espacio de publicación para empresas.', 'Ocasional', 'Alta', 'Enlace «Espacio para empresas» y navegación del sitio.', 'No localizar el acceso; confundirlo con las secciones destinadas a personas candidatas.', 'Acceso al formulario de publicación de vacantes.'],
            ['Introducir los datos generales de una vacante.', 'Ocasional', 'Alta', 'Formulario empresarial y datos del puesto: empresa, cargo, ciudad, modalidad, jornada y salario.', 'Omitir campos obligatorios; seleccionar una modalidad incorrecta; introducir el salario sin indicar moneda o periodo.', 'Datos generales completos y comprensibles.'],
            ['Describir las funciones esenciales y las competencias necesarias.', 'Ocasional', 'Alta', 'Campos de funciones y competencias, descripción interna del puesto y teclado.', 'Confundir funciones con competencias; introducir requisitos poco relevantes; no separar las competencias mediante comas.', 'Descripción clara de las actividades y habilidades necesarias para el puesto.'],
            ['Informar las condiciones laborales y los ajustes disponibles.', 'Ocasional', 'Alta', 'Campo de entorno laboral, lista de ajustes y conocimiento de las condiciones reales de la empresa.', 'Seleccionar ajustes que no están disponibles; usar descripciones ambiguas; omitir condiciones importantes del entorno.', 'Información concreta que ayude a las personas candidatas a valorar la oportunidad.'],
            ['Revisar y publicar una vacante de demostración.', 'Ocasional', 'Alta', 'Formulario completo, validación de campos y botón de publicación.', 'Publicar con errores; duplicar una vacante; interpretar que la publicación estará disponible para otros dispositivos o usuarios.', 'Vacante registrada y visible en el navegador donde se creó.'],
            ['Comprobar cómo se presenta la vacante publicada.', 'Ocasional', 'Alta', 'Sección «Explorar vacantes», tarjeta de la publicación y detalle de la oportunidad.', 'No localizar la vacante por los filtros activos; detectar información incompleta o incorrecta.', 'Verificación de que la vacante muestra la información prevista.'],
            ['Retirar una vacante local.', 'Ocasional', 'Media', 'Listado «Mis vacantes locales», botón de retirada y confirmación.', 'Retirar la publicación equivocada; confirmar sin revisar; eliminar un registro que todavía necesitaba.', 'Vacante retirada del listado local después de confirmar la acción.'],
        ],
    },
]

wb = Workbook()
wb.remove(wb.active)
wb.properties.title = 'Talento Sin Barreras — Análisis de tareas por usuario'
wb.properties.subject = 'F1 – Contexto de Uso | Accesibilidad y Usabilidad'
wb.properties.creator = 'Kevin Joel Alonso Bailón; Diego Andrés Calva Bravo; Carlos Armando Pico Restrepo'
wb.properties.description = 'Perfiles hipotéticos y tareas del prototipo académico. Noviembre de 2026.'
green, ink, pale = '17614F', '1F3633', 'EAF2EC'
line = Side(style='thin', color='C8D7CF')

for index, user in enumerate(USERS, 1):
    ws = wb.create_sheet(user['sheet'])
    ws.sheet_view.showGridLines = False
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.sheet_properties.outlinePr.summaryRight = False
    ws.sheet_properties.tabColor = green
    for col, width in zip('ABCDEFG', [18, 42, 24, 20, 52, 60, 54]):
        ws.column_dimensions[col].width = width
    ws.merge_cells('A1:G2')
    ws['A1'] = 'TALENTO SIN BARRERAS | ANÁLISIS DE TAREAS POR USUARIO DEL SISTEMA'
    ws['A1'].font = Font(name='Calibri', size=19, bold=True, color='FFFFFF')
    ws['A1'].fill = PatternFill('solid', fgColor=green)
    ws['A1'].alignment = Alignment(vertical='center', wrap_text=True, indent=1)
    ws.row_dimensions[1].height = 24
    ws.row_dimensions[2].height = 24
    for row, label, text, height in [
        (4, 'Usuario o rol:', user['role'], 42),
        (5, 'Objetivo general del usuario:', user['goal'], 54),
        (6, 'Escenario o contexto de uso:', user['context'], 66),
    ]:
        ws.cell(row, 1, label)
        ws.cell(row, 1).font = Font(name='Calibri', size=12, bold=True, color=green)
        ws.cell(row, 1).alignment = Alignment(wrap_text=True, vertical='center')
        ws.merge_cells(start_row=row, start_column=2, end_row=row, end_column=7)
        cell = ws.cell(row, 2, text)
        cell.font = Font(name='Calibri', size=12, color=ink)
        cell.alignment = Alignment(wrap_text=True, vertical='center', indent=1)
        cell.fill = PatternFill('solid', fgColor=pale)
        ws.row_dimensions[row].height = height
    ws.merge_cells('A8:G8')
    ws['A8'] = 'F1 – Contexto de Uso · Accesibilidad y Usabilidad · Noviembre de 2026'
    ws['A8'].font = Font(name='Calibri', size=11, italic=True, color='435B52')
    ws.row_dimensions[8].height = 23
    for col, text in enumerate(HEADERS, 1):
        cell = ws.cell(9, col, text)
        cell.font = Font(name='Calibri', size=12, bold=True, color='FFFFFF')
        cell.fill = PatternFill('solid', fgColor=green)
        cell.alignment = Alignment(wrap_text=True, vertical='center', horizontal='center')
        cell.border = Border(left=line, right=line, top=line, bottom=line)
    ws.row_dimensions[9].height = 55
    for task_index, values in enumerate(user['tasks'], 1):
        row = 9 + task_index
        for col, value in enumerate([f'T{task_index}-U{index}', *values], 1):
            cell = ws.cell(row, col, value)
            cell.font = Font(name='Calibri', size=12, color=ink, bold=col == 1)
            cell.fill = PatternFill('solid', fgColor='FFFFFF' if task_index % 2 else 'F0F5F1')
            cell.alignment = Alignment(wrap_text=True, vertical='top', horizontal='center' if col in (1, 3, 4) else 'left')
            cell.border = Border(left=line, right=line, top=line, bottom=line)
        ws.row_dimensions[row].height = 110
    # Excel table headings must be plain strings; line breaks are valid strings.
    table = Table(displayName=f'TareasUsuario{index}', ref='A9:G16')
    table.tableStyleInfo = TableStyleInfo(name='TableStyleMedium4', showRowStripes=True)
    ws.add_table(table)
    ws.freeze_panes = 'C10'
    ws.merge_cells('A18:G18')
    ws['A18'] = ('Nota: perfiles ficticios y frecuencias estimadas, pendientes de validación con usuarios reales. '
                 'El prototipo guarda los datos en el navegador; no envía postulaciones a empresas ni ofrece respuesta humana de soporte.')
    ws['A18'].font = Font(name='Calibri', size=11, italic=True, color='435B52')
    ws['A18'].alignment = Alignment(wrap_text=True, vertical='center')
    ws.row_dimensions[18].height = 42
    ws.print_area = 'A1:G18'
    ws.print_options.horizontalCentered = True
    ws.page_setup.orientation = 'landscape'
    ws.page_setup.paperSize = ws.PAPERSIZE_A3
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 1
    ws.page_margins.left = ws.page_margins.right = 0.25
    ws.page_margins.top = ws.page_margins.bottom = 0.35
    ws.oddFooter.left.text = 'Talento Sin Barreras'
    ws.oddFooter.right.text = 'Página &P de &N'
    ws.sheet_view.zoomScale = 75

wb.save(OUT)
# Reopen the generated workbook and verify all tables and task identifiers.
check = load_workbook(OUT)
assert len(check.worksheets) == 3
for i, ws in enumerate(check.worksheets, 1):
    assert len(ws.tables) == 1
    assert [ws.cell(r, 1).value for r in range(10, 17)] == [f'T{t}-U{i}' for t in range(1, 8)]
    assert all(ws.cell(r, c).value for r in range(10, 17) for c in range(1, 8))
print(f'Generado y verificado: {OUT} ({OUT.stat().st_size:,} bytes)')
