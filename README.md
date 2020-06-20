# LocSearch
LocSearch ist ein Programm, mit dem es möglich ist Bilder auf einer Karte zu suchen.<br>
Diese Bilder müssen vorher von dem Admin zusammen mit richtigen Koordinaten hochgeladen werden.<br>
Ich habe dieses Programm für einen [Geocache](https://geocaching.com) entwickelt.
## Installation
1. Das Repository sollte gecloned werden
2. `npm install`
(3. `npm run run`)
4. Es sollte ein https reverse Proxy mit z.B. nginx oder Apache2 konfiguriert werden.
## Konfiguration
- Die Konfiguration erfolgt über die, nach dem ersten Start generierte, config.json
- Bilder müssen in einen image Ordner im standardverzeichnis gelegt werden. (Noch unbennant)
- `npm run install`
- Auf den in der Config angegebenen Port zugreifen.
- Hier können jetzt die Positionen hinzugefügt werden
- Mit STRG+C den install Prozess am Ende beenden
- Am besten nun einmal die database.sqlite an einem anderen Ort sichern
- Es kann mit `npm run run` der Server gestartet werden
- Sollten weitere statische Dateien (z.B. well-known) direkt von node verteilt werden kann dies über den public Ordner passieren. Empfohlen wird jedoch dies direkt über einen Webserver zu machen.
## Troubleshooting
- LocSearch funktioniert nicht in einem Unterordner
## Contribution
PRs und Issues sind gerne gesehen.
## License
Siehe LICENSE.md
Über eine Erwähnung der Software bei verwendung der Software (z.B. für einen Geocache) würde ich mich sehr freuen.


Bei weiteren Fragen mir bitte eine Mail senden.
