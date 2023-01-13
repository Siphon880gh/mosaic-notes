/**
 * 
 * TODO: Implement saving a list of local storage keys you can access
 * So you can dropdrop select a storage key to load that HTML's boxes
 * Also implement user creating new keys
 * 
 */
function saveBodyHTML(localStorageKey) {
    // Sanitize
    // Warning does not sanitize against Chrome extensions that injected html
    // - Remove classes flagging it was initialized
    let html = $(".grid").html();
    // let $html = $(html);
    // - Remove resize handles so the boxes can be initiated to be resizable and the handles added back
    // debugger;

    html = html.replaceAll("medium-editor-element", "")
    html = html.replaceAll(`<div class="ui-resizable-handle ui-resizable-e" style="z-index: 90; display: block;"></div>`, "")
    html = html.replaceAll(`<div class="ui-resizable-handle ui-resizable-s" style="z-index: 90; display: block;"></div>`, "")
    html = html.replaceAll(`<div class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se" style="z-index: 90; display: block;"></div>`, "")
    html = html.replaceAll("ui-resizable", "")

    // $html.find(".ui-resizable-handle").remove();
    // html = $html.html();
    
    console.log(html)
    localStorage.setItem(localStorageKey, html)
}

function loadBodyHTML(localStorageKey) {
    let html = localStorage.getItem(localStorageKey)
    if(html)
        $(".grid").html(html)
}

/**
 * 
saveBodyHTML("mosaic__data1")
loadBodyHTML("mosaic__data1")
 * 
 */