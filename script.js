// Datos de los Calendarios
const diasTzolkin = 260;
const diasHaab = 365;
const diasLunar = 29.5;
let anguloActual = 0;
let modoEducativo = false;
let solRotation = 0;

const nombresTzolkin = ["Imix", "Ik", "Akbal", "Kan", "Chicchan", "Cimi", "Manik", "Lamat", "Muluc", "Oc", "Chuen", "Eb", "Ben", "Ix", "Men", "Cib", "Caban", "Etznab", "Cauac", "Ahau"];
const mesesHaab = ["Pop", "Wo", "Sip", "Sotz", "Sek", "Xul", "Yaxkin", "Mol", "Chen", "Yax", "Sak", "Keh", "Mak", "Kankin", "Muwan", "Pax", "Kayab", "Kumku", "Wayeb"];

// Configuración del Canvas
const calendarCanvas = document.getElementById("calendarCanvas");
const ctx = calendarCanvas.getContext("2d");

let diaTzolkin, diaHaab, diaLunar;
let segmentoHoyTzolkin, segmentoHoyHaab, segmentoHoyLunar;

function dibujarAnillo(ctx, segmentos, radioInterior, radioExterior, colores, etiquetas, segmentoHoy, numeroDia, diasTotales, diaActual, mostrarNumeros = false) {
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
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#00D4FF";
        ctx.stroke();

        // Resaltar "hoy"
        if (i === segmentoHoy) {
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#00FF66";
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
        ctx.font = "bold 12px Arial";
        ctx.fillStyle = "#E0FFFF";
        ctx.strokeStyle = "#00D4FF";
        ctx.lineWidth = 1;
        ctx.textAlign = "center";
        let etiqueta = etiquetas[i % etiquetas.length];
        if (i === segmentoHoy && numeroDia) {
            etiqueta = `${numeroDia} ${etiqueta}`;
        }
        ctx.strokeText(etiqueta, 0, 0);
        ctx.fillText(etiqueta, 0, 0);
        ctx.restore();

        // Números (puntos y barras) si aplica
        if (mostrarNumeros) {
            const numero = (i % 13) + 1;
            const puntos = numero % 5;
            const barras = Math.floor(numero / 5);
            const numeroX = centroX + (radioInterior + 10) * Math.cos(anguloTexto);
            const numeroY = centroY + (radioInterior + 10) * Math.sin(anguloTexto);

            ctx.save();
            ctx.translate(numeroX, numeroY);
            ctx.rotate(anguloTexto + Math.PI / 2);
            ctx.fillStyle = "#00FF66";
            for (let b = 0; b < barras; b++) {
                ctx.fillRect(-10, -5 + b * 10, 20, 5);
            }
            for (let p = 0; p < puntos; p++) {
                ctx.beginPath();
                ctx.arc(-5 + p * 5, barras * 10 + 5, 2, 0, 2 * Math.PI);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    // Indicador de progreso
    ctx.beginPath();
    ctx.arc(centroX, centroY, radioInterior - 5, 0, (diaActual / diasTotales) * 2 * Math.PI);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#00FF66";
    ctx.stroke();
}

function dibujarSol(ctx) {
    const centroX = ctx.canvas.width / 2;
    const centroY = ctx.canvas.height / 2;

    // Fondo del sol
    ctx.save();
    ctx.translate(centroX, centroY);
    ctx.rotate(solRotation);
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, 2 * Math.PI);
    ctx.fillStyle = "radial-gradient(circle, #FFFF00, #FF4500)";
    ctx.fill();
    ctx.strokeStyle = "#E0FFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Detalles del sol (estilo prehispánico simplificado)
    for (let i = 0; i < 8; i++) {
        const angulo = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(30 * Math.cos(angulo), 30 * Math.sin(angulo));
        ctx.lineTo(50 * Math.cos(angulo), 50 * Math.sin(angulo));
        ctx.strokeStyle = "#E0FFFF";
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // Cara del sol (simplificada)
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#FF4500";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-10, -5, 5, 0, 2 * Math.PI);
    ctx.arc(10, -5, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#E0FFFF";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 5, 10, 0, Math.PI);
    ctx.strokeStyle = "#E0FFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

function dibujarCalendario() {
    ctx.clearRect(0, 0, calendarCanvas.width, calendarCanvas.height);

    const numeroTzolkin = (diaTzolkin % 13) || 13;
    const numeroHaab = diaHaab <= 360 ? (diaHaab % 20) || 20 : (diaHaab - 360);

    // Anillo Haab (externo)
    dibujarAnillo(ctx, 19, 150, 190, ["#2A2A2A", "#3A3A3A"], mesesHaab, segmentoHoyHaab, numeroHaab, diasHaab, diaHaab);
    // Anillo Tzolkin (intermedio) con números
    dibujarAnillo(ctx, 20, 110, 150, ["#2A2A2A", "#3A3A3A"], nombresTzolkin, segmentoHoyTzolkin, numeroTzolkin, diasTzolkin, diaTzolkin, true);
    // Anillo Lunar (interno)
    dibujarAnillo(ctx, 30, 70, 110, ["#2A2A2A", "#3A3A3A"], Array(30).fill("Día"), segmentoHoyLunar, diaLunar, 30, diaLunar);

    // Sol central
    dibujarSol(ctx);
}

// Animación
function animar() {
    solRotation += 0.01; // Rotación lenta del sol
    dibujarCalendario();
    requestAnimationFrame(animar);
}

// Calcular la Posición de "Hoy"
function calcularPosicionesHoy() {
    const fecha = new Date(document.getElementById("dateInput").value);
    const inicioCicloTzolkin = new Date("2023-12-05"); // Inicio del ciclo Tzolkin (1 Imix)
    const inicioCicloHaab = new Date("2024-12-02"); // Ajustado para que Yaxkin sea correcto
    const diasDesdeInicioTzolkin = Math.floor((fecha - inicioCicloTzolkin) / (1000 * 60 * 60 * 24));
    const diasDesdeInicioHaab = Math.floor((fecha - inicioCicloHaab) / (1000 * 60 * 60 * 24));

    // Tzolkin
    diaTzolkin = (diasDesdeInicioTzolkin % diasTzolkin) || diasTzolkin; // Día 1 a 260
    const cicloTzolkin = diaTzolkin - 1;
    segmentoHoyTzolkin = cicloTzolkin % 20;

    // Haab
    diaHaab = (diasDesdeInicioHaab % diasHaab) || diasHaab; // Día 1 a 365
    if (diaHaab <= 360) {
        segmentoHoyHaab = Math.floor((diaHaab - 1) / 20);
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
    const longCount = "13.0.12.7.3";
    panelInfo.innerHTML = `
        <h3>Fecha: ${fecha.toLocaleDateString('es-ES')}</h3>
        <p><b>Tzolkin:</b> ${numeroTzolkin} ${nombresTzolkin[segmentoHoyTzolkin]} (Día ${diaTzolkin}/260)</p>
        <p><b>Haab:</b> ${numeroHaab} ${mesesHaab[segmentoHoyHaab]} (Día ${diaHaab}/365)</p>
        <p><b>Ciclo Lunar:</b> Día ${diaLunar}/30</p>
        <p><b>Calendario Largo:</b> ${longCount}</p>
    `;
}

// Interacción
function mostrarInfo(calendario, segmento) {
    const panelInfo = document.getElementById("infoPanel");
    panelInfo.style.display = "block";
    let contenido = `<h3>${calendario}</h3><p><b>Segmento:</b> ${segmento}</p>`;

    if (calendario === "Tzolkin") {
        contenido += `
            <p><b>Estructura:</b> 13 números x 20 signos = 260 días.</p>
            <p><b>Significado:</b> Guía espiritual, asociado al embarazo humano.</p>
        `;
    } else if (calendario === "Haab") {
        contenido += `
            <p><b>Estructura:</b> 18 meses de 20 días + 5 días (Wayeb) = 365 días.</p>
            <p><b>Significado:</b> Ciclos agrícolas, Wayeb es desafortunado.</p>
        `;
    } else if (calendario === "Ciclo Lunar") {
        contenido += `
            <p><b>Estructura:</b> 29.5 días (simplificado a 30).</p>
            <p><b>Significado:</b> Influencias lunares y ritmos emocionales.</p>
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

    if (distancia >= 150 && distancia <= 190) { // Haab
        const segmento = Math.floor((angulo < 0 ? angulo + 2 * Math.PI : angulo) / (2 * Math.PI / 19));
        mostrarInfo("Haab", mesesHaab[segmento]);
    } else if (distancia >= 110 && distancia <= 150) { // Tzolkin
        const segmento = Math.floor((angulo < 0 ? angulo + 2 * Math.PI : angulo) / (2 * Math.PI / 20));
        mostrarInfo("Tzolkin", nombresTzolkin[segmento]);
    } else if (distancia >= 70 && distancia <= 110) { // Ciclo Lunar
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
    panelEducativo.style.display = modoEducativo ? "flex" : "none";

    if (modoEducativo) {
        panelEducativo.innerHTML = `
            <div class="education-column">
                <h3>Introducción</h3>
                <p>El calendario mesoamericano unió a culturas como mayas y aztecas, ordenando la vida cotidiana. Aún se usa en México y Guatemala.</p>
                <h3>Sistema de Conteo</h3>
                <p>Base 20 (dedos de manos y pies). Símbolos: punto (1), barra (5), concha (0). Ejemplo: 1307 = 3 (400s), 5 (20s), 7 (1s).</p>
                <h3>Ciclo de 52 Años</h3>
                <p>El Tzolkin y Haab forman un ciclo de 52 años. Los aztecas temían su fin, realizando la ceremonia del Nuevo Fuego.</p>
            </div>
            <div class="education-column">
                <h3>Tzolkin (260 Días)</h3>
                <p><b>Estructura:</b> 13 números x 20 signos = 260 días. Asociado al embarazo humano.</p>
                <p><b>Relación:</b> No se alinea con el gregoriano. Ejemplo: 5 dic 2023 = 1 Imix (correlación GMT).</p>
                <p><b>Significados:</b></p>
                <ul>
                    <li>Imix: Cocodrilo, comienzos.</li>
                    <li>Ik: Viento, comunicación.</li>
                    <li>Akbal: Noche, introspección.</li>
                    <li>Kan: Semilla, potencial.</li>
                    <li>Chicchan: Serpiente, transformación.</li>
                    <li>Cimi: Muerte, renacimiento.</li>
                    <li>Manik: Venado, estabilidad.</li>
                    <li>Lamat: Conejo, fertilidad.</li>
                    <li>Muluc: Agua, purificación.</li>
                    <li>Oc: Perro, lealtad.</li>
                    <li>Chuen: Mono, creatividad.</li>
                    <li>Eb: Camino, destino.</li>
                    <li>Ben: Caña, autoridad.</li>
                    <li>Ix: Jaguar, magia.</li>
                    <li>Men: Águila, visión.</li>
                    <li>Cib: Búho, ancestros.</li>
                    <li>Caban: Tierra, inteligencia.</li>
                    <li>Etznab: Pedernal, verdad.</li>
                    <li>Cauac: Tormenta, renovación.</li>
                    <li>Ahau: Sol, liderazgo.</li>
                </ul>
            </div>
            <div class="education-column">
                <h3>Haab (365 Días)</h3>
                <p><b>Estructura:</b> 18 meses de 20 días + 5 días (Wayeb). Ejemplo: 1 Pop, ..., 20 Pop.</p>
                <p><b>Relación:</b> Cerca del gregoriano, pero sin años bisiestos. Año Nuevo: 2 dic 2024.</p>
                <p><b>Significados:</b></p>
                <ul>
                    <li>Pop: Estera, liderazgo.</li>
                    <li>Wo: Conjunción negra, reflexión.</li>
                    <li>Sip: Conjunción roja, caza.</li>
                    <li>Sotz: Murciélago, secreto.</li>
                    <li>Sek: Cielo y tierra, calor.</li>
                    <li>Xul: Perro, finales.</li>
                    <li>Yaxkin: Sol nuevo, renovación.</li>
                    <li>Mol: Agua, reunión.</li>
                    <li>Chen: Tormenta negra, pozo.</li>
                    <li>Yax: Tormenta verde, fuerza.</li>
                    <li>Sak: Tormenta blanca, luz.</li>
                    <li>Keh: Tormenta roja, venado.</li>
                    <li>Mak: Encerrado, introspección.</li>
                    <li>Kankin: Sol amarillo, despliegue.</li>
                    <li>Muwan: Búho, lluvia.</li>
                    <li>Pax: Siembra, música.</li>
                    <li>Kayab: Tortuga, cosecha.</li>
                    <li>Kumku: Granero, maduración.</li>
                    <li>Wayeb: 5 días desafortunados.</li>
                </ul>
            </div>
            <div class="education-column">
                <h3>Ciclo Lunar (29.5 Días)</h3>
                <p><b>Estructura:</b> Simplificado a 30 días. Representa fases lunares.</p>
                <p><b>Relación:</b> Alineado con el período sinódico (29.53 días).</p>
                <h3>Conteo Largo</h3>
                <p><b>Estructura:</b> Cuenta días desde 14 ago 3114 a.C. Unidades: Kin (1 día), Winal (20 días), Tun (360 días), K'atun (20 Tun), Baktun (20 K'atun).</p>
                <p><b>Ejemplo:</b> 13.0.12.7.3 (6 abr 2025).</p>
                <h3>Percepción del Tiempo</h3>
                <p>Los mesoamericanos veían el tiempo como cíclico, con presagios que se repetían.</p>
            </div>
        `;
    }
}

// Dibujo Inicial y Animación
calcularPosicionesHoy();
dibujarCalendario();
requestAnimationFrame(animar);
