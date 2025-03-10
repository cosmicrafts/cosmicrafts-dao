# Governance
![Governance](govbanner.webp)

## Einführung

Die Cosmicrafts DAO stellt die Community in den Mittelpunkt und gibt Stakeholdern ein echtes Mitspracherecht bei der Entwicklung des Franchises. Aufgebaut auf bewährter Technologie nutzt die DAO Fairness, Transparenz und Community-gesteuerte Entscheidungsfindung, um sicherzustellen, dass Cosmicrafts seiner Vision treu bleibt.

::: info Leseleitfaden
Dieses Dokument beschreibt den Governance-Rahmen der Cosmicrafts DAO mit Fokus auf Entscheidungsprozesse, Vorschlagssysteme und Community-Beteiligung. Es ergänzt das [Tokenomics](/tokenomics)-Dokument, das die wirtschaftlichen Aspekte behandelt.

- **Hauptfokus**: Governance-Prozesse, Abstimmung und Community-Entscheidungsfindung
- **Begleitdokument**: [Tokenomics](/tokenomics) für Token-Wirtschaft und Nutzen
- **Querverweise**: Achten Sie auf Info-Boxen mit Verweisen zu relevanten Tokenomics-Abschnitten
:::

## DAO-Kernprinzipien

| Prinzip | Beschreibung |
|---------|--------------|
| **Community-Souveränität** | • Kollektive Entscheidungskraft<br>• Transparenter Governance-Prozess<br>• On-Chain-Abstimmung und automatisierte Ausführung<br>|
| **Nachhaltiges Wachstum** | • Langfristige Wertschöpfung<br>• Ausgewogene Ökosystem-Entwicklung<br>• Community-gesteuerte Treasury-Verwaltung<br>• Datengetriebenes Bewertungssystem |
| **Offene Beteiligung** | • Inklusive Governance-Struktur<br>• Niedrige Einstiegshürden<br>• Community-gesteuerte Expansion<br>• Multi-Chain-Zugänglichkeit |

## Stimmrechtsverteilung

<div class="tokenomics-diagram">
  <img src="src/assets/icons/votingpower.svg" alt="SPIRAL-Token-Stimmrechtsverteilung" />
</div>

<style>
.tokenomics-diagram {
  text-align: center;
  width: 100%;
  margin: 4rem auto;
}

.tokenomics-diagram img {
  width: 65%;
  max-width: 800px;
  height: auto;
  filter: none;
  box-shadow: none;
  background: transparent;
  margin: 0 auto;
  display: block;
}

@media (max-width: 768px) {
  .tokenomics-diagram img {
    width: 100%;
    max-width: 100%;
  }
}
</style>

::: info Dynamische Stimmkraft
Die tatsächliche Verteilung der Stimmkraft wird basierend auf Stakeholder-Entscheidungen schwanken bezüglich:
- Menge der in Neuronen gestakten Tokens
- Gewählte Auflösungsverzögerungsdauer
- Akkumuliertes Alter der Neuronen
Diese Faktoren können den relativen Einfluss verschiedener Stakeholder-Gruppen im Laufe der Zeit erheblich verschieben.
:::

| Stakeholder-Gruppe | Stimmanteil | Basis-Tokens | Zweck |
|-------------------|-------------|--------------|--------|
| **SNS-Teilnehmer** | 50% | 120M | - Größter Stimmblock<br>- Community-gesteuerte Governance<br>- Potenzial für erhöhten Einfluss durch Beteiligung |
| **Entwicklerteam** | 33,3% | 80M | - Strategische Entscheidungsfindung<br>- 8-Jahre Auflösungsverzögerung mit 1-Jahr Vesting<br>- Graduelle Einflussreduzierung |
| **Genesis/Seed** | 16,7% | 40M | - Vertretung früher Unterstützer<br>- Gestaffelte Auflösungsverzögerungen (0-7 Jahre)<br>- Ausgewogener initialer Einfluss |

### Leistungsmultiplikatoren

| Faktor | Maximaler Bonus | Zeit zum Erreichen |
|--------|-----------------|-------------------|
| **Auflösungsverzögerung** | +100% | 8 Jahre |
| **Neuron-Alter** | +100% | 1 Jahr |
| **Minimale Auflösungsverzögerung** | N/A | 1 Monat |
| **Kombinierte Obergrenze** | 3x Basisleistung | N/A |

## SNS-Integration

Die Cosmicrafts DAO nutzt das [Service Nervous System (SNS)](https://internetcomputer.org/docs/building-apps/governing-apps/overview) des Internet Computer für ihre Governance-Infrastruktur. Dies bietet einen bewährten, sicheren Rahmen für dezentrale Entscheidungsfindung.

### Hauptmerkmale

- **Neuron-basierte Abstimmung**: SPIRAL-Tokens staken, um Neuronen zu erstellen und an der Governance teilzunehmen
- **Auflösungsverzögerungsboni**: Längere Sperrfristen erhöhen die Stimmkraft
- **Altersboni**: Neuronen gewinnen mit der Zeit mehr Stimmkraft
- **Vorschlagssystem**: Standard SNS-Vorschlagsrahmen für alle Governance-Aktionen

::: info SNS-Konfiguration
Für detaillierte technische Parameter unseres SNS-Setups, einschließlich Mindest-Stakes, Abstimmungsperioden und Belohnungsraten, siehe die SNS-Initialisierungsparameter in unserer Dokumentation.
:::

### Governance-Parameter

| Parameter | Wert | Zweck |
|-----------|------|--------|
| **Ablehnungsgebühr** | 1000 SPIRAL | Spam-Vorschläge verhindern |
| **Initiale Abstimmungsperiode** | 7 Tage | Standard-Beratungszeit |
| **Maximale Fristverlängerung** | 1 Tag | Späte Beteiligung ermöglichen |
| **Mindest-Stake für Neuron-Erstellung** | 1000 SPIRAL | Basis-Beteiligungsschwelle |

## Neuron-Staking-Mechaniken

### Basisanforderungen

| Parameter | Wert | Beschreibung |
|-----------|------|--------------|
| **Mindest-Stake** | 1.000 SPIRAL | Basisbetrag für Neuron-Erstellung |
| **Minimale Sperrfrist** | 30 Tage | Kürzeste erlaubte Auflösungsverzögerung |
| **Maximale Sperrfrist** | 8 Jahre | Längstmögliche Auflösungsverzögerung |
| **Transaktionsgebühr** | 0,01 SPIRAL | Netzwerkbetriebskosten |

### Reifezeitplan

| Sperrfrist | Bonus-Multiplikator | Effektive Leistung |
|------------|-------------------|-------------------|
| 30 Tage | 1,0x | Basisleistung |
| 6 Monate | 1,25x | +25% |
| 1 Jahr | 1,5x | +50% |
| 2 Jahre | 1,75x | +75% |
| 4 Jahre | 1,85x | +85% |
| 8 Jahre | 2,0x | +100% |

## Entscheidungsfindungsrahmen

### Governance-Bereiche

1. **Treasury-Management**
   - Marketing-Kampagnen
   - Entwicklungsfinanzierung
   - Strategische Partnerschaften

2. **Wirtschaftspolitik**
   - Tokenomics-Anpassungen
   - Staking-Raten
   - Gebührenstrukturen

3. **Entwicklungs-Roadmap**
   - Feature-Priorisierung
   - Spiel-Erweiterungen
   - Technische Verbesserungen

### Vorschlagssystem

| Phase | Dauer | Anforderungen |
|-------|-------|---------------|
| **Einreichung** | N/A | 1.000 SPIRAL Stake |
| **Überprüfung** | 24 Stunden | Community-Feedback |
| **Abstimmung** | 7 Tage | Aktives Neuron erforderlich |
| **Ausführung** | Variabel | Automatisiert wenn genehmigt |

::: info Community-Implementierung
Für praktische Details über Treasury-Management, Community-Programme und Ökosystem-Wachstumsinitiativen, siehe unseren [Community](/community)-Rahmen.
:::

