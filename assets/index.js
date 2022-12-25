
        window.lastBox = null;

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
        function precheckCanDuplicateBox() {
            if (window.lastBox !== null) {
                const options = [window.lastBox.width() + "px", window.lastBox.height() + "px", window.lastBox.html()]
                addBox(...options)
            } else {
                alert("Error: You never interacted with any boxes. No recent box to duplicate.")
            }
        }

        function addBox(width = "130px", height = "100px", html = "&nbsp;") {
            const $box = $(`<div class="grid-item rounded-sm unreset" contenteditable="true" style="width:${width}; height:${height}">${html}</div>`);
            $(".grid").append($box);
        }

        function deleteLastBox() {
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
            if (confirm("Delete all boxes. Are you sure?")) {
                $(".grid-item").remove();
                window.lastBox = null;
                toggleClass('.page-controls__controls', 'invisible'); // Menu can close
            }
        }

        function toggleLastBoxBorders() {
            if (window.lastBox !== null) {
                window.lastBox.toggleClass("no-borders");
            } else {
                alert("Error: You haven't interacted with any current boxes. No box to toggle borders with.")
            }
        }

        $(() => {
            // Always have resizable grid items that can have rich text controls
            setInterval(() => {
                $(".grid-item:not(.ui-resizable)").resizable();
                
                // TODO: This plugin is conflicting with copying and pasting images into the box
                let newGridsWithoutRichTextControls = document.querySelectorAll('.grid-item:not(.medium-editor-element)');
                if(newGridsWithoutRichTextControls.length) {
                    editor = new MediumEditor(newGridsWithoutRichTextControls);
                    restyleNewEditorInstances();
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