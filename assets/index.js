/** 
 * For VS Code Outline
 * Don't want it alphabetized in outline? ... -> Sort By: Position
 * Jump to that section's exact comment or function name: Copy -> Search
 * 
 * */

delete {
    "Init Process": {
        "Load file if in URL":{},
        "Warn user if on mobile":{},
        "Init Command Palette UI":{},
        "Autosave when user stops typing":{},
        "Load last saved page view":{},
        "lastBox: Tracks the most recent box for toggling borders, etc settings":{},
        "Track if an image is clicked when you are in Resize Image Mode": {},
        "Init sorting makes items able to rearrange via handle icon":{},
        "Future proof persisting boxes. Would find the last box, however can add more implementations as necessary.":{},
        "Init modifier keys for changing resizing/rearranging/plain boxes.":{},
        "Init page controls menu showing and hiding.":{},
        "Autocomplete feature": {}
    },
    "Init polling required": {
        "Resizable":{},
        "Rich text editor":{},
        "Links open in new window":{}
    },
    "Utility functions": {},
    "Low level implementation for core methods: Change box mode into resizable|rearrange|plain": {
        "function changeBoxModeVisual": "Core implementation. User clicks toggle through different layout states: resizable|rearrange|plain",
        "function reassertBoxModeVisual": "Low level implementation. Refer to visual indicator to return to the desired box mode.",
        "function changeBoxMode": "Low level implementation, resizable|rearrange|plain"
    },
    "Setting methods to change box appearance and behaviors": {},
    "Command prompt user opens": {}

}

/** 
 * Init Process
 * Load file if in URL
 * Warn user if on mobile
 * Init Command Palette UI
 * lastBox: Tracks the most recent box for toggling borders, etc settings
 * Init sorting makes items able to rearrange via handle icon
 * Future proof persisting boxes. Would find the last box, however can add more implementations as necessary.
 * Init modifier keys for changing resizing/rearranging/plain boxes
 */
$(()=>{

    let hash = window.location.hash.length?window.location.hash.substr(1):"";
    if(hash) {
        loadBodyHTML(hash)
    } else {
        resetCanvas(true); // Reset to starter boxes, so not empty
    }

    // Warn user if on mobile that this is a Desktop app
    if(window.innerWidth < 816) {
        alert("Advisory: You are on a small window. The purpose of this app is to create a boxed notes template that prints on a 11 x 8.5 inches paper. Then you would use it for work or school. Please visit on a bigger screen.")
    }

    //  Init Command Palette UI
    window.cpDialog = $("#command-prompt").dialog({
        width: 500,
        autoOpen: false,
        modal: true,
        title: "Command Palette",
        open: function() {
            $("#command-prompt").keypress(function(e) {
              if (e.keyCode == $.ui.keyCode.ENTER) {
                $(this).parent().find("button:eq(1)").trigger("click");
              }
            });
        },
        buttons: {
            "OK": function() {
                commandPromptProcessor($('#command-prompt-cmd').val());
                $(this).dialog('close');
                $("#command-prompt-cmd").val("")
            },
            "Close": function() {
                $(this).dialog('close');
                $("#command-prompt-cmd").val("")
            }
        }
    });
    $("#command-prompt").removeClass("hidden");
    $("button[title='Close']").html(`<span class="ui-button-icon ui-icon ui-icon-closethick"></span><span class="ui-button-icon-space"> </span>`)

    function animateBorderImplyingSaving() {
        $('.grid').css("border", "5px solid transparent");
            $('.grid').animate({
                borderColor: "rgba(152,251,152,.8)"
            },500)

            setTimeout(()=>{
                $('.grid').animate({
                    borderColor: "transparent"
                },500)
            }, 500);
    }

    $(()=>{
        // Autosave when user stops typing
    
        window.lastPressedTime = 0;
        // $(".grid").on("keyup click blur", ()=>{
        $(".grid-item").on("blur", ()=>{
            const currentTime = parseInt(Date.now()/1000);
            if(currentTime - window.lastPressedTime >= 2) {
                window.lastPressedTime = currentTime;
                if(window.PERSIST.pollFile.length>0) {
                    let previouslyAccessedFile = PERSIST.pollFile
                    saveBodyHTML(previouslyAccessedFile);

                    animateBorderImplyingSaving();
                    console.log("Saved " + window.lastPressedTime);
                }
            }
        })
    })

    // Load last saved page view
    const hasSavedPageView = localStorage.getItem("mosaic_notes___page_view");
    if(hasSavedPageView) changePageView(hasSavedPageView)
    // $("body").css("border", "1px solid rgba(125, 125, 125, .5);");
    // $("html").addClass("bg-gradient-to-r from-gray-400 to-gray-100");
    $("html").css("opacity", 1);

    // lastBox: Tracks the most recent box for toggling borders, etc settings (includes duplicating and deleting the most recently used or created box)
    // Track if an image is clicked when you are in Resize Image Mode
    window.lastBox = null;
    window.resizingImg = false;
    window.alignImg = "";
    $("body").on("click", event => {
        const gridItem = event.target.matches(".grid-item") ? event.target : event.target.closest(".grid-item");
        if (gridItem) {
            console.group("I'm at: ")
            console.log(gridItem);
            console.groupEnd();
            window.lastBox = $(gridItem);
            // Clicks inside the strip (swatches, chevron) keep the current strip
            // so its expanded/collapsed state survives the click.
            if (!event.target.closest(".card-color-strip")) showCardColorStrip(window.lastBox);
        }

        if(event.target.matches("img")) {
            if(window.alignImg.length) {
                if(window.alignImg==="left") {
                    event.target.style.float = "left";
                    event.target.style.margin = "inherit";
                } else if(window.alignImg==="right") {
                    event.target.style.float = "right";
                    event.target.style.margin = "inherit";
                } else if(window.alignImg==="center") {
                    event.target.style.float = "none";
                    event.target.style.margin = "0 auto";
                }
                alignImgMode(false)
            }
        }
    }); // body

    // Rearrangeable: Once container is init, can create new boxes and they are automatically rearrangeable
    function initSort() {
        $(".grid").sortable({
            items: "> .grid-item",
            cursor: "move",
            handle: ".handle-rearrange",
            helper: "clone",
            revert: true,
            scroll: true,
            // tolerance:"pointer",
            forceHelperSize: true,
            forcePlaceholderSize: true,
            sort(event, ui) {
                const w = ui.helper.width(),
                    h = ui.helper.height();

                ui.placeholder.css("visibility", "visible");
                ui.placeholder.css("height", h);
                ui.placeholder.css("width", w);
                ui.placeholder.css("background-color", "lightred");
            }
        });
    }
    initSort();

    // Future proof persisting boxes. Would find the last box, however can add more implementations as necessary.
    window.lastBox = getLastItemIfExists();

    initCardColorStripVisibility();

    // Capture these before MediumEditor sees them. Its editable key handler runs
    // on the card itself and should not interpret application shortcuts.
    document.addEventListener('keydown', function(e) {
        if (!(e.metaKey || e.ctrlKey)) return;
        updateShortcutPanel(e);
        // [Special + Alt + Backspace] delete card, [Special + Alt + Shift + Backspace] clear canvas.
        // preventDefault keeps the combo from also deleting text inside the card being edited.
        if (e.altKey && (e.key === "Backspace" || e.key === "Delete")) {
            if (isTypingInTextField(e.target)) return;
            e.preventDefault();
            e.stopPropagation();
            if (e.repeat || !document.getElementById("color-dialog").hidden) return;
            if (e.shiftKey) clearCanvas(); else deleteLastBox();
            return;
        }
        if (!(e.shiftKey && !e.altKey)) return;
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            e.stopPropagation();
            cycleCardColor(e.key === "ArrowUp" ? -1 : 1);
        } else if (e.key.toLowerCase() === "d") {
            e.preventDefault();
            e.stopPropagation();
            openCloneDialog();
        }
    }, true);

    // Init modifier keys for changing resizing/rearranging/plain boxes
    document.body.addEventListener('keydown', function(e) {
        if(!e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
            return;
        }

        // Card color cycling intentionally uses the arrow keys, so it must run
        // before modifier keys temporarily switch the visual box mode.
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && !e.altKey && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
            e.preventDefault();
            cycleCardColor(e.key === "ArrowUp" ? -1 : 1);
            return;
        }

        if ((e.metaKey || e.ctrlKey) && e.shiftKey && !e.altKey && e.key.toLowerCase() === "d") {
            e.preventDefault();
            openCloneDialog();
            return;
        }

        console.log({key:e.key});
        function hasKey(key) {
            return key.length===1;
        }
    
        // Resizing vs Rearranging vs Plain
        if ((e.metaKey || e.ctrlKey) && (!e.shiftKey && !e.altKey && !hasKey(e.key))) {
            changeBoxMode("resizable")
            console.log("Try resizing mode")
        } else if ((e.metaKey || e.ctrlKey) && e.shiftKey && (!e.altKey && !hasKey(e.key))) {
            changeBoxMode("rearrange")
            console.log("Try rearranging mode")
        } else { // resets in other cases
            changeBoxMode("plain")
            // console.log("Try plain mode")
        }

        // [Special + Alt + n]
        if ((e.metaKey || e.ctrlKey) && e.altKey && (e.key.toLowerCase()==="n"||e.key.toLowerCase()==="dead")) { // Opt+n is a special character on Mac
            addBox();
        // [Special + Alt + t]
        } else if ((e.metaKey || e.ctrlKey) && e.altKey && (e.key.toLowerCase()==="t"||e.key.toLowerCase()==="†")) { // Opt+n is a special character on Mac
            precheckCanDuplicateBox()();
         
        // [Special + Shift + ?]
        } else if((e.metaKey || e.ctrlKey) && e.shiftKey && hasKey(e.key) && (!e.altKey)) {
            // These can't be simply SPECIAL+P because that usually has other commands

            // Command Palette. 
            if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase()==="p") {
                commandPromptUserOpen(e);
            } else {
                // return;
            }
            // e.preventDefault();
            // e.stopPropagation();

        // [Special + ?]
        } else if((e.metaKey || e.ctrlKey) && !e.shiftKey && hasKey(e.key)) {

            // After copying/pasting, check for and fix broken handles
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==="v")
                setTimeout(fixLayoutHandles, 100);
            else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==="e") {
                slideInPageControls();
                toggleEditPreview();
                $("#btn-toggle-edit-preview").animate({color:"#166534"}, 500, "easeInBounce", function() {
                    $("#btn-toggle-edit-preview").css("color", "")
                })
                setTimeout(()=>{
                    slideOutPageControls();
                }, 4500)
            }

        }
        
    });
    document.body.addEventListener('keyup', function(e) {
        reassertBoxModeVisual();
        if (e.metaKey || e.ctrlKey) updateShortcutPanel(e);
        else hideShortcutPanel();
    });
});

// Init page controls menu showing and hiding
function slideInPageControls() {}

function slideOutPageControls() {}

function setSlideOutPageControls() {}

$(() => {
    document.getElementById("sheet-toolbar").addEventListener("click", (event) => {
        if (event.target.closest(".drawer-toggle, .drawer-panel")) return;
        forceCloseMenu();
    });
    document.addEventListener("click", (event) => {
        if (document.body.classList.contains("is-touring")) return;
        if (event.target.closest && event.target.closest(".sheet-toolbar, .files-panel, .tour-confirm, #tour")) return;
        forceCloseMenu();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") forceCloseMenu();
    });
    window.addEventListener("resize", () => {
        document.querySelectorAll(".drawer-panel").forEach((panel) => {
            if (panel.hidden) return;
            const button = document.querySelector('[aria-controls="' + panel.id + '"]');
            placeDrawer(panel, button);
        });
    });
});

// Autocomplete feature
window.lastTyped = "["
window.selLastFocused = null;
window.selBaseOffset = -1;

// Checked if user typed [], etc
$("body").keypress(function (e) {
    const token = "[]";
    window.lastTyped+=String.fromCharCode(e.which);
   // Always memory cleanup 
   if(window.lastTyped.length>2) {
        window.lastTyped = window.lastTyped.slice(- token.length) // Right
    } 
    var sel = window.getSelection();

    // Always track if clicked away or arrowed away
    // console.log("Previous offset: "+window.selBaseOffset)
    // console.log("Current offset: "+(sel.baseOffset - token.length + 1))

    if(window.lastTyped==="[]" && window.selBaseOffset == sel.baseOffset - token.length + 1) {
        if(confirm("You typed: []\nReplace with checkbox?")) {
            e.preventDefault();
            
                if (sel.rangeCount > 0) {
                    // First, delete the existing selection
                    var range = sel.getRangeAt(0);
                    console.log(range)
                    range.setStart(window.getSelection().focusNode, window.getSelection().focusNode.length-1);
                    range.deleteContents();

                    // After typed text deleted, add element in place
                    var elNode = document.createElement("input");
                    elNode.type = "checkbox";
                    range.insertNode(elNode);
        
                    // Move editing cursor to after added element
                    range.setStartAfter(elNode);
                    range.setEndAfter(elNode); 
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } // if typed token


    // console.log(window.selBaseOffset)
    // console.log(sel.baseOffset)
    window.selLastFocused = sel.baseNode.parentElement;
    window.selBaseOffset = sel.baseOffset;
});

/**
 * Init polling required
 * Resizable
 * Rich text editor
 * Autosave
 * 
 */
function reinitableResizable(isReinit) {
    let nonresizables = $(".grid-item:not(.ui-resizable)");
    if(nonresizables.length) {
        if(isReinit) {
            nonresizables.each((i,el)=>{
                if($(el).resizable( "instance" )) {
                    $(el).resizable("destroy");
                }
            })
        }

        nonresizables.resizable({
            helper: "resizable-helper"
        });
    }
} // reinitableResizable
function reinitableEditor() {
    let newGridsWithoutRichTextControls = document.querySelectorAll('.grid-item:not(.medium-editor-element)');
    if(newGridsWithoutRichTextControls.length) {
        newGridsWithoutRichTextControls.forEach(gridbox=>{ 
            $(gridbox).removeAttr("data-medium-editor-element")
            $(gridbox).removeAttr("data-medium-editor-editor-index")
            $(gridbox).removeAttr("medium-editor-index")

            editor = new MediumEditor(gridbox, {
                targetBlank: true,
                autoLink: true,
                imageDragging: true,
                paste: {
                    /* This was preventing pictures from pasting into box */
                    forcePlainText: false,
                },
                toolbar: {
                    buttons: ["bold", "italic", "underline", "strikethrough", "anchor", "image", "quote", "indent", "outdent", "orderedlist", "unorderedlist", "justifyLeft", "justifyCenter", "justifyRight", "h1", "h2", "h3", "h4", "h5", "h6", "html"]
                }
            }); // forEach
            editor.subscribe("showToolbar", (data,editable)=>{
                var top = $(".medium-editor-toolbar-active").css("top");
                top = parseFloat(top);
                if(top<0) {$(".medium-editor-toolbar-active").css("top", 0);

                }
            })
            restyleNewEditorIcons();
        });
    } // if newGridsWithoutRichTextControls
} // reinitableResizable

function newLinksOpenNewTab() {
    let missedLinks = $("a[target!=_blank]").length;
    if(missedLinks) {
        $("a[target!=_blank]").attr("target", "_blank")
    }

} // newLinksOpenNewTab

$(()=>{
    // Must call 
    reinitableResizable();
    reinitableEditor();
    window.suspendPoll = false; // Will be true to be thread-safe
    // Always have resizable grid items that can have rich text controls
    // This must be init for every new box.

    // Every new box will NOT have ui-resizable class because the class is added after initializing
    // When the new box is init with resizing, it will be init with rich text controls too
    // Every new link will open in new tab (Links open in new window)
    setInterval(() => {
        if(!window.suspendPoll) {
            reinitableResizable(true); // isReinit: Boolean = false
            reinitableEditor();
            newLinksOpenNewTab();
        }
    }, 100);
})

/**
 * Utility functions
 */

function getLastItemIfExists() {
    let hasGridItems = $(".grid").find(".grid-item").length>0;
    if(hasGridItems) {
        return $(".grid").find(".grid-item").last()
    } else {
        return null;
    }
} // getLastItemIfExists

function updateShortcutPanel(event) {
    const panel = document.getElementById("shortcut-panel");
    if (!panel) return;
    const key = event.metaKey ? "⌘" : "Ctrl";
    const keyLabel = document.getElementById("shortcut-panel-key");
    const copy = document.getElementById("shortcut-panel-copy");
    const hint = document.getElementById("shortcut-panel-hint");
    if (!keyLabel || !copy || !hint) return;
    const alt = event.metaKey ? "⌥" : "Alt";
    if (event.altKey) {
        keyLabel.textContent = key + alt + (event.shiftKey ? "⇧" : "");
        if (event.key === "Backspace" || event.key === "Delete") {
            copy.textContent = event.shiftKey ? "Clear canvas" : "Delete card";
            hint.textContent = "Asks to confirm first";
        } else {
            copy.textContent = event.shiftKey ? "⌫ Clear canvas" : "Card actions";
            hint.textContent = event.shiftKey ? "Removes every card" : "⌫ delete · ⇧⌫ clear canvas · N new · T duplicate";
        }
    } else if (!event.shiftKey) {
        keyLabel.textContent = key;
        copy.textContent = "Resize cards";
        hint.textContent = "Hold " + key + "⇧ to reposition · " + key + alt + "⌫ delete card · " + key + alt + "⇧⌫ clear canvas";
    } else {
        keyLabel.textContent = key + "⇧";
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            copy.textContent = "Cycle card color";
            hint.textContent = "↑ previous · ↓ next";
        } else if (event.key.toLowerCase() === "d") {
            copy.textContent = "Clone new card";
            hint.textContent = "Choose style, content, or both";
        } else {
            copy.textContent = "Reposition cards";
            hint.textContent = "D clone · ↑/↓ cycle color";
        }
    }
    panel.classList.add("is-visible");
    panel.setAttribute("aria-hidden", "false");
}

function hideShortcutPanel() {
    const panel = document.getElementById("shortcut-panel");
    if (!panel) return;
    panel.classList.remove("is-visible");
    panel.setAttribute("aria-hidden", "true");
}

/* Card color sequences live outside individual sheets. Cards keep only a
 * sequence id and their current color index, so changing a sequence updates
 * every card that uses it. */
const COLOR_SEQUENCE_STORAGE_KEY = "mosaic_notes___color_sequences";
const DEFAULT_COLOR_SEQUENCES = [{
    id: "default",
    name: "Mosaic",
    colors: ["#fef3c7", "#dbeafe", "#dcfce7", "#fce7f3", "#ede9fe"]
}];

function getColorSequences() {
    try {
        const saved = JSON.parse(localStorage.getItem(COLOR_SEQUENCE_STORAGE_KEY));
        if (Array.isArray(saved) && saved.length && saved.every(sequence => sequence.id && Array.isArray(sequence.colors) && sequence.colors.length)) return saved;
    } catch (error) { /* Start with the built-in sequence if older data is invalid. */ }
    localStorage.setItem(COLOR_SEQUENCE_STORAGE_KEY, JSON.stringify(DEFAULT_COLOR_SEQUENCES));
    return DEFAULT_COLOR_SEQUENCES.map(sequence => ({ ...sequence, colors: [...sequence.colors] }));
}

function saveColorSequences(sequences) {
    localStorage.setItem(COLOR_SEQUENCE_STORAGE_KEY, JSON.stringify(sequences));
    refreshCardColors();
}

function getActiveCard() {
    if (window.lastBox && window.lastBox.length && document.contains(window.lastBox[0])) return window.lastBox;
    window.lastBox = getLastItemIfExists();
    return window.lastBox;
}

function getSequenceForCard($card) {
    const sequences = getColorSequences();
    const storedId = $card.attr("data-color-sequence");
    return sequences.find(sequence => sequence.id === storedId) || sequences[0];
}

function applyCardSequenceColor($card) {
    if (!$card || !$card.length) return;
    const sequence = getSequenceForCard($card);
    let colorIndex = parseInt($card.attr("data-color-index"), 10);
    if (Number.isNaN(colorIndex) || colorIndex < 0) colorIndex = 0;
    colorIndex = colorIndex % sequence.colors.length;
    $card.attr("data-color-sequence", sequence.id);
    $card.attr("data-color-index", colorIndex);
    $card.css("background-color", sequence.colors[colorIndex]);
    if ($card.find(".card-color-strip").length) renderCardColorStrip($card);
}

function refreshCardColors() {
    $(".grid-item[data-color-sequence]").each((_, card) => applyCardSequenceColor($(card)));
}

function setCardSequence(sequenceId, colorIndex) {
    const $card = getActiveCard();
    if (!$card || !$card.length) return;
    $card.attr("data-color-sequence", sequenceId);
    $card.attr("data-color-index", colorIndex || 0);
    applyCardSequenceColor($card);
}

/* Card color strip visibility
 * Desktop: swatches stay hidden until the special key (⌘/Ctrl) is held.
 * iPad/phone (by viewport width): swatches sit behind a collapsed chevron.
 * Both states are body classes so the CSS decides what shows.
 */
const COMPACT_CARD_CONTROLS_QUERY = "(max-width: 1024px)";

function initCardColorStripVisibility() {
    const compactQuery = window.matchMedia(COMPACT_CARD_CONTROLS_QUERY);
    const syncCompactWidth = () => document.body.classList.toggle("is-compact-width", compactQuery.matches);
    syncCompactWidth();
    if (compactQuery.addEventListener) compactQuery.addEventListener("change", syncCompactWidth);
    else compactQuery.addListener(syncCompactWidth); // Older Safari

    const syncModifier = e => document.body.classList.toggle("is-modifier-held", !!(e.metaKey || e.ctrlKey));
    const releaseModifier = () => document.body.classList.remove("is-modifier-held");
    window.addEventListener("keydown", syncModifier, true);
    window.addEventListener("keyup", syncModifier, true);
    // Keyup is missed when focus leaves mid-press (e.g. ⌘Tab), so don't leave swatches stuck on.
    window.addEventListener("blur", releaseModifier);
    document.addEventListener("visibilitychange", () => { if (document.hidden) releaseModifier(); });
}

function toggleCardColorStrip(element) {
    const strip = element.closest(".card-color-strip");
    if (!strip) return;
    const isExpanded = strip.classList.toggle("is-expanded");
    element.setAttribute("aria-expanded", isExpanded ? "true" : "false");
    element.setAttribute("aria-label", isExpanded ? "Hide card colors" : "Show card colors");
}

function renderCardColorStrip($card) {
    const sequence = getSequenceForCard($card);
    const activeIndex = parseInt($card.attr("data-color-index"), 10) || 0;
    const strip = $card.find(".card-color-strip");
    if (!strip.length) return;
    const isExpanded = strip.hasClass("is-expanded");
    const toggle = `<button type="button" contenteditable="false" class="card-color-strip__toggle" aria-expanded="${isExpanded}" aria-label="${isExpanded ? "Hide" : "Show"} card colors" onclick="toggleCardColorStrip(this)"><i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>`;
    strip.html(toggle + sequence.colors.map((color, index) => `<button type="button" contenteditable="false" class="card-color-strip__swatch ${index === activeIndex ? "is-selected" : ""}" style="--swatch:${color}" aria-label="Set card color ${index + 1} of ${sequence.colors.length}" title="${color}" onclick="setCardSequenceForElement(this, '${sequence.id}', ${index})"></button>`).join(""));
}

function setCardSequenceForElement(element, sequenceId, colorIndex) {
    const $card = $(element).closest(".grid-item");
    if (!$card.length) return;
    window.lastBox = $card;
    $card.attr("data-color-sequence", sequenceId);
    $card.attr("data-color-index", colorIndex);
    applyCardSequenceColor($card);
}

function showCardColorStrip($card) {
    if (!$card || !$card.length) return;
    $(".card-color-strip").remove();
    const sequence = getSequenceForCard($card);
    $card.attr("data-color-sequence", sequence.id);
    if ($card.attr("data-color-index") === undefined) $card.attr("data-color-index", 0);
    $card.append('<div class="card-color-strip" contenteditable="false" aria-label="Card color sequence"></div>');
    applyCardSequenceColor($card);
}

function cycleCardColor(direction) {
    const $card = getActiveCard();
    if (!$card || !$card.length) {
        displayMessage("Choose a card", "Click a card before cycling its color.", "info");
        return;
    }
    const sequence = getSequenceForCard($card);
    const currentIndex = parseInt($card.attr("data-color-index"), 10) || 0;
    $card.attr("data-color-sequence", sequence.id);
    $card.attr("data-color-index", (currentIndex + direction + sequence.colors.length) % sequence.colors.length);
    applyCardSequenceColor($card);
    displayMessage("Color changed", sequence.name + " · " + ((parseInt($card.attr("data-color-index"), 10)) + 1) + " of " + sequence.colors.length, "info", 1200);
}

function closeColorDialog() {
    window.pendingConfirmAction = null;
    const dialog = document.getElementById("color-dialog");
    dialog.hidden = true;
    dialog.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", colorDialogKeyHandler);
}

function openColorDialog(html, keyHandler) {
    const dialog = document.getElementById("color-dialog");
    document.getElementById("color-dialog-content").innerHTML = html;
    dialog.hidden = false;
    dialog.setAttribute("aria-hidden", "false");
    window.colorDialogAction = keyHandler || null;
    document.addEventListener("keydown", colorDialogKeyHandler);
    const firstFocus = dialog.querySelector("button, input, select");
    if (firstFocus) firstFocus.focus();
}

/* In-app confirmation (reuses the color dialog sheet). Cancel, ×, and Escape
 * all close without running the action. */
function confirmDestructiveAction(title, message, confirmLabel, onConfirm) {
    openColorDialog(`<h2 id="color-dialog-title">${title}</h2>
        <p class="color-dialog__lede">${message}</p>
        <div class="color-dialog__actions"><button type="button" class="btn-quiet" onclick="closeColorDialog()">Cancel</button><button type="button" class="btn-ink btn-danger" onclick="runPendingConfirmAction()">${confirmLabel}</button></div>`, null);
    window.pendingConfirmAction = onConfirm;
}

function runPendingConfirmAction() {
    const action = window.pendingConfirmAction;
    closeColorDialog();
    if (action) action();
}

function isTypingInTextField(element) {
    if (!element || !element.closest) return false;
    if (element.closest("input, textarea, select")) return true;
    // Cards are contenteditable themselves; the shortcut is meant to work on them.
    return element.isContentEditable && !element.closest(".grid-item");
}

function colorDialogKeyHandler(event) {
    if (event.key === "Escape") { closeColorDialog(); return; }
    if (window.colorDialogAction && !event.metaKey && !event.ctrlKey && !event.altKey) window.colorDialogAction(event);
}

function openCardColorSwitch() {
    const $card = getActiveCard();
    if (!$card || !$card.length) {
        displayMessage("Choose a card", "Click a card before changing its color.", "info");
        return;
    }
    const active = getSequenceForCard($card);
    const colorIndex = parseInt($card.attr("data-color-index"), 10) || 0;
    const sequences = getColorSequences();
    openColorDialog(`
        <h2 id="color-dialog-title">Card color</h2>
        <p class="color-dialog__lede">Choose a sequence, then a color. Use <kbd>⌘⇧↑</kbd> and <kbd>⌘⇧↓</kbd> to cycle this card later.</p>
        <label class="color-dialog__label" for="card-color-sequence">Sequence</label>
        <select id="card-color-sequence" class="color-dialog__select" onchange="renderCardColorChoices(this.value)">
            ${sequences.map(sequence => `<option value="${sequence.id}" ${sequence.id === active.id ? "selected" : ""}>${sequence.name}</option>`).join("")}
        </select>
        <div id="card-color-choices" class="color-swatches"></div>
        <div class="color-dialog__actions"><button type="button" class="btn-quiet" onclick="openColorSequenceSettings()">Manage sequences</button><button type="button" class="btn-ink" onclick="closeColorDialog()">Done</button></div>`, null);
    renderCardColorChoices(active.id, colorIndex);
}

function renderCardColorChoices(sequenceId, selectedIndex) {
    const sequence = getColorSequences().find(item => item.id === sequenceId);
    const $card = getActiveCard();
    if (!sequence || !$card || !$card.length) return;
    const isChangingSequence = $card.attr("data-color-sequence") !== sequence.id;
    if (isChangingSequence) setCardSequence(sequence.id, 0);
    const currentIndex = isChangingSequence ? 0 : (selectedIndex === undefined ? (parseInt($card.attr("data-color-index"), 10) || 0) : selectedIndex);
    document.getElementById("card-color-choices").innerHTML = sequence.colors.map((color, index) => `<button type="button" class="color-swatch ${index === currentIndex ? "is-selected" : ""}" style="--swatch:${color}" aria-label="Use ${color}" title="${color}" onclick="setCardSequence('${sequence.id}', ${index}); renderCardColorChoices('${sequence.id}', ${index})"></button>`).join("");
}

function openColorSequenceSettings() {
    const sequences = getColorSequences();
    openColorDialog(`
        <h2 id="color-dialog-title">Color sequences</h2>
        <p class="color-dialog__lede">These sequences are available to every card in the app.</p>
        <div id="sequence-editor">${sequences.map((sequence, index) => renderSequenceEditor(sequence, index)).join("")}</div>
        <div class="color-dialog__actions"><button type="button" class="btn-quiet" onclick="addColorSequence()">Add sequence</button><button type="button" class="btn-ink" onclick="closeColorDialog()">Done</button></div>`, null);
}

function renderSequenceEditor(sequence, index) {
    return `<section class="sequence-editor" data-sequence-index="${index}">
        <div class="sequence-editor__head"><label class="color-dialog__label">Name <input class="sequence-name" value="${escapeHtml(sequence.name)}" onchange="updateSequenceName(${index}, this.value)"></label>${index ? `<button type="button" class="btn-link-danger" onclick="deleteColorSequence(${index})">Delete</button>` : ""}</div>
        <div class="sequence-editor__colors">${sequence.colors.map((color, colorIndex) => `<label class="sequence-color"><input type="color" value="${color}" onchange="updateSequenceColor(${index}, ${colorIndex}, this.value)"><button type="button" aria-label="Remove ${color}" onclick="deleteSequenceColor(${index}, ${colorIndex})">×</button></label>`).join("")}<button type="button" class="add-color" onclick="addSequenceColor(${index})">+</button></div>
    </section>`;
}

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character])); }
function updateSequences(mutator) { const sequences = getColorSequences(); mutator(sequences); saveColorSequences(sequences); openColorSequenceSettings(); }
function updateSequenceName(index, name) { updateSequences(sequences => { sequences[index].name = name.trim() || "Untitled sequence"; }); }
function updateSequenceColor(index, colorIndex, color) { updateSequences(sequences => { sequences[index].colors[colorIndex] = color; }); }
function addSequenceColor(index) { updateSequences(sequences => { sequences[index].colors.push("#ffffff"); }); }
function deleteSequenceColor(index, colorIndex) { updateSequences(sequences => { if (sequences[index].colors.length > 1) sequences[index].colors.splice(colorIndex, 1); }); }
function addColorSequence() { updateSequences(sequences => { sequences.push({ id: "sequence-" + Date.now(), name: "New sequence", colors: ["#fef3c7", "#dbeafe", "#dcfce7"] }); }); }
function deleteColorSequence(index) { updateSequences(sequences => { if (sequences.length > 1) sequences.splice(index, 1); }); }

function cardContentHtml($card) {
    const $copy = $card.clone();
    $copy.find(".handle-rearrange, .ui-resizable-handle, .card-color-strip").remove();
    return $copy.html();
}

function findNearestCard($source) {
    const sourceRect = $source[0].getBoundingClientRect();
    const cards = $(".grid-item").not($source).toArray();
    if (!cards.length) return null;
    const isColumnFlow = $(".grid").css("flex-flow").indexOf("column") === 0;
    let best = null;
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const primaryDistance = isColumnFlow ? rect.top - sourceRect.top : rect.left - sourceRect.left;
        const crossDistance = isColumnFlow ? Math.abs(rect.left - sourceRect.left) : Math.abs(rect.top - sourceRect.top);
        const forwardPenalty = primaryDistance >= -4 ? 0 : 100000;
        const score = forwardPenalty + Math.abs(primaryDistance) + crossDistance * 1.5;
        if (!best || score < best.score) best = { card: $(card), score };
    });
    return best ? best.card : null;
}

function openCloneDialog() {
    const $source = getActiveCard();
    if (!$source || !$source.length) { displayMessage("Choose a card", "Click a card before cloning.", "info"); return; }
    openColorDialog(`
        <h2 id="color-dialog-title">Clone to next card</h2>
        <p class="color-dialog__lede">A new card will be inserted immediately after this one, following the current layout.</p>
        <div class="clone-choices">
            <button type="button" onclick="cloneCardToNeighbor('style')"><strong>Style only</strong><span><kbd>S</kbd> All visual settings</span></button>
            <button type="button" onclick="cloneCardToNeighbor('content')"><strong>Content only</strong><span><kbd>C</kbd> Text, media, links, and metadata</span></button>
            <button type="button" onclick="cloneCardToNeighbor('both')"><strong>Style and content</strong><span><kbd>B</kbd> Exact card clone</span></button>
        </div>`, event => {
            const key = event.key.toLowerCase();
            if (["s", "c", "b"].includes(key)) { event.preventDefault(); cloneCardToNeighbor(key === "s" ? "style" : key === "c" ? "content" : "both"); }
        });
}

function cloneCardToNeighbor(kind) {
    const $source = getActiveCard();
    if (!$source || !$source.length) return;
    addBox($source.css("width"), $source.css("height"), "&nbsp;");
    const $target = window.lastBox;
    $target.insertAfter($source);
    if (kind === "style" || kind === "both") {
        $target.attr("style", $source.attr("style") || "");
        $target.attr("class", $source.attr("class") || "grid-item");
        ["data-color-sequence", "data-color-index"].forEach(attribute => {
            const value = $source.attr(attribute);
            if (value === undefined) $target.removeAttr(attribute); else $target.attr(attribute, value);
        });
    }
    if (kind === "content" || kind === "both") $target.html('<span class="handle-rearrange ui-icon ui-icon-arrow-4-diag"></span>' + cardContentHtml($source));
    applyCardSequenceColor($target);
    showCardColorStrip($target);
    window.lastBox = $target;
    closeColorDialog();
    displayMessage("Card cloned", kind === "both" ? "A new card was created with its style and content." : (kind === "style" ? "A new card was created with its style." : "A new card was created with its content."), "green");
}

function toggleAllClass(querySelected, clssName) {
    document.querySelectorAll(querySelected).forEach(el=>el.classList.toggle(clssName))
}

function closeMenu() {
    forceCloseMenu();
}

function forceCloseMenu() {
    document.querySelectorAll(".drawer-panel").forEach(el => { el.hidden = true; });
    document.querySelectorAll(".drawer-toggle").forEach(el => el.setAttribute("aria-expanded", "false"));
    document.querySelectorAll(".drawer-group-body").forEach(el => { el.hidden = true; });
    document.querySelectorAll(".drawer-heading-btn").forEach(el => el.setAttribute("aria-expanded", "false"));
}

function toggleDrawerGroup(button) {
    const body = button.nextElementSibling;
    if (!body) return;
    const opening = body.hidden;
    document.querySelectorAll(".drawer-group-body").forEach(el => { el.hidden = true; });
    document.querySelectorAll(".drawer-heading-btn").forEach(el => el.setAttribute("aria-expanded", "false"));
    if (!opening) return;
    body.hidden = false;
    button.setAttribute("aria-expanded", "true");
    const panel = button.closest(".drawer-panel");
    const trigger = panel ? document.querySelector('[aria-controls="' + panel.id + '"]') : null;
    placeDrawer(panel, trigger);
}

function toggleDrawer(id) {
    const panel = document.getElementById(id);
    const button = document.querySelector('[aria-controls="' + id + '"]');
    if (!panel) return;
    const opening = panel.hidden;
    forceCloseMenu();
    if (!opening) return;
    panel.hidden = false;
    if (button) button.setAttribute("aria-expanded", "true");
    placeDrawer(panel, button);
}

function placeDrawer(panel, button) {
    if (!panel || panel.hidden || !button) return;
    const margin = 12;
    const gap = 6;
    const trigger = button.getBoundingClientRect();
    const width = panel.offsetWidth;
    let left = trigger.right - width;
    if (left < margin) left = margin;
    if (left + width > window.innerWidth - margin) {
        left = Math.max(margin, window.innerWidth - margin - width);
    }
    let top = trigger.bottom + gap;
    const maxHeight = Math.max(120, window.innerHeight - top - margin);
    panel.style.maxHeight = maxHeight + "px";
    panel.style.left = Math.round(left) + "px";
    panel.style.top = Math.round(top) + "px";
}

/**
 * 
 * displayMessage("Success", "This passes", "green")
 * displayMessage("Error", "This is error information", "red")
 * displayMessage("Info", "This is information", "info")
 * 
 */
function displayMessage(heading, message, colorTheme = "green", duration = 2000) {
    $("html, body").animate({ scrollTop: 0 }, "fast");

    switch(colorTheme.toLowerCase()) {
        case "green":
            $("#msg").removeClass("green red info").addClass("green")
            break;
        case "red":
            $("#msg").removeClass("green red info").addClass("red")    
            break;
        case "info":
            $("#msg").removeClass("green red info").addClass("info")    
            break;
        default:
            $("#msg").removeClass("green red info").addClass("green")    
    } // color Theme

    $("#msg-heading").html(heading)
    $("#msg-message").html(message)
    $("#msg").slideDown("slow", function() {
        setTimeout(()=>{
            $("#msg").fadeOut("slow", ()=>{
                $("#msg").slideUp("slow");
            });
        }, duration)
    });
}
$("#msg").on("click", function() {
    $("#msg").slideDown("fast", function() {
        setTimeout(()=>{
            $("#msg").fadeOut("slow", ()=>{
                $("#msg").slideUp("slow");
            });
        }, 10)
    });
});


/**
 * Low level implementation for core methods: Change box mode into resizable|rearrange|plain
 */


/**
 * 
 * function changeBoxModeVisual
 * Core implementation. User clicks toggle through different layout states: resizable|rearrange|plain
 * @param {string} mode resizable|rearrange|plain  
 * 
 */
window.cycledCornerMode = 0;
function changeBoxModeVisual() {
    console.log("changeBoxModeVisual")

    // let $indicator = $("#indicator-box-mode")
    // let cycled = $indicator.attr("data-cycled");
    let cycled = window.cycledCornerMode;
    cycled = parseInt(cycled);
    cycled += 1;
    cycled = cycled % 3;

    // $indicator.attr("data-cycled", cycled);
    window.cycledCornerMode = cycled;

    switch(cycled) {
        case 0:
            changeBoxMode("plain");
                console.log("-> plain")
                break;
        case 1:
            changeBoxMode("resizable");
            console.log("-> resizable")
            break;
        case 2:
            changeBoxMode("rearrange");
            console.log("-> rearrange")
            break;
    }
    syncBoxModeLabel();
}

function syncBoxModeLabel() {
    const names = ["Plain", "Resize", "Rearrange"];
    const label = document.getElementById("box-mode-label");
    if (label) label.textContent = names[window.cycledCornerMode] || "Plain";
}

/**
 * 
 * function reassertBoxModeVisual
 * Low level implementation. Refer to visual indicator to return to the desired box mode.
 * @param {string} mode resizable|rearrange|plain  
 * 
 */
function reassertBoxModeVisual() {
    const cycled = window.cycledCornerMode || 0;
    const modes = ["plain", "resizable", "rearrange"];
    changeBoxMode(modes[cycled] || "plain");
}


/**
 * 
 * function changeBoxMode
 * Low level implementation
 * @param {string} mode resizable|rearrange|plain  
 * 
 */
function changeBoxMode(mode) {

    switch (mode) {
        case "resizable":
            $("#box-mode").html(
                `
                    .grid-item .handle-rearrange {
                        display: none !important;
                    }

                    .grid-item .ui-resizable-e,
                    .grid-item .ui-resizable-s,
                    .grid-item .ui-resizable-se {
                        display: block !important;
                    }
                `
            )
            break;
        case "rearrange":
            $("#box-mode").html(
                `
                    .grid-item .handle-rearrange {
                        display: block !important;
                    }

                    .grid-item .ui-resizable-e,
                    .grid-item .ui-resizable-s,
                    .grid-item .ui-resizable-se {
                        display: none !important;
                    }
                `
            )
            break;
        case "plain":
            $("#box-mode").html(
                `
                    .grid-item .handle-rearrange {
                        display: none !important;
                    }

                    .grid-item .ui-resizable-e,
                    .grid-item .ui-resizable-s,
                    .grid-item .ui-resizable-se {
                        display: none !important;
                    }
                `
            )
            break;
        default:
    }

} // changeBoxMode

/**
 * 
 * Setting methods to change box appearance and behaviors
 */

window.pageView = 0;
function changePageView(at=-1) {
    if(at===-1) window.pageView++;
    else window.pageView = parseInt(at);

    switch(window.pageView) {
        case 0:
            $("body").css("width", "8.5in")
            $("body").css("max-height", "11in")
            $("body").css("max-height", "1200vh")
            $(".grid").css("min-width", "8.5in")
            $(".grid").css("min-height", "11in")
            $(".grid").css("max-height", "1200vh")
            $(".grid").css("flex-flow", "row wrap")
            $(".grid").css("overflow", "scroll")
            console.log("Changed view to: Printing Paper")
            localStorage.setItem("mosaic_notes___page_view", 0)
            break;
        case 1:
            $("body").css("width", "8.5in")
            $("body").css("max-height", "11in")
            $(".grid").css("min-width", "8.5in")
            $(".grid").css("min-height", "11in")
            $(".grid").css("max-height", "11in")
            $(".grid").css("flex-flow", "column wrap")
            $(".grid").css("overflow", "scroll");
            console.log("Changed view to: Mosaic Paper")
            localStorage.setItem("mosaic_notes___page_view", 1)
            break;
        case 2:
            $("body").css("width", "100vw")
            $("body").css("min-height", "100vh")
            $("body").css("max-height", "150vh")
            $(".grid").css("min-width", "100vw")
            $(".grid").css("min-height", "100vh")
            $(".grid").css("max-height", "100vh") // Previously 150vh
            $(".grid").css("flex-flow", "column wrap")
            $(".grid").css("overflow", "scroll")
            console.log("Changed view to: Mosaic Screen")
            localStorage.setItem("mosaic_notes___page_view", 2)
            break;
        default:
            window.pageView = -1;
            changePageView()
            return;
    }
    syncPageViewLabel();
}

function syncPageViewLabel() {
    const names = ["Printing paper", "Mosaic paper", "Mosaic screen"];
    const label = document.getElementById("page-view-label");
    if (label) label.textContent = names[window.pageView] || "Printing paper";
}

function toggleEditPreview() {
    $('[contenteditable]').attr('contenteditable', $('[contenteditable]').eq(0).attr('contenteditable')==="false"?true:false)
    const btn = document.getElementById("btn-toggle-edit-preview");
    if (!btn) return;
    if (btn.classList.contains("is-preview")) {
        btn.classList.remove("is-preview");
        btn.textContent = "Edit";
    } else {
        btn.classList.add("is-preview");
        btn.textContent = "Preview";
    }
}

function addBox(width = "130px", height = "100px", html = "&nbsp;") {
    html = `<span class="handle-rearrange ui-icon ui-icon-arrow-4-diag"></span>` + html;
    const $box = $(`<div class="grid-item unreset rounded-lg" contenteditable="true" style="width:${width}; height:${height}">${html}</div>`);
    $(".grid").append($box);
    window.lastBox = $box;
    applyCardSequenceColor($box);
    showCardColorStrip($box);
    $box.trigger("focus")
}

function precheckCanDuplicateBox() {
    if (window.lastBox == null) {
        window.lastBox = getLastItemIfExists();
    }
    
    if (window.lastBox !== null) {
        const options = [window.lastBox.width() + "px", window.lastBox.height() + "px", window.lastBox.html()]
        addBox(...options)
    } else {
        alert("Error: You never interacted with any boxes. No recent box to duplicate.")
    }
}

function deleteLastBox() {
    const $card = getActiveCard();
    if (!$card || !$card.length) {
        displayMessage("No card to delete", "The canvas has no cards.", "info");
        return;
    }
    const preview = $card.text().replace(/\s+/g, " ").trim().substr(0, 50);
    confirmDestructiveAction("Delete this card?", preview ? `“${escapeHtml(preview)}…”` : "This card is empty.", "Delete card", () => {
        $card.remove();
        window.lastBox = null;
        closeMenu();
        // Keep the open file in sync so the card doesn't come back on reload.
        if (window.PERSIST.pollFile) saveBodyHTML(window.PERSIST.pollFile);
        displayMessage("Card deleted", "", "green", 1200);
    });
}

function clearCanvas() {
    const count = $(".grid .grid-item").length;
    const savedNote = window.PERSIST.pollFile ? ` Your saved file “${escapeHtml(window.PERSIST.pollFile)}” is left as it was.` : "";
    confirmDestructiveAction("Clear the canvas?", `This removes all ${count} card${count === 1 ? "" : "s"}.${savedNote}`, "Clear canvas", () => {
        $(".grid").html("");
        window.lastBox = null;
        closeMenu();
        window.PERSIST.pollFile = "";
    });
}

function resetCanvas(force) {
    if (force || confirm("Reset canvas. Are you sure?")) {
        $(".grid").html("");
        let html1 = $("#template-starter-box-1").html()
        let html2 = $("#template-starter-box-2").html()
        let html3 = $("#template-starter-box-3").html()
        addBox("33%", "338px", html1)
        addBox("33%", "338px", html2)
        addBox("33%", "338px", html3)
        window.lastBox = getLastItemIfExists();
        closeMenu();
        window.PERSIST.pollFile = "";
    }
}

function changeGapGlobal(querySelected, gap) {
    const newGapStyle = `${querySelected} {
        gap: ${gap}
    }`
    $("#dynamic-style-block--gap").remove();
    $("body").append($(`<style id="dynamic-style-block--gap"></style>`).html(newGapStyle))
}

function changePaddingGlobal(querySelected, gap) {
    const newGapStyle = `${querySelected} {
        padding: ${gap}
    }`
    $("#dynamic-style-block--gap").remove();
    $("body").append($(`<style id="dynamic-style-block--gap"></style>`).html(newGapStyle))
}

function toggleLastBoxBorders() {
    if (window.lastBox == null) {
        window.lastBox = getLastItemIfExists();
    }

    if (window.lastBox !== null) {
        window.lastBox.toggleClass("border-0");
    } else {
        alert("Error: You haven't interacted with any current boxes. No box to toggle borders with.")
    }
} // toggleLastBoxBorders

function changeBorderLength() {
    if (window.lastBox == null) {
        window.lastBox = getLastItemIfExists();
    }

    if (window.lastBox !== null) {
        var borderLength = window.lastBox.css("border-width")?window.lastBox.css("border-width"):"1px";
        var newLength = prompt("", borderLength);
        if(!newLength) return;
        else if(!newLength.includes("px")) {
            newLength += "px";
        }
        window.lastBox.css("border-width", newLength);
    } else {
        alert("Error: You haven't interacted with any current boxes. No box to toggle borders with.")
    }
} // changeBorderLength

function changeBorderColor(event) {
    event.preventDefault();
    event.stopPropagation();
    if (window.lastBox == null) {
        window.lastBox = getLastItemIfExists();
    }

    if (window.lastBox !== null) {
        const color = event.target.value;
        window.lastBox.css("border-color", color);
    } else {
        alert("Error: You haven't interacted with any current boxes. No box to toggle borders with.")
    }
} // changeBorderColor

function changeBackgroundColor(event) {
    event.preventDefault();
    event.stopPropagation();
    if (window.lastBox == null) {
        window.lastBox = getLastItemIfExists();
    }

    if (window.lastBox !== null) {
        const color = event.target.value;
        window.lastBox.css("background-color", color);
    } else {
        alert("Error: You haven't interacted with any current boxes. No box to change background color with.")
    }
} // changeBackgroundColor

function changeOpacityBox(event) {
    if (window.lastBox == null) {
        window.lastBox = getLastItemIfExists();
    }
    if(window.lastBox == null) {
        return;
    }


    let opacity = prompt("Enter opacity percent 0-100. Decimals are allowed, eg. 50.5");


    if(opacity===null) {
        return;
    }

    opacity = parseFloat(opacity);
    if(isNaN(opacity)) {
        return;
    }


    if (window.lastBox !== null) {
        window.lastBox.css("opacity", opacity/100);
    } else {
        alert("Error: You haven't interacted with any current boxes. No box to change opacity with.")
    }


} // changeOpacityBox

window.cycledOpacityBox = 0;
function toggleLowOpacityBox() {
    console.log("toggleLowOpacityBox")
    if(window.cycledOpacityBox===0) { // on 1 we hide
        $(".grid-item").each((i,el)=>{

            let anOpacity = el.style.opacity; // which will always exist
            anOpacity = parseFloat(anOpacity);
            if(!isNaN(anOpacity)) {
                if(anOpacity<0.5) {
                    el.classList.add("hidden-by-opacity");
                }
            }
        });
        window.cycledOpacityBox = 1;
    } else {
        $(".hidden-by-opacity").removeClass("hidden-by-opacity")
        window.cycledOpacityBox = 0;
    }

}

function fixLayoutHandles() {
    console.log("fixLayoutHandles")

    window.suspendPoll = true;
    let length = $(".grid").find(".grid-item").length;
    $(".grid").find(".grid-item").each((i,el)=>{
        let $el = $(el);
        $el.find(".ui-resizable-handle").remove();
        if($el.hasClass("ui-resizable")) {
            $el.removeClass("ui-resizable");
        }
        if($el.hasClass("medium-editor-element")) {
            $el.removeClass("medium-editor-element");
        }

        if($el.find(".handle-rearrange").length==0) {
            $el.append($(`<span class="handle-rearrange ui-icon ui-icon-arrow-4-diag ui-sortable-handle"></span>`));
        }
        // Remove e/s/se because sometimes they dont get removed even though they share class with ui-resizable-handle, and not having them removed can cause resizing to stop working
        let $leftoverGlitched = $el.find(".ui-resizable-e, .ui-resizable-s, .ui-resizable-se");
        if($leftoverGlitched.length>0) {
            $leftoverGlitched.remove();
        }
        if(i==length-1) {
            setTimeout(()=>{
                window.suspendPoll = false;
            }, 200);
        }
    });
} // fixLayoutHandles

function resizeImgMode(willResize) {
    if(willResize) {
        $("#dynamic-style-img")[0].innerHTML = `
            img {
                cursor: alias;
            }
        `;
        window.resizingImg = true;
    } else {
        $("#dynamic-style-img")[0].innerHTML = ``
        window.resizingImg = false;
    }
} // resizeImgMode

function alignImgMode(alignment) {
    if(alignment && alignment.length) {
        $("#dynamic-style-img")[0].innerHTML = `
            img {
                cursor: alias;
            }
        `;
        window.alignImg = alignment;
    } else {
        $("#dynamic-style-img")[0].innerHTML = ``
        window.alignImg = "";
    }
} // alignImgMode




/**
 * 
 * Command prompt user opens
 * commandPromptUserOpen: User clicks or presses shortcut key for command prompt to open
 * commandPromptProcessor: User had typed in command, and now we process what the command is, and what to do next
 */
function commandPromptUserOpen(event) {
    // Prevent the web browser's command palette from showing up if in Developer Mode while we are using our app's command palette shortcut
   event.preventDefault();

    // Opem the UI for command palette
    $("#command-prompt").dialog("open");
    setTimeout(()=>{
        $("#command-prompt-cmd").focus();
    }, 500)
} // commandPromptUserOpen
function commandPromptProcessor(cmd) {
    if(cmd) {
        if(cmd==="save") {
            let localStorageKey = PERSIST.pollFile;
            if(localStorageKey) {
                saveBodyHTML(localStorageKey);
                displayMessage("Saved!", `Saved '${localStorageKey}'. Next session you can revisit with either load or open: 'open ${localStorageKey}'`, "green", 5000);
            } else {
                displayMessage("Error", `No recently opened or saved file to refer to. Please type the save command followed by a filename. Then you may run the shorter \`save\` command on the same session.`, "red", 7000);
            }
        } else if(cmd.includes("save ")) {
            let localStorageKey = cmd.split(" ")[1];
            saveBodyHTML(localStorageKey);
            displayMessage("Saved!", `Saved '${cmd.split(" ")[1]}'. Next session you can revisit with either load or open: 'open ${cmd.split(" ")[1]}'`, "green", 5000);
        } else if(cmd.includes("load ")) {
            let localStorageKey = cmd.split(" ")[1];
            loadBodyHTML(localStorageKey)
        } else if(cmd.includes("open ")) {
            let localStorageKey = cmd.split(" ")[1];
            loadBodyHTML(localStorageKey)
        } else if(cmd.indexOf("export")===0) {
            exportBodyHTML();
            displayMessage("Exported!", `Open <a href='https://developer.chrome.com/docs/devtools/open/' target='_blank'>DevTools console</a> for the content text. On a separate device or browser, you can 'import {contents}'`, "green", 5000);
        } else if(cmd.includes("import ")) {
            const importedContents = cmd.substr(7)
            importBodyHTML(importedContents);
        } else if(cmd.indexOf("resize img")===0) {
            displayMessage("Instructions", "Click an image you want to resize. Future version will allow click and dragging to resize.", "info", 5000)
            resizeImgMode(true);
        } else if(cmd.indexOf(" img")!=-1 && (cmd.indexOf("center")!=-1 | cmd.indexOf("left")!=-1 | cmd.indexOf("right")!=-1)) {
            let alignment = (()=>{
                if(cmd.indexOf("center")!=-1) return "center"
                else if(cmd.indexOf("left")!=-1) return "left"
                else if(cmd.indexOf("right")!=-1) return "right"
                else return "error"
            })()
            if(alignment!=="error") {
                displayMessage("Instructions", `Click an image you want to align ${alignment}`, "info", 2000)
                alignImgMode(alignment);
            } else {
                displayMessage("Error", `Something went wrong. Alignment unable to set.`, "error", 2500)
            }
        } else if(cmd.indexOf("expand")===0) {
            let w = prompt("Add width in px?");
            let h = prompt("Add height in px?");
            w=parseInt(w);
            h=parseInt(h);

            $("#grid-dynamically-expand").html(`
                .grid-dynamically-expand {
                    width: ${ $("body").width()+w+"px" } !important;
                    height: ${ $("body").height()+h+"px" } !important;
                }
            `);

        } else if(cmd.indexOf("list files")===0) {
            if (typeof openFilesPanel === "function") openFilesPanel();
            console.log(JSON.stringify(listSavedFiles()));
        }
    }
} // commandPromptProcessor
