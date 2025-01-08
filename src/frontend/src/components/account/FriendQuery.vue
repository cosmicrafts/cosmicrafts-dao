<template>
  <div class="friend-container">
    <div class="avatar">
      <img :src="avatarUrl" alt="Avatar" />
    </div>
    <div class="name">{{ name }}</div>
    <div class="btnAdd"><button class="add-friend-btn">Add Friend</button></div>
  </div>
</template>

<script>
export default {
  props: {
    avatarUrl: {
      type: String,
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
  },
  mounted() {
    console.log('FriendQuery mounted');
    console.log('avatarUrl:', this.avatarUrl);
    console.log('name:', this.name);
  },
};
</script>

<style scoped>
.friend-container {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  padding: 2px;
  border-radius: 5px;
}

.avatar {
  display: flex;
  border: 1px solid;
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
</style>