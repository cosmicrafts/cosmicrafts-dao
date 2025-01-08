<script>
export default {
  data() {
    return {
      isMenuVisible: false,
    };
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
    }
  }
};
</script>

<template>
  <div class="account-menu">
    <div class="avatar-wrapper" @click="toggleMenu">
      <!-- Add an image tag to load the avatar directly -->
      <img src="@/assets/avatars/Avatar_01.jpg" alt="User Avatar" class="avatar" />
    </div>
    <transition name="slide-fade" @before-enter="beforeEnter" @enter="enter" @leave="leave">
      <div v-if="isMenuVisible" class="menu">
        <ul>
          <li><a href="/account">Account</a></li>
          <li><a href="/settings">Settings</a></li>
          <li><a href="/logout">Logout</a></li>
        </ul>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.account-menu {
  position: relative;
  display: flex;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  margin: 10px;
  border: 0.25px solid rgba(255, 255, 255, 0.239);

}

.avatar {
  width: 100%;
  height: 100%;
  color: #ffffff;
}

.menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border-radius: 4px;
  box-shadow: 2px 2px 2px 4px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.menu ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu ul li {
  border: 0.1px solid #7a7a7a;
}

.menu ul li:last-child {
  border-bottom: none;
}

.menu ul li a {
  display: block;
  background: linear-gradient(to right, #151927, #1f222f);
  padding: 10px 20px;
  text-decoration: none;
  color: #79829B;
}

.menu ul li a:hover {
  background: linear-gradient(to left, #151927, #1f222f);

  color: #009df8;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
