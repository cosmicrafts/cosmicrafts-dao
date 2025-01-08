<template>
  <div class="nav-container">
    <div :class="['nav-sections', 'link-list', orientationClass]">
      <ul>
        <li
          v-for="item in items"
          :key="item.path"
          :class="{ active: isActive(item.path) }"
          @mouseenter="hoveredItem = item.path"
          @mouseleave="hoveredItem = null"
        >
          <RouterLink :to="item.path">
            <div class="section">
              <img
                v-if="getIcon(item)"
                :src="getIcon(item)"
                alt="icon"
                class="nav-icon"
              />
            </div>
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SLinkList',
  props: {
    items: {
      type: Array,
      required: true,
      validator: (items) => {
        return items.every(
          item => 'name' in item && 'path' in item && 'icons' in item
        );
      }
    }
  },
  data() {
    return {
      activeLink: this.$route.path,
      hoveredItem: null
    };
  },
  computed: {
    orientationClass() {
      return 'vertical';
    }
  },
  methods: {
    isActive(path) {
      return this.activeLink === path;
    },
    getIcon(item) {
      if (item.icons) {
        if (this.isActive(item.path)) {
          return item.icons.active;
        } else if (this.hoveredItem === item.path) {
          return item.icons.hover;
        } else {
          return item.icons.inactive;
        }
      }
      return null;
    }
  },
  watch: {
    $route(newRoute) {
      this.activeLink = newRoute.path;
    }
  },
  mounted() {
    this.activeLink = this.$route.path;
  }
};
</script>

<style scoped>
.nav-container {
  display: flex;
  justify-content: center; /* Center the nav-container horizontally */
  align-items: center; /* Align the items vertically */
  margin: 0 auto; /* Horizontally center the container */
}

.section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.4s ease-in-out, border 0.2s ease-in-out, box-shadow 0.3s ease-in-out, transform 0.1s ease-in-out;
  margin-bottom: 12px;
}

.nav-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.2s ease-in-out;
}

.link-list li:not(.active):hover .nav-icon {
  transform: scale(1.1);
  transition: background 0.4s ease-in-out, border 0.25s ease-in-out, box-shadow 0.5s ease-in-out, transform 0.1s ease-in-out;
}

.link-list li.active .nav-icon {
  transition: background 0.4s ease-in-out, border 0.2s ease-in-out, box-shadow 0.3s ease-in-out, transform 0.1s ease-in-out;
}

.link-list li.active .section {
  background: linear-gradient(to bottom, #00C0FC, #0039BA);
  border: 1px solid #00ffff88;
  box-shadow: 0 0 8px rgba(0, 225, 255, 0.498);
  transform: scale(1.05);
  transition: background 0.6s ease-in-out, border 0.2s ease-in-out, box-shadow 0.5s ease-in-out, transform 0.25s ease-in-out;
}

.link-list li .section {
  background: linear-gradient(to bottom, #292c3729, #0c0f1684);
  border: 0.5px solid #ffffff2e;
  box-shadow: 0 4px 2px rgba(0, 0, 0, 0.139);
  transition: background 0.6s ease-in-out, border 0.25s ease-in-out, box-shadow 0.5s ease-in-out, transform 0.25s ease-in-out;
  margin-bottom: 24px;
}

.link-list li:not(.active):hover .section {
  background: linear-gradient(to bottom, #151927, #293547);
  border: 1px solid #41c79f;
  box-shadow: 0 0 8px rgba(0, 255, 251, 0.197);
  transform: scale(1.05);
  transition: background 0.4s ease-in-out, border 0.2s ease-in-out, box-shadow 0.3s ease-in-out, transform 0.1s ease-in-out;
}

.link-list li .section,
.link-list li.active .section,
.link-list li:not(.active):hover .section {
  width: 24px;
  height: 24px;
}

.link-list ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

@media (max-width: 1080px) {
  .nav-container {
    width: 60%; /* Limit the width to 60% of the viewport */
    margin: 0 auto; /* Ensure it's centered horizontally */
  }

  .link-list {
    flex-direction: row;
    justify-content: center;
  }

  .link-list ul {
    display: flex;
    flex-direction: row;
    justify-content: center;
  }

  .link-list li {
    margin-bottom: 0;
    margin-right: 12px;
  }

  .link-list li:last-child {
    margin-right: 0;
  }
}
</style>
