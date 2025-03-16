<template>
  <section v-if="proposals.length > 0" class="proposals-section">
    <h2 class="section-title text-gradient">{{ $t('proposals.title', 'Active Proposals') }}</h2>
    
    <div class="proposals-grid">
      <div v-for="proposal in proposals" 
           :key="`proposal-${proposal.id}`" 
           class="proposal-card cosmic-card">
        <div class="proposal-header">
          <div class="proposal-title">
            <h3>{{ proposal.title }}</h3>
            <span class="proposal-id">#{{ proposal.id }}</span>
          </div>
          <span class="proposal-status" :class="proposal.status">
            {{ $t(`proposals.status.${proposal.status}`, proposal.status) }}
          </span>
        </div>
        
        <p class="proposal-summary">{{ proposal.summary }}</p>
        
        <div class="proposal-stats">
          <div class="vote-progress">
            <div class="progress-bar">
              <div class="progress-fill" 
                   :style="{ width: `${proposal.forPercentage}%` }"></div>
            </div>
            <div class="vote-counts">
              <span class="for">{{ $t('proposals.for', 'For') }}: {{ proposal.forVotes }}</span>
              <span class="against">{{ $t('proposals.against', 'Against') }}: {{ proposal.againstVotes }}</span>
            </div>
          </div>
          
          <div class="time-remaining">
            <i class="fas fa-clock"></i>
            <span>{{ proposal.timeRemaining }}</span>
          </div>
        </div>
        
        <div class="proposal-actions">
          <a :href="daoAppUrl" target="_blank" rel="noopener noreferrer" class="cosmic-button primary">
            <i class="fas fa-check"></i>
            {{ $t('proposals.vote_for', 'Vote For') }}
          </a>
          <a :href="daoAppUrl" target="_blank" rel="noopener noreferrer" class="cosmic-button secondary">
            <i class="fas fa-times"></i>
            {{ $t('proposals.vote_against', 'Vote Against') }}
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
  name: "ProposalsComponent",
  props: {
    initialProposals: {
      type: Array,
      default: () => []
    },
    daoUrl: {
      type: String,
      default: 'https://nns.ic0.app'
    }
  },
  setup(props) {
    const { t } = useI18n();
    
    // Reactive properties
    const proposals = ref(props.initialProposals.length > 0 ? props.initialProposals : [
      {
        id: "1",
        title: "Community Content Creator Program",
        status: "active",
        summary: "Establish a framework for content creators to receive funding for promoting Cosmicrafts ecosystem",
        forVotes: "243K",
        againstVotes: "52K",
        forPercentage: 82,
        timeRemaining: "3 days"
      },
      {
        id: "2",
        title: "Treasury Diversification Strategy",
        status: "active",
        summary: "Allocate 5% of treasury funds to strategic investments in ecosystem-aligned protocols",
        forVotes: "189K",
        againstVotes: "115K",
        forPercentage: 62,
        timeRemaining: "5 days"
      }
    ]);
    
    const daoAppUrl = ref(props.daoUrl);

    return {
      proposals,
      daoAppUrl
    };
  }
};
</script>

<style scoped>
/* Proposals Section Styles */
.proposals-section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.section-title {
  font-size: 3rem;
  text-align: center;
  margin-bottom: 4rem;
  font-weight: 900;
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, var(--color-text-primary, #ffffff) 0%, var(--color-primary, #0fb9fd) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 5px 15px rgba(15, 185, 253, 0.2);
  letter-spacing: -0.02em;
  transform-style: preserve-3d;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -1rem;
  left: 50%;
  transform: translateX(-50%);
  width: 8rem;
  height: 3px;
  background: linear-gradient(90deg, 
    rgba(15, 185, 253, 0) 0%, 
    rgba(15, 185, 253, 0.7) 50%, 
    rgba(15, 185, 253, 0) 100%);
  border-radius: 2px;
}

.proposals-grid {
  display: grid;
  gap: 2rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.proposal-card {
  padding: 2rem;
  background: linear-gradient(135deg,
    rgba(15, 185, 253, 0.05) 0%,
    rgba(15, 185, 253, 0.02) 100%
  );
  border: 1px solid rgba(15, 185, 253, 0.1);
  border-radius: 6px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.proposal-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(15, 185, 253, 0.15);
  border-color: rgba(15, 185, 253, 0.2);
}

.proposal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(15, 185, 253, 0.1);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.proposal-title {
  flex: 1;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.proposal-title h3 {
  font-size: 1.5rem;
  color: var(--color-text-primary, #ffffff);
  margin-bottom: 0.5rem;
  font-weight: var(--weight-bold, 700);
}

.proposal-id {
  font-size: 0.9rem;
  color: var(--color-text-tertiary, #a0b0c5);
}

.proposal-status {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  background: rgba(15, 185, 253, 0.1);
  color: var(--color-primary, #0fb9fd);
  border: 1px solid var(--color-primary, #0fb9fd);
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.proposal-status.active {
  background: rgba(15, 185, 253, 0.15);
}

.proposal-summary {
  font-size: 1.1rem;
  color: var(--color-text-secondary, #d1d9e6);
  margin-bottom: 2rem;
  line-height: 1.6;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.proposal-stats {
  margin-bottom: 2rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.vote-progress {
  margin-bottom: 1rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.progress-bar {
  height: 8px;
  background: rgba(15, 185, 253, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.75rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary, #0fb9fd);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.vote-counts {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--color-text-secondary, #d1d9e6);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.time-remaining {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text-tertiary, #a0b0c5);
  font-size: 0.9rem;
}

.time-remaining i {
  color: var(--color-primary, #0fb9fd);
}

.proposal-actions {
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.cosmic-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  box-sizing: border-box;
}

.cosmic-button.primary {
  background: var(--color-primary, #0fb9fd);
  color: #ffffff;
  border: 1px solid transparent;
}

.cosmic-button.secondary {
  background: transparent;
  color: var(--color-primary, #0fb9fd);
  border: 1px solid var(--color-primary, #0fb9fd);
}

.cosmic-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 185, 253, 0.3);
}

.cosmic-button:active {
  transform: translateY(0);
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  .proposals-section {
    padding: 3rem 1rem;
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }
  
  .section-title {
    font-size: 2.25rem;
    margin-bottom: 2.5rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .proposal-card {
    padding: 1.5rem 1rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .proposal-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .proposal-title h3 {
    font-size: 1.25rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .proposal-summary {
    font-size: 1rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .vote-counts {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .proposal-actions {
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
  
  .cosmic-button {
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }
}

@media (max-width: 480px) {
  .proposals-section {
    padding: 2rem 0.5rem;
  }
  
  .section-title {
    font-size: 1.75rem;
    margin-bottom: 2rem;
  }
  
  .proposal-card {
    padding: 1.25rem 0.75rem;
  }
  
  .proposal-title h3 {
    font-size: 1.1rem;
  }
  
  .proposal-summary {
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
  }
  
  .cosmic-button {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}
</style> 