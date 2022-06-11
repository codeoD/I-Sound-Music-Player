<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
import Music from "./pages/Music.vue";
</script>

<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
  <Music />
</template>

<style>
#app {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
body {
  margin: 0;
}
ul {
  list-style-type: none;
  padding-inline-start: 0;
  margin-block-start: 0;
  margin-block-end: 0;
}
p {
  margin-block-start: 0;
  margin-block-end: 0;
}
</style>
<style>
/* 滚动条样式 */
/* 整个滚动条 */
::-webkit-scrollbar {
  background: transparent;
  width: 4px;
}
/* 滚动滑块 */
::-webkit-scrollbar-thumb {
  background: #18bbc380;
  border-radius: 2px;
}
/* 滚动条轨道 */
::-webkit-scrollbar-track {
}
/* 滚动条的按钮（上下箭头） */
::-webkit-scrollbar-button {
}
/* 滚动条没有滑块的轨道部分 */
::-webkit-scrollbar-track-piece {
}
/* 当同时有垂直滚动条和水平滚动条时交汇的部分 */
::-webkit-scrollbar-corner {
}
/* 出现在某些元素底角的可拖动调整大小的滑块 */
::-webkit-resizer {
}
</style>
