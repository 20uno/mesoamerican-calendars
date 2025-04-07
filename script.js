// Datos de los Calendarios
const diasTzolkin = 260;
const diasHaab = 365;
const diasLunar = 29.5;
let anguloActual = 0;
let modoEducativo = false;

const nombresTzolkin = ["Imix", "Ik", "Akbal", "Kan", "Chicchan", "Cimi", "Manik", "Lamat", "Muluc", "Oc", "Chuen", "Eb", "Ben", "Ix", "Men", "Cib", "Caban", "Etznab", "Cauac", "Ahau"];
const mesesHaab = ["Pop", "Wo", "Sip", "Sotz", "Sek", "Xul", "Yaxkin", "Mol", "Chen", "Yax", "Sak", "Keh", "Mak", "Kankin", "Muwan", "Pax", "Kayab", "Kumku", "Wayeb"];

// Configuración del Canvas
const calendarCanvas = document.getElementById("calendarCanvas");
const ctx = calendarCanvas.getContext("2d");

let diaTzolkin, diaHaab, diaLunar;
let segmentoHoyTzolkin, segmentoHoyHaab, segmentoHoyLunar;

function dibujarAnillo(ctx, segmentos, radioInterior, radioExterior, colores, etiquetas, segmentoHoy, numeroDia, diasTotales, diaActual) {
    const centroX = ctx.canvas.width / 2;
    const centroY = ctx.canvas.height / 2;
    const pasoAngulo = (2 * Math.PI) / segmentos;

    for (let i = 0; i < segmentos; i++) {
        const anguloInicio = i * pasoAngulo + anguloActual;
        const anguloFin = (i + 1) * pasoAngulo + anguloActual;

        // Rellenar segmento
        ctx.beginPath();
        ctx.arc(centroX, centroY, radioExterior, anguloInicio, anguloFin);
        ctx.arc(centroX, centroY, radioInterior, anguloFin, anguloInicio, true);
        ctx.fillStyle = i % 2 === 0 ? colores[0] : colores[1];
        ctx.fill();

        // Contorno
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000";
        ctx.stroke();

        // Resaltar "hoy"
        if (i === segmentoHoy) {
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#FFD700";
            ctx.stroke();
        }
        ctx.closePath();

        // Etiqueta
        const anguloTexto = anguloInicio + pasoAngulo / 2;
        const radioTexto = (radioInterior + radioExterior) / 2;
        const textoX = centroX + radioTexto * Math.cos(anguloTexto);
        const textoY = centroY + radioTexto * Math.sin(anguloTexto);

        ctx.save();
        ctx.translate(textoX, textoY);
        ctx.rotate(anguloTexto + Math.PI / 2);
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "#F4EBD0";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.textAlign = "center";
        let etiqueta = etiquetas[i % etiquetas.length];
        if (i === segmentoHoy && numeroDia) {
            etiqueta = `${numeroDia} ${etiqueta}`;
        }
        ctx.strokeText(etiqueta, 0, 0);
        ctx.fillText(etiqueta, 0, 0);
        ctx.restore();
    }

    // Indicador de progreso
    ctx.beginPath();
    ctx.arc(centroX, centroY, radioInterior - 10, 0, (diaActual / diasTotales) * 2 * Math.PI);
    ctx.lineWidth = 5;
    ctx.strokeStyle = colores[0];
    ctx.stroke();
}

function dibujarCalendario() {
    ctx.clearRect(0, 0, calendarCanvas.width, calendarCanvas.height);

    const numeroTzolkin = (diaTzolkin % 13) || 13;
    const numeroHaab = diaHaab <= 360 ? (diaHaab % 20) || 20 : (diaHaab - 360);

    // Anillo Haab (externo)
    dibujarAnillo(ctx, 19, 200, 250, ["#1A3C34", "#2A5D53"], mesesHaab, segmentoHoyHaab, numeroHaab, diasHaab, diaHaab);
    // Anillo Tzolkin (intermedio)
    dibujarAnillo(ctx, 20, 150, 200, ["#6D0E10", "#8B1A1C"], nombresTzolkin, segmentoHoyTzolkin, numeroTzolkin, diasTzolkin, diaTzolkin);
    // Anillo Lunar (interno)
    dibujarAnillo(ctx, 30, 100, 150, ["#13294B", "#1E3F6D"], Array(30).fill("Día"), segmentoHoyLunar, diaLunar, 30, diaLunar);

    // Centro
    ctx.beginPath();
    ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, 100, 0, 2 * Math.PI);
    ctx.fillStyle = "#3d405b";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// Calcular la Posición de "Hoy"
function calcularPosicionesHoy() {
    const fecha = new Date(document.getElementById("dateInput").value);
    const inicioCicloTzolkin = new Date("2023-12-05"); // Inicio del ciclo Tzolkin (1 Imix)
    const inicioCicloHaab = new Date("2024-03-30"); // Ajustar según el Haab correcto
    const diasDesdeInicioTzolkin = Math.floor((fecha - inicioCicloTzolkin) / (1000 * 60 * 60 * 24));
    const diasDesdeInicioHaab = Math.floor((fecha - inicioCicloHaab) / (1000 * 60 * 60 * 24));

    // Tzolkin
    diaTzolkin = (diasDesdeInicioTzolkin % diasTzolkin) || diasTzolkin; // Día 1 a 260
    const cicloTzolkin = diaTzolkin - 1; // Ajustar para contar desde 0
    segmentoHoyTzolkin = cicloTzolkin % 20; // Signo actual (0-19)

    // Haab (Corrección: 20 días por mes)
    diaHaab = (diasDesdeInicioHaab % diasHaab) || diasHaab; // Día 1 a 365
    if (diaHaab <= 360) {
        segmentoHoyHaab = Math.floor((diaHaab - 1) / 20); // Mes actual (0-17)
    } else {
        segmentoHoyHaab = 18; // Wayeb
    }

    // Ciclo Lunar
    diaLunar = (diasDesdeInicioTzolkin % 30) || 30; // Día 1 a 30
    segmentoHoyLunar = diaLunar - 1;

    // Actualizar el panel de información
    const panelInfo = document.getElementById("infoPanel");
    panelInfo.style.display = "block";
    const numeroTzolkin = (diaTzolkin % 13) || 13;
    const numeroHaab = diaHaab <= 360 ? (diaHaab % 20) || 20 : (diaHaab - 360);
    const longCount = "13.0.12.7.3"; // Aproximación basada en GMT
    panelInfo.innerHTML = `
        <h3>Fecha Actual: ${fecha.toLocaleDateString('es-ES')}</h3>
        <p><b>Tzolkin:</b> ${numeroTzolkin} ${nombresTzolkin[segmentoHoyTzolkin]} (Día ${diaTzolkin} de 260)</p>
        <p><b>Haab:</b> ${numeroHaab} ${mesesHaab[segmentoHoyHaab]} (Día ${diaHaab} de 365)</p>
        <p><b>Ciclo Lunar:</b> Día ${diaLunar} de 30</p>
        <p><b>Calendario Largo:</b> ${longCount}</p>
    `;
}

// Interacción
function mostrarInfo(calendario, segmento) {
    const panelInfo = document.getElementById("infoPanel");
    panelInfo.style.display = "block";
    let contenido = `<h3>${calendario}</h3><p><b>Segmento Seleccionado:</b> ${segmento}</p>`;

    if (calendario === "Tzolkin") {
        contenido += `
            <p><b>Estructura:</b> 13 números x 20 signos = 260 combinaciones únicas. Dividido en 20 trecenas (períodos de 13 días).</p>
            <p><b>Significado:</b> Asociado con el ciclo de gestación humana (aproximadamente 260 días). Guía el desarrollo personal y espiritual a través del kin o nawal de nacimiento.</p>
        `;
    } else if (calendario === "Haab") {
        contenido += `
            <p><b>Estructura:</b> 365 días = 18 meses de 20 días + 5 días (Wayeb). Los meses comienzan con el número 0, el primer mes es Pop.</p>
            <p><b>Significado:</b> Ayuda a identificar el entorno para la misión de vida. Los 5 días de Wayeb son considerados desafortunados.</p>
        `;
    } else if (calendario === "Ciclo Lunar") {
        contenido += `
            <p><b>Estructura:</b> Ciclo lunar simplificado de 29.5 días para visualización.</p>
            <p><b>Significado:</b> Representa las influencias lunares, a menudo vinculadas a ritmos emocionales y espirituales en la cosmología mesoamericana.</p>
        `;
    }

    panelInfo.innerHTML = contenido;
}

calendarCanvas.addEventListener("click", (e) => {
    const rect = calendarCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left - calendarCanvas.width / 2;
    const y = e.clientY - rect.top - calendarCanvas.height / 2;
    const distancia = Math.sqrt(x * x + y * y);
    const angulo = Math.atan2(y, x) - anguloActual;

    // Determinar en qué anillo se hizo clic
    if (distancia >= 200 && distancia <= 250) { // Haab
        const segmento = Math.floor((angulo < 0 ? angulo + 2 * Math.PI : angulo) / (2 * Math.PI / 19));
        mostrarInfo("Haab", mesesHaab[segmento]);
    } else if (distancia >= 150 && distancia <= 200) { // Tzolkin
        const segmento = Math.floor((angulo < 0 ? angulo + 2 * Math.PI : angulo) / (2 * Math.PI / 20));
        mostrarInfo("Tzolkin", nombresTzolkin[segmento]);
    } else if (distancia >= 100 && distancia <= 150) { // Ciclo Lunar
        const segmento = Math.floor((angulo < 0 ? angulo + 2 * Math.PI : angulo) / (2 * Math.PI / 30));
        mostrarInfo("Ciclo Lunar", `Día ${segmento + 1}`);
    }
});

// Avanzar un Día
function avanzarDia() {
    const entradaFecha = document.getElementById("dateInput");
    const fechaActual = new Date(entradaFecha.value);
    fechaActual.setDate(fechaActual.getDate() + 1);
    entradaFecha.value = fechaActual.toISOString().split("T")[0];
    actualizarCalendario();
}

// Avanzar una Trecena (13 días)
function avanzarTrecena() {
    const entradaFecha = document.getElementById("dateInput");
    const fechaActual = new Date(entradaFecha.value);
    fechaActual.setDate(fechaActual.getDate() + 13);
    entradaFecha.value = fechaActual.toISOString().split("T")[0];
    actualizarCalendario();
}

// Avanzar un Mes Haab (20 días)
function avanzarMesHaab() {
    const entradaFecha = document.getElementById("dateInput");
    const fechaActual = new Date(entradaFecha.value);
    fechaActual.setDate(fechaActual.getDate() + 20);
    entradaFecha.value = fechaActual.toISOString().split("T")[0];
    actualizarCalendario();
}

// Entrada de Fecha
function actualizarCalendario() {
    const fecha = new Date(document.getElementById("dateInput").value);
    const diasDesdeEpoca = Math.floor((fecha - new Date("1970-01-01")) / (1000 * 60 * 60 * 24));
    anguloActual = (diasDesdeEpoca % diasTzolkin) * (2 * Math.PI / diasTzolkin);
    calcularPosicionesHoy();
    dibujarCalendario();
}

// Alternar Modo Educativo
function alternarModoEducativo() {
    modoEducativo = !modoEducativo;
    const panelEducativo = document.getElementById("educationPanel");
    panelEducativo.style.display = modoEducativo ? "block" : "none";

    if (modoEducativo) {
        panelEducativo.innerHTML = `
            <h3>Entendiendo el Calendario Mesoamericano</h3>
            <p><b>Introducción:</b> El calendario mesoamericano unió a las culturas de Mesoamérica, como los mayas y aztecas. No era un solo calendario, sino una combinación de varios sistemas que ordenaban la vida cotidiana. Comunidades en México y Guatemala aún lo mantienen.</p>

            <h4>Tzolkin (260 Días)</h4>
            <p><b>Estructura:</b> Conocido como Tzolk’in por los mayas y Tonalpohualli por los aztecas, tiene 260 días (13 números x 20 signos). Se cree que 260 días corresponden al embarazo humano.</p>
            <p><b>Significado:</b> Cada día tiene asociaciones y presagios específicos. Ejemplo: 1 Imix, 2 Ik’, ..., 13 Ben, 1 Ix, etc.</p>
            <p><b>Relación con el Calendario Gregoriano:</b> El Tzolkin no se alinea directamente con el calendario gregoriano debido a su ciclo de 260 días. La correlación Goodman-Martinez-Thompson (GMT) mapea fechas (ejemplo: 5 de diciembre de 2023 fue 1 Imix).</p>
            <p><b>Relación con el Calendario Largo:</b> Forma parte del Ciclo del Calendario (52 años) junto con el Haab. El Calendario Largo (Long Count) mide períodos más largos: Kin (1 día), Winal (20 días), Tun (360 días), K'atun (20 Tun), Baktun (20 K'atun).</p>

            <h4>Haab (365 Días)</h4>
            <p><b>Estructura:</b> Conocido como Haab por los mayas, tiene 365 días: 18 meses de 20 días + 5 días de Wayeb (considerados desafortunados).</p>
            <p><b>Significado:</b> Los meses reflejan ciclos agrícolas y naturales. Ejemplo: 1 Pop, 2 Pop, ..., 20 Pop.</p>
            <p><b>Relación con el Calendario Gregoriano:</b> El Haab se alinea más con el calendario gregoriano (365 días), pero no incluye años bisiestos, causando un desfase.</p>
            <p><b>Relación con el Calendario Largo:</b> Junto con el Tzolkin, forma el Ciclo del Calendario. Una combinación específica (como 4 Ahau 8 Cumku) se repite cada 52 años.</p>

            <h4>Ciclo Lunar (29.5 Días)</h4>
            <p><b>Estructura:</b> Un ciclo lunar simplificado de 29.5 días para representar las fases lunares, significativas en la cosmología mesoamericana.</p>
            <p><b>Relación con el Calendario Gregoriano:</b> Se alinea con el período sinódico de la luna (29.53 días).</p>
            <p><b>Relación con el Calendario Largo:</b> Los mayas registraban ciclos lunares en la "Serie Lunar" dentro de las inscripciones del Long Count.</p>

            <h4>Ciclo del Calendario (52 Años)</h4>
            <p>El Tzolkin y el Haab se combinan en un ciclo de 52 años. Los aztecas temían el fin de este ciclo, realizando la ceremonia del Nuevo Fuego para asegurar la continuidad del mundo.</p>

            <h4>Conteo Largo</h4>
            <p><b>Estructura:</b> Los mayas desarrollaron el Conteo Largo para registrar eventos históricos. Cuenta días desde el 14 de agosto de 3114 a.C. Ejemplo: 13.0.12.7.3 (6 de abril de 2025).</p>
            <p><b>Unidades:</b> Kin (1 día), Winal (20 días), Tun (360 días), K'atun (20 Tun), Baktun (20 K'atun).</p>
        `;
    }
}

// Dibujo Inicial
calcularPosicionesHoy();
dibujarCalendario();
