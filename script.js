// Calendar Data (Simplified)
const tzolkinDays = 260; // 13 numbers x 20 day names
const haabDays = 365; // 18 months of 20 days + 5 Wayeb
const lunarDays = 29.5; // Lunar cycle approximation
let currentAngle = 0;

const tzolkinNames = ["Imix", "Ik", "Akbal", "Kan", "Chicchan", "Cimi", "Manik", "Lamat", "Muluc", "Oc", "Chuen", "Eb", "Ben", "Ix", "Men", "Cib", "Caban", "Etznab", "Cauac", "Ahau"];
const haabMonths = ["Pop", "Wo", "Sip", "Sotz", "Sek", "Xul", "Yaxkin", "Mol", "Chen", "Yax", "Sak", "Keh", "Mak", "Kankin", "Muwan", "Pax", "Kayab", "Kumku", "Wayeb"];

// Canvas Setup
const tzolkinCanvas = document.getElementById("tzolkinCanvas");
const haabCanvas = document.getElementById("haabCanvas");
const lunarCanvas = document.getElementById("lunarCanvas");
const tzolkinCtx = tzolkinCanvas.getContext("2d");
const haabCtx = haabCanvas.getContext("2d");
const lunarCtx = lunarCanvas.getContext("2d");

function drawWheel(ctx, segments, radius, color, labels) {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const angleStep = (2 * Math.PI) / segments;

    for (let i = 0; i < segments; i++) {
        const startAngle = i * angleStep + currentAngle;
        const endAngle = (i + 1) * angleStep + currentAngle;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.fillStyle = color + Math.floor(255 - (i * 10)).toString(16) + ")"; // Gradient effect
        ctx.fill();
        ctx.closePath();

        // Label (modern text, replace with glyph SVGs in practice)
        const textAngle = startAngle + angleStep / 2;
        const textX = centerX + (radius * 0.7) * Math.cos(textAngle);
        const textY = centerY + (radius * 0.7) * Math.sin(textAngle);
        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.fillText(labels[i % labels.length], textX, textY);
    }
}

function drawCalendars() {
    tzolkinCtx.clearRect(0, 0, tzolkinCanvas.width, tzolkinCanvas.height);
    haabCtx.clearRect(0, 0, haabCanvas.width, haabCanvas.height);
    lunarCtx.clearRect(0, 0, lunarCanvas.width, lunarCanvas.height);

    drawWheel(tzolkinCtx, 20, 130, "rgba(230, 57, 70, ", tzolkinNames); // 20 day names
    drawWheel(haabCtx, 19, 130, "rgba(69, 123, 157, ", haabMonths); // 18 months + Wayeb
    drawWheel(lunarCtx, 30, 130, "rgba(42, 157, 143, ", Array(30).fill("Day")); // Simplified lunar phases
}

// Interaction
function showInfo(calendar, segment) {
    const infoPanel = document.getElementById("infoPanel");
    infoPanel.style.display = "block";
    infoPanel.innerHTML = `Selected: ${calendar} - ${segment}`;
    // Add sound effect here with Howler.js: new Howl({ src: ['click.wav'] }).play();
}

tzolkinCanvas.addEventListener("click", (e) => {
    const rect = tzolkinCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left - tzolkinCanvas.width / 2;
    const y = e.clientY - rect.top - tzolkinCanvas.height / 2;
    const angle = Math.atan2(y, x) - currentAngle;
    const segment = Math.floor((angle < 0 ? angle + 2 * Math.PI : angle) / (2 * Math.PI / 20));
    showInfo("Tzolkin", tzolkinNames[segment]);
});

haabCanvas.addEventListener("click", (e) => {
    const rect = haabCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left - haabCanvas.width / 2;
    const y = e.clientY - rect.top - haabCanvas.height / 2;
    const angle = Math.atan2(y, x) - currentAngle;
    const segment = Math.floor((angle < 0 ? angle + 2 * Math.PI : angle) / (2 * Math.PI / 19));
    showInfo("Haab", haabMonths[segment]);
});

lunarCanvas.addEventListener("click", (e) => {
    const rect = lunarCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left - lunarCanvas.width / 2;
    const y = e.clientY - rect.top - lunarCanvas.height / 2;
    const angle = Math.atan2(y, x) - currentAngle;
    const segment = Math.floor((angle < 0 ? angle + 2 * Math.PI : angle) / (2 * Math.PI / 30));
    showInfo("Lunar", `Day ${segment + 1}`);
});

// Animation
function rotateCalendars() {
    currentAngle += Math.PI / 18; // 10 degrees
    drawCalendars();
    requestAnimationFrame(rotateCalendars);
}

// Date Input
function updateCalendars() {
    const date = new Date(document.getElementById("dateInput").value);
    const daysSinceEpoch = Math.floor((date - new Date("1970-01-01")) / (1000 * 60 * 60 * 24));
    currentAngle = (daysSinceEpoch % tzolkinDays) * (2 * Math.PI / tzolkinDays); // Sync to Tzolkin
    drawCalendars();
}

// Initial Draw
drawCalendars();
