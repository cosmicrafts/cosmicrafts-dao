<script>
import { Principal } from "@dfinity/principal";
import { cosmicrafts } from 'declarations/cosmicrafts/index';

export default {
  data() {
    return {
      isMenuVisible: false,
      query: '',
      results: [],
    };
  },
  watch: {
    query(newQuery) {
      if (newQuery.length > 0) {
        this.handleInput();
      } else {
        this.results = [];
        this.isMenuVisible = false;
      }
    },
  },
  methods: {
    toggleMenu() {
      this.isMenuVisible = !this.isMenuVisible;
    },
    beforeEnter(el) {
      el.style.transform = 'translateY(-10px)';
      el.style.opacity = 0;
    },
    enter(el, done) {
      el.offsetHeight; // trigger reflow
      el.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      el.style.transform = 'translateY(0)';
      el.style.opacity = 1;
      done();
    },
    leave(el, done) {
      el.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      el.style.transform = 'translateY(-10px)';
      el.style.opacity = 0;
      done();
    },
    async handleInput() {
      const query = this.query.trim();

      if (query.length === 0) {
        this.results = [];
        this.isMenuVisible = false;
        return;
      }

      try {
        let result;
        if (this.isPrincipal(query)) {
          result = await cosmicrafts.get_player(Principal.fromText(query));
        } else {
          result = await cosmicrafts.getPlayerByUsername(query);
        }

        console.log('Result:', result); // Log the result to verify its structure

        if (result[1][0].errorCode) {
          console.error('Error code:', result[1][0].errorCode);
          this.results = [];
          this.isMenuVisible = false;
        } else {
          this.results = [result[1][0]];
          console.log('Results Array:', this.results); // Log the results array
          this.isMenuVisible = true;
        }
      } catch (error) {
        this.results = [];
        this.isMenuVisible = false;
        console.log("Error fetching player");
      }
    },
    isPrincipal(query) {
      try {
        Principal.fromText(query);
        return true;
      } catch (error) {
        return false;
      }
    },
  },
};
</script>

<template>
  <div class="search">
    <div class="search-input">
      <input v-model="query" @input="handleInput" placeholder="Search in Cosmicrafts... " />
      <img src="@/assets/icons/search_icon.svg" class="search-icon" />
    </div>
    <transition name="slide-fade" @before-enter="beforeEnter" @enter="enter" @leave="leave">
      <div v-if="isMenuVisible" class="search-results">
        <ul v-if="results.length > 0" :key="results.length">
          <li v-for="(result, index) in results" :key="index">
            <div class="friend-container">
              <div class="avatar">
                <img :src="result.avatarUrl || 'https://via.placeholder.com/50'" alt="Avatar" />
              </div>
              <div class="name">{{ result.username }}</div>
              <div class="btnAdd"><button class="add-friend-btn">Add Friend</button></div>
            </div>
          </li>
        </ul>
        <p v-else-if="query.length > 0" class="no-results">No results found</p>
      </div>
    </transition>
  </div>  
</template>

<style scoped>
.search {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to bottom, #282828c7, #252525b7);
  border-radius: 24px;
  border: 0.25px solid rgba(255, 255, 255, 0.107);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.109);
  width: 100%;
  max-width: 60%; /* Maximum width to be 60% of the viewport */
  margin: 0 auto; /* Center horizontally */
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.search-input input {
  padding: 8px 16px 8px 42px;
  background: none;
  border: none;
  color: #b4b4b4;
  width: 100%;
}

.search-input input::placeholder {
  color: #828282;
}

.search-input input:focus {
  background: linear-gradient(to bottom, #282828c7, #252525b7);
  padding: 8px 16px 8px 42px;
  border-radius: 25px;
  outline: none;
  box-shadow: none;
}

.search-input .search-icon {
  position: absolute;
  left: 12px;
  width: 16px;
  height: 20px;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.search-results {
  position: absolute;
  top: 110%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.search-results ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.search-results ul li {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.search-results ul li:last-child {
  border-bottom: none;
}

.no-results {
  padding: 10px;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.friend-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  border-radius: 5px;
}

.avatar {
  display: flex;
  margin: 2px;
}

.avatar img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.name {
  margin-left: 10px;
  font-size: 1.2em;
}

.btnAdd {
  margin-left: auto;
}

.add-friend-btn {
  padding: 5px 10px;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 5px;
  cursor: pointer;
}

.add-friend-btn:hover {
  background-color: #0056b3;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive Design */
@media (max-width: 1080px) {
  .search {
    max-width: 60%; /* 60% of the viewport on 1080px */
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .search {
    max-width: 66%; /* Make it larger on smaller screens */
  }
}

@media (max-width: 480px) {
  .search {
    max-width: 50%; /* Even larger for very small screens */
  }
}
</style>
