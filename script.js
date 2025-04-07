// Calendar Data
const tzolkinDays = 260;
const haabDays = 365;
const lunarDays = 29.5;
const bolonDays = 819;
let currentAngle = 0;

// Tzolkin/Tonalpohualli Signs (Mayan and Nahuatl names)
const tzolkinSigns = [
    { mayan: "Imox", nahuatl: "Cipactli" },
    { mayan: "Iq", nahuatl: "Ehecatl" },
    { mayan: "Aq'ab'al", nahuatl: "Calli" },
    { mayan: "K'at", nahuatl: "Cuetzpallin" },
    { mayan: "Kan", nahuatl: "Coatl" },
    { mayan: "Kemé", nahuatl: "Miquiztli" },
    { mayan: "Keej", nahuatl: "Mazatl" },
    { mayan: "Q'anil", nahuatl: "Tochtli" },
    { mayan: "Toj", nahuatl: "Atl" },
    { mayan: "Tz'i", nahuatl: "Itzcuintli" },
    { mayan: "B'atz", nahuatl: "Ozomahtli" },
    { mayan: "E", nahuatl: "Malinalli" },
    { mayan: "Aj", nahuatl: "Acatl" },
    { mayan: "I'x", nahuatl: "Ocelotl" },
    { mayan: "Tz'ikin", nahuatl: "Cuauhtli" },
    { mayan: "Ajmaq", nahuatl: "Cozcacuauhtli" },
    { mayan: "No'j", nahuatl: "Tecpatl" },
    { mayan: "Tijax", nahuatl: "Quiahuitl" },
    { mayan: "Kawoq", nahuatl: "Xochitl" },
    { mayan: "Ajpu", nahuatl: "Ollin" }
];

// Haab/Xiuhpohualli Months
const haabMonths = ["Pop", "Wo", "Sip", "Sotz", "Sek", "Xul", "Yaxkin", "Mol", "Chen", "Yax", "Sak", "Keh", "Mak", "Kankin", "Muwan", "Pax", "Kayab", "Kumku", "Wayeb"];

// Bolon Tz'ak'ab Signs (Simplified, as exact signs may vary)
const bolonSigns = Array(20).fill("Cycle").map((_, i) => `Cycle ${i + 1}`);

// Canvas Setup
const tzolkinCanvas = document.getElementById("tzolkinCanvas");
const haabCanvas = document.getElementById("haabCanvas");
const lunarCanvas = document.getElementById("lunarCanvas");
const bolonCanvas = document.getElementById("bolonCanvas");
const tzolkinCtx = tzolkinCanvas.getContext("2d");
const haabCtx = haabCanvas.getContext("2d");
const lunarCtx = lunarCanvas.getContext("2d");
const bolonCtx = bolonCanvas.getContext("2d");

function drawWheel(ctx, segments, radius, colors, labels, labelType) {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const angleStep = (2 * Math.PI) / segments;

    for (let i = 0; i < segments; i++) {
        const startAngle = i * angleStep + currentAngle;
        const endAngle = (i + 1) * angleStep + currentAngle;

        // Radial gradient for carved-stone effect
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, i % 2 === 0 ? colors[0] : colors[1]);
        gradient.addColorStop(1, i % 2 === 0 ? colors[1] : colors[0]);

        // Fill segment
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Thick outline
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#2A2A2A";
        ctx.stroke();
        ctx.closePath();

        // Rotate and draw label
        const textAngle = startAngle + angleStep / 2;
        const textX = centerX + (radius * 0.65) * Math.cos(textAngle);
        const textY = centerY + (radius * 0.65) * Math.sin(textAngle);

        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2);
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "#F5E6CC";
        ctx.strokeStyle = "#2A2A2A";
        ctx.lineWidth = 2;
        ctx.textAlign = "center";
        const label = labelType === "tzolkin" ? `${labels[i % labels.length].mayan}/${labels[i % labels.length].nahuatl}` : labels[i % labels.length];
        ctx.strokeText(label, 0, 0);
        ctx.fillText(label, 0, 0);
        ctx.restore();
    }

    // Central circle with stone-like texture
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.3);
    centerGradient.addColorStop(0, "#D9C2A3");
    centerGradient.addColorStop(1, "#BFA98A");
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = centerGradient;
    ctx.fill();
    ctx.strokeStyle = "#2A2A2A";
    ctx.lineWidth = 3;
    ctx.stroke();
}

function drawCalendars() {
    tzolkinCtx.clearRect(0, 0, tzolkinCanvas.width, tzolkinCanvas.height);
    haabCtx.clearRect(0, 0, haabCanvas.width, haabCanvas.height);
    lunarCtx.clearRect(0, 0, lunarCanvas.width, lunarCanvas.height);
    bolonCtx.clearRect(0, 0, bolonCanvas.width, bolonCanvas.height);

    drawWheel(tzolkinCtx, 20, 130, ["#6D0E10", "#8B1A1C"], tzolkinSigns, "tzolkin"); // Tzolkin
    drawWheel(haabCtx, 19, 130, ["#1A3C34", "#2A5D53"], haabMonths, "haab");       // Haab
    drawWheel(lunarCtx, 30, 130, ["#13294B", "#1E3F6D"], Array(30).fill("Day"), "lunar"); // Lunar
    drawWheel(bolonCtx, 20, 130, ["#4A2C2A", "#6B3E3C"], bolonSigns, "bolon");     // Bolon Tz'ak'ab
}

// Interaction with Detailed Info
function showInfo(calendar, segment) {
    const infoPanel = document.getElementById("infoPanel");
    infoPanel.style.display = "block";
    let content = `<h3>${calendar}</h3><p><b>Selected Segment:</b> ${segment}</p>`;

    if (calendar === "Tzolkin/Tonalpohualli") {
        content += `
            <p><b>Structure:</b> 13 numbers x 20 signs = 260 unique combinations. Divided into 20 trecenas (13-day periods).</p>
            <p><b>Current Cycle:</b> Started on December 5, 2023, ends on August 20, 2024.</p>
            <p><b>Purpose:</b> Associated with the human gestation cycle. Guides personal and spiritual development through one's kin or nawal of birth.</p>
        `;
    } else if (calendar === "Haab/Xiuhpohualli") {
        content += `
            <p><b>Structure:</b> 365 days = 18 months of 20 days + 5 days (Wayeb/Nemotemi). Months start with number 0, first month is Pop.</p>
            <p><b>New Year:</b> March 30, 2024 (Gregorian). Each month starts with a No'j day in Tzolkin.</p>
            <p><b>Purpose:</b> Helps identify the environment for one's life mission. Annual energy can be calculated via the Haab birthday and Annual Mayan Cross.</p>
        `;
    } else if (calendar === "Lunar") {
        content += `
            <p><b>Structure:</b> Simplified 29.5-day lunar cycle for visualization.</p>
            <p><b>Purpose:</b> Represents lunar influences, often tied to emotional and spiritual rhythms in Mesoamerican cosmology.</p>
        `;
    } else if (calendar === "Bolon Tz'ak'ab") {
        content += `
            <p><b>Structure:</b> 819 days, based on synodic cycles of visible planets (Mercury, Mars, Saturn, Jupiter, Venus). 20 cycles form a Great Bolon Tz'ak'ab Cycle of 16,380 days.</p>
            <p><b>Purpose:</b> Guides material development and project timing. Synchronizes physical, mental, emotional, spiritual, and energy aspects.</p>
        `;
    }

    infoPanel.innerHTML = content;
}

tzolkinCanvas.addEventListener("click", (e) => {
    const rect = tzolkinCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left - tzolkinCanvas.width / 2;
    const y = e.clientY - rect.top - tzolkinCanvas.height / 2;
    const angle = Math.atan2(y, x) - currentAngle;
    const segment = Math.floor((angle < 0 ? angle + 2 * Math.PI : angle) / (2 * Math.PI / 20));
    const label = `${tzolkinSigns[segment].mayan}/${tzolkinSigns[segment].nahuatl}`;
    showInfo("Tzolkin/Tonalpohualli", label);
});

haabCanvas.addEventListener("click", (e) => {
    const rect = haabCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left - haabCanvas.width / 2;
    const y = e.clientY - rect.top - haabCanvas.height / 2;
    const angle = Math.atan2(y, x) - currentAngle;
    const segment = Math.floor((angle < 0 ? angle + 2 * Math.PI : angle) / (2 * Math.PI / 19));
    showInfo("Haab/Xiuhpohualli", haabMonths[segment]);
});

lunarCanvas.addEventListener("click", (e) => {
    const rect = lunarCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left - lunarCanvas.width / 2;
    const y = e.clientY - rect.top - lunarCanvas.height / 2;
    const angle = Math.atan2(y, x) - currentAngle;
    const segment = Math.floor((angle < 0 ? angle + 2 * Math.PI : angle) / (2 * Math.PI / 30));
    showInfo("Lunar", `Day ${segment + 1}`);
});

bolonCanvas.addEventListener("click", (e) => {
    const rect = bolonCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left - bolonCanvas.width / 2;
    const y = e.clientY - rect.top - bolonCanvas.height / 2;
    const angle = Math.atan2(y, x) - currentAngle;
    const segment = Math.floor((angle < 0 ? angle + 2 * Math.PI : angle) / (2 * Math.PI / 20));
    showInfo("Bolon Tz'ak'ab", bolonSigns[segment]);
});

// Animation
function rotateCalendars() {
    currentAngle += Math.PI / 18;
    drawCalendars();
    requestAnimationFrame(rotateCalendars);
}

// Date Input with Cycle Synchronization
function updateCalendars() {
    const date = new Date(document.getElementById("dateInput").value);
    const daysSinceEpoch = Math.floor((date - new Date("1970-01-01")) / (1000 * 60 * 60 * 24));

    // Synchronize with Tzolkin cycle (Dec 5, 2023 - Aug 20, 2024)
    const cycleStart = new Date("2023-12-05");
    const daysSinceCycleStart = Math.floor((date - cycleStart) / (1000 * 60 * 60 * 24));
    currentAngle = (daysSinceCycleStart % tzolkinDays) * (2 * Math.PI / tzolkinDays);

    drawCalendars();
}

// Initial Draw
drawCalendars();
