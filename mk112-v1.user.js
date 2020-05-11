// ==UserScript==
// @name         MK-112
// @namespace    http://meldkamersspel.com/
// @version      0.0.2
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

console.log('MK-112 loaded, Version 0.0.2');

var missionTypes = JSON.parse(localStorage.getItem('mk112-mission-types'));

(function() {
    'use strict';

    waitForKeyElements ( "#iframe-inside-container", iFrameCheck);

    waitForKeyElements ('.missionSideBarEntry', (entry) => {
        if (!missionTypes || missionTypes.length === 0) {
            console.log('First load mission screen');
            return;
        }

        var missionTypeId = +entry[0].getAttribute('mission_type_id');
        var missionType = missionTypes.find(value => value.id === missionTypeId);


        if (missionType && missionType.credits) {
            var elTitle = entry[0].querySelector('a.map_position_mover');
            elTitle.innerHTML = elTitle.innerHTML + ' <b>(' + missionType.credits + ' credits)</b>';
        } else {
            console.log('mission not found', missionTypeId, entry[0]);
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

    function iFrameMissionTypes(){
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

  })();
