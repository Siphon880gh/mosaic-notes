
        window.lastBox = null;
        $(()=>{
            let hasGridItems = $(".grid-item").length>0;
            if(hasGridItems) {
                window.lastBox = $(".grid-item").last()
            }
        })

        function toggleClass(querySelected, clssName) {
            document.querySelectorAll(querySelected).forEach(el=>el.classList.toggle(clssName))
        }

        function changeGap(querySelected, gap) {
            console.log("Changed gap")
            const newGapStyle = `${querySelected} {
                gap: ${gap}
            }`
            $("#dynamic-style-block--gap").remove();
            $("body").append($(`<style id="dynamic-style-block--gap"></style>`).html(newGapStyle))
        }
        
        function changePadding(querySelected, gap) {
            console.log("Changed padding")
            const newGapStyle = `${querySelected} {
                padding: ${gap}
            }`
            $("#dynamic-style-block--gap").remove();
            $("body").append($(`<style id="dynamic-style-block--gap"></style>`).html(newGapStyle))
        }

        function getLastItemIfExists() {
            let hasGridItems = $(".grid-item").length>0;
            if(hasGridItems) {
                return window.lastBox = $(".grid-item").last()
            } else {
                return null;
            }
        } // getLastItemIfExists

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

        function addBox(width = "130px", height = "100px", html = "&nbsp;") {
            html = `<span class="handle-rearrange ui-icon ui-icon-arrow-4-diag"></span>` + html;
            const $box = $(`<div class="grid-item rounded-sm unreset" contenteditable="true" style="width:${width}; height:${height}">${html}</div>`);
            $(".grid").append($box);
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
                    toggleClass('.page-controls__controls', 'invisible'); // Menu can close
                }
            } else {
                alert("Error: You haven't interacted with any current boxes. No box to duplicate.")
            }
        }
        
        function clearCanvas() {
            if (window.lastBox == null) {
                window.lastBox = getLastItemIfExists();
            }

            if (confirm("Delete all boxes. Are you sure?")) {
                $(".grid-item").remove();
                window.lastBox = null;
                toggleClass('.page-controls__controls', 'invisible'); // Menu can close
            }
        }

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

        function changeBorderColor() {
            if (window.lastBox == null) {
                window.lastBox = getLastItemIfExists();
            }

            if (window.lastBox !== null) {
                window.lastBox.toggleClass("no-borders");
            } else {
                alert("Error: You haven't interacted with any current boxes. No box to toggle borders with.")
            }
        } // changeBorderColor
        
        function toggleLastBoxBorders() {
            if (window.lastBox == null) {
                window.lastBox = getLastItemIfExists();
            }

            if (window.lastBox !== null) {
                window.lastBox.toggleClass("no-borders");
            } else {
                alert("Error: You haven't interacted with any current boxes. No box to toggle borders with.")
            }
        } // toggleLastBoxBorders

        $(() => {
            // Always have resizable grid items that can have rich text controls
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
                            //buttons: ['bold', 'italic', 'underline', 'anchor', 'image', 'h2', 'h3', 'quote']
                            //buttons: ["bold", "italic", "underline", "strikethrough", "subscript", "superscript", "anchor", "image", "quote", "pre", "orderedlist", "unorderedlist", "indent", "outdent", "justifyLeft", "justifyCenter", "justifyRight", "justifyFull", "h1", "h2", "h3", "h4", "h5", "h6", "removeFormat", "html"]
                            buttons: ["bold", "italic", "underline", "strikethrough", "anchor", "image", "quote", "indent", "outdent", "orderedlist", "unorderedlist", "justifyLeft", "justifyCenter", "justifyRight", "h1", "h2", "h3", "h4", "h5", "h6", "html"]
                        }
                    });
                    restyleNewEditorIcons();
                }
            }, 100);
            
            // Warn user if on mobile that this is a Desktop app
            if(window.innerWidth < 816) {
                alert("Advisory: You are on a small window. The purpose of this app is to create a boxed notes template that prints on a 11 x 8.5 inches paper. Then you would use it for work or school. Please visit on a bigger screen.")
            }

            // Point to last grid item for duplication or deletion
            $("body").on("click", event => {
                const gridItem = event.target.matches(".grid-item") ? event.target : event.target.closest(".grid-item");
                if (gridItem) {
                    console.group("I'm at: ")
                    console.log(gridItem);
                    console.groupEnd();
                    window.lastBox = $(gridItem);
                }
            })
        });