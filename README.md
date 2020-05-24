# LocSearch
LocSearch ist ein Programm, mit dem es möglich ist Bilder auf einer Karte zu suchen.<br>
Diese Bilder müssen vorher von dem Admin zusammen mit richtigen Koordinaten hochgeladen werden.<br>
Ich habe dieses Programm für einen [Geocache](https://geocaching.com) entwickelt.
## Installation
1. Das Repository sollte gecloned werden
2. `npm install`
3. `npm run run`
4. Es sollte ein https reverse Proxy mit z.B. nginx oder Apache2 konfiguriert werden.
## Konfiguration
- Die Konfiguration erfolgt über die, nach dem ersten Start generierte, config.json
- Des weiteren müssen die Positionen (noch) manuell in die Datenbank eingetragen werden. (Hier eignet sich zum Beispiel https://sqlitebrowser.org/)
- Bilder können in einen image Ordner im standardverzeichnis gelegt werden. In der Datenbank muss dann nur der Bild name angegeben werden.
- Sollten weitere statische Dateien (z.B. well-known) direkt von node verteilt werden kann dies über den public Ordner passieren. Empfohlen wird jedoch dies direkt über einen Webserver zu machen.
## Troubleshooting
- LocSearch funktioniert nicht in einem Unterordner
## Contribution
PRs und Issues sind gerne gesehen.
## License
Siehe LICENSE.md
Über eine Erwähnung der Software bei verwendung der Software (z.B. für einen Geocache) würde ich mich sehr freuen.


Bei weiteren Fragen mir bitte eine Mail senden.
