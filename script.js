
// =============================================
// CAPRI CALCULATOR - MULTI MODE ENGINE
// =============================================

let expression = "";
let currentMode = "Standard";

const screen = document.getElementById("screen");
const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");
const resultStatus = document.getElementById("resultStatus");
const resultMessage = document.getElementById("resultMessage");
const coreStatus = document.getElementById("coreStatus");
const coreProgress = document.getElementById("coreProgress");
const processStatus = document.getElementById("processStatus");
const processText = document.getElementById("processText");
const processDetails = document.getElementById("processDetails");
const keypad = document.getElementById("keypad");
const modeWorkspace = document.getElementById("modeWorkspace");

function randomFrom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// =============================================
// CAPRI DIALOGUE
// =============================================

const capriMockingLines = [
    "Seriously? You needed a calculator for that?",
    "Oh my. Was that really difficult?",
    "I could have calculated that in my sleep.",
    "You're making me work for THIS?",
    "Should I be impressed? Because I'm not.",
    "A calculator? For something that simple?",
    "Don't worry. Math isn't everyone's strength.",
    "That was adorable. Try something harder.",
    "I expected more of you. Honestly.",
    "Well, at least you got the answer."
];

const capriCalculationLines = [
    "There you go. Not bad.",
    "Done. Was that what you wanted?",
    "The answer is right there. You're welcome.",
    "Another calculation finished.",
    "I do make this look easy, don't I?",
    "Well, that was straightforward.",
    "There. Happy now?",
    "Quite an interesting calculation.",
    "See? We make a good team.",
    "All finished. What next?"
];

const capriErrorLines = [
    "That doesn't look right. Try again.",
    "Hmm. Did you make a mistake?",
    "Even I can't calculate nonsense.",
    "Check your input, silly.",
    "Something went wrong. Care to try again?"
];

const capriRandomMessages = [
    "Need anything calculated?",
    "You're taking your time.",
    "Hmm. What are we working on?",
    "Don't mind me. Just relaxing.",
    "That looks interesting.",
    "I'm still here, you know.",
    "Another calculation? Go ahead.",
    "You seem rather focused today.",
    "I wonder what you're thinking about.",
    "Don't overwork yourself.",
    "Is there something you're curious about?",
    "You can talk to me, you know.",
    "How long are you planning to stay here?",
    "It's rather peaceful today."
];

const capriGoodbyes = [
    "Leaving already? How unfortunate. Take care, alright?",
    "I'll be here when you return. Don't make me wait too long.",
    "Finally getting some rest? Well, goodbye for now.",
    "Don't forget to come back. I might get lonely.",
    "See you next time. And try not to miss me too much.",
    "Take care of yourself, okay? Even when I'm not around.",
    "Well then... until we meet again.",
    "Don't stay away for too long. It's rather quiet here without you.",
    "Already bored of my company? How cruel.",
    "Goodbye for now. Try not to get into trouble."
];

function isSimpleEquation(source) {
    const match = source.replace(/\s+/g, "").match(
        /^(-?\d+(?:\.\d+)?)([+\-*/])(-?\d+(?:\.\d+)?)$/
    );

    if (!match) return false;

    const a = Number(match[1]);
    const b = Number(match[3]);

    return Math.abs(a) <= 20 && Math.abs(b) <= 20;
}

function getCalculationDialogue() {
    if (
        ["Standard", "Scientific"].includes(currentMode) &&
        isSimpleEquation(expression)
    ) {
        return randomFrom(capriMockingLines);
    }

    return randomFrom(capriCalculationLines);
}

// =============================================
// CALCULATOR FUNCTIONS
// =============================================

function updateScreen() {
    screen.textContent = expression || "0";
}

function formatNumber(n) {
    if (!Number.isFinite(n)) {
        throw new Error("Result is not a finite number.");
    }

    return Number(n.toPrecision(11)).toString();
}

function showResult(value, message = "Calculation completed successfully.") {
    const output = typeof value === "number" ? formatNumber(value) : String(value);

    resultDisplay.textContent = output;
    resultStatus.textContent = "COMPLETE";
    resultMessage.textContent = message;
    expressionDisplay.textContent = currentMode.toUpperCase() + " RESULT";
    coreStatus.textContent = "Neural computation complete";
    coreProgress.style.width = "100%";
    processStatus.textContent = "COMPLETE";
    processText.textContent = "Result generated";
    processDetails.textContent = "CAPRI processed the requested operation.";

    window.capriSpeak?.(getCalculationDialogue());
}

function fail(error) {
    resultDisplay.textContent = "ERROR";
    resultStatus.textContent = "FAILED";
    resultMessage.textContent = error.message || "Check your inputs.";
    coreStatus.textContent = "Computation interrupted";
    coreProgress.style.width = "0%";
    processStatus.textContent = "ERROR";
    processText.textContent = "Unable to calculate";
    processDetails.textContent = error.message || "Invalid input.";

    window.capriSpeak?.(randomFrom(capriErrorLines));
}

function clearCalculator() {
    expression = "";
    updateScreen();

    expressionDisplay.textContent = "READY FOR INPUT";
    resultDisplay.textContent = "---";
    resultStatus.textContent = "AWAITING";
    resultMessage.textContent = "Waiting for a calculation command.";

    coreStatus.textContent = "Neural system initialized";
    coreProgress.style.width = "15%";

    processStatus.textContent = "IDLE";
    processText.textContent = "Awaiting expression";
    processDetails.textContent = "No active calculations.";
}

async function calculate() {
    if (!expression.trim()) return;

    try {
        processStatus.textContent = "PROCESSING";
        processText.textContent = "Analyzing expression...";
        coreStatus.textContent = "Neural core calculating";
        coreProgress.style.width = "80%";

        const response = await fetch("/api/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ expression })
        });
        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error || "The calculation could not be completed.");
        }

        const answer = Number(data.result);

        showResult(answer);

        expression = formatNumber(answer);
        updateScreen();

    } catch (e) {
        fail(e);
    }
}

// =============================================
// MODE FUNCTIONS
// =============================================

function field(label, id, value = "", type = "text", placeholder = "") {
    return `<label>${label}<input id="${id}" type="${type}" value="${value}" placeholder="${placeholder}"></label>`;
}

function selectField(label, id, options) {
    return `<label>${label}<select id="${id}">${options.map(x => `<option value="${x[0]}">${x[1]}</option>`).join("")}</select></label>`;
}

function modeButton(text = "CALCULATE", id = "modeRun") {
    return `<button class="mode-action" id="${id}" type="button">${text}</button>`;
}

function setMode(mode) {
    currentMode = mode;

    document.getElementById("currentMode").textContent = mode.toUpperCase();

    keypad.classList.toggle(
        "hidden",
        !["Standard", "Scientific"].includes(mode)
    );

    modeWorkspace.innerHTML = modeMarkup(mode);

    clearCalculator();

    expressionDisplay.textContent = mode.toUpperCase() + " MODE READY";

    bindMode(mode);
}

function modeMarkup(mode) {
    const wrap = (title, body) =>
        `<div class="mode-card"><div class="mode-title">${title}</div>${body}</div>`;

    switch (mode) {
        case "Standard":
            return "";

        case "Scientific":
            return wrap(
                "SCIENTIFIC FUNCTIONS",
                `<div class="mode-buttons">
                    ${["sin(", "cos(", "tan(", "log(", "ln(", "sqrt(", "abs(", "pi", "^"]
                        .map(x => `<button class="mode-chip" data-sci="${x}">${x}</button>`)
                        .join("")}
                </div>
                <p class="mode-output">Angles use degrees. Use the keypad, then press =.</p>`
            );

        case "Programmer":
            return wrap(
                "BASE CONVERSION / BITWISE",
                `<div class="mode-grid">
                    ${field("Input value", "progValue", "42", "text", "Decimal, 0b binary, or 0x hex")}
                    ${selectField("Input base", "progBase", [
                        ["10", "Decimal"],
                        ["2", "Binary"],
                        ["8", "Octal"],
                        ["16", "Hexadecimal"]
                    ])}
                </div>
                ${modeButton("CONVERT")}
                <div class="mode-output" id="progOutput"></div>
                <div class="mode-grid">
                    ${field("First integer", "bitA", "12", "number")}
                    ${field("Second integer", "bitB", "5", "number")}
                </div>
                ${selectField("Bitwise operation", "bitOp", [
                    ["and", "AND"],
                    ["or", "OR"],
                    ["xor", "XOR"],
                    ["left", "LEFT SHIFT"],
                    ["right", "RIGHT SHIFT"]
                ])}
                ${modeButton("RUN BITWISE", "bitRun")}
                <div class="mode-output" id="bitOutput"></div>`
            );

        case "Statistics":
            return wrap(
                "STATISTICAL ANALYSIS",
                `${field("Data values (comma separated)", "statsData", "4, 7, 7, 9, 13", "text", "e.g. 4, 7, 7, 9")}
                ${selectField("Calculation", "statsType", [
                    ["all", "Full summary"],
                    ["mean", "Mean"],
                    ["median", "Median"],
                    ["mode", "Mode"],
                    ["sd", "Standard deviation"]
                ])}
                ${modeButton("ANALYZE")}
                <div class="mode-output" id="statsOutput"></div>`
            );

        case "Fraction":
            return wrap(
                "FRACTION ENGINE",
                `<div class="mode-grid">
                    ${field("Numerator A", "fa", "1", "number")}
                    ${field("Denominator A", "fb", "2", "number")}
                    ${field("Numerator B", "fc", "1", "number")}
                    ${field("Denominator B", "fd", "3", "number")}
                </div>
                ${selectField("Operation", "fracOp", [
                    ["+", "Add"],
                    ["-", "Subtract"],
                    ["*", "Multiply"],
                    ["/", "Divide"]
                ])}
                ${modeButton("CALCULATE FRACTION")}
                <div class="mode-output" id="fracOutput"></div>`
            );

        case "Equation":
            return wrap(
                "LINEAR / QUADRATIC SOLVER",
                `${selectField("Equation type", "eqType", [
                    ["linear", "Linear: ax + b = 0"],
                    ["quadratic", "Quadratic: ax² + bx + c = 0"]
                ])}
                <div class="mode-grid">
                    ${field("Coefficient a", "eqA", "2", "number")}
                    ${field("Coefficient b", "eqB", "-8", "number")}
                    ${field("Coefficient c", "eqC", "0", "number")}
                </div>
                ${modeButton("SOLVE EQUATION")}
                <div class="mode-output" id="eqOutput"></div>`
            );

        case "Graphing":
            return wrap(
                "FUNCTION PLOTTER",
                `${field("Function of x", "graphFn", "x*x - 4", "text", "Examples: x*x, sin(x), 2*x+1")}
                ${modeButton("PLOT FUNCTION")}
                <canvas id="graphCanvas" class="graph-canvas" width="600" height="240"></canvas>
                <div class="mode-output" id="graphOutput">x range: -10 to 10</div>`
            );

        case "Financial":
            return wrap(
                "FINANCIAL CALCULATOR",
                `${selectField("Calculation", "finType", [
                    ["compound", "Compound interest"],
                    ["simple", "Simple interest"],
                    ["loan", "Monthly loan payment"]
                ])}
                <div class="mode-grid">
                    ${field("Principal / loan amount", "finP", "10000", "number")}
                    ${field("Annual rate (%)", "finR", "5", "number")}
                    ${field("Years", "finY", "3", "number")}
                    ${field("Compounds per year", "finN", "12", "number")}
                </div>
                ${modeButton("COMPUTE FINANCE")}
                <div class="mode-output" id="finOutput"></div>`
            );

        case "Converter":
            return wrap(
                "UNIT CONVERSION",
                `${field("Value", "convValue", "1", "number")}
                ${selectField("Category", "convCategory", [
                    ["length", "Length"],
                    ["weight", "Weight"],
                    ["temperature", "Temperature"],
                    ["volume", "Volume"]
                ])}
                <div class="mode-grid">
                    ${selectField("From", "convFrom", [])}
                    ${selectField("To", "convTo", [])}
                </div>
                ${modeButton("CONVERT UNIT")}
                <div class="mode-output" id="convOutput"></div>`
            );

        case "Date":
            return wrap(
                "DATE CALCULATOR",
                `${selectField("Operation", "dateType", [
                    ["difference", "Days between two dates"],
                    ["add", "Add days to a date"]
                ])}
                <div class="mode-grid">
                    ${field("Start date", "dateA", "2026-01-01", "date")}
                    ${field("End date / base date", "dateB", "2026-12-31", "date")}
                </div>
                ${field("Days to add (used for Add)", "dateDays", "30", "number")}
                ${modeButton("CALCULATE DATES")}
                <div class="mode-output" id="dateOutput"></div>`
            );

        default:
            return "";
    }
}

function bindMode(mode) {
    const $ = id => document.getElementById(id);
    const run = $("modeRun");

    if (mode === "Scientific") {
        modeWorkspace.querySelectorAll("[data-sci]").forEach(b => {
            b.addEventListener("click", () => {
                const v = b.dataset.sci;

                if (v === "pi") expression += String(Math.PI);
                else if (v === "^") expression += "**";
                else expression += v;

                updateScreen();
                expressionDisplay.textContent = expression;
            });
        });
    }

    if (mode === "Programmer") {
        run.onclick = () => {
            try {
                const base = Number($("progBase").value);
                const raw = $("progValue").value.trim();
                const n = parseInt(raw, base);

                if (!Number.isFinite(n)) {
                    throw Error("Enter a valid integer for the selected base.");
                }

                $("progOutput").textContent =
                    `BIN ${n.toString(2)} | OCT ${n.toString(8)} | DEC ${n} | HEX ${n.toString(16).toUpperCase()}`;

                showResult(n, "Number converted between bases.");

            } catch (e) {
                fail(e);
            }
        };

        $("bitRun").onclick = () => {
            const a = Number($("bitA").value);
            const b = Number($("bitB").value);
            const op = $("bitOp").value;

            const v =
                op === "and" ? a & b :
                op === "or" ? a | b :
                op === "xor" ? a ^ b :
                op === "left" ? a << b :
                a >> b;

            $("bitOutput").textContent = String(v);
            showResult(v, "Bitwise operation completed.");
        };
    }

    if (mode === "Statistics") {
        run.onclick = () => {
            try {
                const a = $("statsData").value.split(",").map(Number);

                if (!a.length || a.some(n => !Number.isFinite(n))) {
                    throw Error("Enter comma-separated numbers.");
                }

                const s = [...a].sort((x, y) => x - y);
                const mean = a.reduce((x, y) => x + y, 0) / a.length;
                const mid = Math.floor(s.length / 2);
                const median = s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;

                const counts = new Map();
                a.forEach(n => counts.set(n, (counts.get(n) || 0) + 1));

                const max = Math.max(...counts.values());
                const modes = [...counts]
                    .filter(x => x[1] === max && max > 1)
                    .map(x => x[0]);

                const sd = Math.sqrt(
                    a.reduce((sum, n) => sum + (n - mean) ** 2, 0) / a.length
                );

                const t = $("statsType").value;

                const out =
                    t === "mean" ? `Mean: ${mean}` :
                    t === "median" ? `Median: ${median}` :
                    t === "mode" ? `Mode: ${modes.length ? modes.join(", ") : "No repeated value"}` :
                    t === "sd" ? `Population SD: ${sd}` :
                    `Count: ${a.length} | Mean: ${mean} | Median: ${median} | Mode: ${modes.join(", ") || "None"} | SD: ${sd}`;

                $("statsOutput").textContent = out;
                showResult(out, "Statistical analysis completed.");

            } catch (e) {
                fail(e);
            }
        };
    }

    if (mode === "Fraction") {
        run.onclick = () => {
            try {
                let a = +$("fa").value;
                let b = +$("fb").value;
                let c = +$("fc").value;
                let d = +$("fd").value;

                if (!b || !d) {
                    throw Error("Denominators cannot be zero.");
                }

                let n, den;
                const op = $("fracOp").value;

                if (op === "+") {
                    n = a * d + c * b;
                    den = b * d;
                } else if (op === "-") {
                    n = a * d - c * b;
                    den = b * d;
                } else if (op === "*") {
                    n = a * c;
                    den = b * d;
                } else {
                    n = a * d;
                    den = b * c;
                }

                if (!den) {
                    throw Error("Cannot divide by zero.");
                }

                const gcd = (x, y) => y ? gcd(y, x % y) : Math.abs(x);

                const g = gcd(n, den);
                n /= g;
                den /= g;

                if (den < 0) {
                    n = -n;
                    den = -den;
                }

                const out = `${n}/${den} (${formatNumber(n / den)})`;

                $("fracOutput").textContent = out;
                showResult(out, "Fraction simplified.");

            } catch (e) {
                fail(e);
            }
        };
    }

    if (mode === "Equation") {
        run.onclick = () => {
            try {
                const a = +$("eqA").value;
                const b = +$("eqB").value;
                const c = +$("eqC").value;

                let out;

                if ($("eqType").value === "linear") {
                    if (a === 0) {
                        throw Error("Coefficient a cannot be zero.");
                    }

                    out = `x = ${formatNumber(-b / a)}`;

                } else {
                    if (a === 0) {
                        throw Error("For a quadratic equation, a cannot be zero.");
                    }

                    const d = b * b - 4 * a * c;

                    if (d < 0) {
                        out = `No real roots. Discriminant: ${d}`;
                    } else {
                        const x1 = (-b + Math.sqrt(d)) / (2 * a);
                        const x2 = (-b - Math.sqrt(d)) / (2 * a);

                        out = `x₁ = ${formatNumber(x1)}, x₂ = ${formatNumber(x2)}`;
                    }
                }

                $("eqOutput").textContent = out;
                showResult(out, "Equation solved.");

            } catch (e) {
                fail(e);
            }
        };
    }

    if (mode === "Graphing") {
        run.onclick = () => {
            try {
                const fn = $("graphFn").value.replace(/\^/g, "**");

                if (!/^[x0-9+\-*/().\s*Math.sincoqrtanlgabsPI]+$/.test(fn)) {
                    throw Error("Use x, numbers, arithmetic, and sin/cos/tan/sqrt/log.");
                }

                const f = x => Function(
                    "x",
                    `"use strict";return (${fn
                        .replace(/\bpi\b/gi, "Math.PI")
                        .replace(/\bsin\b/g, "Math.sin")
                        .replace(/\bcos\b/g, "Math.cos")
                        .replace(/\btan\b/g, "Math.tan")
                        .replace(/\bsqrt\b/g, "Math.sqrt")
                        .replace(/\blog\b/g, "Math.log")})`
                )(x);

                const c = $("graphCanvas");
                const ctx = c.getContext("2d");
                const w = c.width;
                const h = c.height;

                ctx.clearRect(0, 0, w, h);
                ctx.strokeStyle = "#35121d";
                ctx.lineWidth = 1;

                for (let i = 0; i <= 10; i++) {
                    let x = i * w / 10;
                    let y = i * h / 10;

                    ctx.beginPath();
                    ctx.moveTo(x, 0);
                    ctx.lineTo(x, h);
                    ctx.moveTo(0, y);
                    ctx.lineTo(w, y);
                    ctx.stroke();
                }

                ctx.strokeStyle = "#ff2449";
                ctx.lineWidth = 2;
                ctx.beginPath();

                let started = false;

                for (let px = 0; px < w; px++) {
                    const x = (px / w) * 20 - 10;
                    let y = f(x);

                    if (!Number.isFinite(y) || Math.abs(y) > 100) {
                        started = false;
                        continue;
                    }

                    const py = h / 2 - y * (h / 20);

                    if (!started) {
                        ctx.moveTo(px, py);
                        started = true;
                    } else {
                        ctx.lineTo(px, py);
                    }
                }

                ctx.stroke();

                $("graphOutput").textContent = "Function plotted over x = -10 to 10.";
                showResult("GRAPH GENERATED", "Function plotted successfully.");

            } catch (e) {
                fail(e);
            }
        };
    }

    if (mode === "Financial") {
        run.onclick = () => {
            try {
                const p = +$("finP").value;
                const r = +$("finR").value / 100;
                const y = +$("finY").value;
                const n = +$("finN").value;

                let out;

                if ([p, r, y, n].some(v => !Number.isFinite(v)) || p < 0 || y < 0 || n <= 0) {
                    throw Error("Check the financial inputs.");
                }

                const type = $("finType").value;

                if (type === "simple") {
                    out = `Interest: ${formatNumber(p * r * y)} | Total: ${formatNumber(p * (1 + r * y))}`;

                } else if (type === "compound") {
                    const total = p * Math.pow(1 + r / n, n * y);
                    out = `Future value: ${formatNumber(total)} | Interest: ${formatNumber(total - p)}`;

                } else {
                    const months = y * 12;
                    const monthly = r / 12;
                    const payment = monthly === 0
                        ? p / months
                        : p * monthly / (1 - Math.pow(1 + monthly, -months));

                    out = `Monthly payment: ${formatNumber(payment)} | Total paid: ${formatNumber(payment * months)}`;
                }

                $("finOutput").textContent = out;
                showResult(out, "Financial calculation completed.");

            } catch (e) {
                fail(e);
            }
        };
    }

    if (mode === "Converter") {
        const units = {
            length: {
                m: 1,
                km: 1000,
                cm: .01,
                mm: .001,
                mi: 1609.344,
                ft: .3048,
                in: .0254
            },
            weight: {
                kg: 1,
                g: .001,
                lb: .45359237,
                oz: .0283495
            },
            volume: {
                L: 1,
                mL: .001,
                "gal (US)": 3.78541
            },
            temperature: {}
        };

        const populate = () => {
            const cat = $("convCategory").value;

            const opts = cat === "temperature"
                ? ["Celsius", "Fahrenheit", "Kelvin"]
                : Object.keys(units[cat]);

            ["convFrom", "convTo"].forEach(id => {
                $(id).innerHTML = opts
                    .map(u => `<option>${u}</option>`)
                    .join("");
            });
        };

        $("convCategory").onchange = populate;
        populate();

        run.onclick = () => {
            try {
                const v = +$("convValue").value;
                const cat = $("convCategory").value;
                const from = $("convFrom").value;
                const to = $("convTo").value;

                let out;

                if (cat === "temperature") {
                    let c = from === "Celsius"
                        ? v
                        : from === "Fahrenheit"
                            ? (v - 32) * 5 / 9
                            : v - 273.15;

                    out = to === "Celsius"
                        ? c
                        : to === "Fahrenheit"
                            ? c * 9 / 5 + 32
                            : c + 273.15;

                } else {
                    out = v * units[cat][from] / units[cat][to];
                }

                const text = `${formatNumber(v)} ${from} = ${formatNumber(out)} ${to}`;

                $("convOutput").textContent = text;
                showResult(text, "Unit conversion completed.");

            } catch (e) {
                fail(e);
            }
        };
    }

    if (mode === "Date") {
        run.onclick = () => {
            try {
                const a = new Date($("dateA").value + "T00:00:00");
                let out;

                if (isNaN(a)) {
                    throw Error("Choose a valid date.");
                }

                if ($("dateType").value === "difference") {
                    const b = new Date($("dateB").value + "T00:00:00");

                    if (isNaN(b)) {
                        throw Error("Choose a valid second date.");
                    }

                    out = `${Math.round(Math.abs(b - a) / 86400000)} days`;

                } else {
                    a.setDate(a.getDate() + (+$("dateDays").value));

                    out = a.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    });
                }

                $("dateOutput").textContent = out;
                showResult(out, "Date calculation completed.");

            } catch (e) {
                fail(e);
            }
        };
    }
}

// =============================================
// KEYPAD
// =============================================

keypad.addEventListener("click", event => {
    const button = event.target.closest("button");
    if (!button) return;

    const value = button.dataset.value;

    if (value === "AC") {
        clearCalculator();
        window.capriSpeak?.(randomFrom([
            "Fresh start? Alright.",
            "Clearing everything? As you wish.",
            "Starting over again? How predictable.",
            "A clean slate. I like that."
        ]));
        return;
    }

    if (value === "BACK") {
        expression = expression.slice(0, -1);
        updateScreen();
        return;
    }

    if (value === "=") {
        if (currentMode === "Scientific") {
            try {
                let exp = expression
                    .replace(/\^/g, "**")
                    .replace(/\bpi\b/gi, "Math.PI")
                    .replace(/\bsin\b/g, "Math.sin")
                    .replace(/\bcos\b/g, "Math.cos")
                    .replace(/\btan\b/g, "Math.tan")
                    .replace(/\blog\b/g, "Math.log10")
                    .replace(/\bln\b/g, "Math.log")
                    .replace(/\bsqrt\b/g, "Math.sqrt")
                    .replace(/\babs\b/g, "Math.abs");

                exp = exp.replace(
                    /(Math\.(?:sin|cos|tan)\()\s*([-+]?\d*\.?\d+)\s*(\))/g,
                    (_, a, n, z) => a + (Number(n) * Math.PI / 180) + z
                );

                const answer = Function('"use strict";return (' + exp + ')')();

                showResult(answer);

                expression = formatNumber(answer);
                updateScreen();

            } catch (e) {
                fail(e);
            }

            return;
        }

        calculate();
        return;
    }

    expression += value;
    updateScreen();
    expressionDisplay.textContent = expression;
});

// =============================================
// KEYBOARD INPUT
// =============================================

document.addEventListener("keydown", event => {
    if (event.target.matches("input,select,textarea")) return;
    if (capriIsExiting) return;

    const key = event.key;

    if (/^[0-9+\-*/().]$/.test(key)) {
        expression += key;
        updateScreen();
        expressionDisplay.textContent = expression;
    }

    if (key === "Enter" || key === "=") {
        event.preventDefault();

        if (currentMode === "Scientific") {
            keypad.querySelector('[data-value="="]').click();
        } else {
            calculate();
        }
    }

    if (key === "Backspace") {
        expression = expression.slice(0, -1);
        updateScreen();
    }

    if (key === "Escape") {
        clearCalculator();
    }
});

// =============================================
// SETTINGS MENU
// =============================================

const settingsButton = document.getElementById("settingsButton");
const settingsMenu = document.getElementById("settingsMenu");

settingsButton.addEventListener("click", () => {
    settingsMenu.classList.toggle("hidden");
});

settingsMenu.addEventListener("click", event => {
    const button = event.target.closest("button[data-mode]");
    if (!button) return;

    setMode(button.dataset.mode);
    settingsMenu.classList.add("hidden");

    window.capriSpeak?.(
        randomFrom([
            "Switched to " + currentMode + " mode. Interesting choice.",
            currentMode + "? Let's see what you can do.",
            "Ah, " + currentMode + " mode. Very well.",
            "Changing things up? I approve."
        ])
    );
});

// =============================================
// CAPRI AI COMPANION
// =============================================

const capri = document.getElementById("capriCompanion");
const capriImage = document.getElementById("capriImage");
const capriChat = document.getElementById("capriChat");
const capriMessage = document.getElementById("capriMessage");

const capriPoses = {
    stand: "assets/CapriStand.png",
    sit: "assets/CapriSit.png",
    lie: "assets/CapriRest.png"
};

const capriSpots = ["spot-1", "spot-2", "spot-3", "spot-4"];

let currentCapriSpot = null;
let chatTimer = null;
let capriExperienceStarted = false;
let capriMovementInterval = null;
let capriDialogueInterval = null;
let capriIsExiting = false;

function changeCapriPose(pose) {
    capriImage.src = capriPoses[pose];
}

function moveCapri() {
    const availableSpots = capriSpots.filter(
        spot => spot !== currentCapriSpot
    );

    const nextSpot = availableSpots[
        Math.floor(Math.random() * availableSpots.length)
    ];

    capriSpots.forEach(spot => capri.classList.remove(spot));

    capri.classList.add(nextSpot);
    currentCapriSpot = nextSpot;
}

function capriSpeak(message) {
    if (capriIsExiting && !message) return;

    capriMessage.textContent = message;
    capriChat.classList.add("show");

    clearTimeout(chatTimer);

    chatTimer = setTimeout(() => {
        if (!capriIsExiting) {
            capriChat.classList.remove("show");
        }
    }, 4500);
}

window.capriSpeak = capriSpeak;

function randomCapriPose() {
    if (capriIsExiting) return;

    const poses = ["sit", "lie"];
    const randomPose = randomFrom(poses);

    changeCapriPose(randomPose);
    moveCapri();
}

function startCapriExperience() {
    if (capriExperienceStarted) return;

    capriExperienceStarted = true;

    capri.classList.remove("greeting-fullscreen");

    capriSpots.forEach(spot => capri.classList.remove(spot));

    changeCapriPose("stand");
    capri.classList.add("spot-1");
    capri.classList.add("visible");

    currentCapriSpot = "spot-1";

    capriSpeak(randomFrom([
        "Oh? You're here. Welcome.",
        "Well, look who finally arrived.",
        "Hello again. I was wondering when you'd show up.",
        "There you are. I was getting bored.",
        "Welcome back. Shall we get started?"
    ]));

    setTimeout(() => {
        if (capriIsExiting) return;

        changeCapriPose("sit");
        moveCapri();
    }, 3500);

    capriMovementInterval = setInterval(() => {
        randomCapriPose();
    }, 20000);

    capriDialogueInterval = setInterval(() => {
        if (capriIsExiting) return;

        capriSpeak(randomFrom(capriRandomMessages));
    }, 45000);
}

// =============================================
// CAPRICORN STARTUP SCREEN - FULLSCREEN REQUIRED
// =============================================

document.body.classList.add("startup-hidden");

const startupScreen = document.createElement("div");

startupScreen.className = "startup-screen";

startupScreen.innerHTML = `
    <div class="startup-content">
        <div class="startup-title">CAPRICORN</div>

        <button class="startup-enter" id="startupEnter" type="button">
            ENTER
        </button>

        <div id="fullscreenMessage" class="fullscreen-message">
            FULLSCREEN REQUIRED
        </div>
    </div>
`;

document.body.appendChild(startupScreen);

let startupStarted = false;
let startupRequesting = false;

const startupEnter = document.getElementById("startupEnter");
const fullscreenMessage = document.getElementById("fullscreenMessage");

startupEnter.addEventListener("click", async () => {
    if (startupStarted || startupRequesting) return;

    startupRequesting = true;
    startupEnter.textContent = "INITIALIZING...";
    fullscreenMessage.textContent = "REQUESTING FULLSCREEN ACCESS...";

    try {
        if (!document.fullscreenElement) {
            await document.documentElement.requestFullscreen();
        }

        if (!document.fullscreenElement) {
            throw new Error("Fullscreen was not activated.");
        }

        startupStarted = true;
        startupEnter.textContent = "WELCOME";
        fullscreenMessage.textContent = "FULLSCREEN ACTIVE";

        startupScreen.classList.add("leaving");

        setTimeout(() => {
            setTimeout(() => {
                document.body.classList.remove("startup-hidden");
                startupScreen.classList.add("fade-out");

                setTimeout(() => {
                    startupScreen.remove();
                    startCapriExperience();
                }, 850);

            }, 2000);
        }, 500);

    } catch (error) {
        startupEnter.textContent = "TRY AGAIN";
        fullscreenMessage.textContent =
            "FULLSCREEN REQUIRED — PLEASE ALLOW ACCESS";

        startupRequesting = false;
    }
});

// =============================================
// REAL-TIME CLOCK
// =============================================

const capriClock = document.createElement("div");
capriClock.id = "capriClock";

capriClock.innerHTML = `
    <div id="clockTime">00:00:00 AM</div>
    <div id="clockDate">LOADING DATE...</div>
`;

const topBar = document.querySelector(".topbar");

if (topBar) {
    topBar.appendChild(capriClock);
} else {
    document.body.appendChild(capriClock);
}

function updateCapriClock() {
    const now = new Date();

    document.getElementById("clockTime").textContent =
        now.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });

    document.getElementById("clockDate").textContent =
        now.toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
}

updateCapriClock();
setInterval(updateCapriClock, 1000);

// =============================================
// EXIT BUTTON AND GOODBYE EXPERIENCE
// =============================================

const capriExitButton = document.createElement("button");

capriExitButton.id = "capriExitButton";
capriExitButton.textContent = "EXIT";
capriExitButton.type = "button";

if (topBar) {
    topBar.appendChild(capriExitButton);
} else {
    document.body.appendChild(capriExitButton);
}

const capriExitOverlay = document.createElement("div");
capriExitOverlay.id = "capriExitOverlay";
document.body.appendChild(capriExitOverlay);

// =============================================
// ADDITIONAL STYLES
// =============================================

const capriUpgradeStyles = document.createElement("style");

capriUpgradeStyles.textContent = `
    #capriClock {
        margin-left: auto;
        margin-right: 15px;
        padding: 8px 14px;
        text-align: right;
        background: rgba(10, 5, 10, 0.85);
        border: 1px solid rgba(255, 35, 75, 0.45);
        border-right: 3px solid #ff2449;
        pointer-events: none;
    }

    #clockTime {
        color: #ff3159;
        font-size: 20px;
        font-weight: bold;
        letter-spacing: 2px;
        text-shadow: 0 0 10px rgba(255, 30, 70, 0.65);
    }

    #clockDate {
        margin-top: 4px;
        color: #a87985;
        font-size: 10px;
        letter-spacing: 1px;
        text-transform: uppercase;
    }

    #capriExitButton {
        padding: 9px 20px;
        margin-left: 10px;
        background: rgba(255, 20, 60, 0.08);
        border: 1px solid #ff3159;
        color: #ff3159;
        font: inherit;
        letter-spacing: 2px;
        cursor: pointer;
        transition: 0.3s ease;
    }

    #capriExitButton:hover {
        background: #ff3159;
        color: white;
        box-shadow: 0 0 18px rgba(255, 30, 70, 0.5);
    }

    #capriExitOverlay {
        position: fixed;
        inset: 0;
        z-index: 999999;
        background: #000;
        opacity: 0;
        pointer-events: none;
        transition: opacity 1.5s ease;
    }

    #capriExitOverlay.active {
        opacity: 1;
        pointer-events: all;
    }
`;

document.head.appendChild(capriUpgradeStyles);

// =============================================
// CAPRI GOODBYE
// =============================================

function capriGoodbye() {
    if (capriIsExiting) return;

    capriIsExiting = true;

    // Stop Capri's regular movement and dialogue.
    if (capriMovementInterval) {
        clearInterval(capriMovementInterval);
    }

    if (capriDialogueInterval) {
        clearInterval(capriDialogueInterval);
    }

    if (chatTimer) {
        clearTimeout(chatTimer);
    }

    // Keep Capri visible.
    capri.classList.add("visible");
    capri.classList.remove("greeting-fullscreen");

    // Show her sitting pose.
    changeCapriPose("sit");

    // Show a random goodbye message.
    const goodbye = randomFrom(capriGoodbyes);

    capriMessage.textContent = goodbye;
    capriChat.classList.add("show");

    // Wait for her farewell, then fade to black.
    setTimeout(() => {
        capriExitOverlay.classList.add("active");
    }, 2200);

    // Leave after the fade finishes.
    setTimeout(() => {
        window.location.replace("about:blank");
    }, 3900);
}

capriExitButton.addEventListener("click", capriGoodbye);

// =============================================
// BROWSER CLOSE DETECTION
// =============================================

// Browsers control the close confirmation.
// A custom animation cannot be guaranteed during tab closure.

window.addEventListener("beforeunload", event => {
    if (capriIsExiting) return;

    event.preventDefault();
    event.returnValue = "";
});
