# Uculi Landing Style System

Status: Documentatiebasis (fase 1)
Doel: De visuele en tekstuele stijl van de landing page vastleggen als standaard voor de hele app.
Bronreferentie: public/landing.html

## 1) Design Intent

Uculi voelt als een warme, betrouwbare digitale familiereceptenmap.

Kernprincipes:
- Warmte boven tech-kou
- Rust boven drukte
- Vertrouwen boven hype
- Menselijk en eerlijk boven agressieve verkooptaal

Wat gebruikers moeten voelen:
- Dit is mijn plek
- Dit is veilig genoeg voor familietradities
- Dit is eenvoudig, niet overweldigend

## 2) Kleurensysteem

Gebruik deze kleuren als vaste basis:
- Forest: #2D4A3E
- Forest Light: #3D6050
- Sage: #7A9E7E
- Gold: #C9A84C
- Gold Light: #E8C96B
- Parchment: #F5F0E8
- Parchment Dark: #E8DFD0
- Coral: #E07A5F

Gebruikregels:
- Primair oppervlak: Parchment / wit
- Primair tekstaccent: Forest
- Secundaire tekst: Sage
- Highlight en focus: Gold
- Waarschuwing/fout: Coral

Contrastregels:
- Forest tekst op Parchment of wit voor leesbaarheid
- Witte tekst alleen op Forest / Forest Light knoppen
- Gold vooral voor accenten, iconen, badges, niet voor lange bodytekst

## 3) Typografie

Huidige stijlrichting in landing:
- Display/Headings: serif (klassiek, editorial)
- Body/UI: sans (helder en modern)

Stijlregels:
- H1/H2: serif, sterk contrast, ruime line-height
- Body: sans, medium tot semibold
- Labels/kickers: uppercase, hoge letter-spacing, klein formaat

Typografische hiërarchie:
- Hero title: groot, emotioneel, maximaal 1-2 regels per breakpoint
- Section title: duidelijk en rustig
- Body copy: compact, scanbaar, max 2-4 zinnen per blok
- Meta/captions: klein, subtiel, semibold

## 4) Vormtaal en layout

Vormtaal:
- Grote afgeronde hoeken (xl tot 2xl)
- Zachte borders
- Subtiele schaduwen
- Kaartgebaseerde informatieblokken

Layoutregels:
- Brede ademruimte (whitespace is onderdeel van de merkbeleving)
- Duidelijke section-ritmes
- Niet te veel elementen per viewport
- Mobiel eerst, desktop verrijking

Containerbreedtes:
- Content in gecentreerde kolommen
- Hero: compact, focus op boodschap en CTA
- Feature grids: 2 of 3 kolommen op grotere schermen

## 5) Componentstijl

### Buttons

Primair:
- Forest achtergrond, witte tekst
- Hover: Forest Light
- Vorm: afgerond (xl/2xl)
- Gewicht: bold

Secundair:
- Witte/lichte achtergrond met zachte border
- Tekst in Forest
- Hover: iets donkerdere border of subtiele lift

Disabled / coming soon:
- Duidelijk zichtbaar als niet actief
- Eerlijk label, geen schijnbare klikbaarheid

### Cards

- Parchment/wit achtergrond
- Dunne Parchment Dark border
- Zachte shadow
- Optionele lichte hover-lift

### Pills / badges

- Klein, uppercase, duidelijk semantisch doel
- Gebruik voor status, sectielabels, trust-signalen

### Iconen

- Lucide stijl
- Altijd ondersteunend, niet dominant
- Gold voor nadruk, Sage voor neutraal

## 6) Motion en interactie

Gewenste motion:
- Zacht en functioneel
- Geen drukke of springerige animaties

Toegestane animaties:
- Fade-up bij section reveal
- Subtiele hover-lift op kaarten
- Kleurtransities op buttons/links

Niet doen:
- Overmatig stuiteren
- Lange bewegingsketens zonder functionele waarde

## 7) Beeld- en achtergrondstijl

Achtergrondprincipes:
- Parchment basis
- Subtiele texture/grain toegestaan
- Zachte radial highlights voor diepte

Beeldtaal:
- Huiselijk, warm, echt koken
- Geen hyper-commerciële stock look
- Menselijke context: familie, tafel, notitieboek-gevoel

## 8) Copy en tone of voice

Tone of voice:
- Warm
- Professioneel
- Eerlijk
- Niet pushy

Copyregels:
- Verkoop op waarde, niet op druk
- Concreet en herkenbaar taalgebruik
- Korte zinnen, weinig jargon

Voorbeeldrichting:
- Goed: Free plan available forever.
- Goed: Billing available once checkout is live.
- Niet goed: Last chance, buy now, only today.

## 9) SEO en share-consistentie

Om stijl + distributie te verenigen:
- Elke publieke recipe-URL heeft consistente title/description tone
- Open Graph copy volgt dezelfde warme, eerlijke stem
- WhatsApp/social share text blijft kort, persoonlijk en duidelijk

## 10) Accessibility minimum

Minimumeisen voor alle nieuwe schermen:
- Toetsenbordnavigeerbaar
- Voldoende kleurcontrast
- Duidelijke focus states
- Klikdoelen groot genoeg op mobiel
- Tekst niet alleen via kleur coderen

## 11) App-brede implementatie-afspraken (fase 2 later)

Bij implementatie in de app:
- Leg design tokens centraal vast (kleur, radius, shadow, spacing)
- Breng button/card/badge varianten terug tot een kleine set
- Hergebruik dezelfde copytone in modals, empty states en toasts
- Laat nieuwe features visueel aansluiten op landing-ritme

## 12) Review checklist

Gebruik deze checklist bij elke nieuwe UI:
- Past dit binnen Forest/Sage/Gold/Parchment?
- Is de hiërarchie direct scanbaar?
- Is de CTA duidelijk maar niet agressief?
- Is de ruimte rustig genoeg?
- Voelt dit als Uculi, niet als generieke template?

## 13) Scope van dit document

Dit document beschrijft stijlprincipes en afspraken.
Nog niet inbegrepen:
- Volledige technische refactor van bestaande schermen
- Volledige token-migratie in alle views
- Design QA van elke pagina

Dat volgt in de implementatiefase zodra deze documentatie door jou is goedgekeurd.
