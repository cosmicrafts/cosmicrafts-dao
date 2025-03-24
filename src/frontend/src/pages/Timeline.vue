<template>
  <!-- Main Timeline Container -->
  <div class="timeline-container">
    <!-- App Header (Mobile) -->
    <header class="app-header">
      <div class="logo-container">
        <img src="@/assets/icons/logo.svg" alt="CosmicCrafts" class="logo" />
      </div>
      <div class="header-actions">
        <button class="header-action-btn notifications-btn">
          <i class="fas fa-bell"></i>
          <span class="notification-badge">3</span>
        </button>
        <div class="user-avatar-small" @click="navigateTo('/profile')">
          <img :src="getAvatarUrl(avatarId)" :alt="username" />
        </div>
      </div>
    </header>
    
    <!-- Main Content Area -->
    <div class="main-content-area">
      <!-- Left Sidebar (Desktop) -->
      <nav class="desktop-sidebar">
        <div class="sidebar-header">
          <img src="@/assets/icons/logo.svg" alt="CosmicCrafts" class="logo" />
        </div>
        
        <div class="nav-links">
          <a href="#" class="nav-link active" @click.prevent="navigateTo('/')">
            <i class="fas fa-home"></i>
            <span>{{ $t('navigation.home') }}</span>
          </a>
          <a href="#" class="nav-link" @click.prevent="navigateTo('/explore')">
            <i class="fas fa-hashtag"></i>
            <span>{{ $t('navigation.explore') }}</span>
          </a>
          <a href="#" class="nav-link" @click.prevent="navigateTo('/notifications')">
            <i class="fas fa-bell"></i>
            <span>{{ $t('navigation.notifications') }}</span>
            <span class="badge">3</span>
          </a>
          <a href="#" class="nav-link" @click.prevent="navigateTo('/messages')">
            <i class="fas fa-envelope"></i>
            <span>{{ $t('navigation.messages') }}</span>
            <span class="badge">1</span>
          </a>
          <a href="#" class="nav-link" @click.prevent="navigateTo('/profile')">
            <i class="fas fa-user"></i>
            <span>{{ $t('navigation.profile') }}</span>
          </a>
          <a href="#" class="nav-link" @click.prevent="navigateTo('/dashboard')">
            <i class="fas fa-chart-line"></i>
            <span>{{ $t('navigation.dashboard') }}</span>
          </a>
        </div>
        
        <button class="post-button desktop">
          <span>{{ $t('timeline.post') }}</span>
          <i class="fas fa-pen"></i>
        </button>
        
        <div class="user-profile-compact">
          <div class="user-avatar-small">
            <img :src="getAvatarUrl(avatarId)" :alt="username" />
          </div>
          <div class="user-details">
            <span class="username">{{ username }}</span>
            <span class="user-handle">@{{ username.toLowerCase().replace(' ', '') }}</span>
          </div>
          <i class="fas fa-ellipsis-h"></i>
        </div>
      </nav>
      
      <!-- Main Timeline Content -->
      <main class="timeline-content" :class="{ 'loading': isLoading }">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-overlay">
          <div class="loader-container">
            <div class="pulsating-circle"></div>
            <span>{{ $t('timeline.loading') }}</span>
          </div>
        </div>
        
        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-container">
            <i class="fas fa-satellite-dish error-icon"></i>
            <h3>{{ $t('timeline.connectionError') }}</h3>
            <p>{{ error }}</p>
            <button @click="fetchFeed" class="retry-button">
              <i class="fas fa-sync-alt"></i>
              {{ $t('timeline.retry') }}
            </button>
          </div>
        </div>
        
        <!-- Feed Content -->
        <div v-else>
          <!-- Feed Header with Tabs -->
          <div class="feed-header">
            <div class="feed-tabs">
              <button 
                class="tab-button" 
                :class="{ active: activeTab === 'forYou' }"
                @click="setActiveTab('forYou')"
              >
                <span>{{ $t('timeline.tabs.forYou') }}</span>
              </button>
              <button 
                class="tab-button" 
                :class="{ active: activeTab === 'following' }"
                @click="setActiveTab('following')"
              >
                <span>{{ $t('timeline.tabs.following') }}</span>
              </button>
              <button 
                class="tab-button" 
                :class="{ active: activeTab === 'trending' }"
                @click="setActiveTab('trending')"
              >
                <span>{{ $t('timeline.tabs.trending') }}</span>
              </button>
            </div>
          </div>
          
          <!-- Post Creation -->
          <div class="compose-post">
            <div class="compose-post-avatar">
              <img :src="getAvatarUrl(avatarId)" :alt="username" />
            </div>
            <div class="compose-post-input">
              <div class="compose-textarea-wrapper">
                <textarea 
                  ref="composeTextarea" 
                  :placeholder="$t('timeline.createPostPlaceholder')"
                  v-model="newPostContent"
                  @input="autoResizeTextarea"
                  rows="1"
                ></textarea>
              </div>
              <div class="compose-actions">
                <div class="compose-attachments">
                  <button class="attachment-btn" title="Add Photo">
                    <i class="fas fa-image"></i>
                  </button>
                  <button class="attachment-btn" title="Add GIF">
                    <i class="fas fa-film"></i>
                  </button>
                  <button class="attachment-btn" title="Add Poll">
                    <i class="fas fa-poll-h"></i>
                  </button>
                  <button class="attachment-btn" title="Add Emoji">
                    <i class="fas fa-smile"></i>
                  </button>
                </div>
                <button 
                  class="post-button"
                  :disabled="!newPostContent.trim()" 
                  @click="createPost"
                >
                  {{ $t('timeline.post') }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Feed Divider -->
          <div class="feed-divider"></div>
          
          <!-- Posts Feed -->
          <div class="posts-feed" v-if="posts.length > 0">
            <div v-for="post in posts" :key="post.id" class="post">
              <div class="post-avatar">
                <img 
                  :src="getAvatarUrl(post.author.avatar)" 
                  :alt="post.author.username"
                  @click="navigateToProfile(post.author.id)"
                />
              </div>
              <div class="post-content">
                <div class="post-header">
                  <div class="post-user-info">
                    <span class="post-user-name" @click="navigateToProfile(post.author.id)">
                      {{ post.author.username }}
                      <i v-if="post.author.verified" class="fas fa-badge-check verified-badge"></i>
                    </span>
                    <span class="post-user-handle">@{{ post.author.username.toLowerCase().replace(' ', '') }}</span>
                    <span class="post-time">· {{ formatPostTime(post.createdAt) }}</span>
                  </div>
                  <div class="post-menu">
                    <button class="post-menu-btn">
                      <i class="fas fa-ellipsis"></i>
                    </button>
                  </div>
                </div>
                
                <div class="post-text">{{ post.content }}</div>
                
                <div v-if="post.media && post.media.length" class="post-media">
                  <img 
                    v-if="post.media[0].type === 'image'" 
                    :src="post.media[0].url" 
                    :alt="post.content" 
                    class="post-image"
                    loading="lazy"
                  />
                </div>
                
                <div class="post-actions">
                  <button class="post-action-btn comment-btn" @click="commentOnPost(post.id)">
                    <div class="action-icon-container">
                      <i class="fas fa-comment"></i>
                    </div>
                    <span>{{ post.comments }}</span>
                  </button>
                  
                  <button class="post-action-btn repost-btn" @click="repostPost(post.id)">
                    <div class="action-icon-container">
                      <i class="fas fa-retweet"></i>
                    </div>
                    <span>{{ post.reposts }}</span>
                  </button>
                  
                  <button class="post-action-btn like-btn" :class="{ liked: post.liked }" @click="likePost(post.id)">
                    <div class="action-icon-container">
                      <i class="fas fa-heart"></i>
                    </div>
                    <span>{{ post.likes }}</span>
                  </button>
                  
                  <button class="post-action-btn share-btn" @click="sharePost(post.id)">
                    <div class="action-icon-container">
                      <i class="fas fa-share-alt"></i>
                    </div>
                  </button>
                </div>
                
                <!-- Comments Section (When Expanded) -->
                <div v-if="post.showComments" class="post-comments">
                  <div class="post-comment-form">
                    <div class="comment-avatar">
                      <img :src="getAvatarUrl(avatarId)" :alt="username" />
                    </div>
                    <div class="comment-input-wrapper">
                      <textarea 
                        :id="`comment-${post.id}`"
                        :placeholder="$t('timeline.writeComment')"
                        v-model="post.newComment"
                        rows="1"
                      ></textarea>
                      <div class="comment-actions">
                        <div class="comment-attachments">
                          <button class="attachment-btn-small">
                            <i class="fas fa-image"></i>
                          </button>
                          <button class="attachment-btn-small">
                            <i class="fas fa-smile"></i>
                          </button>
                        </div>
                        <button 
                          class="comment-btn"
                          :disabled="!post.newComment?.trim()"
                          @click="submitComment(post.id)"
                        >
                          {{ $t('timeline.reply') }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Load More Posts -->
            <div class="load-more-container">
              <button v-if="!loadingMore" @click="loadMorePosts" class="load-more-btn">
                <span>{{ $t('timeline.loadMore') }}</span>
              </button>
              <div v-else class="load-more-indicator">
                <div class="pulsating-circle small"></div>
                <span>{{ $t('timeline.loadingMore') }}</span>
              </div>
            </div>
          </div>
          
          <!-- Empty Feed State -->
          <div v-else class="empty-feed">
            <div class="empty-feed-content">
              <i class="fas fa-satellite-dish empty-icon"></i>
              <h3>{{ $t('timeline.emptyFeedTitle') }}</h3>
              <p>{{ $t('timeline.emptyFeed') }}</p>
              <p>{{ $t('timeline.startFollowing') }}</p>
              <button class="discover-people-btn">
                <i class="fas fa-user-plus"></i>
                {{ $t('timeline.discoverPeople') }}
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <!-- Right Sidebar (Trending & Suggestions) -->
      <aside class="trends-sidebar">
        <!-- Search Box -->
        <div class="search-container">
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              :placeholder="$t('timeline.searchPlaceholder')"
              class="search-input"
            />
          </div>
        </div>
        
        <!-- Premium Promotion -->
        <div class="sidebar-card premium-card">
          <h2>{{ $t('timeline.getPremium') }}</h2>
          <p>{{ $t('timeline.premiumDescription') }}</p>
          <button class="premium-btn">
            {{ $t('timeline.subscribe') }}
          </button>
        </div>
        
        <!-- Trending Topics -->
        <div class="sidebar-card trending-card">
          <h2>{{ $t('timeline.trending') }}</h2>
          
          <div class="trending-topics">
            <div v-for="topic in trendingTopics" :key="topic.id" class="trending-topic">
              <div class="topic-header">
                <span class="topic-category">{{ topic.category }}</span>
                <button class="topic-options-btn">
                  <i class="fas fa-ellipsis"></i>
                </button>
              </div>
              <h3 class="topic-title">{{ topic.content }}</h3>
              <span class="topic-posts">{{ topic.posts.toLocaleString() }} {{ $t('timeline.posts') }}</span>
            </div>
          </div>
          
          <a href="#" class="show-more">
            {{ $t('timeline.showMore') }}
          </a>
        </div>
        
        <!-- Who to Follow -->
        <div class="sidebar-card follow-card">
          <h2>{{ $t('timeline.whoToFollow') }}</h2>
          
          <div class="suggested-users">
            <div v-for="user in suggestedUsers" :key="user.id" class="suggested-user">
              <div class="user-avatar" @click="navigateToProfile(user.id)">
                <img :src="getAvatarUrl(user.avatar)" :alt="user.username" />
              </div>
              
              <div class="user-info" @click="navigateToProfile(user.id)">
                <div class="user-name">
                  {{ user.username }}
                  <i v-if="user.verified" class="fas fa-badge-check verified-badge small"></i>
                </div>
                <div class="user-handle">@{{ user.username.toLowerCase().replace(' ', '') }}</div>
              </div>
              
              <button 
                class="follow-btn" 
                :class="{ following: user.following }"
                @click.stop="followUser(user.id)"
              >
                {{ user.following ? $t('timeline.following') : $t('timeline.follow') }}
              </button>
            </div>
          </div>
          
          <a href="#" class="show-more">
            {{ $t('timeline.showMore') }}
          </a>
        </div>
        
        <!-- Footer Links -->
        <div class="sidebar-footer">
          <div class="footer-links">
            <a href="#" class="footer-link">Terms</a>
            <a href="#" class="footer-link">Privacy</a>
            <a href="#" class="footer-link">Cookies</a>
            <a href="#" class="footer-link">About</a>
            <a href="#" class="footer-link">More</a>
          </div>
          <div class="copyright">
            © 2023 CosmicCrafts
          </div>
        </div>
      </aside>
    </div>
    
    <!-- Mobile Navigation Bar -->
    <nav class="mobile-nav">
      <a href="#" class="nav-icon-btn active" @click.prevent="navigateTo('/')">
        <i class="fas fa-home"></i>
      </a>
      <a href="#" class="nav-icon-btn" @click.prevent="navigateTo('/explore')">
        <i class="fas fa-search"></i>
      </a>
      <a href="#" class="nav-icon-btn" @click.prevent="navigateTo('/notifications')">
        <i class="fas fa-bell"></i>
        <span class="notification-indicator"></span>
      </a>
      <a href="#" class="nav-icon-btn" @click.prevent="navigateTo('/messages')">
        <i class="fas fa-envelope"></i>
      </a>
    </nav>
    
    <!-- Mobile Post Button -->
    <button class="floating-post-btn" @click="showMobileComposeModal = true">
      <i class="fas fa-pen"></i>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCanisterStore } from '@/stores/canister';
import { useI18n } from 'vue-i18n';

// Import avatars
import avatar1 from '@/assets/avatars/Avatar_01.webp';
import avatar2 from '@/assets/avatars/Avatar_02.webp';
import avatar3 from '@/assets/avatars/Avatar_03.webp';
import avatar4 from '@/assets/avatars/Avatar_04.webp';
import avatar5 from '@/assets/avatars/Avatar_05.webp';
import avatar6 from '@/assets/avatars/Avatar_06.webp';
import avatar7 from '@/assets/avatars/Avatar_07.webp';
import avatar8 from '@/assets/avatars/Avatar_08.webp';
import avatar9 from '@/assets/avatars/Avatar_09.webp';
import avatar10 from '@/assets/avatars/Avatar_10.webp';
import avatar11 from '@/assets/avatars/Avatar_11.webp';
import avatar12 from '@/assets/avatars/Avatar_12.webp';

// Avatar array
const avatarSrcArray = [
  avatar1, avatar2, avatar3, avatar4,
  avatar5, avatar6, avatar7, avatar8,
  avatar9, avatar10, avatar11, avatar12
];

// Store access
const authStore = useAuthStore();
const canisterStore = useCanisterStore();
const router = useRouter();
const { t } = useI18n();

// References for DOM elements
const composeTextarea = ref(null);

// Component state
const isLoading = ref(true);
const error = ref(null);
const activeTab = ref('forYou');
const posts = ref([]);
const newPostContent = ref('');
const loadingMore = ref(false);
const showMobileComposeModal = ref(false);

// User data
const player = ref(null);

// Mock data - Replace with actual data from backend
const trendingTopics = ref([
  { id: 1, category: 'Gaming', content: '#CosmicCup2023', posts: 15420 },
  { id: 2, category: 'NFTs', content: '#GalacticDrop', posts: 8762 },
  { id: 3, category: 'Blockchain', content: 'Internet Computer', posts: 5321 },
  { id: 4, category: 'Technology', content: '#Web3Gaming', posts: 4215 }
]);

const suggestedUsers = ref([
  { id: 'user1', username: 'CosmicChampion', title: 'Top Player', avatar: 1, following: false, verified: true },
  { id: 'user2', username: 'GalacticWarrior', title: 'Tournament Winner', avatar: 3, following: false, verified: false },
  { id: 'user3', username: 'StardustCollector', title: 'NFT Enthusiast', avatar: 5, following: true, verified: true }
]);

// Computed properties
const isAuthenticated = computed(() => authStore.isAuthenticated());
const username = computed(() => player.value?.username || 'Cosmic Player');
const avatarId = computed(() => player.value?.avatar || 1);

// Methods
const getAvatarUrl = (id) => {
  const index = (Number(id) - 1) % avatarSrcArray.length;
  return avatarSrcArray[index] || avatar1;
};

const setActiveTab = (tab) => {
  activeTab.value = tab;
  fetchFeed();
};

const navigateTo = (path) => {
  router.push(path);
};

const navigateToProfile = (userId) => {
  router.push(`/${userId}`);
};

const autoResizeTextarea = () => {
  if (!composeTextarea.value) return;
  
  // Reset height temporarily to get the correct scrollHeight
  composeTextarea.value.style.height = 'auto';
  
  // Set the height to scrollHeight + border
  const newHeight = composeTextarea.value.scrollHeight;
  composeTextarea.value.style.height = `${newHeight}px`;
};

const fetchFeed = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    // TODO: Implement actual data fetching from backend
    // For now, we'll use mock data
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    const mockPosts = generateMockPosts(10, activeTab.value);
    posts.value = mockPosts;
    isLoading.value = false;
  } catch (err) {
    console.error('Error fetching feed:', err);
    error.value = 'Failed to load your feed. Please try again.';
    isLoading.value = false;
  }
};

const loadMorePosts = async () => {
  loadingMore.value = true;
  
  try {
    // TODO: Implement actual data fetching for pagination
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    
    const morePosts = generateMockPosts(5, activeTab.value, posts.value.length);
    posts.value = [...posts.value, ...morePosts];
  } catch (err) {
    console.error('Error loading more posts:', err);
  } finally {
    loadingMore.value = false;
  }
};

const createPost = async () => {
  if (!newPostContent.value.trim()) return;
  
  try {
    // TODO: Implement actual post creation on blockchain
    console.log('Creating post:', newPostContent.value);
    
    // Show loading effect
    isLoading.value = true;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Add post to local state for immediate feedback
    const newPost = {
      id: `local-${Date.now()}`,
      content: newPostContent.value,
      author: {
        id: authStore.getIdentity()?.getPrincipal().toString() || 'unknown',
        username: username.value,
        avatar: avatarId.value,
        verified: false
      },
      likes: 0,
      comments: 0,
      reposts: 0,
      createdAt: new Date().toISOString(),
      liked: false,
      showComments: false,
      newComment: ''
    };
    
    // Reset textarea height
    if (composeTextarea.value) {
      composeTextarea.value.style.height = 'auto';
    }
    
    posts.value.unshift(newPost);
    newPostContent.value = '';
    showMobileComposeModal.value = false;
    isLoading.value = false;
    
    // TODO: Add toast notification for success
  } catch (err) {
    console.error('Error creating post:', err);
    error.value = 'Failed to create post. Please try again.';
    isLoading.value = false;
    // TODO: Add toast notification for error
  }
};

const likePost = (postId) => {
  // TODO: Implement actual like functionality on blockchain
  const post = posts.value.find(p => p.id === postId);
  if (post) {
    post.liked = !post.liked;
    post.likes += post.liked ? 1 : -1;
  }
};

const commentOnPost = (postId) => {
  const post = posts.value.find(p => p.id === postId);
  if (post) {
    post.showComments = !post.showComments;
    
    if (post.showComments) {
      // Focus the comment input after expanding
      nextTick(() => {
        const commentTextarea = document.querySelector(`#comment-${postId}`);
        if (commentTextarea) {
          commentTextarea.focus();
        }
      });
    }
  }
};

const submitComment = (postId) => {
  const post = posts.value.find(p => p.id === postId);
  if (post && post.newComment?.trim()) {
    // TODO: Implement actual comment submission on blockchain
    console.log('Submitting comment on post', postId, ':', post.newComment);
    
    // For now, just increment the comment count
    post.comments++;
    post.newComment = '';
    
    // TODO: Add toast notification
  }
};

const repostPost = (postId) => {
  // TODO: Implement actual repost functionality on blockchain
  const post = posts.value.find(p => p.id === postId);
  if (post) {
    post.reposts++;
    // TODO: Add toast notification
  }
};

const sharePost = (postId) => {
  // TODO: Implement share functionality
  console.log('Sharing post:', postId);
  // Could show sharing options in a modal
};

const followUser = (userId) => {
  // TODO: Implement actual follow functionality on blockchain
  const user = suggestedUsers.value.find(u => u.id === userId);
  if (user) {
    user.following = !user.following;
    // TODO: Add toast notification
  }
};

const formatPostTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  
  // Convert to seconds, minutes, hours, and days
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);
  
  if (diffSec < 60) {
    return t('timeline.time.justNow');
  } else if (diffMin < 60) {
    return `${diffMin}${t('timeline.time.min')}`;
  } else if (diffHrs < 24) {
    return `${diffHrs}${t('timeline.time.hr')}`;
  } else if (diffDays < 7) {
    return `${diffDays}${t('timeline.time.day')}`;
  } else {
    return date.toLocaleDateString();
  }
};

// Helper function to generate mock posts
const generateMockPosts = (count, tabType, offset = 0) => {
  const posts = [];
  
  // Different content based on tab type
  const tabContent = {
    forYou: [
      'Just discovered an amazing new strategy in #CosmicCrafts!',
      'Check out my latest NFT from the Galactic Collection 🌟',
      'Who wants to team up for the upcoming tournament?',
      'The new update is simply mind-blowing! Love the new features 💯',
      'Just reached level 50 in the game! #MilestoneAchieved'
    ],
    following: [
      'Thanks for all the support, my cosmic friends!',
      'Streaming my gameplay in 30 minutes, join me!',
      'Just published my web3 gaming article, check it out',
      'Looking for alliance members, DM if interested',
      'Sharing my gameplay stats from yesterday\'s match'
    ],
    trending: [
      'The CosmicCup finals were EPIC! Congrats to the winners 🏆',
      'This new blockchain integration is revolutionary for gaming',
      'The marketplace just dropped some rare collectibles! #FOMO',
      'My prediction for the next season: more cross-chain features',
      'Hot take: Play-to-earn is just getting started in this space'
    ]
  };
  
  const content = tabContent[tabType] || tabContent.forYou;
  
  for (let i = 0; i < count; i++) {
    const index = (i + offset) % content.length;
    const hasMedia = Math.random() > 0.7;
    const post = {
      id: `post-${offset + i}`,
      content: content[index] + (index % 2 === 0 ? ' #CosmicCrafts' : ''),
      author: {
        id: `user${(i + offset) % 5 + 1}`,
        username: ['CosmicChampion', 'GalacticWarrior', 'StardustCollector', 'NebulaHunter', 'QuantumGamer'][(i + offset) % 5],
        avatar: ((i + offset) % avatarSrcArray.length) + 1,
        verified: (i + offset) % 3 === 0
      },
      likes: Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 100),
      reposts: Math.floor(Math.random() * 50),
      createdAt: new Date(Date.now() - (i + offset) * 3600000).toISOString(),
      liked: Math.random() > 0.7,
      showComments: false,
      newComment: '',
      media: hasMedia ? [{
        type: 'image',
        url: `https://picsum.photos/800/450?random=${i + offset}`
      }] : []
    };
    posts.push(post);
  }
  
  return posts;
};

// Implement infinite scroll
const setupInfiniteScroll = () => {
  // Using Intersection Observer for better performance
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !loadingMore.value && !isLoading.value) {
      loadMorePosts();
    }
  }, { threshold: 0.5 });
  
  // Observe the load more button
  const loadMoreBtn = document.querySelector('.load-more-container');
  if (loadMoreBtn) {
    observer.observe(loadMoreBtn);
  }
  
  return observer;
};

// Lifecycle methods
onMounted(async () => {
  if (authStore.isAuthenticated()) {
    player.value = authStore.player;
  }
  
  await fetchFeed();
  
  // Set up auto-resize for compose textarea
  nextTick(() => {
    if (composeTextarea.value) {
      composeTextarea.value.setAttribute('style', 'height: auto;');
      composeTextarea.value.setAttribute('style', `height: ${composeTextarea.value.scrollHeight}px;`);
    }
    
    // Set up infinite scroll
    const observer = setupInfiniteScroll();
    
    // Cleanup function
    return () => {
      observer.disconnect();
    };
  });
});
</script>

<style scoped>
/* ===== MODERN SOCIAL MEDIA TIMELINE STYLING ===== */
/* Mobile-first with responsive breakpoints */

/* ==== Core Variables ==== */
:root {
  --primary: #1d9bf0;
  --primary-hover: #1a8cd8;
  --primary-light: rgba(29, 155, 240, 0.1);
  --primary-transparent: rgba(29, 155, 240, 0.2);
  --accent: #8b5cf6;
  --accent-light: rgba(139, 92, 246, 0.1);
  --like: #f91880;
  --like-light: rgba(249, 24, 128, 0.1);
  --repost: #00ba7c;
  --repost-light: rgba(0, 186, 124, 0.1);
  --surface: #15202b;
  --surface-light: #1e2732;
  --surface-lighter: #2c3640;
  --surface-border: #38444d;
  --overlay: rgba(21, 32, 43, 0.9);
  --text: #fff;
  --text-secondary: #8899a6;
  --text-tertiary: #71767b;
  --shadow: 0 0 10px rgba(0, 0, 0, 0.12);
  --header-height: 53px;
  --nav-height: 50px;
  --sidebar-width: 275px;
  --content-width: 600px;
  --radius-sm: 4px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  --transition: 0.2s ease;
  --z-header: 100;
  --z-nav: 100;
  --z-sidebar: 50;
  --z-modal: 200;
  --z-dropdown: 150;
  --z-floating: 90;
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
}

/* ==== Reset & Base Styles ==== */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: var(--surface);
  color: var(--text);
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

button, input, textarea {
  font-family: inherit;
}

button {
  cursor: pointer;
  border: none;
  background: none;
  color: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

/* ==== Layout Structure ==== */
.timeline-container {
  min-height: 100vh;
  background-color: var(--surface);
  position: relative;
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

/* App Header (Mobile) */
.app-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-4);
  border-bottom: 1px solid var(--surface-border);
  position: sticky;
  top: 0;
  background-color: var(--surface);
  backdrop-filter: blur(12px);
  z-index: var(--z-header);
}

.logo-container {
  height: 30px;
}

.logo {
  height: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

.header-action-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition);
}

.header-action-btn:hover {
  background-color: var(--surface-lighter);
}

.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  background-color: var(--primary);
  color: var(--text);
  border-radius: var(--radius-full);
  font-size: 11px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  overflow: hidden;
  cursor: pointer;
}

.user-avatar-small img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Main Content Area */
.main-content-area {
  display: flex;
  width: 100%;
  position: relative;
}

/* Left Sidebar (Hidden on Mobile) */
.desktop-sidebar {
  display: none;
  width: var(--sidebar-width);
  height: 100vh;
  position: sticky;
  top: 0;
  padding: var(--spacing-2) var(--spacing-4);
  border-right: 1px solid var(--surface-border);
  flex-direction: column;
}

.sidebar-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: var(--spacing-2) var(--spacing-3);
  margin-bottom: var(--spacing-2);
}

.sidebar-header .logo {
  height: 30px;
}

.nav-links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-5);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-5);
  padding: var(--spacing-3) var(--spacing-4);
  border-radius: var(--radius-full);
  transition: background-color var(--transition);
  font-size: 20px;
  font-weight: 400;
}

.nav-link span {
  font-size: 18px;
}

.nav-link.active {
  font-weight: 700;
}

.nav-link:hover {
  background-color: var(--surface-lighter);
}

.badge {
  background-color: var(--primary);
  color: var(--text);
  font-size: 11px;
  border-radius: var(--radius-full);
  padding: 2px 6px;
  margin-left: auto;
}

.post-button {
  background-color: var(--primary);
  color: var(--text);
  border-radius: var(--radius-full);
  font-weight: 700;
  padding: var(--spacing-3) var(--spacing-5);
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  transition: background-color var(--transition);
  margin-bottom: var(--spacing-3);
  width: 100%;
  white-space: nowrap;
}

.post-button:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.post-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.post-button.desktop {
  margin-top: auto;
}

.user-profile-compact {
  display: flex;
  align-items: center;
  padding: var(--spacing-3);
  border-radius: var(--radius-full);
  margin-top: auto;
  cursor: pointer;
  transition: background-color var(--transition);
}

.user-profile-compact:hover {
  background-color: var(--surface-lighter);
}

.user-details {
  margin-left: var(--spacing-3);
  display: flex;
  flex-direction: column;
  flex: 1;
  line-height: 1.3;
}

.username {
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-handle {
  color: var(--text-secondary);
  font-size: 14px;
}

/* Timeline Content */
.timeline-content {
  width: 100%;
  min-height: calc(100vh - var(--header-height) - var(--nav-height));
  position: relative;
  border-right: 1px solid var(--surface-border);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--overlay);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-4);
  color: var(--text);
}

.pulsating-circle {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background-color: var(--primary);
  position: relative;
  animation: pulse 1.5s infinite;
}

.pulsating-circle.small {
  width: 20px;
  height: 20px;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.8;
  }
}

.error-state {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-6);
}

.error-container {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-4);
  color: var(--text-secondary);
}

.retry-button {
  background-color: var(--text);
  color: var(--surface);
  border-radius: var(--radius-full);
  font-weight: 700;
  padding: var(--spacing-3) var(--spacing-5);
  margin-top: var(--spacing-5);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
}

/* Feed Header with Tabs */
.feed-header {
  height: 53px;
  border-bottom: 1px solid var(--surface-border);
  position: sticky;
  top: var(--header-height);
  background-color: var(--surface);
  backdrop-filter: blur(12px);
  z-index: 5;
}

.feed-tabs {
  height: 100%;
  display: flex;
}

.tab-button {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  font-weight: 600;
  position: relative;
}

.tab-button.active {
  color: var(--text);
}

.tab-button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 56px;
  height: 4px;
  background-color: var(--primary);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

/* Compose Post */
.compose-post {
  display: flex;
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--surface-border);
}

.compose-post-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-right: var(--spacing-3);
  flex-shrink: 0;
}

.compose-post-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.compose-post-input {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.compose-textarea-wrapper {
  margin-bottom: var(--spacing-3);
}

.compose-textarea-wrapper textarea {
  width: 100%;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 18px;
  resize: none;
  outline: none;
  padding: var(--spacing-2) 0;
  min-height: 52px;
}

.compose-textarea-wrapper textarea::placeholder {
  color: var(--text-tertiary);
}

.compose-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid var(--surface-border);
  padding-top: var(--spacing-3);
}

.compose-attachments {
  display: flex;
  gap: var(--spacing-3);
}

.attachment-btn {
  color: var(--primary);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition);
}

.attachment-btn:hover {
  background-color: var(--primary-light);
}

.feed-divider {
  height: 12px;
  background-color: var(--surface-lighter);
  border-bottom: 1px solid var(--surface-border);
  border-top: 1px solid var(--surface-border);
}

/* Posts Feed */
.posts-feed {
  display: flex;
  flex-direction: column;
}

.post {
  display: flex;
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--surface-border);
  transition: background-color var(--transition);
}

.post:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.post-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-right: var(--spacing-3);
  flex-shrink: 0;
  cursor: pointer;
}

.post-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-content {
  flex: 1;
}

.post-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: var(--spacing-2);
}

.post-user-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 15px;
}

.post-user-name {
  font-weight: 700;
  cursor: pointer;
}

.post-user-name:hover {
  text-decoration: underline;
}

.verified-badge {
  color: var(--primary);
  font-size: 14px;
  margin-left: 2px;
}

.verified-badge.small {
  font-size: 12px;
}

.post-user-handle, .post-time {
  color: var(--text-tertiary);
}

.post-menu-btn {
  color: var(--text-tertiary);
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -8px;
  margin-right: -8px;
}

.post-menu-btn:hover {
  color: var(--primary);
  background-color: var(--primary-light);
}

.post-text {
  margin-bottom: var(--spacing-3);
  word-wrap: break-word;
  white-space: pre-wrap;
}

.post-media {
  margin-bottom: var(--spacing-3);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--surface-border);
}

.post-image {
  width: 100%;
  max-height: 510px;
  object-fit: cover;
  display: block;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  max-width: 425px;
}

.post-action-btn {
  display: flex;
  align-items: center;
  color: var(--text-tertiary);
  transition: color var(--transition);
  font-size: 13px;
}

.action-icon-container {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition);
  margin-right: 4px;
}

.comment-btn:hover {
  color: var(--primary);
}

.comment-btn:hover .action-icon-container {
  background-color: var(--primary-light);
}

.repost-btn:hover {
  color: var(--repost);
}

.repost-btn:hover .action-icon-container {
  background-color: var(--repost-light);
}

.like-btn:hover, .like-btn.liked {
  color: var(--like);
}

.like-btn:hover .action-icon-container, .like-btn.liked .action-icon-container {
  background-color: var(--like-light);
}

.share-btn:hover {
  color: var(--primary);
}

.share-btn:hover .action-icon-container {
  background-color: var(--primary-light);
}

/* Post Comments */
.post-comments {
  margin-top: var(--spacing-4);
  border-top: 1px solid var(--surface-border);
  padding-top: var(--spacing-4);
}

.post-comment-form {
  display: flex;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-right: var(--spacing-3);
  flex-shrink: 0;
}

.comment-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.comment-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.comment-input-wrapper textarea {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--surface-border);
  color: var(--text);
  font-size: 16px;
  resize: none;
  outline: none;
  padding: var(--spacing-2) 0;
  margin-bottom: var(--spacing-3);
}

.comment-input-wrapper textarea::placeholder {
  color: var(--text-tertiary);
}

.comment-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.comment-attachments {
  display: flex;
  gap: var(--spacing-2);
}

.attachment-btn-small {
  color: var(--primary);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition);
}

.attachment-btn-small:hover {
  background-color: var(--primary-light);
}

.comment-btn {
  background-color: var(--primary);
  color: var(--text);
  border-radius: var(--radius-full);
  font-weight: 700;
  padding: 4px var(--spacing-4);
  font-size: 14px;
  transition: background-color var(--transition);
}

.comment-btn:hover:not(:disabled) {
  background-color: var(--primary-hover);
}

.comment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Load More */
.load-more-container {
  padding: var(--spacing-5);
  display: flex;
  justify-content: center;
}

.load-more-btn {
  background-color: transparent;
  color: var(--primary);
  border: 1px solid var(--surface-border);
  border-radius: var(--radius-full);
  padding: var(--spacing-3) var(--spacing-5);
  font-weight: 600;
  transition: background-color var(--transition);
}

.load-more-btn:hover {
  background-color: var(--primary-light);
}

.load-more-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  color: var(--text-secondary);
}

/* Empty Feed */
.empty-feed {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-6);
}

.empty-feed-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: var(--spacing-4);
  color: var(--text-secondary);
}

.discover-people-btn {
  background-color: var(--primary);
  color: var(--text);
  border-radius: var(--radius-full);
  font-weight: 700;
  padding: var(--spacing-3) var(--spacing-5);
  margin-top: var(--spacing-5);
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
}

.discover-people-btn:hover {
  background-color: var(--primary-hover);
}

/* Trending Sidebar (Hidden on mobile) */
.trends-sidebar {
  display: none;
  width: 350px;
  padding: 0 var(--spacing-4);
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.search-container {
  height: var(--header-height);
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  z-index: 5;
  background-color: var(--surface);
  margin-bottom: var(--spacing-4);
}

.search-box {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-tertiary);
}

.search-input {
  width: 100%;
  background-color: var(--surface-lighter);
  border: 1px solid transparent;
  border-radius: var(--radius-full);
  padding: 12px 40px;
  color: var(--text);
  font-size: 15px;
  outline: none;
  transition: all var(--transition);
}

.search-input:focus {
  background-color: var(--surface);
  border-color: var(--primary);
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

/* Sidebar Cards */
.sidebar-card {
  background-color: var(--surface-lighter);
  border-radius: var(--radius-md);
  margin-bottom: var(--spacing-4);
  overflow: hidden;
}

.sidebar-card h2 {
  font-size: 20px;
  font-weight: 800;
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--surface-border);
}

/* Premium Card */
.premium-card {
  padding: var(--spacing-4);
}

.premium-card h2 {
  padding: 0;
  margin-bottom: var(--spacing-2);
  border: none;
}

.premium-card p {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-4);
  font-size: 15px;
}

.premium-btn {
  background-color: var(--primary);
  color: var(--text);
  border-radius: var(--radius-full);
  font-weight: 700;
  padding: var(--spacing-2) var(--spacing-4);
  font-size: 15px;
  transition: background-color var(--transition);
}

.premium-btn:hover {
  background-color: var(--primary-hover);
}

/* Trending Topics */
.trending-topic {
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--surface-border);
  cursor: pointer;
  transition: background-color var(--transition);
}

.trending-topic:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.trending-topic:last-child {
  border-bottom: none;
}

.topic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
}

.topic-category {
  color: var(--text-tertiary);
  font-size: 13px;
}

.topic-options-btn {
  color: var(--text-tertiary);
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -8px;
}

.topic-options-btn:hover {
  color: var(--primary);
  background-color: var(--primary-light);
}

.topic-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 4px;
  color: var(--text);
}

.topic-posts {
  color: var(--text-tertiary);
  font-size: 13px;
}

.show-more {
  display: block;
  color: var(--primary);
  padding: var(--spacing-4);
  transition: background-color var(--transition);
}

.show-more:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

/* Who to Follow */
.suggested-user {
  padding: var(--spacing-3) var(--spacing-4);
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--surface-border);
  transition: background-color var(--transition);
}

.suggested-user:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.suggested-user:last-child {
  border-bottom: none;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-right: var(--spacing-3);
  flex-shrink: 0;
  cursor: pointer;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
  cursor: pointer;
}

.follow-btn {
  background-color: var(--text);
  color: var(--surface);
  border-radius: var(--radius-full);
  font-weight: 700;
  padding: 6px var(--spacing-4);
  font-size: 14px;
  transition: all var(--transition);
}

.follow-btn:hover {
  opacity: 0.9;
}

.follow-btn.following {
  background-color: transparent;
  color: var(--text);
  border: 1px solid var(--surface-border);
}

/* Footer */
.sidebar-footer {
  padding: var(--spacing-4);
  color: var(--text-tertiary);
  font-size: 13px;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2) var(--spacing-3);
  margin-bottom: var(--spacing-3);
}

.footer-link:hover {
  text-decoration: underline;
}

/* Mobile Navigation Bar */
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--nav-height);
  background-color: var(--surface);
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid var(--surface-border);
  z-index: var(--z-nav);
}

.nav-icon-btn {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  font-size: 22px;
  position: relative;
}

.nav-icon-btn.active {
  color: var(--primary);
}

.notification-indicator {
  position: absolute;
  top: 8px;
  right: calc(50% - 8px);
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background-color: var(--primary);
}

/* Floating Post Button (Mobile) */
.floating-post-btn {
  position: fixed;
  bottom: calc(var(--nav-height) + 16px);
  right: 16px;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-full);
  background-color: var(--primary);
  color: var(--text);
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  z-index: var(--z-floating);
  transition: transform var(--transition), background-color var(--transition);
}

.floating-post-btn:hover {
  background-color: var(--primary-hover);
  transform: scale(1.05);
}

/* Responsive Breakpoints */
@media (min-width: 500px) {
  .tab-button span {
    display: inline;
  }
}

@media (min-width: 768px) {
  .app-header {
    display: none;
  }
  
  .desktop-sidebar {
    display: flex;
  }
  
  .mobile-nav,
  .floating-post-btn {
    display: none;
  }
  
  .main-content-area {
    margin-left: 80px; /* Collapsed sidebar */
  }
  
  .timeline-content {
    max-width: var(--content-width);
    border-left: 1px solid var(--surface-border);
    min-height: 100vh;
  }
  
  .compose-post {
    padding: var(--spacing-4) var(--spacing-5);
  }
  
  .post {
    padding: var(--spacing-4) var(--spacing-5);
  }
}

@media (min-width: 1024px) {
  .main-content-area {
    margin-left: 0;
  }
  
  .desktop-sidebar {
    padding: var(--spacing-2) var(--spacing-5) var(--spacing-2) var(--spacing-4);
  }
  
  .desktop-sidebar .nav-link span,
  .desktop-sidebar .post-button span {
    display: inline;
  }
  
  .trends-sidebar {
    display: block;
  }
}

@media (min-width: 1200px) {
  .timeline-container {
    display: flex;
    justify-content: center;
  }
  
  .main-content-area {
    width: auto;
    max-width: 1265px;
  }
}

@media (min-width: 1280px) {
  .desktop-sidebar {
    width: 275px;
  }
}
</style> 