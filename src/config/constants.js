// CONSTANTES

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

export const prepagasById = {
    "galeno": {
        nombre: "Galeno",
        pagos: [15, 200, 475]
    },
    "ososs": {
        nombre: "OSOSS",
        pagos: [230]
    },
    "ospacp": {
        nombre: "O.S.P.A.C.P",
        pagos: [230]
    }
}
// armo arrays auxiliares para filtrar y cargar combos
let auxfiltroPrepagas = {}, auxprepagas = [];
for (const prop in prepagasById) {
    let prepaga = prepagasById[prop];
    prepaga.id = prop; 
    auxfiltroPrepagas[prop] = prepaga.nombre;
    auxprepagas.push(prepaga);
}

export const filtroPrepagas = auxfiltroPrepagas;
export const prepagas = auxprepagas;

export const estadosPaciente = [
    { value: '', title: 'Todos' },
    { value: true, title: 'Activos' },
    { value: false, title: 'Inactivos'}
];

export const tipoLoader = "ball-scale-ripple-multiple";

export const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
export const mesesShort = [
    "ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"
];

export const mesesFormat = {
    number: 'M', //1 2 ... 11 12
    short: 'MMM', //Jan Feb ... Nov Dec
    long: 'MMMM' //January February ... November December
}

export const tableColumnClasses = {
    showLarge: 'd-none d-lg-table-cell',
    showMedium: 'd-none d-md-table-cell',
    showSmall: 'd-none d-sm-table-cell',
    hide: 'd-none'
}

// valores para grafica de facturaciones
export const brandColors = {
    brandPrimary:   '#20a8d8',
    brandSuccess:   '#4dbd74',
    brandInfo:      '#63c2de',
    brandWarning:   '#f8cb00',
    brandDanger:    '#f86c6b',
    brandPurple:    '#6f42c1',
    brandTeal:      '#20c997'
}

// breakpoints Bootstrap 4
export const breakpoints = {
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1200
}
