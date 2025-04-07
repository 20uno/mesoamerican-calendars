// Calendar Data
const tzolkinDays = 260;
const haabDays = 365;
const lunarDays = 29.5;
let currentAngle = 0;
let educationMode = false;

const tzolkinNames = ["Imix", "Ik", "Akbal", "Kan", "Chicchan", "Cimi", "Manik", "Lamat", "Muluc", "Oc", "Chuen", "Eb", "Ben", "Ix", "Men", "Cib", "Caban", "Etznab", "Cauac", "Ahau"];
const haabMonths = ["Pop", "Wo", "Sip", "Sotz", "Sek", "Xul", "Yaxkin", "Mol", "Chen", "Yax", "Sak", "Keh", "Mak", "Kankin", "Muwan", "Pax", "Kayab", "Kumku", "Wayeb"];

// Canvas Setup
const tzolkinCanvas = document.getElementById("tzolkinCanvas");
const haabCanvas = document.getElementById("haabCanvas");
const lunarCanvas = document.getElementById("lunarCanvas");
const tzolkinCtx = tzolkinCanvas.getContext("2d");
const haabCtx = haabCanvas.getContext("2d");
const lunarCtx = lunarCanvas.getContext("2d");

let todayTzolkinSegment, todayHaabSegment, todayLunarSegment;

function drawWheel(ctx, segments, radius, colors, labels, todaySegment) {
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

        // Highlight today's segment with a gold border
        if (i === todaySegment) {
            ctx.lineWidth = 5;
            ctx.strokeStyle = "#FFD700"; // Gold
            ctx.stroke();
        }
        ctx.closePath();

        // Rotate and draw label
        const textAngle = startAngle + angleStep / 2;
        const textX = centerX + (radius * 0.7) * Math.cos(textAngle);
        const textY = centerY + (radius * 0.7) * Math.sin(textAngle);

        ctx.save();
        ctx.translate(textX, textY);
        ctx.rotate(textAngle + Math.PI / 2);
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "#F4EBD0";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.textAlign = "center";
        ctx.strokeText(labels[i % labels.length], 0, 0);
        ctx.fillText(labels[i % labels.length], 0, 0);
        ctx.restore();
    }

    // Central circle
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

    drawWheel(tzolkinCtx, 20, 130, ["#6D0E10", "#8B1A1C"], tzolkinNames, todayTzolkinSegment);
    drawWheel(haabCtx, 19, 130, ["#1A3C34", "#2A5D53"], haabMonths, todayHaabSegment);
    drawWheel(lunarCtx, 30, 130, ["#13294B", "#1E3F6D"], Array(30).fill("Day"), todayLunarSegment);
}

// Calculate Today's Position
function calculateTodayPositions() {
    const date = new Date(document.getElementById("dateInput").value);
    const cycleStart = new Date("2023-12-05"); // Tzolkin cycle start
    const daysSinceCycleStart = Math.floor((date - cycleStart) / (1000 * 60 * 60 * 24));

    todayTzolkinSegment = Math.floor((daysSinceCycleStart % tzolkinDays) / (tzolkinDays / 20));
    todayHaabSegment = Math.floor((daysSinceCycleStart % haabDays) / (haabDays / 19));
    todayLunarSegment = Math.floor((daysSinceCycleStart % 30) / (30 / 30));

    // Update info panel with today's date
    const infoPanel = document.getElementById("infoPanel");
    infoPanel.style.display = "block";
    infoPanel.innerHTML = `
        <h3>Today's Date: ${date.toDateString()}</h3>
        <p><b>Tzolkin:</b> ${tzolkinNames[todayTzolkinSegment]}</p>
        <p><b>Haab:</b> ${haabMonths[todayHaabSegment]}</p>
        <p><b>Lunar Cycle:</b> Day ${todayLunarSegment + 1}</p>
    `;
}

// Interaction
function showInfo(calendar, segment) {
    const infoPanel = document.getElementById("infoPanel");
    infoPanel.style.display = "block";
    let content = `<h3>${calendar}</h3><p><b>Selected Segment:</b> ${segment}</p>`;

    if (calendar === "Tzolkin") {
        content += `
            <p><b>Structure:</b> 13 numbers x 20 signs = 260 unique combinations. Divided into 20 trecenas (13-day periods).</p>
            <p><b>Current Cycle:</b> Started on December 5, 2023, ends on August 20, 2024.</p>
            <p><b>Purpose:</b> Associated with the human gestation cycle. Guides personal and spiritual development through one's kin or nawal of birth.</p>
        `;
    } else if (calendar === "Haab") {
        content += `
            <p><b>Structure:</b> 365 days = 18 months of 20 days + 5 days (Wayeb). Months start with number 0, first month is Pop.</p>
            <p><b>New Year:</b> March 30, 2024 (Gregorian). Each month starts with a No'j day in Tzolkin.</p>
            <p><b>Purpose:</b> Helps identify the environment for one's life mission. Annual energy can be calculated via the Haab birthday and Annual Mayan Cross.</p>
        `;
    } else if (calendar === "Lunar") {
        content += `
            <p><b>Structure:</b> Simplified 29.5-day lunar cycle for visualization.</p>
            <p><b>Purpose:</b> Represents lunar influences, often tied to emotional and spiritual rhythms in Mesoamerican cosmology.</p>
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

// Advance One Day
function advanceDay() {
    const dateInput = document.getElementById("dateInput");
    const currentDate = new Date(dateInput.value);
    currentDate.setDate(currentDate.getDate() + 1);
    dateInput.value = currentDate.toISOString().split("T")[0];
    updateCalendars();
}

// Date Input
function updateCalendars() {
    const date = new Date(document.getElementById("dateInput").value);
    const daysSinceEpoch = Math.floor((date - new Date("1970-01-01")) / (1000 * 60 * 60 * 24));
    currentAngle = (daysSinceEpoch % tzolkinDays) * (2 * Math.PI / tzolkinDays);
    calculateTodayPositions();
    drawCalendars();
}

// Toggle Education Mode
function toggleEducationMode() {
    educationMode = !educationMode;
    const educationPanel = document.getElementById("educationPanel");
    educationPanel.style.display = educationMode ? "block" : "none";

    if (educationMode) {
        educationPanel.innerHTML = `
            <h3>Understanding Mesoamerican Calendars</h3>
            <h4>Tzolkin (260 Days)</h4>
            <p><b>Structure:</b> Combines 13 numbers with 20 day signs (e.g., Imix, Ik, etc.), creating 260 unique combinations. Each day sign has a symbolic meaning:</p>
            <ul>
                <li><b>Imix:</b> Waterlily, crocodile, birth, and beginnings.</li>
                <li><b>Ik:</b> Wind, breath, spirit, communication.</li>
                <li><b>Akbal:</b> Night, darkness, introspection.</li>
                <li><b>Kan:</b> Seed, growth, potential.</li>
                <li><b>Chicchan:</b> Serpent, wisdom, transformation.</li>
                <li><b>Cimi:</b> Death, transition, rebirth.</li>
                <li><b>Manik:</b> Deer, healing, stability.</li>
                <li><b>Lamat:</b> Rabbit, abundance, fertility.</li>
                <li><b>Muluc:</b> Water, offering, purification.</li>
                <li><b>Oc:</b> Dog, loyalty, guidance.</li>
                <li><b>Chuen:</b> Monkey, creativity, playfulness.</li>
                <li><b>Eb:</b> Road, human life, destiny.</li>
                <li><b>Ben:</b> Reed, growth, authority.</li>
                <li><b>Ix:</b> Jaguar, magic, earth connection.</li>
                <li><b>Men:</b> Eagle, vision, freedom.</li>
                <li><b>Cib:</b> Owl, wisdom, ancestors.</li>
                <li><b>Caban:</b> Earth, intelligence, movement.</li>
                <li><b>Etznab:</b> Flint, clarity, truth.</li>
                <li><b>Cauac:</b> Storm, transformation, renewal.</li>
                <li><b>Ahau:</b> Sun, enlightenment, leadership.</li>
            </ul>
            <p><b>Relation to Gregorian Calendar:</b> The Tzolkin does not align directly with the Gregorian calendar due to its 260-day cycle. However, correlations like the Goodman-Martinez-Thompson (GMT) correlation are used to map Tzolkin dates to Gregorian dates. For example, December 5, 2023, marked the start of a new Tzolkin cycle (1 Imix).</p>
            <p><b>Relation to Long Count:</b> The Tzolkin, combined with the Haab, forms part of the Calendar Round (52-year cycle). The Long Count tracks longer periods (e.g., 13.0.0.0.0 4 Ahau 8 Cumku corresponds to August 11, 3114 BCE in the GMT correlation). Today, April 6, 2025, corresponds to approximately 13.0.12.7.3 in the Long Count (based on the GMT correlation).</p>

            <h4>Haab (365 Days)</h4>
            <p><b>Structure:</b> 18 months of 20 days each, plus 5 "Wayeb" days. The months are:</p>
            <ul>
                <li><b>Pop:</b> Mat, beginnings, leadership (March 30, 2024 - April 18, 2024).</li>
                <li><b>Wo:</b> Black conjunction, reflection (April 19 - May 8).</li>
                <li><b>Sip:</b> Red conjunction, hunting (May 9 - May 28).</li>
                <li><b>Sotz:</b> Bat, secrecy (May 29 - June 17).</li>
                <li><b>Sek:</b> Sky and earth, warmth (June 18 - July 7).</li>
                <li><b>Xul:</b> Dog, endings (July 8 - July 27).</li>
                <li><b>Yaxkin:</b> New sun, renewal (July 28 - August 16).</li>
                <li><b>Mol:</b> Water, gathering (August 17 - September 5).</li>
                <li><b>Chen:</b> Black storm, well (September 6 - September 25).</li>
                <li><b>Yax:</b> Green storm, strength (September 26 - October 15).</li>
                <li><b>Sak:</b> White storm, light (October 16 - November 4).</li>
                <li><b>Keh:</b> Red storm, deer (November 5 - November 24).</li>
                <li><b>Mak:</b> Enclosed, introspection (November 25 - December 14).</li>
                <li><b>Kankin:</b> Yellow sun, unfolding (December 15 - January 3, 2025).</li>
                <li><b>Muwan:</b> Owl, rain (January 4 - January 23).</li>
                <li><b>Pax:</b> Planting, music (January 24 - February 12).</li>
                <li><b>Kayab:</b> Turtle, harvest (February 13 - March 4).</li>
                <li><b>Kumku:</b> Granary, ripening (March 5 - March 24).</li>
                <li><b>Wayeb:</b> 5 unlucky days, rest (March 25 - March 29).</li>
            </ul>
            <p><b>Relation to Gregorian Calendar:</b> The Haab aligns more closely with the Gregorian calendar due to its 365-day cycle, but it does not account for leap years, causing a drift over time. The Haab New Year on March 30, 2024, marks the start of Pop.</p>
            <p><b>Relation to Long Count:</b> The Haab, combined with the Tzolkin, forms the Calendar Round. A specific Tzolkin-Haab combination (e.g., 4 Ahau 8 Cumku) repeats every 52 years, but the Long Count uniquely identifies each day over a much longer period.</p>

            <h4>Lunar Cycle (29.5 Days)</h4>
            <p><b>Structure:</b> A simplified 29.5-day cycle to represent lunar phases, which were significant in Mesoamerican cosmology.</p>
            <p><b>Relation to Gregorian Calendar:</b> The lunar cycle aligns with the moon's synodic period (29.53 days). Day 1 corresponds to the new moon closest to the input date.</p>
            <p><b>Relation to Long Count:</b> Lunar cycles were tracked in the Long Count inscriptions, often as part of the "Lunar Series" (e.g., recording the moon's age on a specific date).</p>
        `;
    }
}

// Initial Draw
calculateTodayPositions();
drawCalendars();
