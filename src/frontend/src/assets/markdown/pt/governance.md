# Governança
![Governança](govbanner.webp)

## Introdução

A Cosmicrafts DAO coloca a comunidade no centro, dando aos stakeholders uma voz real na evolução da franquia. Construída sobre tecnologia comprovada, a DAO utiliza justiça, transparência e tomada de decisão dirigida pela comunidade para garantir que a Cosmicrafts permaneça fiel à sua visão.

::: info Guia de Leitura
Este documento descreve a estrutura de governança da Cosmicrafts DAO, focando em processos decisórios, sistemas de propostas e participação da comunidade. Ele complementa o documento de [Tokenomics](/tokenomics), que aborda os aspectos econômicos.

- **Foco Principal**: Processos de governança, votação e tomada de decisão da comunidade
- **Documento Complementar**: [Tokenomics](/tokenomics) para economia e utilidade dos tokens
- **Referências Cruzadas**: Observe as caixas de informação com referências a seções relevantes de Tokenomics
:::

## Princípios Fundamentais da DAO

| Princípio | Descrição |
|-----------|-----------|
| **Soberania da Comunidade** | • Poder decisório coletivo<br>• Processo de governança transparente<br>• Votação on-chain e execução automatizada<br>|
| **Crescimento Sustentável** | • Criação de valor a longo prazo<br>• Desenvolvimento equilibrado do ecossistema<br>• Gestão do tesouro dirigida pela comunidade<br>• Sistema de avaliação baseado em dados |
| **Participação Aberta** | • Estrutura de governança inclusiva<br>• Baixas barreiras de entrada<br>• Expansão dirigida pela comunidade<br>• Acessibilidade multi-chain |

## Distribuição do Poder de Voto

<div class="tokenomics-diagram">
  <img src="src/assets/icons/votingpower.svg" alt="Distribuição do Poder de Voto do Token SPIRAL" />
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

::: info Poder de Voto Dinâmico
A distribuição real do poder de voto flutuará com base nas decisões dos stakeholders em relação a:
- Quantidade de tokens em stake em neurônios
- Duração escolhida do atraso de dissolução
- Idade acumulada dos neurônios
Esses fatores podem mudar significativamente a influência relativa de diferentes grupos de stakeholders ao longo do tempo.
:::

| Grupo de Stakeholders | Participação no Voto | Tokens Base | Propósito |
|----------------------|---------------------|-------------|-----------|
| **Participantes SNS** | 50% | 120M | - Maior bloco de votação<br>- Governança dirigida pela comunidade<br>- Potencial para influência aumentada através da participação |
| **Time de Desenvolvimento** | 33,3% | 80M | - Tomada de decisão estratégica<br>- Atraso de dissolução de 8 anos com vesting de 1 ano<br>- Redução gradual de influência |
| **Genesis/Seed** | 16,7% | 40M | - Representação de apoiadores iniciais<br>- Atrasos de dissolução escalonados (0-7 anos)<br>- Influência inicial equilibrada |

### Multiplicadores de Desempenho

| Fator | Bônus Máximo | Tempo para Alcançar |
|-------|--------------|---------------------|
| **Atraso de Dissolução** | +100% | 8 anos |
| **Idade do Neurônio** | +100% | 1 ano |
| **Atraso de Dissolução Mínimo** | N/A | 1 mês |
| **Limite Combinado** | 3x Desempenho Base | N/A |

## Integração SNS

A Cosmicrafts DAO utiliza o [Service Nervous System (SNS)](https://internetcomputer.org/docs/building-apps/governing-apps/overview) do Internet Computer para sua infraestrutura de governança. Isso fornece uma estrutura comprovada e segura para tomada de decisão descentralizada.

### Características Principais

- **Votação Baseada em Neurônios**: Fazer stake de tokens SPIRAL para criar neurônios e participar da governança
- **Bônus de Atraso de Dissolução**: Períodos de bloqueio mais longos aumentam o poder de voto
- **Bônus de Idade**: Neurônios ganham mais poder de voto com o tempo
- **Sistema de Propostas**: Estrutura padrão de propostas SNS para todas as ações de governança

::: info Configuração SNS
Para parâmetros técnicos detalhados de nossa configuração SNS, incluindo stakes mínimos, períodos de votação e taxas de recompensa, consulte os parâmetros de inicialização SNS em nossa documentação.
:::

### Parâmetros de Governança

| Parâmetro | Valor | Propósito |
|-----------|-------|-----------|
| **Taxa de Rejeição** | 1000 SPIRAL | Prevenir propostas spam |
| **Período Inicial de Votação** | 7 dias | Tempo padrão de deliberação |
| **Extensão Máxima de Prazo** | 1 dia | Permitir participação tardia |
| **Stake Mínimo para Criação de Neurônio** | 1000 SPIRAL | Limite base de participação |

## Mecânicas de Staking de Neurônios

### Requisitos Básicos

| Parâmetro | Valor | Descrição |
|-----------|-------|-----------|
| **Stake Mínimo** | 1.000 SPIRAL | Quantidade base para criação de neurônio |
| **Período Mínimo de Bloqueio** | 30 dias | Menor atraso de dissolução permitido |
| **Período Máximo de Bloqueio** | 8 anos | Maior atraso de dissolução possível |
| **Taxa de Transação** | 0,01 SPIRAL | Custos operacionais da rede |

### Cronograma de Maturação

| Período de Bloqueio | Multiplicador de Bônus | Desempenho Efetivo |
|---------------------|------------------------|---------------------|
| 30 dias | 1,0x | Desempenho Base |
| 6 meses | 1,25x | +25% |
| 1 ano | 1,5x | +50% |
| 2 anos | 1,75x | +75% |
| 4 anos | 1,85x | +85% |
| 8 anos | 2,0x | +100% |

## Estrutura de Tomada de Decisão

### Áreas de Governança

1. **Gestão do Tesouro**
   - Campanhas de marketing
   - Financiamento de desenvolvimento
   - Parcerias estratégicas

2. **Política Econômica**
   - Ajustes de tokenomics
   - Taxas de staking
   - Estruturas de taxas

3. **Roadmap de Desenvolvimento**
   - Priorização de recursos
   - Expansões do jogo
   - Melhorias técnicas

### Sistema de Propostas

| Fase | Duração | Requisitos |
|------|---------|------------|
| **Submissão** | N/A | Stake de 1.000 SPIRAL |
| **Revisão** | 24 horas | Feedback da comunidade |
| **Votação** | 7 dias | Requer neurônio ativo |
| **Execução** | Variável | Automatizada se aprovada |

::: info Implementação na Comunidade
Para detalhes práticos sobre gestão do tesouro, programas comunitários e iniciativas de crescimento do ecossistema, consulte nossa estrutura de [Comunidade](/community).
:::

