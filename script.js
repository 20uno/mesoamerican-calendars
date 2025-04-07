// Datos de los Calendarios
const diasTzolkin = 260;
const diasHaab = 365;
let tzolkinAngle = 0;
let haabAngle = 0;
let solRotation = 0;

const nombresTzolkin = ["Imix", "Ik", "Akbal", "Kan", "Chicchan", "Cimi", "Manik", "Lamat", "Muluc", "Oc", "Chuen", "Eb", "Ben", "Ix", "Men", "Cib", "Caban", "Etznab", "Cauac", "Ahau"];
const mesesHaab = ["Pop", "Wo", "Sip", "Sotz", "Sek", "Xul", "Yaxkin", "Mol", "Chen", "Yax", "Sak", "Keh", "Mak", "Kankin", "Muwan", "Pax", "Kayab", "Kumku", "Wayeb"];

// Configuración de los Canvas
const tzolkinCanvas = document.getElementById("tzolkinCanvas");
const tzolkinCtx = tzolkinCanvas.getContext("2d");
const haabCanvas = document.getElementById("haabCanvas");
const haabCtx = haabCanvas.getContext("2d");

let diaTzolkin, diaHaab;
let segmentoHoyTzolkinNombre, segmentoHoyTzolkinNumero;
let segmentoHoyHaabMes, segmentoHoyHaabDia;

function dibujarAnillo(ctx, segmentos, radioInterior, radioExterior, colores, etiquetas, segmentoHoy, numeroDia, diasTotales, diaActual, mostrarNumeros = false, rotationAngle) {
    const centroX = ctx.canvas.width / 2;
    const centroY = ctx.canvas.height / 2;
    const pasoAngulo = (2 * Math.PI) / segmentos;

    for (let i = 0; i < segmentos; i++) {
        const anguloInicio = i * pasoAngulo + rotationAngle;
        const anguloFin = (i + 1) * pasoAngulo + rotationAngle;

        // Rellenar segmento con transparencia
        ctx.beginPath();
        ctx.arc(centroX, centroY, radioExterior, anguloInicio, anguloFin);
        ctx.arc(centroX, centroY, radioInterior, anguloFin, anguloInicio, true);
        ctx.fillStyle = i % 2 === 0 ? colores[0] : colores[1];
        ctx.globalAlpha = 0.5; // Transparencia
        ctx.fill();

        // Contorno
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#00D4FF";
        ctx.globalAlpha = 1; // Sin transparencia para los bordes
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
            const numero = i + 1;
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

    // Fondo del sol con brillo intenso
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

    // Efecto de brillo
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, 70, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(255, 255, 0, 0.5)";
    ctx.fill();

    ctx.restore();
}

function dibujarTzolkin() {
    tzolkinCtx.clearRect(0, 0, tzolkinCanvas.width, tzolkinCanvas.height);

    const numeroTzolkin = (diaTzolkin % 13) || 13;

    // Anillo exterior (nombres)
    dibujarAnillo(tzolkinCtx, 20, 130, 190, ["rgba(42, 42, 42, 0.5)", "rgba(58, 58, 58, 0.5)"], nombresTzolkin, segmentoHoyTzolkinNombre, numeroTzolkin, diasTzolkin, diaTzolkin, false, tzolkinAngle);
    // Anillo interior (números 1-13)
    dibujarAnillo(tzolkinCtx, 13, 70, 130, ["rgba(42, 42, 42, 0.5)", "rgba(58, 58, 58, 0.5)"], Array(13).fill("").map((_, i) => (i + 1).toString()), segmentoHoyTzolkinNumero, null, 13, diaTzolkin % 13 || 13, true, tzolkinAngle * 2);

    // Sol central
    dibujarSol(tzolkinCtx);
}

function dibujarHaab() {
    haabCtx.clearRect(0, 0, haabCanvas.width, haabCanvas.height);

    const numeroHaab = diaHaab <= 360 ? (diaHaab % 20) || 20 : (diaHaab - 360);

    // Anillo interior (meses)
    dibujarAnillo(haabCtx, 19, 70, 130, ["rgba(42, 42, 42, 0.5)", "rgba(58, 58, 58, 0.5)"], mesesHaab, segmentoHoyHaabMes, null, diasHaab, diaHaab, false, haabAngle);
    // Anillo exterior (días 0-19)
    dibujarAnillo(haabCtx, 20, 130, 190, ["rgba(42, 42, 42, 0.5)", "rgba(58, 58, 58, 0.5)"], Array(20).fill("").map((_, i) => i.toString()), diaHaab % 20, numeroHaab, 20, diaHaab % 20, true, haabAngle / 2);

    // Sol central
    dibujarSol(haabCtx);
}

// Animación
function animar() {
    solRotation += 0.01; // Rotación del sol
    tzolkinAngle += 0.005; // Rotación más rápida para Tzolk'in
    haabAngle += 0.003; // Rotación más lenta para Haab'
    dibujarTzolkin();
    dibujarHaab();
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
    segmentoHoyTzolkinNombre = cicloTzolkin % 20;
    segmentoHoyTzolkinNumero = (diaTzolkin % 13) - 1 || 12;

    // Haab
    diaHaab = (diasDesdeInicioHaab % diasHaab) || diasHaab; // Día 1 a 365
    if (diaHaab <= 360) {
        segmentoHoyHaabMes = Math.floor((diaHaab - 1) / 20);
    } else {
        segmentoHoyHaabMes = 18; // Wayeb
    }

    // Actualizar el panel de información
    const panelInfo = document.getElementById("infoPanel");
    panelInfo.style.display = "block";
    const numeroTzolkin = (diaTzolkin % 13) || 13;
    const numeroHaab = diaHaab <= 360 ? (diaHaab % 20) || 20 : (diaHaab - 360);
    const longCount = "13.0.12.7.3";
    panelInfo.innerHTML = `
        <h3>Fecha: ${fecha.toLocaleDateString('es-ES')}</h3>
        <p><b>Tzolk'in:</b> ${numeroTzolkin} ${nombresTzolkin[segmentoHoyTzolkinNombre]} (Día ${diaTzolkin}/260)</p>
        <p><b>Haab':</b> ${numeroHaab} ${mesesHaab[segmentoHoyHaabMes]} (Día ${diaHaab}/365)</p>
        <p><b>Calendario Largo:</b> ${longCount}</p>
    `;
}

// Interacción
function mostrarInfo(calendario, segmento, tipo) {
    const panelInfo = document.getElementById("infoPanel");
    panelInfo.style.display = "block";
    let contenido = `<h3>${calendario}</h3><p><b>${tipo}:</b> ${segmento}</p>`;

    if (calendario === "Tzolk'in") {
        contenido += `
            <p><b>Estructura:</b> 13 números x 20 signos = 260 días.</p>
            <p><b>Significado:</b> Guía espiritual, asociado al embarazo humano.</p>
        `;
    } else if (calendario === "Haab'") {
        contenido += `
            <p><b>Estructura:</b> 18 meses de 20 días + 5 días (Wayeb) = 365 días.</p>
            <p><b>Significado:</b> Ciclos agrícolas, Wayeb es desafortunado.</p>
        `;
    }

    panelInfo.innerHTML = contenido;
}

tzolkinCanvas.addEventListener("click", (e) => {
    const rect = tzolkinCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left - tzolkinCanvas.width / 2;
    const y = e.clientY - rect.top - tzolkinCanvas.height / 2;
    const distancia = Math.sqrt(x * x + y * y);
    const angulo = Math.atan2(y, x) - tzolkinAngle;

    if (distancia >= 130 && distancia <= 190) { // Nombres
        const segmento = Math.floor((angulo < 0 ? angulo + 2 * Math.PI : angulo) / (2 * Math.PI / 20));
        mostrarInfo("Tzolk'in", nombresTzolkin[segmento], "Nombre del Día");
    } else if (distancia >= 70 && distancia <= 130) { // Números
        const segmento = Math.floor((angulo < 0 ? angulo + 2 * Math.PI : angulo) / (2 * Math.PI / 13));
        mostrarInfo("Tzolk'in", segmento + 1, "Número");
    }
});

haabCanvas.addEventListener("click", (e) => {
    const rect = haabCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left - haabCanvas.width / 2;
    const y = e.clientY - rect.top - haabCanvas.height / 2;
    const distancia = Math.sqrt(x * x + y * y);
    const angulo = Math.atan2(y, x) - haabAngle;

    if (distancia >= 130 && distancia <= 190) { // Días
        const segmento = Math.floor((angulo < 0 ? angulo + 2 * Math.PI : angulo) / (2 * Math.PI / 20));
        mostrarInfo("Haab'", segmento, "Día del Mes");
    } else if (distancia >= 70 && distancia <= 130) { // Meses
        const segmento = Math.floor((angulo < 0 ? angulo + 2 * Math.PI : angulo) / (2 * Math.PI / 19));
        mostrarInfo("Haab'", mesesHaab[segmento], "Mes");
    }
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
    tzolkinAngle = (diasDesdeEpoca % diasTzolkin) * (2 * Math.PI / diasTzolkin);
    haabAngle = (diasDesdeEpoca % diasHaab) * (2 * Math.PI / diasHaab);
    calcularPosicionesHoy();
    dibujarTzolkin();
    dibujarHaab();
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
                <h3>Tzolk'in (260 Días)</h3>
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
                <h3>Haab' (365 Días)</h3>
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
dibujarTzolkin();
dibujarHaab();
requestAnimationFrame(animar);
