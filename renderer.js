// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const songListEl = document.getElementById("songList");

window.eAPI.onSongList((e, val) => {
  songListEl.innerText = val.join(" ");
  window.eAPI.log("log 输出");
  // const audio = document.querySelector("audio");
  // audio.src = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/858/outfoxing.mp3";
  // audio.play();
});
// window.eAPI.getSongList("f:/music").then((res) => {
//   songListEl.innerText = res.join("/n");
// });
