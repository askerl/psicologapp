export const tipoPaciente = [
    { key: "O", name: "Obra social"},
    { key: "P", name: "Privado"}
];

export const pacientePrepaga = tipoPaciente[0].key; // código para obra social
export const pacientePrivado = tipoPaciente[1].key; // código para paciente privado

let auxfiltroTipoPaciente = {};
auxfiltroTipoPaciente[pacientePrepaga] = tipoPaciente[0].name;
auxfiltroTipoPaciente[pacientePrivado] = tipoPaciente[1].name;
export const filtroTipoPaciente = auxfiltroTipoPaciente;

export const errores = {
    nombreVacio: "Ingrese el nombre",
    apellidoVacio: "Ingrese el apellido",
    tipoPacienteVacio: "Seleccione el tipo",
    valorConsultaVacio: "Ingrese el valor de la consulta",
    prepagaVacia: "Seleccione la prepaga",
    pagoPrepagaVacio: "Seleccione el pago",
    errorGuardar: "Ocurrió un error al guardar los datos"
}

export const calcPorcentajesSesiones = (sesionesAut, sesiones) => {
    let porcUsadas = sesionesAut > 0 ? sesiones / sesionesAut * 100 : 0;
    let porcRestantes = sesionesAut > 0 ? (sesionesAut - sesiones)/ sesionesAut * 100 : 0 ;
    return {porcUsadas, porcRestantes};
}