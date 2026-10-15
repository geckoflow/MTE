# Redaktionsanleitung (für David)

Die Website pflegst du unter **`https://<deine-domain>/admin`**. Alles, was du dort speicherst, ist sofort auf der Website sichtbar.

## Überblick

| Bereich | Was du dort machst |
|---|---|
| **Produkte → Produkte** | Schaftböller, Zubehör und Personalisierungen: Texte, Preise, Bilder, technische Daten, Lieferbarkeit, Konfigurator-Optionen |
| **Anfragen → Anfragen** | Eingegangene Anfragen aus Kontaktformular und Konfigurator. Status setzen (Neu → In Bearbeitung → Angebot gesendet → Auftrag erhalten …), interne Notizen |
| **Anfragen → Konfigurationen** | Alle gespeicherten Konfigurationen mit Code und Preis zum Zeitpunkt des Speicherns |
| **Inhalte → Startseite** | Texte und Bilder der Startseite (Hero, Manufaktur, Qualität, Kontrast, Produkte, Unikat, Kontakt) |
| **Inhalte → Handwerk & Tradition** | „Vom Baum zum Böller“, Geschichte, Materialien |
| **Inhalte → Häufige Fragen** | Fragen und Antworten. „Auf der Startseite zeigen“ legt fest, was auf der Startseite erscheint |
| **Inhalte → Galerie** | Fotos fertiger Unikate |
| **Inhalte → Rechtstexte** | Impressum, Datenschutz (später AGB, Widerruf) |
| **Inhalte → Medien** | Alle Bilder. Platzhalterbilder sind markiert und vor dem Go-live zu ersetzen |
| **Verwaltung → Einstellungen** | Kontaktdaten, Empfänger für Anfragen, Preise anzeigen ja/nein, Umsatzsteuer, Logo-Intro, Vorschau-Hinweis |

## Häufige Aufgaben

### Preis ändern
Produkte → Produkt öffnen → Reiter **Allgemein** → „Preis (€)“ (Bruttopreis inkl. USt.) → **Speichern**.
Aufpreise von Optionen stehen im Reiter **Konfigurator** bei der jeweiligen Option. Zubehör-Preise im Konfigurator kommen direkt vom Zubehör-Produkt.

### Bild austauschen
Medien → Bild hochladen (Alternativtext ausfüllen, z. B. „Schaftböller mit Edelweiß-Schnitzerei, Seitenansicht“). Dann beim Produkt bzw. bei der Startseite das neue Bild auswählen. Beim Ersetzen eines Platzhalters das Häkchen „Platzhalterbild“ entfernen.

### Konfigurator-Option hinzufügen (z. B. neues Schnitzmotiv)
Produkt „Schaftböller Klassik“ → Reiter **Konfigurator** → Optionsgruppe „Kerbschnitzerei“ aufklappen → **Option hinzufügen**:
- **Schlüssel:** kurz, klein, ohne Leerzeichen, z. B. `hirsch`. Nach dem Go-live nicht mehr ändern.
- **Bezeichnung**, **Kurzbeschreibung**, **Aufpreis**
- **Vorschaubild für die Auswahl-Kachel:** ein Foto des Motivs
- Optional **Foto-Ebenen** für die Vorschau (siehe unten)
- **Nicht kombinierbar mit:** andere Optionen im Format „gruppe.option“, z. B. `holz.maser`. Die Website sperrt die Kombination dann automatisch.

„Verfügbar“ ausschalten blendet eine Option vorübergehend aus (z. B. wenn ein Holz ausgegangen ist).

### Foto-Vorschau statt Illustration
Sobald professionelle Fotos vorliegen (alle aus **gleicher Kameraposition**, freigestellt mit transparentem Hintergrund):
1. Produkt → Reiter **Konfigurator** → „Grundbild(er) für die Foto-Vorschau“ → Grundbild (Ansicht „Seitenansicht“) hochladen.
2. Bei den Optionen unter „Foto-Ebenen“ das passende freigestellte Bild hinterlegen (z. B. dunkler Schaft, roter Riemen, Schnitzmotiv). „Ebene (z)“ bestimmt die Reihenfolge, höhere Zahlen liegen oben.
3. Bei Zubehör-Produkten (z. B. Standhalterung) im Reiter **Bilder & Details** eine Foto-Ebene hinterlegen.
4. „Position der Beschriftung auf dem Foto“ so einstellen, dass der Text auf dem Schaft sitzt.

Ohne Grundbild zeigt der Konfigurator automatisch die stilisierte Illustration.

### Anfrage bearbeiten
Anfragen → Eintrag öffnen. Kontaktdaten, Nachricht und die verknüpfte Konfiguration (mit Code und Preis) sind sichtbar. Den Status setzen und interne Notizen festhalten. Die E-Mail mit PDF hast du zusätzlich im Postfach erhalten. Auf „Antworten“ in der Mail antwortest du direkt der anfragenden Person.

### Preise vorübergehend ausblenden
Einstellungen → Reiter **Anfragen & Preise** → „Preise anzeigen“ ausschalten. Website und Konfigurator zeigen dann „Preis auf Anfrage“.

## Gut zu wissen
- **Konfigurations-Codes** (`SE-XXXX-XXXX`) bleiben gültig. Ändern sich Preise, zeigt eine alte Konfiguration den aktuellen Preis und einen Hinweis.
- **Neue Benutzer** (z. B. für Mitarbeiter) legt ein Administrator unter Verwaltung → Benutzer an. Die Rolle „Redaktion“ darf Inhalte und Anfragen bearbeiten, aber keine Benutzer verwalten.
- Nach fünf falschen Passwort-Eingaben ist das Konto 10 Minuten gesperrt. „Passwort vergessen“ funktioniert, sobald der E-Mail-Versand eingerichtet ist.
