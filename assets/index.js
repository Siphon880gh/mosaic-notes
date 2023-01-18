/** 
 * For VS Code Outline
 * Don't want it alphabetized in outline? ... -> Sort By: Position
 * Jump to that section's exact comment or function name: Copy -> Search
 * 
 * */
delete {
    "Init Process": {
        "Warn user if on mobile":{},
        "Init Command Palette UI":{},
        "lastBox: Tracks the most recent box for toggling borders, etc settings":{},
        "Init sorting makes items able to rearrange via handle icon":{},
        "Future proof persisting boxes. Would find the last box, however can add more implementations as necessary.":{},
        "Init modifier keys for changing resizing/rearranging/plain boxes.":{}
    },
    "Init polling required": {
        "Warn user if on mobile":{},
        "Resizable":{},
        "Rich text editor":{}
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
 * Warn user if on mobile
 * Init Command Palette UI
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
    });

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

        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase()==="v")
            setTimeout(fixLayoutHandles, 100);
        else if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase()==="p")
            commandPromptUserOpen(e)
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
            restyleNewEditorIcons();
        });
    } // if newGridsWithoutRichTextControls
} // reinitableResizable

$(()=>{
    // Must call 
    reinitableResizable();
    reinitableEditor();
    window.suspendPoll = false; // Will be true to be thread-safe
    // Always have resizable grid items that can have rich text controls
    // This must be init for every new box.
    // Every new box will not have ui-resizable class automatically because they need to init individually
    setInterval(() => {
        if(!window.suspendPoll) {
            reinitableResizable(true); // isReinit: Boolean = false
            reinitableEditor();
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

function closeMenu() {
    toggleAllClass('.page-controls__controls', 'hidden');
}

function displayMessage(heading, message) {
    // TODO: Make it a slide in at the bottom right with success colors.
    $("#msg-heading").text(heading)
    $("#msg-message").text(message)
    $("#msg").slideDown("slow", function() {
        setTimeout(()=>{
            $("#msg").fadeOut("slow", ()=>{
                $("#msg").slideUp("slow");
            });
        }, 2000)
    });
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
function changePageView() {
    window.pageView++;
    switch(window.pageView) {
        case 0:
            $("body").css("width", "8.5in")
            $("body").css("max-height", "11in")
            $(".grid").css("min-width", "8.5in")
            $(".grid").css("max-height", "11in")
            $(".grid").css("flex-flow", "row wrap")
            console.log("Changed view to: Printing Paper")
            break;
        case 1:
            $("body").css("width", "8.5in")
            $("body").css("max-height", "11in")
            $(".grid").css("min-width", "8.5in")
            $(".grid").css("min-height", "11in")
            $(".grid").css("max-height", "11in")
            $(".grid").css("flex-flow", "column wrap")
            console.log("Changed view to: Mosaic Paper")
            break;
        case 2:
            $("body").css("width", "100vw")
            $("body").css("max-height", "100vh")
            $(".grid").css("min-width", "100vw")
            $(".grid").css("min-height", "100vh")
            $(".grid").css("max-height", "100vh")
            $(".grid").css("flex-flow", "column wrap")
            console.log("Changed view to: Mosaic Screen")
            break;
        default:
            window.pageView = -1;
            changePageView()
    }
}
function toggleEditPreview() {
    $('[contenteditable]').attr('contenteditable', $('[contenteditable]').eq(0).attr('contenteditable')==="false"?true:false)
    if($("#btn-toggle-edit-preview").hasClass("fa-pencil")) {
        $("#btn-toggle-edit-preview").removeClass("fa-pencil").addClass("fa-book");
    } else {
        $("#btn-toggle-edit-preview").addClass("fa-pencil").removeClass("fa-book");
    }
}

function addBox(width = "130px", height = "100px", html = "&nbsp;") {
    html = `<span class="handle-rearrange ui-icon ui-icon-arrow-4-diag"></span>` + html;
    const $box = $(`<div class="grid-item unreset rounded-lg" contenteditable="true" style="width:${width}; height:${height}">${html}</div>`);
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
            closeMenu();
        }
    } else {
        alert("Error: You haven't interacted with any current boxes. No box to duplicate.")
    }
}

function clearCanvas() {
    if (confirm("Delete all boxes. Are you sure?")) {
        $(".grid").html("");
        window.lastBox = null;
        closeMenu();
    }
}

function resetCanvas(bypassed) {
    if (bypassed || confirm("Reset canvas. Are you sure?")) {
        $(".grid").html("");
        let html1 = $("#template-starter-box-1").html()
        let html2 = $("#template-starter-box-2").html()
        let html3 = $("#template-starter-box-3").html()
        addBox("33%", "314px", html1)
        addBox("33%", "314px", html2)
        addBox("33%", "314px", html3)
        window.lastBox = getLastItemIfExists();
        closeMenu();
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

// TODO: In the future, explore adding an inner contenteditable for the boxes so that the handles can be anchored to the outer box without copying and pasting affecting the handles.
// However, even if we perform this fix, we may want to keep fixLayoutHandles to force reinitializing on loading and importing.
function fixLayoutHandles() {

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
        if(cmd.includes("save ")) {
            let localStorageKey = "mosaic_notes__" + cmd.split(" ")[1];
            saveBodyHTML(localStorageKey);
            displayMessage("Saved!", `If running commands, next time you can run 'open ${cmd.split(" ")[1]}'`);
        } else if(cmd.includes("load ")) {
            let localStorageKey = "mosaic_notes__" + cmd.split(" ")[1];
            loadBodyHTML(localStorageKey)
        } else if(cmd.includes("open ")) {
            let localStorageKey = "mosaic_notes__" + cmd.split(" ")[1];
            loadBodyHTML(localStorageKey)
        } else if(cmd.indexOf("export")===0) {
            exportBodyHTML();
            displayMessage("Exported!", `If running  commands, next time you can run 'import {contents}'`);
        } else if(cmd.includes("import ")) {
            const importedContents = cmd.substr(7)
            importBodyHTML(importedContents);
        }
    }
} // commandPromptProcessor