// ==UserScript==
// @name         MK-112
// @namespace    http://meldkamersspel.com/
// @version      0.1.1
// @description  Game enriching
// @author       Dumb Scripts
// @match        https://www.meldkamerspel.com/*
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require      http://cdnjs.cloudflare.com/ajax/libs/moment.js/2.15.2/moment.min.js
// @updateURL    https://raw.githubusercontent.com/dumb-scripts/MK112/master/mk112-v1.user.js
// @grant        none
// @run          document-start
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

var mk112 = JSON.parse(localStorage.getItem('mk112-settings'))
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
  color: black;
  padding: 3px 3px 0px 3px;
  border-radius: 4px;
  box-sizing: border-box;
}

span.mk112-mission-shareable {
  background: green !important;
  color: white !important;
}

.modal-backdrop {
  z-index: 9998 !important;
}

.modal {
  z-index: 9999 !important;
}
`;
const ref = document.querySelector('script');
ref.parentNode.insertBefore(style, ref);


var missionTypes = JSON.parse(localStorage.getItem('mk112-mission-types'));
var messageCount = 0;

(function() {
    'use strict';

    waitForKeyElements ( "ul.navbar-right", doNavigation);

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
            if (mk112.minShareCredits && missionType.credits >= +mk112.minShareCredits) {
                btn.classList.add('mk112-mission-shareable');
            }
            holder.appendChild(btn);
        }
    });

    waitForKeyElements ('#message_top', (badge) => {
        setInterval(() => {
            const amount = +badge[0].innerText;

            if (messageCount < amount) {
                var message = amount - messageCount === 1 ? 'Er is een nieuw bericht' : `Er zijn ${amount-messageCount} nieuwe berichten`;
                if (mk112.messageVisual) {
                    notify('Berichten', message);
                }
                if (mk112.messageSound) {
                    speak(message);
                }
            }

            messageCount = amount;
        }, 1000);
    });

    waitForKeyElements ('ul#radio_messages_important li', checkRadioMessages);
    waitForKeyElements ('ul#radio_messages li', checkRadioMessages);

    function checkRadioMessages(messages) {
        const message = messages[0];

        if (message.style.display === 'none' || message.className === '' ) {
            // Do not handle hidden messages
            return;
        }

        const vehicleLink = message.querySelector('a:nth-of-type(1)');
        const vehicleName = (vehicleLink) ? vehicleLink.innerText : '';
        const action = message.querySelector('span.building_list_fms').getAttribute('title');
        var important = false;
        var between = 'is';
        var type = 'normal';

        switch (message.querySelector('span.building_list_fms').innerText) {
            case '1': // Uitgerukt
                break;
            case '2': // Ter plaatse
                break;
            case '4': // Beschikbaar
                break;
            case '5': // Op post
                break;
            case '7': // Aanvraag spraakcontact
                type = action.includes('uitgebreid') ? 'extend' : 'speak';
                important = true;
                between = ' ';
                break;
        }

        var sound = false;
        var visual = false;
        switch (type) {
            case 'extend':
                sound = mk112.extendSound;
                visual = mk112.extendVisual;
                break;
            case 'speak':
                sound = mk112.speakSound;
                visual = mk112.speakVisual;
                break;
            default:
                sound = mk112.otherSound;
                visual = mk112.otherVisual;
        }

        if (visual) {
            notify(vehicleName, action);
        }
        if (sound) {
            speak(`${vehicleName}, ${between} ${action}`);
        }
    }

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
            const missionCredits = (missionType && missionType.credits) ? missionType.credits : '?';

            if (missionType && missionType.credits) {
                var elTitle = document.querySelector('#missionH1');
                elTitle.innerHTML = elTitle.innerHTML + ' <b>(' + missionCredits + ' credits)</b>';
            }

            var inputReply = document.querySelector('#mission_reply_content');
            if (inputReply) {
                const btnGroup = document.createElement('div');
                btnGroup.classList.add('btn-group');

                const buttonFunc = (lastVehicle) => {
                    const date = new Date();
                    date.setHours( date.getHours() + 2 );
                    var timeText = moment(date).format('HH:mm');
                    inputReply.value = `${missionCredits} Credits, ${lastVehicle} na ${timeText}`;
                    return false;
                }

                const quickButtons = ['OvD','HOD','CO','ZULU'];
                quickButtons.forEach((value)=>{
                    const btn = document.createElement("button");
                    btn.innerHTML = value;
                    btn.classList.add('btn', 'btn-default');
                    btn.type = 'button';
                    btn.onclick = () => buttonFunc(value);
                    btnGroup.appendChild(btn);
                });

                inputReply.parentNode.before(btnGroup);
            }
        });
    }

    function notify(title, text) {
        // Let's check if the browser supports notifications
        if (!("Notification" in window)) {
            console.log("This browser does not support desktop notification");
            return;
        }

        // Function for sending notifications
        const sendNotification = (title, message) => {
            var notification = new Notification(title, { body: message, icon: 'https://www.meldkamerspel.com/images/logo-header.png' });
        }

        // Let's check whether notification permissions have already been granted
        if (Notification.permission === "granted") {
            sendNotification(title, text);
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(function (permission) {
                if (permission === "granted") {
                    sendNotification(title, text);
                }
            });
        }
    }

    function speak(text) {
        // Let's check if the browser supports notifications
        if (!("SpeechSynthesisUtterance" in window)) {
            console.log("This browser does not support text to speech");
            return;
        }

        var u1 = new SpeechSynthesisUtterance(text);
        u1.lang = 'nl-NL';
        u1.pitch = 1;
        u1.rate = 0.7;
        u1.voiceURI = 'native';
        u1.volume = 1;
        speechSynthesis.speak(u1);
    }

    function doNavigation(items){
        const navbarRight = items[0];

        const btn = document.createElement("ul");
        btn.innerHTML = 'MK112';
        btn.classList.add('btn', 'btn-xs', 'btn-default');
        btn.setAttribute('data-toggle', 'modal')
        btn.setAttribute('data-target', '#settingsModal');

        btn.onclick = loadSettings;

        navbarRight.appendChild(btn);

        createDialog();
    }

    /**
     * Settings dialog
     */
    var modal;

    function createDialog() {
        if (!modal) {
            // dialog created;

            modal = document.createElement("div");
            modal.id = 'settingsModal';
            modal.classList.add('modal', 'fade');
            modal.setAttribute('role', 'dialog');
            modal.setAttribute('tabindex', '-1');
            modal.innerHTML =  `
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">MK-112 Instellingen</h4>
      </div>
      <div class="modal-body">
        <form id="mk112-settings-form">
          <h2>Notificaties</h2>
          <table class="table">
          <thead>
          <tr>
            <th></th>
            <th style="text-align:center">Melding</th>
            <th style="text-align:center">Spraak melding</th>
          </tr>
          <thead>
          <tbody>
          <tr>
            <td>Berichten</td>
            <td style="text-align:center"><input type="checkbox" name='messageVisual'></td>
            <td style="text-align:center"><input type="checkbox" name='messageSound'></td>
          </tr>
          <tr>
            <td>Spraakaanvragen</td>
            <td style="text-align:center"><input type="checkbox" name='speakVisual'></td>
            <td style="text-align:center"><input type="checkbox" name='speakSound'></td>
          </tr>
          <tr>
            <td>Uitbreidingen</td>
            <td style="text-align:center"><input type="checkbox" name='extendVisual'></td>
            <td style="text-align:center"><input type="checkbox" name='extendSound'></td>
          </tr>
          <tr>
            <td>Overige</td>
            <td style="text-align:center"><input type="checkbox" name='otherVisual'></td>
            <td style="text-align:center"><input type="checkbox" name='otherSound'></td>
          </tr>
          <tbody>
          </table>
            <div class="form-group">
              <label for="exampleInputEmail1">Minimale credits voor delen</label>
              <input type="number" class="form-control" name="minShareCredits" placeholder="Minimale credits voor delen">
            </div>
        </form>
      </div>
      <div class="modal-footer">
        <button id="saveSettings" type="button" class="btn btn-primary" data-dismiss="modal" aria-label="Close">Opslaan</button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
`;

            document.querySelector('body').appendChild(modal);

            var btnClose = modal.querySelector('button#saveSettings')
            btnClose.onclick = saveSettings;
        }


    }

    function loadSettings() {
        var form = document.querySelector('#mk112-settings-form');

        if (!mk112) {
            return;
        }

        var elements = form.elements;
        for(var i = 0 ; i < elements.length ; i++){
            var item = elements.item(i);
            if (item && mk112[item.name]) {
                if (item.matches('[type="checkbox"]')) {
                    item.checked = mk112[item.name];
                } else {
                    item.value = mk112[item.name];
                }
            }
        }
    }

    function saveSettings() {
        var form = document.querySelector('#mk112-settings-form');
        var elements = form.elements;
        var settings ={};
        for(var i = 0 ; i < elements.length ; i++){
            var item = elements.item(i);

            if (item.matches('[type="checkbox"]')) {
                settings[item.name] = item.checked; // item.value === 'on';
            } else {
                settings[item.name] = item.value;
            }
        }

        mk112 = settings;
        localStorage.setItem('mk112-settings', JSON.stringify(mk112));
    }
})();
