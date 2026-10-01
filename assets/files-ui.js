var pendingFileName = "";
var pendingSaveName = "";

function openFilesPanel() {
    if (window.jQuery && $("#command-prompt").hasClass("ui-dialog-content")) {
        $("#command-prompt").dialog("close");
    }
    if (typeof forceCloseMenu === "function") forceCloseMenu();
    pendingFileName = "";
    pendingSaveName = "";
    resetFilesReplace();
    renderFilesList();
    document.getElementById("files-panel").hidden = false;
    var names = listSavedFiles();
    var focusTarget = names.length
        ? document.querySelector("#files-list button")
        : document.getElementById("files-save-name");
    if (focusTarget) focusTarget.focus();
}

function closeFilesPanel() {
    document.getElementById("files-panel").hidden = true;
    pendingFileName = "";
    pendingSaveName = "";
    resetFilesReplace();
}

function renderFilesList() {
    var list = document.getElementById("files-list");
    var empty = document.getElementById("files-empty");
    var names = listSavedFiles();
    var current = window.PERSIST && window.PERSIST.pollFile;
    list.innerHTML = "";
    empty.hidden = names.length > 0;
    names.forEach(function (name) {
        var li = document.createElement("li");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = name === current ? name + " (current)" : name;
        if (name === current) btn.classList.add("is-current");
        btn.addEventListener("click", function () {
            askToOpenFile(name);
        });
        li.appendChild(btn);
        list.appendChild(li);
    });
}

function resetFilesReplace() {
    var go = document.getElementById("files-replace-go");
    if (!go) return;
    go.textContent = "Open file";
    document.getElementById("files-replace").hidden = true;
}

function askToOpenFile(name) {
    pendingSaveName = "";
    pendingFileName = name;
    document.getElementById("files-replace-go").textContent = "Open file";
    document.getElementById("files-replace-copy").textContent =
        "Open “" + name + "”? The current canvas will be replaced.";
    document.getElementById("files-replace").hidden = false;
    document.getElementById("files-replace-go").focus();
}

function confirmFilesReplace() {
    if (pendingSaveName) {
        var name = pendingSaveName;
        saveBodyHTML(name);
        document.getElementById("files-save-name").value = "";
        pendingSaveName = "";
        resetFilesReplace();
        renderFilesList();
        displayMessage("Saved", "Saved “" + name + "”.", "green", 2500);
        return;
    }
    if (!pendingFileName) return;
    loadBodyHTML(pendingFileName);
    closeFilesPanel();
}

function saveFromPanel(event) {
    event.preventDefault();
    var input = document.getElementById("files-save-name");
    var name = input.value.trim();
    if (!name || name === "_page_view") {
        displayMessage("Name needed", "Give the sheet a file name before saving.", "red", 3000);
        return;
    }
    var exists = listSavedFiles().indexOf(name) !== -1;
    if (exists) {
        pendingFileName = "";
        pendingSaveName = name;
        document.getElementById("files-replace-copy").textContent =
            "Replace the saved file “" + name + "”?";
        document.getElementById("files-replace-go").textContent = "Replace file";
        document.getElementById("files-replace").hidden = false;
        document.getElementById("files-replace-go").focus();
        return;
    }
    saveBodyHTML(name);
    input.value = "";
    renderFilesList();
    displayMessage("Saved", "Saved “" + name + "”.", "green", 2500);
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("files-close").addEventListener("click", closeFilesPanel);
    document.getElementById("files-save-form").addEventListener("submit", saveFromPanel);
    document.getElementById("files-replace-back").addEventListener("click", function () {
        pendingFileName = "";
        pendingSaveName = "";
        resetFilesReplace();
    });
    document.getElementById("files-replace-go").addEventListener("click", confirmFilesReplace);
    document.getElementById("files-panel").addEventListener("click", function (event) {
        if (event.target.id === "files-panel") closeFilesPanel();
    });
    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape") return;
        var panel = document.getElementById("files-panel");
        if (panel && !panel.hidden) closeFilesPanel();
    });
});
