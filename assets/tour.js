var TOUR_STEPS = [
    {
        selector: "main.grid",
        title: "This page is the sheet",
        body: "You'll print this page. Each box is a place for instructions now and handwriting later."
    },
    {
        selector: "#btn-new-text-card",
        title: "New text card",
        body: "This adds a box. Open and Print sit beside it. Everything else waits under More."
    },
    {
        selector: "main.grid .grid-item",
        title: "Write in a card",
        body: "Click a card and type. Paste a picture if you need one. Hold Ctrl or Command to resize."
    },
    {
        selector: "#btn-open-files",
        title: "Open a saved file",
        body: "Open lists every sheet saved on this device. Pick a name from the list. You don't have to type a command."
    },
    {
        selector: "#btn-more-options",
        title: "More stays closed until you need it",
        body: "Write, cards, layout, and style are grouped inside. Open one group at a time. The panel opens to the left."
    }
];

var tourStep = 0;

function startGetStartedTour() {
    if (typeof forceCloseMenu === "function") forceCloseMenu();
    var confirmEl = document.getElementById("tour-confirm");
    confirmEl.hidden = false;
    document.getElementById("tour-confirm-start").focus();
}

function cancelTourConfirm() {
    document.getElementById("tour-confirm").hidden = true;
    try {
        localStorage.setItem("mosaic_notes_meta__tour_invited", "1");
    } catch (err) {}
}

function confirmTourAndStart() {
    document.getElementById("tour-confirm").hidden = true;
    try {
        localStorage.setItem("mosaic_notes_meta__tour_invited", "1");
    } catch (err) {}
    if (typeof resetCanvas === "function") resetCanvas(true);
    if (typeof forceCloseMenu === "function") forceCloseMenu();
    if (typeof slideInPageControls === "function") slideInPageControls();
    tourStep = 0;
    document.body.classList.add("is-touring");
    document.getElementById("tour").hidden = false;
    document.getElementById("tour-total").textContent = String(TOUR_STEPS.length);
    showTourStep();
}

function clearTourChrome() {
    document.querySelectorAll(".tour-ring").forEach(function (el) {
        el.classList.remove("tour-ring");
    });
    document.querySelectorAll(".tour-raised").forEach(function (el) {
        el.classList.remove("tour-raised");
        if (el.dataset.tourPosition === "static") {
            el.style.position = "";
            delete el.dataset.tourPosition;
        }
    });
}

function endTour() {
    clearTourChrome();
    document.body.classList.remove("is-touring");
    document.getElementById("tour").hidden = true;
}

function showTourStep() {
    clearTourChrome();
    var step = TOUR_STEPS[tourStep];
    var target = document.querySelector(step.selector);
    document.getElementById("tour-index").textContent = String(tourStep + 1);
    document.getElementById("tour-title").textContent = step.title;
    document.getElementById("tour-body").textContent = step.body;
    var prev = document.getElementById("tour-prev");
    prev.disabled = tourStep === 0;
    var next = document.getElementById("tour-next");
    next.textContent = tourStep === TOUR_STEPS.length - 1 ? "Done" : "Next";

    if (target) {
        var host = target.closest(".sheet-toolbar, .page-controls") || target;
        if (window.getComputedStyle(host).position === "static") {
            host.dataset.tourPosition = "static";
            host.style.position = "relative";
        }
        host.classList.add("tour-raised");
        target.classList.add("tour-ring");
        var rect = target.getBoundingClientRect();
        var offscreen = rect.bottom < 0 || rect.top > window.innerHeight || rect.right < 0 || rect.left > window.innerWidth;
        if (offscreen) target.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
    placeTourPopover(target);
}

function placeTourPopover(target) {
    var pop = document.querySelector(".tour-popover");
    var margin = 12;
    var gap = 10;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    pop.style.maxWidth = Math.min(320, vw - margin * 2) + "px";
    var pw = pop.offsetWidth;
    var ph = pop.offsetHeight;
    var left = margin;
    var top = margin;

    if (target) {
        var tr = target.getBoundingClientRect();
        var candidates = [];
        if (tr.height > vh * 0.55) {
            candidates.push({
                top: Math.max(tr.top, margin) + 16,
                left: Math.max(tr.left, margin) + 16
            });
        }
        candidates.push(
            { top: tr.top, left: tr.left - pw - gap },
            { top: tr.bottom + gap, left: Math.max(tr.left, margin) },
            { top: tr.top - ph - gap, left: Math.max(tr.left, margin) },
            { top: tr.top, left: tr.right + gap }
        );
        var chosen = null;
        for (var i = 0; i < candidates.length; i++) {
            var c = candidates[i];
            if (c.left >= margin && c.top >= margin && c.left + pw <= vw - margin && c.top + ph <= vh - margin) {
                chosen = c;
                break;
            }
        }
        if (!chosen) {
            var fallback = candidates[0];
            chosen = {
                left: Math.max(margin, Math.min(fallback.left, vw - pw - margin)),
                top: Math.max(margin, Math.min(fallback.top, vh - ph - margin))
            };
        }
        left = chosen.left;
        top = chosen.top;
    }

    pop.style.left = left + "px";
    pop.style.top = top + "px";
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("tour-confirm-cancel").addEventListener("click", cancelTourConfirm);
    document.getElementById("tour-confirm-start").addEventListener("click", confirmTourAndStart);
    document.getElementById("tour-confirm").addEventListener("click", function (event) {
        if (event.target.id === "tour-confirm") cancelTourConfirm();
    });
    document.getElementById("tour-prev").addEventListener("click", function () {
        if (tourStep === 0) return;
        tourStep -= 1;
        showTourStep();
    });
    document.getElementById("tour-next").addEventListener("click", function () {
        if (tourStep >= TOUR_STEPS.length - 1) {
            endTour();
            return;
        }
        tourStep += 1;
        showTourStep();
    });
    document.getElementById("tour-skip").addEventListener("click", endTour);
    window.addEventListener("resize", function () {
        if (!document.body.classList.contains("is-touring")) return;
        placeTourPopover(document.querySelector(TOUR_STEPS[tourStep].selector));
    });
    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;
        var confirmEl = document.getElementById("tour-confirm");
        if (confirmEl && !confirmEl.hidden) {
            cancelTourConfirm();
            return;
        }
        if (document.body.classList.contains("is-touring")) endTour();
    });
    if (!localStorage.getItem("mosaic_notes_meta__tour_invited")) {
        startGetStartedTour();
    }
});
