// Calendar Data
const tzolkinDays = 260;
const haabDays = 365;
const lunarDays = 29.5;
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

function drawWheel(ctx, segments, radius, colors, labels) {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const angleStep = (2 * Math.PI) / segments;

    for (let i = 0; i < segments; i++) {
        const startAngle = i * angleStep + currentAngle;
        const endAngle = (i + 1) * angleStep + currentAngle;

        // Fill segment with alternating colors
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.fillStyle = i % 2 === 0 ? colors[0] : colors[1];
        ctx.fill();

        // Add thicker outline
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.closePath();

        // Rotate and draw label
        const textAngle = startAngle + angleStep / 2;
        const textX = centerX + (radius * 0.7) * Math.cos(textAngle);
        const textY = centerY + (radius * 0.7) * Math.sin(textAngle);

        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2); // Rotate text to align with segment
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "#F4EBD0";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.textAlign = "center";
        ctx.strokeText(labels[i % labels.length], 0, 0);
        ctx.fillText(labels[i % labels.length], 0, 0);
        ctx.restore();
    }

    // Add a central circle for a polished look
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = "#3d405b";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawCalendars() {
    tzolkinCtx.clearRect(0, 0, tzolkinCanvas.width, tzolkinCanvas.height);
    haabCtx.clearRect(0, 0, haabCanvas.width, haabCanvas.height);
    lunarCtx.clearRect(0, 0, lunarCanvas.width, lunarCanvas.height);

    drawWheel(tzolkinCtx, 20, 130, ["#7A1719", "#A93226"], tzolkinNames); // Tzolkin
    drawWheel(haabCtx, 19, 130, ["#1E3A1F", "#2E5E2A"], haabMonths);   // Haab
    drawWheel(lunarCtx, 30, 130, ["#1A2E59", "#2A9D8F"], Array(30).fill("Day")); // Lunar
}

// Interaction
function showInfo(calendar, segment) {
    const infoPanel = document.getElementById("infoPanel");
    infoPanel.style.display = "block";
    infoPanel.innerHTML = `Selected: ${calendar} - ${segment}`;
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
    currentAngle += Math.PI / 18;
    drawCalendars();
    requestAnimationFrame(rotateCalendars);
}

// Date Input
function updateCalendars() {
    const date = new Date(document.getElementById("dateInput").value);
    const daysSinceEpoch = Math.floor((date - new Date("1970-01-01")) / (1000 * 60 * 60 * 24));
    currentAngle = (daysSinceEpoch % tzolkinDays) * (2 * Math.PI / tzolkinDays);
    drawCalendars();
}

// Initial Draw
drawCalendars();
