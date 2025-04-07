// Datos de los Calendarios
const diasTzolkin = 260;
const diasHaab = 365;
const diasLunar = 29.5;
let anguloActual = 0;
let modoEducativo = false;

const nombresTzolkin = ["Imix", "Ik", "Akbal", "Kan", "Chicchan", "Cimi", "Manik", "Lamat", "Muluc", "Oc", "Chuen", "Eb", "Ben", "Ix", "Men", "Cib", "Caban", "Etznab", "Cauac", "Ahau"];
const mesesHaab = ["Pop", "Wo", "Sip", "Sotz", "Sek", "Xul", "Yaxkin", "Mol", "Chen", "Yax", "Sak", "Keh", "Mak", "Kankin", "Muwan", "Pax", "Kayab", "Kumku", "Wayeb"];

// Configuración de los Canvas
const tzolkinCanvas = document.getElementById("tzolkinCanvas");
const haabCanvas = document.getElementById("haabCanvas");
const lunarCanvas = document.getElementById("lunarCanvas");
const tzolkinCtx = tzolkinCanvas.getContext("2d");
const haabCtx = haabCanvas.getContext("2d");
const lunarCtx = lunarCanvas.getContext("2d");

let segmentoHoyTzolkin, segmentoHoyHaab, segmentoHoyLunar;
let diaTzolkin, diaHaab, diaLunar;

function dibujarRueda(ctx, segmentos, radio, colores, etiquetas, segmentoHoy, numeroDia) {
    const centroX = ctx.canvas.width / 2;
    const centroY = ctx.canvas.height / 2;
    const pasoAngulo = (2 * Math.PI) / segmentos;

    for (let i = 0; i < segmentos; i++) {
        const anguloInicio = i * pasoAngulo + anguloActual;
        const anguloFin = (i + 1) * pasoAngulo + anguloActual;

        // Rellenar segmento con colores alternados
        ctx.beginPath();
        ctx.moveTo(centroX, centroY);
        ctx.arc(centroX, centroY, radio, anguloInicio, anguloFin);
        ctx.fillStyle = i % 2 === 0 ? colores[0] : colores[1];
        ctx.fill();

        // Añadir contorno más grueso
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000";
        ctx.stroke();

        // Resaltar el segmento de "hoy" con un borde dorado
        if (i === segmentoHoy) {
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#FFD700"; // Dorado
            ctx.stroke();
        }
        ctx.closePath();

        // Rotar y dibujar etiqueta
        const anguloTexto = anguloInicio + pasoAngulo / 2;
        const textoX = centroX + (radio * 0.7) * Math.cos(anguloTexto);
        const textoY = centroY + (radio * 0.7) * Math.sin(anguloTexto);

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

    // Círculo central
    ctx.beginPath();
    ctx.arc(centroX, centroY, radio * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = "#3d405b";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function dibujarCalendarios() {
    tzolkinCtx.clearRect(0, 0, tzolkinCanvas.width, tzolkinCanvas.height);
    haabCtx.clearRect(0, 0, haabCanvas.width, haabCanvas.height);
    lunarCtx.clearRect(0, 0, lunarCanvas.width, lunarCanvas.height);

    const numeroTzolkin = (diaTzolkin % 13) || 13; // Número del 1 al 13
    const numeroHaab = diaHaab <= 360 ? (diaHaab % 20) || 20 : (diaHaab - 360); // Día del mes (1-20, o 1-5 para Wayeb)

    dibujarRueda(tzolkinCtx, 20, 130, ["#6D0E10", "#8B1A1C"], nombresTzolkin, segmentoHoyTzolkin, numeroTzolkin);
    dibujarRueda(haabCtx, 19, 130, ["#1A3C34", "#2A5D53"], mesesHaab, segmentoHoyHaab, numeroHaab);
    dibujarRueda(lunarCtx, 30, 130, ["#13294B", "#1E3F6D"], Array(30).fill("Día"), segmentoHoyLunar, diaLunar);

    // Actualizar barras de progreso
    document.getElementById("tzolkinProgress").innerHTML = `<div style="width: ${(diaTzolkin / diasTzolkin) * 100}%"></div>`;
    document.getElementById("haabProgress").innerHTML = `<div style="width: ${(diaHaab / diasHaab) * 100}%"></div>`;
    document.getElementById("lunarProgress").innerHTML = `<div style="width: ${(diaLunar / 30) * 100}%"></div>`;
}

// Calcular la Posición de "Hoy"
function calcularPosicionesHoy() {
    const fecha = new Date(document.getElementById("dateInput").value);
    const inicioCicloTzolkin = new Date("2023-12-05"); // Inicio del ciclo Tzolkin
    const inicioCicloHaab = new Date("2024-03-30"); // Año Nuevo Haab
    const diasDesdeInicioTzolkin = Math.floor((fecha - inicioCicloTzolkin) / (1000 * 60 * 60 * 24));
    const diasDesdeInicioHaab = Math.floor((fecha - inicioCicloHaab) / (1000 * 60 * 60 * 24));

    // Tzolkin
    diaTzolkin = (diasDesdeInicioTzolkin % diasTzolkin) || diasTzolkin; // Día 1 a 260
    const cicloTzolkin = Math.floor((diaTzolkin - 1) / 13); // Cada 13 días cambia el signo
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

    // Actualizar el panel de información con la fecha de hoy
    const panelInfo = document.getElementById("infoPanel");
    panelInfo.style.display = "block";
    const numeroTzolkin = (diaTzolkin % 13) || 13;
    const numeroHaab = diaHaab <= 360 ? (diaHaab % 20) || 20 : (diaHaab - 360);
    const longCount = "13.0.12.7.3"; // Aproximación basada en la correlación GMT
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
            <p><b>Ciclo Actual:</b> Comenzó el 5 de diciembre de 2023 y termina el 20 de agosto de 2024.</p>
            <p><b>Propósito:</b> Asociado con el ciclo de gestación humana. Guía el desarrollo personal y espiritual a través del kin o nawal de nacimiento.</p>
        `;
    } else if (calendario === "Haab") {
        contenido += `
            <p><b>Estructura:</b> 365 días = 18 meses de 20 días + 5 días (Wayeb). Los meses comienzan con el número 0, el primer mes es Pop.</p>
            <p><b>Año Nuevo:</b> 30 de marzo de 2024 (Gregoriano). Cada mes comienza con un día No'j en el Tzolkin.</p>
            <p><b>Propósito:</b> Ayuda a identificar el entorno para la misión de vida. La energía anual se puede calcular con el cumpleaños Haab y la Cruz Maya Anual.</p>
        `;
    } else if (calendario === "Ciclo Lunar") {
        contenido += `
            <p><b>Estructura:</b> Ciclo lunar simplificado de 29.5 días para visualización.</p>
            <p><b>Propósito:</b> Representa las influencias lunares, a menudo vinculadas a ritmos emocionales y espirituales en la cosmología mesoamericana.</p>
        `;
    }

    panelInfo.innerHTML = contenido;
}

tzolkinCanvas.addEventListener("click", (e) => {
    const rect = tzolkinCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left - tzolkinCanvas.width / 2;
    const y = e.clientY - rect.top - tzolkinCanvas.height / 2;
    const angulo = Math.atan2(y, x) - anguloActual;
    const segmento = Math.floor((angulo < 0 ? angulo + 2 * Math.PI : angulo) / (2 * Math.PI / 20));
    mostrarInfo("Tzolkin", nombresTzolkin[segmento]);
});

haabCanvas.addEventListener("click", (e) => {
    const rect = haabCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left - haabCanvas.width / 2;
    const y = e.clientY - rect.top - haabCanvas.height / 2;
    const angulo = Math.atan2(y, x) - anguloActual;
    const segmento = Math.floor((angulo < 0 ? angulo + 2 * Math.PI : angulo) / (2 * Math.PI / 19));
    mostrarInfo("Haab", mesesHaab[segmento]);
});

lunarCanvas.addEventListener("click", (e) => {
    const rect = lunarCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left - lunarCanvas.width / 2;
    const y = e.clientY - rect.top - lunarCanvas.height / 2;
    const angulo = Math.atan2(y, x) - anguloActual;
    const segmento = Math.floor((angulo < 0 ? angulo + 2 * Math.PI : angulo) / (2 * Math.PI / 30));
    mostrarInfo("Ciclo Lunar", `Día ${segmento + 1}`);
});

// Avanzar un Día
function avanzarDia() {
    const entradaFecha = document.getElementById("dateInput");
    const fechaActual = new Date(entradaFecha.value);
    fechaActual.setDate(fechaActual.getDate() + 1);
    entradaFecha.value = fechaActual.toISOString().split("T")[0];
    actualizarCalendarios();
}

// Avanzar una Trecena (13 días)
function avanzarTrecena() {
    const entradaFecha = document.getElementById("dateInput");
    const fechaActual = new Date(entradaFecha.value);
    fechaActual.setDate(fechaActual.getDate() + 13);
    entradaFecha.value = fechaActual.toISOString().split("T")[0];
    actualizarCalendarios();
}

// Avanzar un Mes Haab (20 días)
function avanzarMesHaab() {
    const entradaFecha = document.getElementById("dateInput");
    const fechaActual = new Date(entradaFecha.value);
    fechaActual.setDate(fechaActual.getDate() + 20);
    entradaFecha.value = fechaActual.toISOString().split("T")[0];
    actualizarCalendarios();
}

// Entrada de Fecha
function actualizarCalendarios() {
    const fecha = new Date(document.getElementById("dateInput").value);
    const diasDesdeEpoca = Math.floor((fecha - new Date("1970-01-01")) / (1000 * 60 * 60 * 24));
    anguloActual = (diasDesdeEpoca % diasTzolkin) * (2 * Math.PI / diasTzolkin);
    calcularPosicionesHoy();
    dibujarCalendarios();
}

// Alternar Modo Educativo
function alternarModoEducativo() {
    modoEducativo = !modoEducativo;
    const panelEducativo = document.getElementById("educationPanel");
    panelEducativo.style.display = modoEducativo ? "block" : "none";

    if (modoEducativo) {
        panelEducativo.innerHTML = `
            <h3>Entendiendo los Calendarios Mesoamericanos</h3>
            <h4>Tzolkin (260 Días)</h4>
            <p><b>Estructura:</b> Combina 13 números con 20 signos (por ejemplo, Imix, Ik, etc.), creando 260 combinaciones únicas. Cada signo tiene un significado simbólico:</p>
            <ul>
                <li><b>Imix:</b> Nenúfar, cocodrilo, nacimiento y comienzos.</li>
                <li><b>Ik:</b> Viento, aliento, espíritu, comunicación.</li>
                <li><b>Akbal:</b> Noche, oscuridad, introspección.</li>
                <li><b>Kan:</b> Semilla, crecimiento, potencial.</li>
                <li><b>Chicchan:</b> Serpiente, sabiduría, transformación.</li>
                <li><b>Cimi:</b> Muerte, transición, renacimiento.</li>
                <li><b>Manik:</b> Venado, curación, estabilidad.</li>
                <li><b>Lamat:</b> Conejo, abundancia, fertilidad.</li>
                <li><b>Muluc:</b> Agua, ofrenda, purificación.</li>
                <li><b>Oc:</b> Perro, lealtad, guía.</li>
                <li><b>Chuen:</b> Mono, creatividad, alegría.</li>
                <li><b>Eb:</b> Camino, vida humana, destino.</li>
                <li><b>Ben:</b> Caña, crecimiento, autoridad.</li>
                <li><b>Ix:</b> Jaguar, magia, conexión con la tierra.</li>
                <li><b>Men:</b> Águila, visión, libertad.</li>
                <li><b>Cib:</b> Búho, sabiduría, ancestros.</li>
                <li><b>Caban:</b> Tierra, inteligencia, movimiento.</li>
                <li><b>Etznab:</b> Pedernal, claridad, verdad.</li>
                <li><b>Cauac:</b> Tormenta, transformación, renovación.</li>
                <li><b>Ahau:</b> Sol, iluminación, liderazgo.</li>
            </ul>
            <p><b>Relación con el Calendario Gregoriano:</b> El Tzolkin no se alinea directamente con el calendario gregoriano debido a su ciclo de 260 días. Sin embargo, se usa la correlación Goodman-Martinez-Thompson (GMT) para mapear fechas. Por ejemplo, el 5 de diciembre de 2023 fue 1 Imix, marcando el inicio de un nuevo ciclo.</p>
            <p><b>Relación con el Calendario Largo:</b> El Tzolkin, combinado con el Haab, forma el "Ciclo de Calendario" (ciclo de 52 años). El Calendario Largo (Long Count) mide períodos más largos en unidades de kin (días), uinal (20 días), tun (360 días), katun (7200 días) y baktun (144,000 días). Hoy, 6 de abril de 2025, corresponde aproximadamente a 13.0.12.7.3 en el Calendario Largo (según la correlación GMT).</p>

            <h4>Haab (365 Días)</h4>
            <p><b>Estructura:</b> 18 meses de 20 días cada uno, más 5 días "Wayeb". Los meses son:</p>
            <ul>
                <li><b>Pop:</b> Estera, comienzos, liderazgo (30 de marzo de 2024 - 18 de abril de 2024).</li>
                <li><b>Wo:</b> Conjunción negra, reflexión (19 de abril - 8 de mayo).</li>
                <li><b>Sip:</b> Conjunción roja, caza (9 de mayo - 28 de mayo).</li>
                <li><b>Sotz:</b> Murciélago, secreto (29 de mayo - 17 de junio).</li>
                <li><b>Sek:</b> Cielo y tierra, calor (18 de junio - 7 de julio).</li>
                <li><b>Xul:</b> Perro, finales (8 de julio - 27 de julio).</li>
                <li><b>Yaxkin:</b> Sol nuevo, renovación (28 de julio - 16 de agosto).</li>
                <li><b>Mol:</b> Agua, reunión (17 de agosto - 5 de septiembre).</li>
                <li><b>Chen:</b> Tormenta negra, pozo (6 de septiembre - 25 de septiembre).</li>
                <li><b>Yax:</b> Tormenta verde, fuerza (26 de septiembre - 15 de octubre).</li>
                <li><b>Sak:</b> Tormenta blanca, luz (16 de octubre - 4 de noviembre).</li>
                <li><b>Keh:</b> Tormenta roja, venado (5 de noviembre - 24 de noviembre).</li>
                <li><b>Mak:</b> Encerrado, introspección (25 de noviembre - 14 de diciembre).</li>
                <li><b>Kankin:</b> Sol amarillo, despliegue (15 de diciembre - 3 de enero de 2025).</li>
                <li><b>Muwan:</b> Búho, lluvia (4 de enero - 23 de enero).</li>
                <li><b>Pax:</b> Siembra, música (24 de enero - 12 de febrero).</li>
                <li><b>Kayab:</b> Tortuga, cosecha (13 de febrero - 4 de marzo).</li>
                <li><b>Kumku:</b> Granero, maduración (5 de marzo - 24 de marzo).</li>
                <li><b>Wayeb:</b> 5 días desafortunados, descanso (25 de marzo - 29 de marzo).</li>
            </ul>
            <p><b>Relación con el Calendario Gregoriano:</b> El Haab se alinea más con el calendario gregoriano debido a su ciclo de 365 días, pero no incluye años bisiestos, causando un desfase con el tiempo. El Año Nuevo Haab comenzó el 30 de marzo de 2024, marcando el inicio de Pop.</p>
            <p><b>Relación con el Calendario Largo:</b> El Haab, combinado con el Tzolkin, forma el Ciclo de Calendario. Una combinación específica (como 4 Ahau 8 Cumku) se repite cada 52 años, pero el Calendario Largo identifica de manera única cada día en un período mucho más largo.</p>

            <h4>Ciclo Lunar (29.5 Días)</h4>
            <p><b>Estructura:</b> Un ciclo lunar simplificado de 29.5 días para representar las fases lunares, que eran significativas en la cosmología mesoamericana.</p>
            <p><b>Relación con el Calendario Gregoriano:</b> El ciclo lunar de 29.5 días se alinea con el período sinódico real de la luna (29.53 días). El Día 1 corresponde a la luna nueva más cercana a la fecha ingresada.</p>
            <p><b>Relación con el Calendario Largo:</b> Los ciclos lunares se registraban en las inscripciones del Calendario Largo, a menudo como parte de la "Serie Lunar" (por ejemplo, registrando la edad de la luna en una fecha específica).</p>
        `;
    }
}

// Dibujo Inicial
calcularPosicionesHoy();
dibujarCalendarios();
