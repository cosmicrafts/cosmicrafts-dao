# Gouvernance
![Gouvernance](govbanner.webp)

## Introduction

Le Cosmicrafts DAO place la communauté au centre, donnant aux parties prenantes un véritable droit de regard sur la croissance de la franchise. Construit sur une technologie éprouvée, le DAO utilise l'équité, la transparence et la prise de décision communautaire pour garantir que Cosmicrafts reste fidèle à sa vision.

::: info Guide de Lecture
Ce document décrit le cadre de gouvernance du Cosmicrafts DAO, en se concentrant sur les processus de prise de décision, les systèmes de proposition et la participation communautaire. Il complète le document [Tokenomie](/tokenomics) qui couvre les aspects économiques.

- **Focus Principal** : Processus de gouvernance, vote et prise de décision communautaire
- **Document Complémentaire** : [Tokenomie](/tokenomics) pour l'économie des tokens et leur utilité
- **Références Croisées** : Recherchez les encadrés d'information reliant aux sections pertinentes de tokenomie
:::

## Principes Fondamentaux du DAO

| Principe | Description |
|----------|-------------|
| **Souveraineté Communautaire** | • Pouvoir de décision collectif<br>• Processus de gouvernance transparent<br>• Vote on-chain et exécution automatisée<br>|
| **Croissance Durable** | • Création de valeur à long terme<br>• Développement équilibré de l'écosystème<br>• Gestion de la trésorerie par la communauté<br>• Système d'évaluation basé sur les données |
| **Participation Ouverte** | • Structure de gouvernance inclusive<br>• Faibles barrières à l'entrée<br>• Expansion dirigée par la communauté<br>• Accessibilité multi-chaînes |

## Distribution du Pouvoir de Vote

<div class="tokenomics-diagram">
  <img src="src/assets/icons/votingpower.svg" alt="Distribution du Pouvoir de Vote SPIRAL" />
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

::: info Pouvoir de Vote Dynamique
La distribution réelle du pouvoir de vote fluctuera en fonction des décisions des parties prenantes concernant :
- La quantité de tokens stakés dans les neurones
- La durée de délai de dissolution choisie
- L'âge accumulé des neurones
Ces facteurs peuvent modifier significativement l'influence relative des différents groupes de parties prenantes au fil du temps.
:::

| Groupe de Parties Prenantes | Part de Vote | Tokens de Base | Objectif |
|----------------------------|---------------|----------------|-----------|
| **Participants SNS** | 50% | 120M | - Plus grand bloc de vote<br>- Gouvernance dirigée par la communauté<br>- Potentiel d'influence accrue par la participation |
| **Équipe de Développement** | 33,3% | 80M | - Prise de décision stratégique<br>- Délai de dissolution de 8 ans avec acquisition sur 1 an<br>- Réduction progressive de l'influence |
| **Genesis/Seed** | 16,7% | 40M | - Représentation des premiers soutiens<br>- Délais de dissolution échelonnés (0-7 ans)<br>- Influence initiale équilibrée |

### Multiplicateurs de Pouvoir

| Facteur | Bonus Maximum | Temps pour Atteindre |
|---------|---------------|---------------------|
| **Délai de Dissolution** | +100% | 8 ans |
| **Âge du Neurone** | +100% | 1 an |
| **Délai de Dissolution Minimum** | N/A | 1 mois |
| **Plafond Combiné** | 3x pouvoir de base | N/A |

## Intégration SNS

Le Cosmicrafts DAO s'appuie sur le [Service Nervous System (SNS)](https://internetcomputer.org/docs/building-apps/governing-apps/overview) de l'Internet Computer pour son infrastructure de gouvernance. Cela fournit un cadre éprouvé et sécurisé pour la prise de décision décentralisée.

### Caractéristiques Clés

- **Vote Basé sur les Neurones** : Stakez des tokens SPIRAL pour créer des neurones et participer à la gouvernance
- **Bonus de Délai de Dissolution** : Des périodes de blocage plus longues augmentent le pouvoir de vote
- **Bonus d'Âge** : Les neurones gagnent plus de pouvoir de vote au fil du temps
- **Système de Proposition** : Cadre standard de proposition SNS pour toutes les actions de gouvernance

::: info Configuration SNS
Pour les paramètres techniques détaillés de notre configuration SNS, y compris les stakes minimums, les périodes de vote et les taux de récompense, consultez les paramètres d'initialisation SNS dans notre documentation.
:::

### Paramètres de Gouvernance

| Paramètre | Valeur | Objectif |
|-----------|--------|----------|
| **Frais de Rejet** | 1000 SPIRAL | Prévenir les propositions spam |
| **Période de Vote Initiale** | 7 jours | Temps de délibération standard |
| **Extension Maximum de Délai** | 1 jour | Permettre la participation tardive |
| **Stake Minimum pour Création de Neurone** | 1000 SPIRAL | Seuil de participation de base |

## Mécaniques de Staking des Neurones

### Exigences de Base

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| **Stake Minimum** | 1 000 SPIRAL | Montant de base requis pour créer un neurone |
| **Période de Blocage Minimum** | 30 jours | Plus court délai de dissolution autorisé |
| **Période de Blocage Maximum** | 8 ans | Plus long délai de dissolution possible |
| **Frais de Transaction** | 0,01 SPIRAL | Coût d'opération réseau |

### Calendrier de Maturité

| Période de Blocage | Multiplicateur de Bonus | Pouvoir Effectif |
|-------------------|------------------------|-------------------|
| 30 jours | 1,0x | Pouvoir de Base |
| 6 mois | 1,25x | +25% |
| 1 an | 1,5x | +50% |
| 2 ans | 1,75x | +75% |
| 4 ans | 1,85x | +85% |
| 8 ans | 2,0x | +100% |

## Cadre de Prise de Décision

### Domaines de Gouvernance

1. **Gestion de la Trésorerie**
   - Campagnes Marketing
   - Financement du Développement
   - Partenariats Stratégiques

2. **Politiques Économiques**
   - Ajustements de Tokenomie
   - Taux de Staking
   - Structures de Frais

3. **Feuille de Route de Développement**
   - Priorisation des Fonctionnalités
   - Extensions de Jeu
   - Améliorations Techniques

### Système de Proposition

| Étape | Durée | Exigences |
|-------|--------|-----------|
| **Soumission** | N/A | Stake de 1 000 SPIRAL |
| **Révision** | 24 heures | Retour de la communauté |
| **Vote** | 7 jours | Neurone actif requis |
| **Exécution** | Variable | Automatisée si approuvée |

::: info Mise en Œuvre Communautaire
Pour les détails pratiques sur la gestion de la trésorerie, les programmes communautaires et les initiatives de croissance de l'écosystème, consultez notre cadre [Communauté](/community).
:::

