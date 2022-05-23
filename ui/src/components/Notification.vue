<template>
  <teleport to="body">
    <div class="bottom-notification">
      <!-- <div v-if="title">{{ title }}</div> -->
      <div :style="{ color: color[type] }">{{ info }}</div>
    </div>
  </teleport>
</template>
<script lang="">
import { defineComponent } from "vue";
export default defineComponent({
  name: "",
  props: ["title", "info", "type"],
  setup(props) {
    const color = {
      warning: "#e6a23c",
      error: "#f56c6c",
      info: "#909399",
      success: "#67C23A",
    };
    return {
      color,
    };
  },
});
</script>
<style lang="scss">
.bottom-notification {
  position: absolute;
  display: flex;
  bottom: 0;
  right: 20px;
  height: 80px;
  align-items: center;
  max-width: 200px;
  font-size: 14px;
}
</style>
