// ==UserScript==
// @name         MK-112
// @namespace    http://meldkamersspel.com/
// @version      0.0.2
// @description  Game enriching
// @author       Rumpie Dumb
// @match        https://www.meldkamerspel.com/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL    https://raw.githubusercontent.com/dumb-scripts/MK112/master/mk112-v1.user.js
// @grant        none
// @run          document-start
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

console.log('MK-112 loaded, Version 0.0.2');
