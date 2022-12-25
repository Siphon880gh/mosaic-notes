
        window.lastBox = null;

        function toggleClass(querySelected, clssName) {
            document.querySelector(querySelected).classList.toggle(clssName)
        }

        function changeGap(querySelected, gap) {
            console.log("Changed gap")
            const newGapStyle = `${querySelected} {
                gap: ${gap}
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

        function addBox(width = "100px", height = "100px", html = "&nbsp;") {
            const $box = $(`<div class="grid-item rounded-sm" contenteditable="true" style="width:${width}; height:${height}">${html}</div>`);
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

        $(() => {
            // Always have resizable grid items
            setInterval(() => {
                $(".grid-item:not(.ui-resizable)").resizable()
            }, 100);

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