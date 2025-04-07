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
const tzolkinCanvas = document.getElementById("tzolkinCanvas");
const haabCanvas = document.getElementById("haabCanvas");
const lunarCanvas = document.getElementById("lunarCanvas");
const bolonCanvas = document.getElementById("bolonCanvas");
const tzolkinCtx = tzolkinCanvas.getContext("2d");
const haabCtx = haabCanvas.getContext("2d");
const lunarCtx = lunarCanvas.getContext("2d");
const bolonCtx = bolonCanvas.getContext("2d");

const tzolkinWrapper = tzolkinCanvas.parentElement;
const haabWrapper = haabCanvas.parentElement;
const lunarWrapper = lunarCanvas.parentElement;
const bolonWrapper = bolonCanvas.parentElement;

let offsets = { lunar: 0, tzolkin: 0, haab: 0, bolon: 0 };
let highlighted = { ring: null, segment: null };
let animationFrame;

// Draw Glyph Blocks
function drawGlyphs(ctx, items, totalItems, offset, colors, type) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const blockHeight = 50;
    const blockWidth = ctx.canvas.width - 20;
    const visibleHeight = ctx.canvas.height;

    // Adjust canvas height to fit all items
    ctx.canvas.height = totalItems * blockHeight;

    for (let i = 0; i < totalItems; i++) {
        const y = i * blockHeight + offset;

        // Only draw visible blocks
        if (y + blockHeight < 0 || y > visibleHeight) continue;

        // Gradient for carved-stone effect
        const gradient = ctx.createLinearGradient(0, y, 0, y + blockHeight);
        gradient.addColorStop(0, i % 2 === 0 ? colors[0] : colors[1]);
        gradient.addColorStop(1, i % 2 === 0 ? colors[1] : colors[0]);

        // Draw block
        ctx.beginPath();
        ctx.rect(10, y, blockWidth, blockHeight - 5);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Highlight if selected
        if (highlighted.ring === type && highlighted.segment === i) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
            ctx.fill();
        }

        // Outline
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#2A2A2A";
        ctx.stroke();
        ctx.closePath();

        // Label
        ctx.font = "bold 14px Arial";
        ctx.fillStyle = "#F5E6CC";
        ctx.strokeStyle = "#2A2A2A";
        ctx.lineWidth = 1;
        ctx.textAlign = "center";
        const label = type === "tzolkin" ? `${items[i % items.length].mayan}/${items[i % items.length].nahuatl}` : items[i % items.length];
        ctx.strokeText(label, blockWidth / 2 + 10, y + blockHeight / 2 + 5);
        ctx.fillText(label, blockWidth / 2 + 10, y + blockHeight / 2 + 5);
    }
}

function drawAllGlyphs() {
    drawGlyphs(lunarCtx, Array(30).fill("Day"), 30, offsets.lunar, ["#13294B", "#1E3F6D"], "lunar");
    drawGlyphs(tzolkinCtx, tzolkinSigns, tzolkinDays, offsets.tzolkin, ["#6D0E10", "#8B1A1C"], "tzolkin");
    drawGlyphs(haabCtx, haabMonths, haabDays, offsets.haab, ["#1A3C34", "#2A5D53"], "haab");
    drawGlyphs(bolonCtx, bolonSigns, bolonDays, offsets.bolon, ["#4A2C2A", "#6B3E3C"], "bolon");
}

// Scroll Handling
function addScrollListener(wrapper, offsetKey, totalItems) {
    wrapper.addEventListener("scroll", () => {
        const blockHeight = 50;
        const scrollTop = wrapper.scrollTop;
        offsets[offsetKey] = -scrollTop;
        drawAllGlyphs();
    });
}

addScrollListener(lunarWrapper, "lunar", 30);
addScrollListener(tzolkinWrapper, "tzolkin", tzolkinDays);
addScrollListener(haabWrapper, "haab", haabDays);
addScrollListener(bolonWrapper, "bolon", bolonDays);

// Click and Hover Handling
function addInteractionListener(canvas, wrapper, items, totalItems, type) {
    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const y = e.clientY - rect.top + wrapper.scrollTop;
        const blockHeight = 50;
        const segment = Math.floor(y / blockHeight);

        if (segment >= 0 && segment < totalItems) {
            highlighted = { ring: type, segment };
            drawAllGlyphs();
        }
    });

    canvas.addEventListener("mouseleave", () => {
        highlighted = { ring: null, segment: null };
        drawAllGlyphs();
    });

    canvas.addEventListener("click", (e) => {
        const rect = canvas.getBoundingClientRect();
        const y = e.clientY - rect.top + wrapper.scrollTop;
        const blockHeight = 50;
        const segment = Math.floor(y / blockHeight);

        if (segment >= 0 && segment < totalItems) {
            const label = type === "tzolkin" ? `${items[segment % items.length].mayan}/${items[segment % items.length].nahuatl}` : items[segment % items.length];
            showInfo(type === "tzolkin" ? "Tzolkin/Tonalpohualli" : type === "haab" ? "Haab/Xiuhpohualli" : type === "lunar" ? "Lunar Cycle" : "Bolon Tz'ak'ab", label);
        }
    });
}

addInteractionListener(lunarCanvas, lunarWrapper, Array(30).fill("Day"), 30, "lunar");
addInteractionListener(tzolkinCanvas, tzolkinWrapper, tzolkinSigns, tzolkinDays, "tzolkin");
addInteractionListener(haabCanvas, haabWrapper, haabMonths, haabDays, "haab");
addInteractionListener(bolonCanvas, bolonWrapper, bolonSigns, bolonDays, "bolon");

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

    const blockHeight = 50;
    const lunarPos = (daysSinceCycleStart % 30) * blockHeight;
    const tzolkinPos = (daysSinceCycleStart % tzolkinDays) * blockHeight;
    const haabPos = (daysSinceCycleStart % haabDays) * blockHeight;
    const bolonPos = (daysSinceCycleStart % bolonDays) * blockHeight;

    // Smooth scroll to positions
    lunarWrapper.scrollTo({ top: lunarPos, behavior: "smooth" });
    tzolkinWrapper.scrollTo({ top: tzolkinPos, behavior: "smooth" });
    haabWrapper.scrollTo({ top: haabPos, behavior: "smooth" });
    bolonWrapper.scrollTo({ top: bolonPos, behavior: "smooth" });
}

// Play Animation
function playAnimation() {
    let days = 0;
    function animate() {
        days++;
        const blockHeight = 50;
        const lunarPos = (days % 30) * blockHeight;
        const tzolkinPos = (days % tzolkinDays) * blockHeight;
        const haabPos = (days % haabDays) * blockHeight;
        const bolonPos = (days % bolonDays) * blockHeight;

        lunarWrapper.scrollTop = lunarPos;
        tzolkinWrapper.scrollTop = tzolkinPos;
        haabWrapper.scrollTop = haabPos;
        bolonWrapper.scrollTop = bolonPos;

        animationFrame = requestAnimationFrame(animate);
    }
    animationFrame = requestAnimationFrame(animate);
}

// Stop Animation
function stopAnimation() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
    }
}

// Initial Draw
drawAllGlyphs();
