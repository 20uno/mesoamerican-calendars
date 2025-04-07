// Datos de los Calendarios
const diasTzolkin = 260;
const diasHaab = 365;
let tzolkinAngle = 0;
let haabAngle = 0;
let solRotation = 0;
let modoEducativo = false;

// Variables para la animación de transición
let startTzolkinAngle = 0;
let startHaabAngle = 0;
let targetTzolkinAngle = 0;
let targetHaabAngle = 0;
let animating = false;
let animationStartTime = 0;
const animationDuration = 500; // 500 ms

const nombresTzolkin = ["Imix", "Ik", "Akbal", "Kan", "Chicchan", "Cimi", "Manik", "Lamat", "Muluc", "Oc", "Chuen", "Eb", "Ben", "Ix", "Men", "Cib", "Caban", "Etznab", "Cauac", "Ahau"];
const mesesHaab = ["Pop", "Wo", "Sip", "Sotz", "Sek", "Xul", "Yaxkin", "Mol", "Chen", "Yax", "Sak", "Keh", "Mak", "Kankin", "Muwan", "Pax", "Kayab", "Kumku", "Wayeb"];

// Configuración de los Canvas
const tzolkinCanvas = document.getElementById("tzolkinCanvas");
const tzolkinCtx = tzolkinCanvas.getContext("2d");
const haabCanvas = document.getElementById("haabCanvas");
const haabCtx = haabCanvas.getContext("2d");
const connectionCanvas = document.getElementById("connectionCanvas");
const connectionCtx = connectionCanvas.getContext("2d");

let diaTzolkin, diaHaab;
let segmentoHoyTzolkinNombre, segmentoHoyTzolkinNumero;
let segmentoHoyHaabMes, segmentoHoyHaabDia;

// Normalizar ángulos para evitar saltos grandes
function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
}

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
        ctx.globalAlpha = 0.5;
        ctx.fill();

        // Contorno
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#00D4FF";
        ctx.globalAlpha = 1;
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
            const numero = i + (mostrarNumeros === "haab" ? 0 : 1);
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
    dibujarAnillo(haabCtx, 20, 130, 190, ["rgba(42, 42, 42, 0.5)", "rgba(58, 58, 58, 0.5)"], Array(20).fill("").map((_, i) => i.toString()), diaHaab % 20, numeroHaab, 20, diaHaab % 20, "haab", haabAngle / 2);

    // Sol central
    dibujarSol(haabCtx);
}

function dibujarLineaConexion() {
    connectionCtx.clearRect(0, 0, connectionCanvas.width, connectionCanvas.height);

    // Ajustar centros según el tamaño de la pantalla
    let centroTzolkinX = 200;
    let centroTzolkinY = 200;
    let centroHaabX = 600;
    let centroHaabY = 200;

    if (window.innerWidth <= 768) {
        // En modo móvil, los canvas están apilados verticalmente
        centroTzolkinX = 150; // Centro del canvas Tzolk'in (300px de ancho)
        centroTzolkinY = 150;
        centroHaabX = 150; // Centro del canvas Haab' (300px de ancho)
        centroHaabY = 450; // Desplazado 300px hacia abajo
    }

    // Coordenadas del punto "hoy" en el Tzolk'in
    const pasoAnguloTzolkin = (2 * Math.PI) / 20;
    const anguloTzolkinHoy = segmentoHoyTzolkinNombre * pasoAnguloTzolkin + tzolkinAngle;
    const tzolkinX = centroTzolkinX + 190 * Math.cos(anguloTzolkinHoy);
    const tzolkinY = centroTzolkinY + 190 * Math.sin(anguloTzolkinHoy);

    // Coordenadas del punto "hoy" en el Haab'
    const pasoAnguloHaab = (2 * Math.PI) / 19;
    const anguloHaabHoy = segmentoHoyHaabMes * pasoAnguloHaab + haabAngle;
    const haabX = centroHaabX + 190 * Math.cos(anguloHaabHoy);
    const haabY = centroHaabY + 190 * Math.sin(anguloHaabHoy);

    // Dibujar la línea
    connectionCtx.beginPath();
    connectionCtx.moveTo(tzolkinX, tzolkinY);
    connectionCtx.lineTo(haabX, haabY);
    connectionCtx.strokeStyle = "#00FF66";
    connectionCtx.lineWidth = 3;
    connectionCtx.stroke();
}

// Animación
function animar() {
    solRotation += 0.01;

    if (animating) {
        const currentTime = performance.now();
        const elapsed = currentTime - animationStartTime;
        const progress = Math.min(elapsed / animationDuration, 1);

        // Interpolación lineal
        tzolkinAngle = startTzolkinAngle + (targetTzolkinAngle - startTzolkinAngle) * progress;
        haabAngle = startHaabAngle + (targetHaabAngle - startHaabAngle) * progress;

        if (progress === 1) {
            animating = false;
            tzolkinAngle = targetTzolkinAngle;
            haabAngle = targetHaabAngle;
        }
    }

    dibujarTzolkin();
    dibujarHaab();
    dibujarLineaConexion();

    requestAnimationFrame(animar);
}

// Calcular el Conteo Largo
function calcularConteoLargo(fecha) {
    const fechaInicio = new Date("3114-08-14T00:00:00Z"); // 14 de agosto de 3114 a.C.
    const diasTranscurridos = Math.floor((fecha - fechaInicio) / (1000 * 60 * 60 * 24));

    const baktun = Math.floor(diasTranscurridos / 144000);
    const restoBaktun = diasTranscurridos % 144000;
    const katun = Math.floor(restoBaktun / 7200);
    const restoKatun = restoBaktun % 7200;
    const tun = Math.floor(restoKatun / 360);
    const restoTun = restoKatun % 360;
    const winal = Math.floor(restoTun / 20);
    const kin = restoTun % 20;

    return `${baktun}.${katun}.${tun}.${winal}.${kin}`;
}

// Calcular la Posición de "Hoy"
function calcularPosicionesHoy() {
    const fecha = new Date(document.getElementById("dateInput").value);
    const inicioCicloTzolkin = new Date("2023-12-05"); // Inicio del ciclo Tzolkin (1 Imix)
    const inicioCicloHaab = new Date("2024-12-02"); // Inicio del ciclo Haab (0 Pop)
    const diasDesdeInicioTzolkin = Math.floor((fecha - inicioCicloTzolkin) / (1000 * 60 * 60 * 24));
    const diasDesdeInicioHaab = Math.floor((fecha - inicioCicloHaab) / (1000 * 60 * 60 * 24));

    // Tzolkin
    diaTzolkin = (diasDesdeInicioTzolkin % diasTzolkin) || diasTzolkin;
    const cicloTzolkin = diaTzolkin - 1;
    segmentoHoyTzolkinNombre = cicloTzolkin % 20;
    segmentoHoyTzolkinNumero = (diaTzolkin % 13) - 1 || 12;

    // Haab
    diaHaab = (diasDesdeInicioHaab % diasHaab) || diasHaab;
    if (diaHaab <= 360) {
        segmentoHoyHaabMes = Math.floor((diaHaab - 1) / 20);
    } else {
        segmentoHoyHaabMes = 18; // Wayeb
    }

    // Guardar los ángulos actuales como punto de partida
    startTzolkinAngle = tzolkinAngle;
    startHaabAngle = haabAngle;

    // Calcular los ángulos objetivo
    const pasoAnguloTzolkin = (2 * Math.PI) / 20; // 20 segmentos para los nombres del Tzolk'in
    const anguloHoyTzolkin = segmentoHoyTzolkinNombre * pasoAnguloTzolkin;
    targetTzolkinAngle = (Math.PI / 2) - anguloHoyTzolkin; // Alineamos "hoy" a 90°

    const pasoAnguloHaab = (2 * Math.PI) / 19; // 19 segmentos para los meses del Haab'
    const anguloHoyHaabMes = segmentoHoyHaabMes * pasoAnguloHaab;
    targetHaabAngle = (3 * Math.PI / 2) - anguloHoyHaabMes; // Alineamos "hoy" a 270°

    // Normalizar los ángulos objetivo para evitar rotaciones grandes
    targetTzolkinAngle = startTzolkinAngle + normalizeAngle(targetTzolkinAngle - startTzolkinAngle);
    targetHaabAngle = startHaabAngle + normalizeAngle(targetHaabAngle - startHaabAngle);

    // Iniciar la animación
    animating = true;
    animationStartTime = performance.now();

    // Calcular el resultado de la Rueda Calendárica
    const numeroTzolkin = (diaTzolkin % 13) || 13;
    const nombreTzolkin = nombresTzolkin[segmentoHoyTzolkinNombre];
    const numeroHaab = diaHaab <= 360 ? (diaHaab % 20) || 20 : (diaHaab - 360);
    const mesHaab = mesesHaab[segmentoHoyHaabMes];
    const longCount = calcularConteoLargo(fecha);

    // Actualizar el panel de información
    const panelInfo = document.getElementById("infoPanel");
    panelInfo.style.display = "block";
    panelInfo.innerHTML = `
        <h3>Fecha: ${fecha.toLocaleDateString('es-ES')}</h3>
        <p><b>Rueda Calendárica:</b> ${numeroTzolkin} ${nombreTzolkin} ${numeroHaab} ${mesHaab}</p>
        <p><b>Tzolk'in:</b> ${numeroTzolkin} ${nombreTzolkin} (Día ${diaTzolkin}/260)</p>
        <p><b>Haab':</b> ${numeroHaab} ${mesHaab} (Día ${diaHaab}/365)</p>
        <p><b>Conteo Largo:</b> ${longCount}</p>
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
    calcularPosicionesHoy();
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
                <p>El calendario mesoamericano unió a todas las culturas de la antigua Mesoamérica. No era un solo calendario, sino una combinación de varios. Era central para la sociedad mesoamericana y ordenaba la vida cotidiana. Comunidades en México y Guatemala aún mantienen el calendario antiguo.</p>
                <h3>Sistema de Conteo</h3>
                <p>Los mesoamericanos usaban un sistema de conteo decimal basado en 20, a diferencia del sistema occidental que es base 10. Posible origen del sistema base 20: 10 dedos de las manos + 10 dedos de los pies.</p>
                <p><b>Representación de Números:</b> Usaban tres símbolos: un punto (1), una barra (5), una concha (0). Ejemplo: 1307 = 3 (400s), 5 (20s), 7 (1s).</p>
                <h3>Ciclo de 52 Años</h3>
                <p>El calendario mesoamericano sigue ciclos de 52 años. El final de este ciclo era temido por los aztecas, ya que podría significar la destrucción del quinto Sol si no se honraban a los dioses. Se realizaba la ceremonia del nuevo fuego para asegurar la continuidad de la creación.</p>
            </div>
            <div class="education-column">
                <h3>Calendario Sagrado (Tzolk'in)</h3>
                <p><b>Duración:</b> 260 días. Conocido como Tzolk’in por los mayas y Tonalpohualli por los aztecas. Se cree que 260 días corresponden a la duración de un embarazo humano.</p>
                <p><b>Estructura:</b> Combina 13 números (1 al 13) con 20 nombres de días. Ejemplo: 1 Imix, 2 Ik’, 3 Ak’b’al, hasta 13 Ben, luego reinicia a 1 Ix. Total: 260 días.</p>
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
                <h3>Calendario Solar (Haab')</h3>
                <p><b>Duración:</b> 365 días. Conocido como Haab por los mayas y Tonalpohualli por los aztecas. Compuesto por 18 meses de 20 días más 5 días adicionales (Wayeb).</p>
                <p><b>Estructura:</b> 18 meses de 20 días (0 a 19) + 5 días de Wayeb (0 a 4). Ejemplo: 0 Pop, 1 Pop, ..., 19 Pop, luego 0 Wo, ..., hasta 0 Wayeb, ..., 4 Wayeb.</p>
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
                <p><b>Propósito:</b> Sistema lineal para registrar fechas históricas. Cuenta los días desde el 14 de agosto de 3114 a.C.</p>
                <p><b>Estructura:</b> Unidades: Kin (1 día), Winal (20 días), Tun (360 días), K'atun (20 Tun), Baktun (20 K'atun). Formato: Baktun.K'atun.Tun.Winal.Kin.</p>
                <p><b>Ejemplo:</b> 13.0.12.7.3 (6 abr 2025).</p>
                <h3>Percepción del Tiempo</h3>
                <p>Los mesoamericanos veían el tiempo como cíclico. Cada fecha tenía presagios que se repetían cada 52 años.</p>
                <h3>Conclusión</h3>
                <p>El calendario mesoamericano es uno de los más impresionantes jamás creados, reflejando una profunda comprensión del tiempo y los ciclos naturales.</p>
            </div>
        `;
    }
}

// Dibujo Inicial y Animación
calcularPosicionesHoy();
requestAnimationFrame(animar);
