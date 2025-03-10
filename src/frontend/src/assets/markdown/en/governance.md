# Governance
![Governance](govbanner.webp)

## Introduction

The Cosmicrafts DAO puts the community at the center, giving Stakeholders a real say in how the franchise grows. Built on proven technology, the DAO uses fairness, transparency, and community-driven decision-making to ensure Cosmicrafts stays true to its vision.

::: info Reading Guide
This document outlines the governance framework of the Cosmicrafts DAO, focusing on decision-making processes, proposal systems, and community participation. It complements the [Tokenomics](/tokenomics) document, which covers economic aspects.

- **Primary Focus**: Governance processes, voting, and community decision-making
- **Companion Document**: [Tokenomics](/tokenomics) for token economics and utility
- **Cross-References**: Look for tip boxes linking to relevant tokenomics sections
:::

## DAO Core Principles

| Principle | Description |
|-----------|-------------|
| **Community Sovereignty** | • Collective decision-making power<br>• Transparent governance process<br>• On-chain voting and automated execution<br>|
| **Sustainable Growth** | • Long-term value creation<br>• Balanced ecosystem development<br>• Community-driven treasury management<br>• Data-driven evaluation system |
| **Open Participation** | • Inclusive governance structure<br>• Low barriers to entry<br>• Community-driven expansion<br>• Multi-chain accessibility |


## Voting Power Distribution

<div class="tokenomics-diagram">
  <img src="src/assets/icons/votingpower.svg" alt="SPIRAL Token Allocation" />
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

::: info Dynamic Voting Power
The actual distribution of voting power will fluctuate based on stakeholder decisions regarding:
- Amount of tokens staked in neurons
- Length of dissolve delay chosen
- Age of neurons accumulated
These factors can significantly shift the relative influence of different stakeholder groups over time.
:::

| Stakeholder Group | Voting Share | Base Tokens | Purpose |
|-------------------|--------------|-------------|----------|
| **SNS Participants** | 50% | 120M | - Largest voting bloc<br>- Community-driven governance<br>- Potential for increased influence through participation |
| **Developer Team** | 33.3% | 80M | - Strategic decision-making<br>- 8-year dissolve delay with 1-year vesting<br>- Gradual reduction of influence |
| **Genesis/Seed** | 16.7% | 40M | - Early supporter representation<br>- Staggered dissolve delays (0-7 years)<br>- Balanced initial influence |



### Power Multipliers

| Factor | Maximum Bonus | Time to Achieve |
|--------|---------------|-----------------|
| **Dissolve Delay** | +100% | 8 years |
| **Neuron Age** | +100% | 1 year |
| **Minimum Dissolve Delay** | N/A | 1 month |
| **Combined Cap** | 3x base power | N/A |

## SNS Integration

The Cosmicrafts DAO leverages the Internet Computer's [Service Nervous System (SNS)](https://internetcomputer.org/docs/building-apps/governing-apps/overview) for its governance infrastructure. This provides a battle-tested, secure framework for decentralized decision-making.

### Key Features

- **Neuron-Based Voting**: Stake SPIRAL tokens to create neurons and participate in governance
- **Dissolve Delay Bonuses**: Longer lockup periods increase voting power
- **Age Bonuses**: Neurons gain more voting power over time
- **Proposal System**: Standard SNS proposal framework for all governance actions

::: info SNS Configuration
For detailed technical parameters of our SNS setup, including minimum stakes, voting periods, and reward rates, refer to the SNS initialization parameters in our documentation.
:::

### Governance Parameters

| Parameter | Value | Purpose |
|-----------|--------|---------|
| **Rejection Fee** | 1000 SPIRAL | Prevent spam proposals |
| **Initial Voting Period** | 7 days | Standard deliberation time |
| **Maximum Deadline Extension** | 1 day | Allow for late participation |
| **Minimum Neuron Creation Stake** | 1000 SPIRAL | Base participation threshold |


## Neuron Staking Mechanics

### Base Requirements

| Parameter | Value | Description |
|-----------|--------|-------------|
| **Minimum Stake** | 1,000 SPIRAL | Base amount required to create a neuron |
| **Minimum Lock Period** | 30 days | Shortest allowed dissolve delay |
| **Maximum Lock Period** | 8 years | Longest possible dissolve delay |
| **Transaction Fee** | 0.01 SPIRAL | Network operation cost |

### Maturity Schedule

| Lock Period | Bonus Multiplier | Effective Power |
|-------------|------------------|-----------------|
| 30 days | 1.0x | Base Power |
| 6 months | 1.25x | +25% |
| 1 year | 1.5x | +50% |
| 2 years | 1.75x | +75% |
| 4 years | 1.85x | +85% |
| 8 years | 2.0x | +100% |


## Decision Making Framework

### Governance Areas

1. **Treasury Management**
   - Marketing Campaigns
   - Development Funding
   - Strategic Partnerships

2. **Economic Policies**
   - Tokenomics Adjustments
   - Staking Rates
   - Fee Structures

3. **Development Roadmap**
   - Feature Prioritization
   - Game Expansions
   - Technical Improvements

### Proposal System

| Stage | Duration | Requirements |
|-------|----------|--------------|
| **Submission** | N/A | 1,000 SPIRAL stake |
| **Review** | 24 hours | Community feedback |
| **Voting** | 7 days | Active neuron required |
| **Execution** | Variable | Automated if approved |

::: info Community Implementation
For practical details about treasury management, community programs, and ecosystem growth initiatives, see our [Community](/community) framework.
:::

