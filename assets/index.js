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

    // Init modifier keys for changing resizing/rearranging/plain boxes
    document.body.addEventListener('keydown', function(e) {
        if(!e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
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
        // [Special + Alt + Backspace]
        } else if ((e.metaKey || e.ctrlKey) && e.altKey && e.key.toLowerCase()==="backspace") {
            deleteLastBox();
         
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
                $("#btn-toggle-edit-preview").animate({color:"white"}, 500, "easeInBounce", function() {
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
    });
});

// Init page controls menu showing and hiding
function slideInPageControls() {
    $(".page-controls").show("slide", {
        direction: "right"
    }, 200);
}

function slideOutPageControls() {
    if(!$(".page-controls__controls").hasClass("hidden"))
        closeMenu();

    $(".page-controls").hide("slide", {
        direction: "right"
    }, 200);
}
function setSlideOutPageControls() {
    $(".page-controls").hide("slide", {
        direction: "right"
    }, 0);
}
$(() => {
    // Initially hide menu / page controls
    setSlideOutPageControls();

    // Make sure to slide in menu when in general area
    $(".show-menu-hotarea, .page-controls").mouseenter(() => {
        slideInPageControls();
    })

    // Clicking outside general area of page controls will hide controls
    $("body").on("click", (event) => {
        if (event.clientX < window.outerWidth - 66 || event.clientY > window.outerWidth - 205) {
            slideOutPageControls();
        }
    })

    // On mobile you can't just move a mouse in general area, so there's a reveal menu icon
    $(".show-menu-icon").on("click", () => {
        slideInPageControls();
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

function toggleAllClass(querySelected, clssName) {
    document.querySelectorAll(querySelected).forEach(el=>el.classList.toggle(clssName))
}

function closeMenu() {
    toggleAllClass('.page-controls__controls', 'hidden');
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
        window.PERSIST.pollFile = "";
    }
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
            displayMessage("Instructions", "Open <a href='https://developer.chrome.com/docs/devtools/open/' target='_blank'>DevTools console</a> for a list of saved files. Future version will show inside the webpage.", "info", 5000)
            var savedFiles = [];
            var prependKey = "mosaic_notes__"
            for(key in localStorage) {
                if(key.indexOf(prependKey)===0 && key.indexOf(prependKey+"_page_view")===-1) {
                    savedFiles.push(key.substr(prependKey.length)) 
                }
            }
            console.log(JSON.stringify(savedFiles));
        }
    }
} // commandPromptProcessor