<template>
  <div class="main-ui">
    <div class="sheet-ui">
      <div class="sheet-item" v-for="sheet in sheetList" :key="sheet.name">
        <div class="sheet-head">
          <span class="sheet-name">{{ sheet.name }}</span>
          <span class="sheet-operations">
            <play-circle-two-tone
              v-if="sheet.songs.length > 0"
              @click="playAll(sheet.songs)"
              two-tone-color="#52c41a"
              title="播放全部"
            />
          </span>
        </div>
        <ul class="songs-list">
          <li v-for="song in sheet.songs" :key="song.innerName">
            <div class="song-item">
              <div class="song-info">
                <span class="song-name">{{ song.realName }}</span>
                <span class="song-singer">{{ "zdas1d" }}</span>
              </div>
              <span class="operation-icons">
                <play-circle-two-tone
                  v-show="playingSong.source !== song.source"
                  @click="() => handleOperation('play', song)"
                  two-tone-color="#52c41a"
                />
                <pause-circle-two-tone
                  @click="() => handleOperation('pause', song)"
                  v-show="playingSong.source === song.source"
                />
                <plus-square-two-tone
                  @click="showSheetChoice(song)"
                  title="添加歌曲到歌单"
                />
                <plus-circle-two-tone
                  @click="addSong2playlist(song)"
                  title="添加歌曲到播放列表"
                />
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="play-ui">
      <ul v-show="isShowPlaylist" class="play-list">
        <li class="" v-for="(song, i) in playlist" :key="song.source">
          <div class="play-list-item">
            <div>{{ i + 1 }}</div>
            <div
              class="song-name"
              :class="{ active: playingSong.source === song.source }"
            >
              {{ song.realName }}
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
  <div class="footer-ui">
    <div class="controls-left" @click="controlPlayState($event.target.name)">
      <a class="icon icon-playbar-prev" name="prev"></a>
      <a
        :class="[
          'icon',
          playingSong.paused ? 'icon-playbar-play' : 'icon-playbar-pause',
        ]"
        name="toggle"
      ></a>
      <a class="icon icon-playbar-next" name="next"></a>
    </div>
    <div class="controls-bar">
      <div class="song-playing-info">
        <div class="song-name">{{ playingSong.name || "I SOUND" }}</div>
        <div class="duration">
          {{ playingSong.current }} / {{ playingSong.total }}
        </div>
      </div>
      <div class="bar" id="bar" @dragstart="(e) => e.preventDefault()">
        <!-- 播放进度背景（自适应） -->
        <div class="bg" id="progress_bg">
          <span class="icon icon-playbar-bgleft" id="bg_left"></span>
          <span class="bg-middle barBG" id="bg_middle"></span>
          <span class="icon icon-playbar-bgright" id="bg_right"></span>
        </div>
        <!-- 播放进度条（自适应） -->
        <div class="progress-bar" id="progress_bar">
          <span
            class="icon icon-playbar-progressleft"
            id="progress_left"
          ></span>
          <div class="progress-middle" id="progress_middle">
            <span class="progress barProgress" id="progress"></span>
          </div>
        </div>
        <!-- 播放定位头（自适应） -->
        <div class="drag-playhead" id="drag_playhead">
          <span
            @mousedown="startAdjustPlayPostion"
            class="icon icon-playbar-playhead"
            id="playhead"
          ></span>
        </div>
      </div>
    </div>
    <div class="controls-right">
      <div
        class="volume-icon"
        @mouseenter="isShowVolumePanel = true"
        @mouseleave="delayCloseVolume"
      >
        <span
          class="icon icon-playbar-maxvox"
          :class="['icon', volumeIcon]"
          @click="toggleMuted"
        ></span>
      </div>
      <a
        :class="[
          playingSong.mode === 'order' ? 'order-mode' : 'icon',
          'play-mode',
          playingSong.modeIcon,
        ]"
        @click="isShowModePanel = !isShowModePanel"
      >
        <span
          v-if="playingSong.mode === 'order'"
          class="icon-order-mode"
        ></span>
      </a>
      <div class="icon list" @click="isShowPlaylist = !isShowPlaylist">
        <span class="num">{{ playlist.length }}</span>
      </div>
      <!-- 控制面板 -->
      <div class="mode-choosen-panel" v-show="isShowModePanel">
        <ul @click="choosePlayMode">
          <li name="listCycle">
            <span class="icon icon-playbar-cycle icon-base-style"></span
            ><span>列表循环</span>
          </li>
          <li name="singleCycle">
            <span class="icon icon-playbar-singlecycle icon-base-style"></span
            ><span>单曲循环</span>
          </li>
          <li name="order">
            <span class="icon-base-style">
              <span class="icon-order-mode"></span> </span
            ><span>顺序播放</span>
          </li>
          <li name="random">
            <span class="icon icon-playbar-randomcycle icon-base-style"></span
            ><span>随机播放</span>
          </li>
        </ul>
      </div>
      <div
        class="volume-slide-panel"
        v-show="isShowVolumePanel"
        @wheel="adjustVolume"
        @mouseenter="isPointerInVolumePanel = true"
        @mouseleave="
          isPointerInVolumePanel = false;
          isShowVolumePanel = false;
        "
      >
        <div class="volume-bg" @click="adjustVolume"></div>
        <div class="volume-fg" @click="adjustVolume"></div>
        <div class="icon icon-playbar-volumehead"></div>
      </div>
    </div>
    <audio class="player" src=""></audio>
  </div>
  <custom-modal
    v-model:visible="isShowAddSheetModal"
    title="新建歌单"
    :handleConfirm="addSheet"
  >
    <template v-slot:body>
      <div>
        <input
          type="text"
          placeholder="请输入歌单名称"
          @change="addedSheetName = $event.target.value"
        />
      </div>
    </template>
  </custom-modal>
  <custom-modal
    v-model:visible="isShowSheetChoice"
    title="请选择歌单"
    @confirm="addSong2sheet"
  >
    <template v-slot:body>
      <select
        style="min-width: 120px"
        name=""
        id=""
        @change="selectedSheetName = $event.target.value"
      >
        <option value="">请选择</option>
        <option :value="sheet.name" v-for="sheet in chooseableSheets">
          {{ sheet.name }}
        </option>
      </select>
    </template>
  </custom-modal>
</template>
<script lang="jsx">
import {
  defineComponent,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
  createVNode,
  render,
  watchEffect,
} from "vue";
import PlayCircleTwoTone from "@ant-design/icons-vue/PlayCircleTwoTone";
import PauseCircleTwoTone from "@ant-design/icons-vue/es/icons/PauseCircleTwoTone";
import PlusSquareTwoTone from "@ant-design/icons-vue/PlusSquareTwoTone";
import PlusCircleTwoTone from "@ant-design/icons-vue/PlusCircleTwoTone";
import Modal from "../components/Modal.vue";
import Notification from "../components/Notification.vue";
import { computed } from "@vue/reactivity";

// todo： 信息整合  歌曲播放统计信息  性能优化：一些鼠标操作事件回调的优化处理

function notify({ info, type }) {
  const vm = createVNode(Notification, {
    info,
    type,
  });
  render(vm, document.body);
  setTimeout(() => {
    // 待优化
    document.body.removeChild(document.querySelector(".bottom-notification"));
  }, 2000);
}

const electronAPI = window.eAPI;
export default defineComponent({
  name: "",
  components: {
    PlayCircleTwoTone,
    PauseCircleTwoTone,
    PlusSquareTwoTone,
    PlusCircleTwoTone,
    CustomModal: Modal,
  },
  setup() {
    // 也可以使用记录操作类型和数据的方式持久化
    /**
     * @description 操作记录
     * @type Array<{type}>
     */
    const operationStore = reactive([]);
    const sheetList = reactive([]);
    /**
     * @type [{innerName: String, realName: String, source: String}]
     */
    const playlist = reactive([]);
    const isShowAddSheetModal = ref(false);
    const isShowPlaylist = ref(false);
    /**
     * @description 播放模式 列表循环 单曲循环 随机播放 顺序播放
     * @type enum ['listCycle', 'singleCycle', 'random', 'order']
     */
    const playModeData = {
      order: {
        icon: "",
        play: orderPlay,
      },
      listCycle: {
        icon: "icon-playbar-cycle",
        play: listCyclePlay,
      },
      singleCycle: {
        icon: "icon-playbar-singlecycle",
        play: replay,
      },
      random: {
        icon: "icon-playbar-randomcycle",
        play: randomPlay,
      },
    };
    let progressBarHeadEl;
    let volumeEl;
    let footerPosY;
    let volumIconHead;
    // 进度条背景
    let progressBarEl;
    // 正在播放歌曲的标识
    const playingSong = reactive({
      total: "00:00",
      current: "00:00",
      name: "",
      prev: null,
      next: null,
      paused: true,
      performer: "",
      mode: "order",
      source: "",
      volume: 1,
      modeIcon: computed(() => playModeData[playingSong.mode].icon),
      // 方法
      pause: () => el.pause(),
      play: () => el.play(),
    });
    const randomPlayModeData = reactive({
      willPlaySongs: [...playlist],
    });
    watch(
      () => playingSong.mode,
      (curr, prev) => {
        if (prev === "random") {
          // 重置随机播放列表
          randomPlayModeData.willPlaySongs = [...playlist];
        }
      }
    );
    const addedSheetName = ref("");
    // 歌单中选中的正在操作的歌曲
    const selectedSong = ref({});
    const selectedSheetName = ref("");
    const isShowSheetChoice = ref(false);
    const isShowModePanel = ref(false);
    const isShowVolumePanel = ref(false);
    const isPointerInVolumePanel = ref(false);
    const chooseableSheets = computed(() => {
      return sheetList.filter(
        (v) =>
          v.songs.findIndex((d) => d.source === selectedSong.value.source) ===
          -1
      );
    });
    const volumeIcon = computed(() => {
      if (playingSong.muted) return "icon-playbar-silence";
      return playingSong.volume > 0.5
        ? "icon-playbar-maxvox"
        : playingSong.volume > 0
        ? "icon-playbar-minvox"
        : "icon-playbar-silence";
    });
    /**
     * @type HTMLAudioElement
     */
    let el = ref();
    // 生命周期函数
    onMounted(() => {
      el = document.querySelector("audio");
      progressBarHeadEl = document.querySelector("#playhead");
      volumeEl = document.querySelector(".volume-fg");
      footerPosY = document.querySelector(".footer-ui").getClientRects()[0].y;
      volumIconHead = document.querySelector(".icon-playbar-volumehead");
      progressBarEl = document.querySelector(".barProgress");

      el.addEventListener("canplay", () => {
        playingSong.total = sec2min(Math.floor(el.duration));
      });
      el.addEventListener("timeupdate", () => {
        // 移动位置图标
        if (!playPosControlData.isMouseDown) {
          playingSong.current = sec2min(Math.round(el.currentTime));
          progressBarHeadEl.style.marginLeft = `${
            (el.currentTime * 100) / el.duration
          }%`;
          // 进度条增长
          progressBarEl.style.width = `${
            (el.currentTime * 100) / el.duration
          }%`;
        }
      });
      el.addEventListener("play", () => {
        playingSong.paused = false;
      });
      el.addEventListener("pause", () => {
        playingSong.paused = true;
      });
      el.addEventListener("ended", () => {
        progressBarHeadEl.style.marginLeft = "0%";
        playModeData[playingSong.mode].play();
        // 进度条归0
        progressBarEl.style.width = `0%`;
      });
      el.addEventListener("volumechange", (e, v) => {
        console.log("vol", e);
      });

      // 全局事件监听处理
      document.addEventListener("click", (e) => {
        // 关闭播放模式面板
        const notClickInModeControlElFlag = !(
          e.target.classList.contains("play-mode") ||
          e.target.classList.contains("icon-order-mode")
        );
        if (notClickInModeControlElFlag && isShowModePanel.value) {
          isShowModePanel.value = false;
        }
      });

      document.addEventListener("mousemove", (e) => {
        getPlayPosOffset(e);
      });

      document.addEventListener("mouseup", (e) => {
        endAdjustPlayPostion();
      });

      document.addEventListener("beforeunload", () => {
        // electronAPI?.log("update");
      });
    });

    // 数据持久化, 待优化
    // onBeforeUnmount(() => {
    //   electronAPI?.log("update");
    //   electronAPI?.updateJSON(sheetList);
    // });
    watch(sheetList, (curr, prev) => {
      // electronAPI?.log(JSON.stringify(prev));
      electronAPI?.updateJSON(JSON.stringify(sheetList));
    });

    // 一些工具函数
    /**
     * @description 秒转为分钟
     * @param {Number} time
     * @returns String
     */
    function sec2min(time) {
      const min = Math.floor(time / 60);
      const sec = time % 60;
      return `${min < 10 ? "0" + min : min}:${sec < 10 ? "0" + sec : sec}`;
    }
    /**
     * @description 保留两位小数
     * @param {Number} num
     * @returns String
     */
    function saveTwoDecimal(num) {
      let str = num.toString();
      const [intNum, decimal] = str.split(".");
      if (decimal === undefined || decimal.length === 0) return num + ".00";
      if (decimal.length === 1) return num + "0";
      if (decimal.length === 2) return num;
      return (
        intNum +
        "." +
        (Number(decimal.slice(2, 3)) >= 5
          ? Number(decimal.slice(0, 2)) + 1
          : decimal.slice(0, 2))
      );
    }

    /**
     * @description 重新播放
     */
    function replay() {
      el.currentTime = 0;
      el.play();
    }
    /**
     * @description 播放歌曲
     * @param {*} song
     */
    function playSong(song) {
      el.pause();
      el.src = song.source;
      playingSong.name = song.realName;
      playingSong.source = song.source;
      el.play();
    }
    // 设置音量
    function setVolume(num) {
      el.volume = num;
      playingSong.volume = num;
    }
    /**
     * @description 设置播放的当前时间（位置）
     * @param {*} num
     */
    function setCurrentTime(num) {
      el.currentTime = num;
    }

    /**
     * @description 静音
     */
    function toggleMuted() {
      el.muted = !el.muted;
      playingSong.muted = el.muted;
    }
    /**
     * @description 设置音量位置变化
     */
    function setVolumeIconHeadPos(num) {
      volumIconHead.style.bottom = `${num}px`;
    }

    /**
     * @description 选择播放模式
     * @param {PointerEvent} e
     */
    function choosePlayMode(e) {
      console.log(e);
      /**
       * @type HTMLLIElement
       */
      let li;
      if (e.target.tagName === "LI") {
        li = e.target;
      } else {
        li = e.target.parentElement;
      }
      playingSong.mode = li.getAttribute("name");
    }

    // 事件处理
    const playPosControlData = reactive({
      isMouseDown: false,
      currenrtPos: 0,
    });
    function startAdjustPlayPostion(e) {
      playPosControlData.isMouseDown = true;
    }

    function endAdjustPlayPostion() {
      if (playPosControlData.isMouseDown) {
        playPosControlData.isMouseDown = false;
        // 调整播放位置
        setCurrentTime((playPosControlData.currenrtPos * el.duration) / 370);
        if (playingSong.source && playingSong.paused) {
          playingSong.play();
        }
      }
    }

    function getPlayPosOffset(e) {
      if (playPosControlData.isMouseDown) {
        const currentBarPos = Number(
          getComputedStyle(progressBarHeadEl).marginLeft.split("px")[0]
        );

        let nextBarPos = currentBarPos;
        if (e.movementX > 0) {
          nextBarPos =
            currentBarPos === 370 ? currentBarPos : e.movementX + currentBarPos;
        } else if (e.movementX < 0) {
          nextBarPos =
            currentBarPos === 0 ? currentBarPos : e.movementX + currentBarPos;
        }
        console.log(e.movementX, currentBarPos, nextBarPos, nextBarPos / 370);
        if (nextBarPos) {
          progressBarHeadEl.style.marginLeft = `${nextBarPos}px`;
          playPosControlData.currenrtPos = nextBarPos;
          progressBarEl.style.width = `${(nextBarPos * 100) / 370}%`;
        }
      }
    }

    function delayCloseVolume() {
      setTimeout(() => {
        if (isPointerInVolumePanel.value) return;
        isShowVolumePanel.value = false;
      }, 500);
    }
    /**
     * @description 设置音量
     * @param {WheelEvent | MouseEvent} e
     */
    function adjustVolume(e) {
      const originMT = Number(
        getComputedStyle(volumeEl).marginTop.split("px")[0]
      );
      let mt;
      // 处理滚轮事件
      if (e.deltaY) {
        const overLimitFlag =
          (e.deltaY > 0 && originMT >= 120) || (e.deltaY < 0 && originMT <= 20);
        if (!overLimitFlag) {
          mt = originMT + e.deltaY * 0.05;
        }
      } else {
        mt = 120 - (footerPosY - e.y);
      }
      if (mt) {
        const pos = 120 - mt;
        const vol = pos / 100;
        volumeEl.style.marginTop = `${mt}px`;
        setVolume(vol);
        setVolumeIconHeadPos(pos);
      }
    }
    // 播放控制
    function controlPlayState(type) {
      if (type === "toggle") {
        if (playingSong.source) {
          // 切换播放/暂停
          if (el.paused) {
            el.play();
          } else {
            el.pause();
          }
        } else {
          // 播放列表歌曲
          if (playlist.length > 0) {
            if (playingSong.mode === "random") {
              randomPlay();
            } else {
              playSong(playlist[0]);
            }
          }
        }
      } else {
        // 如果没有正在播放的歌曲，直接返回
        if (!playingSong.source) return;
        const index = playlist.findIndex(
          (v) => v.source === playingSong.source
        );
        // 播放上一首
        if (type === "prev")
          playSong(
            index > 0 ? playlist[index - 1] : playlist[playlist.length - 1]
          );
        // 播放下一首
        if (type === "next")
          playSong(
            index < playlist.length - 1 ? playlist[index + 1] : playlist[0]
          );
      }
    }

    function showSheetChoice(song) {
      selectedSong.value = song;
      if (chooseableSheets.value.length === 0) {
        console.log("所有歌单已包含此歌曲");
        notify({ info: "所有歌单已包含此歌曲", type: "info" });
        return;
      }
      isShowSheetChoice.value = true;
    }
    /**
     *
     * @description 播放全部歌曲
     * @param {Array<{realName: string, source: string, innerName: string}>} songs
     * @returns void
     */
    function playAll(songs) {
      // 清空播放列表
      playlist.length = 0;
      playlist.push(...songs);
      if (playingSong.mode === "random") {
        randomPlay();
      } else {
        playSong(playlist[0]);
      }
    }
    /**
     * @description 列表循环
     */
    function listCyclePlay() {
      const currentSongIndex = playlist.findIndex(
        (v) => v.source === playingSong.source
      );
      const nextSongIndex =
        currentSongIndex === playlist.length - 1 ? 0 : currentSongIndex + 1;
      playSong(playlist[nextSongIndex]);
    }

    /**
     * @description 随机播放
     * @param {*} playedSource
     */
    function randomPlay() {
      const nextSongIndex = Math.floor(
        Math.random() * randomPlayModeData.willPlaySongs.length
      );
      playSong(randomPlayModeData.willPlaySongs[nextSongIndex]);
      randomPlayModeData.willPlaySongs.splice(nextSongIndex, 1);
    }

    /**
     * @description 顺序播放列表
     */
    function orderPlay() {
      const currentSongIndex = playlist.findIndex(
        (v) => v.source === playingSong.source
      );
      if (currentSongIndex !== playlist.length - 1) {
        playSong(playlist[currentSongIndex + 1]);
      }
    }
    function addSong2sheet() {
      const sheet = sheetList.filter((v) => v.name === selectedSheetName.value);
      sheet[0].songs.push(selectedSong.value);
    }
    function addSong2playlist(song) {
      const i = playlist.findIndex((v) => v.source === song.source);
      if (i === -1) {
        playlist.push(song);
      } else {
        playlist.splice(i, 1);
        playlist.push(song);
      }
    }
    function handleSongRightClick(song) {
      // 调用electronAPI
    }
    function handleOperation(type, song) {
      switch (type) {
        case "play":
          addSong2playlist(song);
          playSong(song);
          break;
        case "pause":
          playingSong.pause();
          break;
        default:
          break;
      }
    }
    // 新建歌单
    function addSheet() {
      console.log(addedSheetName.value);
      if (sheetList.findIndex((v) => v.name === addedSheetName.value) > -1) {
        window.alert("存在相同名称的歌单，请重新添加");
        return;
      }
      sheetList.push({
        name: addedSheetName.value,
        type: "custom",
        songs: [],
      });
    }

    // 这里是electronAPI的调用;
    // 添加歌单
    electronAPI?.onStartAddSheet(() => {
      isShowAddSheetModal.value = true;
    });
    electronAPI?.onSheetsReady((e, data) => {
      sheetList.push(...data?.children);
    });
    electronAPI?.onAddedSongs((e, songs) => {
      sheetList[0].songs.push(...songs);
    });
    electronAPI?.onWindowWillClose(() => {});

    // faker data
    // if (import.meta.env.DEV) {
    //   sheetList.push({
    //     name: "ggh",
    //     songs: [
    //       {
    //         innerName: "dada",
    //         realName:
    //           "st-2.amazonaws.com/s.cdpn.io/858/outfoxst-2.amazonaws.com/s.cdpn.io/858/outfox.mp3",
    //         source:
    //           "https://s3-us-west-2.amazonaws.com/s.cdpn.io/858/outfoxing.mp3",
    //       },
    //       {
    //         innerName: "34adsa",
    //         realName: "4fsfsf.mp3",
    //         source: "F:\\music\\test\\Fade-Alan Walker.mp3",
    //       },
    //     ],
    //   });
    // }

    return {
      sheetList,
      isShowAddSheetModal,
      addedSheetName,
      playlist,
      isShowPlaylist,
      selectedSong,
      selectedSheetName,
      isShowSheetChoice,
      chooseableSheets,
      playingSong,
      isShowModePanel,
      isShowVolumePanel,
      isPointerInVolumePanel,
      volumeIcon,
      handleSongRightClick,
      handleOperation,
      addSong2playlist,
      addSong2sheet,
      addSheet,
      playAll,
      showSheetChoice,
      controlPlayState,
      adjustVolume,
      setVolume,
      delayCloseVolume,
      toggleMuted,
      choosePlayMode,
      startAdjustPlayPostion,
    };
  },
});
</script>
<style lang="scss">
.main-ui {
  display: flex;
  flex: 1;
  overflow: hidden;
  .sheet-ui {
    width: 25%;
    padding: 12px;
    overflow-y: auto;
    overflow-x: hidden;
    .sheet-item {
      .sheet-head {
        display: flex;
        justify-content: space-between;
        color: #f15fe6;
      }
    }
    .songs-list {
      list-style-type: none;
      padding-inline-start: 0;
      li {
        padding: 4px 0;
        .song-item {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          gap: 16px;
          .song-info {
            display: flex;
            width: 100%;
            // flex: 1;
            flex-direction: column;
            .song-name {
              font-size: 16px;
              width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
            .song-singer {
              font-size: 13px;
              padding-left: 8px;
            }
          }
          .operation-icons {
            position: absolute;
            top: 0;
            right: -100vw;
            display: flex;
            gap: 8px;
            // padding-left: 8px;
            .anticon {
              font-size: 20px;
              cursor: pointer;
            }
          }
        }
        .song-item:hover,
        .song-item.active {
          .song-info {
            width: 75%;
            transition: all 0.5s;
          }
          .operation-icons {
            animation: operations-icon-in 0.5s forwards;
          }
        }
        @keyframes operations-icon-in {
          0% {
            right: -20%;
          }
          100% {
            right: 0;
          }
        }
      }
    }
  }
  .play-ui {
    position: relative;
    flex: 1;
    padding: 20px;
    &::after {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      content: "";
      background: url(../assets/playBg.jpg);
      filter: opacity(0.4);
      background-position: center;
      z-index: -1;
    }
    .play-list {
      float: right;
      width: 20vw;
      list-style-type: none;
      .play-list-item {
        display: flex;
        gap: 12px;
        padding: 4px 0;
        .order-num {
        }
        .song-name {
          width: 240px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
.footer-ui {
  position: relative;
  display: flex;
  height: 80px;
  gap: 30px;
  align-items: center;
  justify-content: center;
  background: #333;
  user-select: none;
  //   filter: blur(90px);
  .controls-left {
    width: 160px;
    height: 80px;
  }
  .icon {
    display: block;
    cursor: pointer;
    background: url(../assets/btn.png);
    background-repeat: no-repeat;
  }
  .icon-playbar-prev {
    display: block;
    position: absolute;
    margin-left: -7px;
    margin-top: 22px;
    background-position: 0 -143px;
  }
  .icon-playbar-prev:hover {
    background-position: -36px -143px;
  }
  .icon-playbar-next {
    position: absolute;
    margin-left: 117px;
    margin-top: 22px;
    background-position: -144px -143px;
  }
  .icon-playbar-next:hover {
    background-position: -180px -143px;
  }
  .icon-playbar-prev,
  .icon-playbar-next {
    width: 36px;
    height: 36px;
  }
  .icon-playbar-play {
    position: absolute;
    margin-left: 43px;
    margin-top: 10px;
  }
  .icon-playbar-pause {
    position: absolute;
    margin-left: 43px;
    margin-top: 10px;
    background-position: 0 -60px;
  }
  .icon-playbar-play:hover {
    background-position: -60px 0;
  }
  .icon-playbar-pause:hover {
    background-position: -60px -60px;
  }
  .icon-playbar-pause,
  .icon-playbar-play {
    width: 60px;
    height: 60px;
  }
  .controls-bar {
    width: 370px;
    height: 80px;
    .song-playing-info {
      padding-top: 18px;
      height: 24px;
      cursor: default;
      display: flex;
      color: #c4c3c3;
      div.song-name {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .duration {
        float: right;
        opacity: 0.4;
      }
    }
    .bar {
      margin-top: 11px;
      height: 5px;
      cursor: pointer;
    }
    .bar .bg {
      position: relative;
      background: 0 0;
      cursor: pointer;
      height: 3px;
      .icon-playbar-bgleft {
        position: absolute;
        background-position: -217px -200px;
      }
      .icon-playbar-bgleft,
      .icon-playbar-bgright,
      .icon-playbar-progressleft {
        width: 2px;
        height: 3px;
      }
      .bg-middle {
        position: absolute;
        margin-left: 2px;
        width: 370px;
        height: 3px;
      }
      .barBG {
        background: url(../assets/progress_bg_middle.png) repeat-x top left;
      }
      .icon-playbar-bgright {
        position: absolute;
        margin-left: 371px;
      }
      .icon-playbar-bgright {
        background-position: -237px -200px;
      }
    }
    .bar .progress-bar {
      cursor: pointer;
      margin-top: -3px;
      height: 3px;
      .icon-playbar-progressleft {
        position: absolute;
        background-position: -527px -387px;
      }
      .progress-middle {
        position: absolute;
        margin-left: 2px;
        width: 370px;
        height: 3px;
        overflow: hidden;
        .progress {
          position: absolute;
          width: 1px;
          height: 3px;
          transform: translate3d(0, 0, 0);
        }
        .barProgress {
          background: url(../assets/progress_bar_middle.png) repeat-x top left;
          // transition: width 0.3s;
        }
      }
    }
    .bar .drag-playhead {
      position: absolute;
      margin-top: -8px;
      width: 371px;
      height: 12px;
      .icon-playbar-playhead {
        position: absolute;
        margin-left: 0;
        transform: translate3d(0, 0, 0);
        width: 12px;
        height: 12px;
        background-position: -217px -181px;
      }
    }
  }
  .controls-right {
    position: relative;
    display: flex;
    height: 100%;
    align-items: center;
    gap: 24px;
    // 播放列表
    .list {
      position: relative;
      width: 60px;
      height: 23px;
      color: white;
      background-position: 0 -120px;
      .num {
        position: absolute;
        right: 4px;
      }
    }
    .play-mode {
      width: 16px;
      height: 16px;
      line-height: 16px;
    }
    .order-mode {
      display: flex;
      align-items: center;
      &:hover {
        .icon-order-mode {
          border-top: 1px solid #19b5f0;
          border-bottom: 1px solid #19b5f0;
        }
      }
    }
    .icon-order-mode {
      display: inline-block;
      height: 4px;
      width: 100%;
      border-top: 1px solid #b7b2b2;
      border-bottom: 1px solid #b7b2b2;
    }
    .mode-choosen-panel {
      position: absolute;
      top: 0;
      transform: translate(25%, -100%);
      color: white;
      background: #262b33;
      ul li {
        display: flex;
        padding: 4px;
        gap: 8px;
        align-items: center;
        font-size: 13px;
        // &:hover {
        //   color: #19b5f0;
        // }
      }
    }
    .volume-slide-panel {
      position: absolute;
      display: flex;
      width: 30px;
      height: 120px;
      // 底部栏高度
      bottom: 80px;
      background: #333;
      transform: translate(-25%, 0);
      justify-content: center;
      overflow: hidden;
      // &:hover {
      //   display: flex;
      // }
      .volume-bg,
      .volume-fg {
        width: 3px;
        height: 100px;
        margin-top: 20px;
        background: #d3d3d3;
      }
      .volume-bg {
        position: absolute;
        cursor: pointer;
        z-index: -1;
      }
      .volume-fg {
        margin-top: 20px;
        cursor: pointer;
        background: #19b5f0;
      }
      .icon-playbar-volumehead {
        position: absolute;
        bottom: 100px;
        width: 9px;
        height: 9px;
        background-position: -242px -130px;
      }
    }
    // #19b5f0 字体hover颜色
    // 音量控制及播放模式
    .icon-playbar-maxvox {
      width: 16px;
      height: 16px;
      background-position: -64px -195px;
    }
    .icon-playbar-maxvox:hover {
      background-position: -80px -195px;
    }
    .icon-playbar-minvox {
      width: 16px;
      height: 16px;
      background-position: 0 -195px;
    }
    .icon-playbar-minvox:hover {
      background-position: -16px -195px;
    }
    .icon-playbar-silence {
      background-position: -128px -195px;
    }
    .icon-playbar-silence:hover {
      background-position: -144px -195px;
    }
    .icon-playbar-randomcycle {
      background-position: -128px -179px;
    }
    .icon-playbar-randomcycle:hover {
      background-position: -144px -179px;
    }
    .icon-playbar-singlecycle {
      background-position: 0 -179px;
    }
    .icon-playbar-singlecycle:hover {
      background-position: -16px -179px;
    }
    .icon-playbar-cycle {
      background-position: -64px -179px;
    }
    .icon-playbar-cycle:hover {
      background-position: -80px -179px;
    }
    .icon-base-style {
      width: 16px;
      height: 16px;
      line-height: 16px;
    }
  }
  audio.player {
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: -1;
    opacity: 0;
  }
}
</style>

<style lang="scss">
.song-name {
  // color: #d3d3d3;
}
.song-name.active {
  color: #19b5f0;
}
</style>
