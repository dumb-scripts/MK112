// ==UserScript==
// @name         MK112-leden
// @namespace    http://meldkamersspel.com/
// @version      0.0.1
// @description  Game enriching
// @author       Dumb Scripts
// @match        https://www.meldkamerspel.com/verband/mitglieder**
// @require      http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require      http://cdnjs.cloudflare.com/ajax/libs/moment.js/2.15.2/moment.min.js
// @updateURL    https://raw.githubusercontent.com/dumb-scripts/MK112/master/mk112-leden-v1.user.js
// @grant        none
// @run          document-start
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);


var settings = JSON.parse(localStorage.getItem('mk112-leden-settings'));
if (!settings) {
    settings = {};
}


(function() {
    'use strict';

    // Create scan button
    waitForKeyElements ("li.active span", (activePageButton) => {
        if (activePageButton[0].innerText === '1') {
            // We are on the first page
            const activeUsersButton = document.querySelectorAll("a[href^='/verband/mitglieder']")[1];
            const btn = document.createElement("button");
            btn.innerHTML = 'MK112 scanner';
            btn.classList.add('btn', 'btn-default', 'btn-xs');
            btn.type = 'button';
            btn.onclick = () => {
                console.log('Start scanning');
                settings.scanning = true;
                settings.invalidPercentages = [];
                scanUsers();
                nextPage();
            };
            activeUsersButton.after(btn);
        }
    });

    if (settings && settings.scanning) {
        waitForKeyElements ("li.next", (listItems) => {
            scanUsers();

            if (listItems[0].classList.contains('disabled')) {
                settings.scanning = false;
                writeSettings();
                console.log(settings);
                writeResults();
            } else {
                nextPage();
            }

        });
    }

    function writeResults() {
        const table = document.createElement("table");
        table.classList.add('table', 'table-striped');
        const thead = document.createElement("thead");
        thead.innerHTML = "<tr><th>gebruiker</th><th>credits</th><th>korting %</th><th>donatie %</th><th>&nbsp;</th><th>&nbsp;</th></tr>"
        table.append(thead);

        const tbody = document.createElement("tbody");
        for(var i=0; i< settings.invalidPercentages.length; i++){
            const invalidRow = settings.invalidPercentages[i];
            const tr = document.createElement("tr");
            const tdUser = document.createElement("td");
            tr.append(tdUser);
            const tdCredits = document.createElement("td");
            tr.append(tdCredits);
            const tdDiscount = document.createElement("td");
            tr.append(tdDiscount);
            const tdDonation = document.createElement("td");
            tr.append(tdDonation);
            const tdFlag = document.createElement("td");
            tr.append(tdFlag);
            const tdAction = document.createElement("td");
            tr.append(tdAction);
            tbody.append(tr);

            tdUser.innerHTML = `<a href="/profile/${invalidRow.userId}" target="_blank">${invalidRow.user}</a>`;
            tdCredits.innerText = invalidRow.credits;
            tdDiscount.innerText = invalidRow.discount;
            tdDonation.innerText = invalidRow.donation;

            if (invalidRow.offline) {
                tdFlag.innerHTML = '<img src="/images/user_red.png"></img>';
            }

            if (invalidRow.discount != invalidRow.donation * 10) {
                const btn = document.createElement("button");
                btn.innerHTML = `Korting op ${invalidRow.donation * 10}% zetten`;
                btn.classList.add('btn', 'btn-default', 'btn-xs');
                btn.type = 'button';
                btn.onclick = () => {
                    setPercentage(invalidRow.userId, invalidRow.donation);
                    tdAction.innerText = `Korting op ${invalidRow.donation * 10}% gezet`;
                };
                tdAction.append(btn);
            }

        }

        // Attach our results
        table.append(tbody);
        const target = document.querySelector("#iframe-inside-container table");
        target.before(table);

    }


    function setPercentage(userId, donation) {
        var url = `https://www.meldkamerspel.com/verband/discount/${userId}/${donation}`;

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", url, false ); // false for synchronous request
        xmlHttp.send( null );
        console.log(xmlHttp.responseText);
    }

    function nextPage() {
        const nextButton = document.querySelector("li.next a");
        nextButton.click();
    }

    function scanUsers() {
        const userRows = document.querySelectorAll("#iframe-inside-container table tbody tr");

        const invalidPercentages = settings && settings.invalidPercentages ? settings.invalidPercentages : [];
        for(var i=0; i< userRows.length; i++){


            const userRow = userRows[i];

            if (userRow) {
                const columns = userRow.querySelectorAll('td');

                const user = columns[0].innerText;
                const userId = +columns[3].querySelector('.btn-discount').getAttribute('user_id');
                const credits = +columns[2].innerText.replace(' Credits', '').replace(/\./g,'');
                const discount = +columns[3].querySelector('.btn-success').innerText.replace('%','');
                const donation = +columns[4].innerText.replace(' %', ' ');

                const offline = columns[0].querySelector('.online_icon').getAttribute('src') === '/images/user_red.png';


                if (discount !== donation * 10 || offline) {
                    invalidPercentages.push({userId: userId ,user: user, credits: credits, donation: donation, discount: discount, offline: offline});
                }
            } else {
                console.log('no users found');
            }
        }
        settings.invalidPercentages = invalidPercentages;
        writeSettings();
    }

    function writeSettings() {
        localStorage.setItem('mk112-leden-settings', JSON.stringify(settings));
    }

})();