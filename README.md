# MK112

Dit is een user script voor extra functionaliteiten in het MeldKamerSpel (https://www.meldkamerspel.com).   
Waarschijnlijk draait deze versie alleen voor de Nederlandse versie.   

## Credits
Voor spelers in een team is het belangrijk om te weten wat een incident opbrengt. Echter dat zit nogal verstopt achter de knop "Hulp bij deze inzet" helemaal onderaan het incident scherm. Dit script zorgt ervoor dat het direct zichtbaar wordt in het incidenten gedeelte. Maar ook op het incident scherm zelf. Om dit te kunnen doen wordt er gebruik gemaakt van de "Mogelijke incidenten" onder het menu help (menu "?"). Deze moet je aanklikken, zodat het script weet wat de waardes zijn.

## Quick Team Buttons
Wanneer een melding gedeeld wordt met het team wordt er vaak in de chat een melding getoond als "3100 Credits, CO na 13:30". Om het gemakkelijker te maken zijn er 3 knoppen bij gemaakt. OvD, HOD, CO en ZULU. Deze knoppen tellen 2 uur bij de huidige tijd op en vullen de tekst in. Daarna kun je het aanpassen en verzenden.

## Notificaties

### Email
Er verschijnt een browser notificatie bij een nieuw bericht. Alleen als het spel geopend is.

### Aanvraag spraakcontact, Uitbreidingen
Er verschijnt een browser notificatie als een voertuig een spraakcontact aanvraag heeft. Of als een incident is uitgebreid. Alleen als het spel geopend is.

### Overige
Notificaties voor alle voertuig bewegingen. Dit staat standaard uit.

### Spraak notificaties
Voor bovenstaande meldingen (behalve email) kan er ook een spraak notificatie worden gebruikt.
Standaard staat dit uit voor overige meldingen. Er wordt hier gebruik gemaakt van het omzetten van tekst naar spraak.
En is volledige browser afhankelijk.

## FAQ

### Geen credits
Ben je al naar het "Mogelijke incidenten" scherm gegaan?

### Niet alle incidenten hebben credits
Dit klopt, helaas kunnen we alleen de waardes tonen uit de mogelijk incidenten lijst.
Als daar het bedrag wel instaat geef het dan mij door.

### Ik zie geen notificaties
De eerste keer als er een notificatie wordt getoond zal er gevraagd worden of dit wordt toegestaan.
Als het niet wordt toegestaan zullen er geen notificaties zijn.

### Ik hoor geen spraak Notificaties
Dit kan aan de browser liggen, maar de meeste recente browsers (Chrome, Firefox) zouden moeten werken.
Check voor de zekerheid of je geluid wel aanstaat.

### Waar kan ik instellingen wijzigen?
Op dit moment kan dit alleen in het script zelf onder het kopje settings:

```JavaScript

//
// ## Settings ##
// You can change some settings here. This will be reset to default when a new version arrives.
// In the future this can be done through a settings screen, without loosing it.
//
const mk112 = {
    notification: {other: false, important : true},
    voice: {other: false, important: true}
};
```
true == aan   
false == uit    
