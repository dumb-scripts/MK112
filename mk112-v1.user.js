// ==UserScript==
// @name         MK-112
// @namespace    http://meldkamersspel.com/
// @version      0.0.4
// @description  Game enriching
// @author       Dumb Scripts
// @match        https://www.meldkamerspel.com/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @updateURL    https://raw.githubusercontent.com/dumb-scripts/MK112/master/mk112-v1.user.js
// @grant        none
// @run          document-start
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

console.log('MK-112 loaded');

var style = document.createElement('style');

style.innerHTML = `
div.mk112-mission-holder { position: relative; height: 9px; margin-top: 2px; }
span.mk112-mission-credits {
  font-size: smaller;
  position: absolute;
  right: 10px;
  top: -2px;
  border: 1px solid #ddd;
  background: white;
  padding: 3px 3px 0px 3px;
  border-radius: 4px;
  box-sizing: border-box;
}
`;
var ref = document.querySelector('script');
ref.parentNode.insertBefore(style, ref);


var missionTypes = JSON.parse(localStorage.getItem('mk112-mission-types'));

(function() {
    'use strict';

    waitForKeyElements ( "#iframe-inside-container", iFrameCheck);

    waitForKeyElements ('.missionSideBarEntry div.panel', (panels) => {
        if (!missionTypes || missionTypes.length === 0) {
            console.log('First load mission screen');
            return;
        }

        const panel = panels[0];
        const entry = panel.parentNode;

        var missionTypeId = +entry.getAttribute('mission_type_id');
        var missionType = missionTypes.find(value => value.id === missionTypeId);
        if (missionType && missionType.credits) {
            var holder = document.createElement("div");
            holder.classList.add('mk112-mission-holder');
            panel.before(holder);

            var btn = document.createElement("span");
            btn.innerHTML = missionType.credits + ' credits';
            btn.classList.add('mk112-mission-credits');
            holder.appendChild(btn);
        }
    });

    function iFrameCheck() {
        var parts = window.location.pathname.split('/');

        switch (parts[1]) {
            case 'einsaetze':
                iFrameMissionTypes();
                break;
            case 'missions':
                iFrameMission();
                break;
            default:
                // console.log('iframe not yet supported: ' +parts[1]);
        }

    }

    function iFrameMissionTypes() {
        waitForKeyElements ( "#no_leitstelle tr.mission_type_index_searchable:nth-child(10)", (s) => {
            var missionTypes = [];
            document.querySelectorAll('#no_leitstelle tr.mission_type_index_searchable').forEach( (row) => {
                const btnLink = row.querySelector('a');
                var id;
                if (btnLink) {
                    var parts = btnLink.getAttribute('href').split('/');
                    id = +parts[2];
                }

                missionTypes.push({
                    id: id,
                    name: row.querySelector('td:nth-child(2) a').innerText,
                    credits: row.querySelector('td:nth-child(4)').innerText

                });
            });
            localStorage.setItem('mk112-mission-types', JSON.stringify(missionTypes));
        }, true);

    }

    function iFrameMission() {
        waitForKeyElements ( "#mission_help", (s) => {
            const url = new URL(s[0].getAttribute('href'), window.location);

            var parts = url.pathname.split('/');
            var missionTypeId = +parts[2];

            var missionType = missionTypes.find(value => value.id === missionTypeId);
            if (missionType && missionType.credits) {
                var elTitle = document.querySelector('#missionH1');
                elTitle.innerHTML = elTitle.innerHTML + ' <b>(' + missionType.credits + ' credits)</b>';
            }
        });
    }
})();
