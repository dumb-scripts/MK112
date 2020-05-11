// ==UserScript==
// @name         MK-112-Test
// @namespace    http://meldkamersspel.com/
// @version      0.0.3
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

var missionTypes = JSON.parse(localStorage.getItem('mk112-mission-types'));

(function() {
    'use strict';

    waitForKeyElements ( "#iframe-inside-container", iFrameCheck);

    waitForKeyElements ('.missionSideBarEntry div.panel', (panel) => {
        const entry = panel[0].parentNode;
        if (!missionTypes || missionTypes.length === 0) {
            console.log('First load mission screen');
            return;
        }

        var missionTypeId = +entry.getAttribute('mission_type_id');
        var missionType = missionTypes.find(value => value.id === missionTypeId);
        if (missionType && missionType.credits) {
            var elTitle = entry.querySelector('a.map_position_mover');
            elTitle.innerHTML = elTitle.innerHTML + ' <b>(' + missionType.credits + ' credits)</b>';
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
                console.log('iframe not yet supported: ' +parts[1]);
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
