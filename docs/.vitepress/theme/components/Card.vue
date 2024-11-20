<template>
  <a :href="to" class="card">
    <div class="card-icon">
      <slot name="icon"></slot>
    </div>
    <div class="card-title">
      <slot name="title">Default Title</slot>
    </div>
  </a>
</template>

<script>
export default {
  name: "Card",
  props: {
    to: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.card {
  display: flex;
  /* flex-direction: column; */
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  /* padding: 16px; */
  /* width: 200px; */
  padding: 10px 20px;
  transition: box-shadow 0.3s ease;
}
.card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}
.card-icon {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}
.card-title {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
</style>
