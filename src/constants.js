
export const tipoPaciente = [
    { key: "O", name: "Obra social"},
    { key: "P", name: "Privado"}
];

export const pacientePrepaga = tipoPaciente[0].key; // código para obra social
export const pacientePrivado = tipoPaciente[1].key; // código para paciente privado

export const errores = {
    nombreVacio: "Ingrese el nombre",
    apellidoVacio: "Ingrese el apellido",
    tipoPacienteVacio: "Seleccione el tipo",
    valorConsultaVacio: "Ingrese el valor de la consulta",
    prepagaVacia: "Seleccione la prepaga",
    pagoPrepagaVacio: "Seleccione el pago",
    errorGuardar: "Ocurrió un error al guardar los datos"
}
