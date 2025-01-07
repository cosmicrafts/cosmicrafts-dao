<script setup>
import { useI18n } from 'vue-i18n';
import LanguageSelector from '@/components/LanguageSelector.vue';
import { inject } from 'vue';
const selectedLanguage = inject('selectedLanguage');
const { locale } = useI18n();

</script>

<template>
  <footer>
    <!-- Social Media & Title -->
    <div class="social-section">
      <h3>{{ $t('footer.stayConnected') }}</h3>
      <ul class="social-links">
        <li><a href="#"><img src="@/assets/icons/discord.svg" alt="Discord" /></a></li>
        <li><a href="#"><img src="@/assets/icons/x.svg" alt="Twitter" /></a></li>
        <li><a href="#"><img src="@/assets/icons/facebook.svg" alt="Facebook" /></a></li>
        <li><a href="#"><img src="@/assets/icons/dscvr.svg" alt="DSCVR" /></a></li>
        <li><a href="#"><img src="@/assets/icons/distrikt.svg" alt="Distrikt" /></a></li>
      </ul>
    </div>

    <!-- Use the LanguageSelector component -->
    <div class="language-section">
      <LanguageSelector />
    </div>  

    <!-- Horizontal Links & Branding -->
    <div class="footer-nav">
      <ul class="links">
        <li><a href="#">{{ $t('footer.careers') }}</a></li>
        <li><a href="#">{{ $t('footer.about') }}</a></li>
        <li><a href="#">{{ $t('footer.support') }}</a></li>
        <li><a href="#">{{ $t('footer.press') }}</a></li>
        <li><a href="#">{{ $t('footer.creators') }}</a></li>
      </ul>

      <!-- Logo and Trademark -->
      <div class="branding">
        <img src="@/assets/icons/wou.svg" alt="World of Unreal Logo" />
        <p>©2024 World of Unreal, LLC.<br>All trademarks referenced herein are the properties of their respective owners.</p>
      </div>

      <!-- Legal Links -->
      <ul class="legal-links">
        <li><a href="#">{{ $t('footer.privacy') }}</a></li>
        <li><a href="#">{{ $t('footer.legal') }}</a></li>
        <li><a href="#">{{ $t('footer.terms') }}</a></li>
        <li><a href="#">{{ $t('footer.cookiePolicy') }}</a></li>
        <li><a href="#">{{ $t('footer.cookieSettings') }}</a></li>
      </ul>
    </div>
  </footer>
</template>

<style scoped>
footer {
  padding: 2rem;
 border-top: 1px solid #3a3a3a;
  text-align: center;
  color: #e2e8f0;

}

.social-section {
  margin-bottom: 1.5rem;
}

.social-section h3 {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.social-links {
  list-style: none;
  padding: 0;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.social-links img {
  width: 24px;
  height: 24px;
  transition: transform 0.3s;
}

.social-links img:hover {
  transform: scale(1.1);
}

/* Language Section */
.language-section {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

/* Footer Navigation Links */
.footer-nav {
  margin-top: 2rem;
}

.links,
.legal-links {
  list-style: none;
  padding: 0;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin: 1rem 0;
}

.links a,
.legal-links a {
  color: #4a90e2;
  text-decoration: none;
  font-size: 0.9rem;
}

.links a:hover,
.legal-links a:hover {
  color: #3a7bd5;
  text-decoration: underline;
}

/* Branding and Logo */
.branding {
  text-align: center;
  margin: 1rem 0;
}

.branding img {
  width: 80px;
  margin-bottom: 0.5rem;
}

.branding p {
  font-size: 0.8rem;
  color: #b0b0b0;
}
</style>
