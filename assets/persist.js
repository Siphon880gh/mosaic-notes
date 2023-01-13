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
    let html = document.body.innerHTML.replaceAll("ui-resizable", "").replaceAll("medium-editor-element", "")
    let $html = $(html);
    // - Remove resize handles so the boxes can be initiated to be resizable and the handles added back
    $html.find(".ui-resizable-handle").remove();
    html = $html.html();
    console.log(html)
}

function loadBodyHTML(html) {
    document.body.html = html;
}