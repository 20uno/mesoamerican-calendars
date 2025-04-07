// Calendar Data
const tzolkinDays = 260;
const haabDays = 365;
const lunarDays = 29.5;
const bolonDays = 819;

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

// Bolon Tz'ak'ab Signs (Simplified)
const bolonSigns = Array(20).fill("Cycle").map((_, i) => `Cycle ${i + 1}`);

// Canvas Setup
const canvas = document.getElementById("calendarStone");
const ctx = canvas.getContext("2d");
let angles = { lunar: 0, tzolkin: 0, haab: 0, bolon: 0 };
let isDragging = false;
let previousAngle = 0;
let highlighted = { ring: null, segment: null };

// Draw Concentric Calendar Stone
function drawCalendarStone() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Lunar Cycle (Innermost Ring)
    drawRing(ctx, 30, 80, 100, ["#13294B", "#1E3F6D"], Array(30).fill("Day"), "lunar", angles.lunar);

    // Tzolkin/Tonalpohualli (Second Ring)
    drawRing(ctx, 20, 110, 150, ["#6D0E10", "#8B1A1C"], tzolkinSigns, "tzolkin", angles.tzolkin);

    // Haab/Xiuhpohualli (Third Ring)
    drawRing(ctx, 19, 160, 200, ["#1A3C34", "#2A5D53"], haabMonths, "haab", angles.haab);

    // Bolon Tz'ak'ab (Outermost Ring)
    drawRing(ctx, 20, 210, 250, ["#4A2C2A", "#6B3E3C"], bolonSigns, "bolon", angles.bolon);

    // Central Stone Detail
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 70);
    centerGradient.addColorStop(0, "#D9C2A3");
    centerGradient.addColorStop(1, "#BFA98A");
    ctx.beginPath();
    ctx.arc(centerX, centerY, 70, 0, 2 * Math.PI);
    ctx.fillStyle = centerGradient;
    ctx.fill();
    ctx.strokeStyle = "#2A2A2A";
    ctx.lineWidth = 4;
    ctx.stroke();
}

function drawRing(ctx, segments, innerRadius, outerRadius, colors, labels, ringType, angle) {
    const centerX = ctx.canvas.width / 2;
    const centerY = ctx.canvas.height / 2;
    const angleStep = (2 * Math.PI) / segments;

    for (let i = 0; i < segments; i++) {
        const startAngle = i * angleStep + angle;
        const endAngle = (i + 1) * angleStep + angle;

        // Gradient for carved-stone effect
        const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
        gradient.addColorStop(0, i % 2 === 0 ? colors[0] : colors[1]);
        gradient.addColorStop(1, i % 2 === 0 ? colors[1] : colors[0]);

        // Fill segment
        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Highlight if selected
        if (highlighted.ring === ringType && highlighted.segment === i) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.fill();
        }

        // Outline
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#2A2A2A";
        ctx.stroke();
        ctx.closePath();

        // Label
        const textAngle = startAngle + angleStep / 2;
        const textRadius = (innerRadius + outerRadius) / 2;
        const textX = centerX + textRadius * Math.cos(textAngle);
        const textY = centerY + textRadius * Math.sin(textAngle);

        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2);
        ctx.font = "bold 12px Arial";
        ctx.fillStyle = "#F5E6CC";
        ctx.strokeStyle = "#2A2A2A";
        ctx.lineWidth = 2;
        ctx.textAlign = "center";
        const label = ringType === "tzolkin" ? `${labels[i % labels.length].mayan}/${labels[i % labels.length].nahuatl}` : labels[i % labels.length];
        ctx.strokeText(label, 0, 0);
        ctx.fillText(label, 0, 0);
        ctx.restore();
    }
}

// Interaction: Drag to Rotate
canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - canvas.height / 2;
    previousAngle = Math.atan2(y, x);
});

canvas.addEventListener("mousemove", (e) => {
    if (!isDragging) {
        // Hover Highlight
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - canvas.width / 2;
        const y = e.clientY - rect.top - canvas.height / 2;
        const distance = Math.sqrt(x * x + y * y);
        const angle = Math.atan2(y, x);

        highlighted = { ring: null, segment: null };
        if (distance >= 80 && distance < 100) { // Lunar
            const segment = Math.floor((angle < 0 ? angle + 2 * Math.PI : angle - angles.lunar) / (2 * Math.PI / 30));
            highlighted = { ring: "lunar", segment };
        } else if (distance >= 110 && distance < 150) { // Tzolkin
            const segment = Math.floor((angle < 0 ? angle + 2 * Math.PI : angle - angles.tzolkin) / (2 * Math.PI / 20));
            highlighted = { ring: "tzolkin", segment };
        } else if (distance >= 160 && distance < 200) { // Haab
            const segment = Math.floor((angle < 0 ? angle + 2 * Math.PI : angle - angles.haab) / (2 * Math.PI / 19));
            highlighted = { ring: "haab", segment };
        } else if (distance >= 210 && distance < 250) { // Bolon
            const segment = Math.floor((angle < 0 ? angle + 2 * Math.PI : angle - angles.bolon) / (2 * Math.PI / 20));
            highlighted = { ring: "bolon", segment };
        }
        drawCalendarStone();
    } else {
        // Dragging
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left - canvas.width / 2;
        const y = e.clientY - rect.top - canvas.height / 2;
        const currentAngle = Math.atan2(y, x);
        const deltaAngle = currentAngle - previousAngle;

        // Rotate all rings proportionally
        angles.lunar += deltaAngle * (lunarDays / lunarDays);
        angles.tzolkin += deltaAngle * (tzolkinDays / lunarDays);
        angles.haab += deltaAngle * (haabDays / lunarDays);
        angles.bolon += deltaAngle * (bolonDays / lunarDays);

        previousAngle = currentAngle;
        drawCalendarStone();
    }
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
});

canvas.addEventListener("mouseleave", () => {
    isDragging = false;
    highlighted = { ring: null, segment: null };
    drawCalendarStone();
});

// Click to Show Info
canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - canvas.width / 2;
    const y = e.clientY - rect.top - canvas.height / 2;
    const distance = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x);

    let ring, segment, label;
    if (distance >= 80 && distance < 100) { // Lunar
        segment = Math.floor((angle < 0 ? angle + 2 * Math.PI : angle - angles.lunar) / (2 * Math.PI / 30));
        ring = "Lunar Cycle";
        label = `Day ${segment + 1}`;
    } else if (distance >= 110 && distance < 150) { // Tzolkin
        segment = Math.floor((angle < 0 ? angle + 2 * Math.PI : angle - angles.tzolkin) / (2 * Math.PI / 20));
        ring = "Tzolkin/Tonalpohualli";
        label = `${tzolkinSigns[segment].mayan}/${tzolkinSigns[segment].nahuatl}`;
    } else if (distance >= 160 && distance < 200) { // Haab
        segment = Math.floor((angle < 0 ? angle + 2 * Math.PI : angle - angles.haab) / (2 * Math.PI / 19));
        ring = "Haab/Xiuhpohualli";
        label = haabMonths[segment];
    } else if (distance >= 210 && distance < 250) { // Bolon
        segment = Math.floor((angle < 0 ? angle + 2 * Math.PI : angle - angles.bolon) / (2 * Math.PI / 20));
        ring = "Bolon Tz'ak'ab";
        label = bolonSigns[segment];
    } else {
        return;
    }

    showInfo(ring, label);
});

// Show Info with Cultural Context
function showInfo(ring, label) {
    const infoPanel = document.getElementById("infoPanel");
    infoPanel.style.display = "block";
    let content = `<h3>${ring}</h3><p><b>Selected:</b> ${label}</p>`;

    if (ring === "Tzolkin/Tonalpohualli") {
        content += `
            <p><b>Structure:</b> 13 numbers x 20 signs = 260 unique combinations. Divided into 20 trecenas (13-day periods).</p>
            <p><b>Current Cycle:</b> Started on December 5, 2023, ends on August 20, 2024.</p>
            <p><b>Purpose:</b> Associated with the human gestation cycle. Guides personal and spiritual development through one's kin or nawal of birth.</p>
        `;
    } else if (ring === "Haab/Xiuhpohualli") {
        content += `
            <p><b>Structure:</b> 365 days = 18 months of 20 days + 5 days (Wayeb/Nemotemi). Months start with number 0, first month is Pop.</p>
            <p><b>New Year:</b> March 30, 2024 (Gregorian). Each month starts with a No'j day in Tzolkin.</p>
            <p><b>Purpose:</b> Helps identify the environment for one's life mission. Annual energy can be calculated via the Haab birthday and Annual Mayan Cross.</p>
        `;
    } else if (ring === "Lunar Cycle") {
        content += `
            <p><b>Structure:</b> Simplified 29.5-day lunar cycle for visualization.</p>
            <p><b>Purpose:</b> Represents lunar influences, often tied to emotional and spiritual rhythms in Mesoamerican cosmology.</p>
        `;
    } else if (ring === "Bolon Tz'ak'ab") {
        content += `
            <p><b>Structure:</b> 819 days, based on synodic cycles of visible planets (Mercury, Mars, Saturn, Jupiter, Venus). 20 cycles form a Great Bolon Tz'ak'ab Cycle of 16,380 days.</p>
            <p><b>Purpose:</b> Guides material development and project timing. Synchronizes physical, mental, emotional, spiritual, and energy aspects.</p>
        `;
    }

    infoPanel.innerHTML = content;
}

// Align Calendars to Date
function alignCalendars() {
    const date = new Date(document.getElementById("dateInput").value);
    const cycleStart = new Date("2023-12-05");
    const daysSinceCycleStart = Math.floor((date - cycleStart) / (1000 * 60 * 60 * 24));

    // Calculate positions
    const lunarPos = (daysSinceCycleStart % lunarDays) * (2 * Math.PI / lunarDays);
    const tzolkinPos = (daysSinceCycleStart % tzolkinDays) * (2 * Math.PI / tzolkinDays);
    const haabPos = (daysSinceCycleStart % haabDays) * (2 * Math.PI / haabDays);
    const bolonPos = (daysSinceCycleStart % bolonDays) * (2 * Math.PI / bolonDays);

    // Smooth animation to new positions
    const duration = 1000; // 1 second
    const startTime = performance.now();
    const startAngles = { ...angles };

    function animate(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);

        angles.lunar = startAngles.lunar + (lunarPos - startAngles.lunar) * progress;
        angles.tzolkin = startAngles.tzolkin + (tzolkinPos - startAngles.tzolkin) * progress;
        angles.haab = startAngles.haab + (haabPos - startAngles.haab) * progress;
        angles.bolon = startAngles.bolon + (bolonPos - startAngles.bolon) * progress;

        drawCalendarStone();

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

// Reset View
function resetView() {
    const duration = 1000;
    const startTime = performance.now();
    const startAngles = { ...angles };

    function animate(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);

        angles.lunar = startAngles.lunar + (0 - startAngles.lunar) * progress;
        angles.tzolkin = startAngles.tzolkin + (0 - startAngles.tzolkin) * progress;
        angles.haab = startAngles.haab + (0 - startAngles.haab) * progress;
        angles.bolon = startAngles.bolon + (0 - startAngles.bolon) * progress;

        drawCalendarStone();

        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

// Initial Draw
drawCalendarStone();
