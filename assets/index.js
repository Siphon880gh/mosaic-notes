
/** 
 * Init Process
 * Warn user if on mobile
 * lastBox: Tracks the most recent box for toggling borders, etc settings
 * Init sorting makes items able to rearrange via handle icon
 * Future proof persisting boxes. Would find the last box, however can add more implementations as necessary.
 * Init modifier keys for changing resizing/rearranging/plain boxes
 */
$(()=>{
    // Warn user if on mobile that this is a Desktop app
    if(window.innerWidth < 816) {
        alert("Advisory: You are on a small window. The purpose of this app is to create a boxed notes template that prints on a 11 x 8.5 inches paper. Then you would use it for work or school. Please visit on a bigger screen.")
    }

    // Track last grid item for duplication, deletion, modifying settings: When user clicks a box
    window.lastBox = null;
    $("body").on("click", event => {
        const gridItem = event.target.matches(".grid-item") ? event.target : event.target.closest(".grid-item");
        if (gridItem) {
            console.group("I'm at: ")
            console.log(gridItem);
            console.groupEnd();
            window.lastBox = $(gridItem);
        }
    })

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

    // Init modifier keys for changing resizing/rearranging/plain boxes
    document.body.addEventListener('keydown', function(e) {
        // console.log(e.shiftKey); // shift
        // console.log(e.ctrlKey); // ctrl
        // console.log(e.altKey); // alt
        // console.log(e.metaKey); // command/windows (meta) key
        // console.log(e.key); // any letter, number, etc
        
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase()==="p")
            commandPrompt(e);
        else if ((e.metaKey || e.ctrlKey) && e.shiftKey)
            changeBoxMode("rearrange")
        else if ((e.metaKey || e.ctrlKey) && !e.shiftKey)
            changeBoxMode("resizable")
        else if (!e.metaKey && !e.ctrlKey && !e.shiftKey)
            changeBoxMode("plain")
    });
    document.body.addEventListener('keyup', function(e) {
        reassertBoxModeVisual();
    });
});


/**
 * Init polling required
 * Resizable
 * Rich text editor
 * Modifier keys to switch between resize/rearrange/plain mode
 * 
 */

$(()=>{
    // Always have resizable grid items that can have rich text controls
    // This must be init for every new box.
    // Every new box will not have ui-resizable class automatically because they need to init individually
    setInterval(() => {
        $(".grid-item:not(.ui-resizable)").resizable();
        
        let newGridsWithoutRichTextControls = document.querySelectorAll('.grid-item:not(.medium-editor-element)');
        if(newGridsWithoutRichTextControls.length) {
            editor = new MediumEditor(newGridsWithoutRichTextControls, {
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
            });
            restyleNewEditorIcons();
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

function toggleAllClass(querySelected, clssName) {
    document.querySelectorAll(querySelected).forEach(el=>el.classList.toggle(clssName))
}

function displayMessage(message) {
    alert(message);
}


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
function changeBoxModeVisual() {
    let $indicator = $("#indicator-box-mode")
    let cycled = $indicator.attr("data-cycled");
    cycled = parseInt(cycled);
    cycled += 1;
    cycled = cycled % 3;

    $indicator.attr("data-cycled", cycled);

    switch(cycled) {
        case 0:
            changeBoxMode("plain");
            break;
        case 1:
            changeBoxMode("resizable");
            break;
        case 2:
            changeBoxMode("rearrange");
            break;
    }
}

/**
 * 
 * function reassertBoxModeVisual
 * Low level implementation. Refer to visual indicator to return to the desired box mode.
 * @param {string} mode resizable|rearrange|plain  
 * 
 */
function reassertBoxModeVisual() {
    let $indicator = $("#indicator-box-mode")
    let cycled = $indicator.attr("data-cycled");
    cycled = parseInt(cycled);
    
    switch(cycled) {
        case 0:
            changeBoxMode("plain");
            break;
        case 1:
            changeBoxMode("resizable");
            break;
        case 2:
            changeBoxMode("rearrange");
            break;
    }
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
                        display: initial !important;
                    }
                `
            )
            break;
        case "rearrange":
            $("#box-mode").html(
                `
                    .grid-item .handle-rearrange {
                        display: initial !important;
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


function addBox(width = "130px", height = "100px", html = "&nbsp;") {
    html = `<span class="handle-rearrange ui-icon ui-icon-arrow-4-diag"></span>` + html;
    const $box = $(`<div class="grid-item rounded-sm unreset" contenteditable="true" style="width:${width}; height:${height}">${html}</div>`);
    $(".grid").append($box);
    window.lastBox = $box;
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
    if (window.lastBox == null) {
        window.lastBox = getLastItemIfExists();
    }

    if (window.lastBox !== null) {
        let remindMeByText = `"${window.lastBox.text().substr(0, 50).trim()+"..."}"`;
        let confirmed = confirm(`Delete the box?\n\n${remindMeByText}`);
        if (confirmed) {
            window.lastBox.remove();
            window.lastBox = null;
            toggleAllClass('.page-controls__controls', 'invisible'); // Menu can close
        }
    } else {
        alert("Error: You haven't interacted with any current boxes. No box to duplicate.")
    }
}

function clearCanvas() {
    if (confirm("Delete all boxes. Are you sure?")) {
        $(".grid").html("");
        window.lastBox = null;
        toggleAllClass('.page-controls__controls', 'invisible'); // Menu can close
    }
}

function resetCanvas(bypassed) {
    if (bypassed || confirm("Reset canvas. Are you sure?")) {
        $(".grid").html("");
        let html1 = $("#template-starter-box-1").html()
        let html2 = $("#template-starter-box-2").html()
        addBox("33%", "337px", html1)
        addBox("33%", "337px", html2)
        window.lastBox = getLastItemIfExists();
        toggleAllClass('.page-controls__controls', 'invisible'); // Menu can close
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

/**
 * 
 * Command prompt
 * User enters command like `save data1` or `load data1`
 */
function commandPrompt(event) {
     // Prevent the web browser's command pallete from showing up if in Developer's Mode while we are using our app's command palette shortcut
    event.preventDefault();

    var cmd = prompt(
        `Enter your command
        
 Save/Load on this device: 'save <name>' or 'load <name>'
 Export/Import to different device: 'export' or 'import <name>'
        
        `
    )
    if(cmd) {
        if(cmd.includes("save ")) {
            let localStorageKey = "mosaic_notes__" + cmd.split(" ")[1];
            saveBodyHTML(localStorageKey)
        } else if(cmd.includes("load ")) {
            let localStorageKey = "mosaic_notes__" + cmd.split(" ")[1];
            loadBodyHTML(localStorageKey)
        } else if(cmd.includes("open ")) {
            let localStorageKey = "mosaic_notes__" + cmd.split(" ")[1];
            loadBodyHTML(localStorageKey)
        } else if(cmd.indexOf("export")===0) {
            exportBodyHTML();
        } else if(cmd.includes("import ")) {
            const importedContents = cmd.substr(7)
            importBodyHTML(importedContents);
        }
    }
}