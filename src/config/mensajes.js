import { diasRespaldo } from "./constants";

export const errores = {
    nombreVacio: "Ingrese el nombre",
    apellidoVacio: "Ingrese el apellido",
    tipoPacienteVacio: "Seleccione el tipo",
    valorConsultaVacio: "Ingrese el valor de la consulta",
    prepagaVacia: "Seleccione la prepaga",
    pagoPrepagaVacio: "Seleccione el pago",
    errorGuardar: "Ocurrió un error al guardar los datos",
    errorBorrar: "Ocurrió un error al borrar los datos",
    fechaVacia: "Ingrese la fecha",
    pacientesVacios: "Seleccione algún paciente",
    sesionesVacias: "Seleccione alguna sesión",
    periodoInvalido: "Debe seleccionar un período válido",
    existePacienteNombre: "Ya ingresó un Paciente con ese nombre y apellido",
    errorCargarDatosPaciente: "Ocurrió un error al cargar los datos del paciente",
    errorCargarDatosPrepaga: "Ocurrió un error al cargar los datos de la prepaga",
    datosSinModificar: "No ha modificado ningún dato",
    errorBackup: "Ocurrió un error al respaldar los datos",
    errorDescarga: "Ocurrió un error al realizar la descarga",
    errorRestore: "Ocurrió un error al restaurar los datos",
    existePrepagaNombre: "Ya existe una Prepaga con ese nombre",
    errorBorrarPrepagaPaciente: "Existen Pacientes con esta Prepaga asociada",
    errorBorrarPrepagaSesiones: "Existen Sesiones ingresadas para esta Prepaga",
    valorActualVacio: "Seleccione el valor actual",
    errorActualizarValores: "Ocurrió un error al actualizar los valores"
}

export const mensajes = {
    noFacturacionPrepaga: 'No hubo facturación de prepagas en el mes.',
    okSave: 'Los datos han sido guardados',
    okUpdate: 'Los datos han sido actualizados',
    okBackup: 'Los datos han sido respaldados',
    okDelete: 'Los datos han sido eliminados',
    okDeletePrepaga: 'La Prepaga ha sido eliminada',
    okRestore: 'Los datos han sido restaurados',
    warningArchivo: 'El archivo del respaldo no pudo ser eliminado. Contacte al Administrador.',
    warningRestore: 'Algunos datos no pudieron ser restaurados. Contacte al Administrador.',
    primerRespaldo: 'Se sugiere realizar su primer respaldo de datos accediendo al menú Administración.',
    recordatorioRespaldo: `Han pasado más de ${diasRespaldo} días desde su último respaldo. Se sugiere realizar un nuevo respaldo desde el menú Administración.`
}