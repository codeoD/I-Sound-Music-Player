const { opendirSync, readdirSync } = require("fs");
const path = require("path");
const mm = require("music-metadata");

module.exports = {
  /**
   *
   * @param {*} path
   * @param {RegExp} filter /.(mp3|wav)$/
   * @returns
   */
  getFilesFromDir(path, filter = /\.[mp3|wav]*$/) {
    const files = [];
    if (!path) return files;
    try {
      const dirents = readdirSync(path, {
        withFileTypes: true,
      });
      dirents.forEach((dirent, i) => {
        if (!filter.test(dirent.name)) return;
        const source = path + "\\" + dirent.name;
        if (dirent.isDirectory()) {
          const tempFiles = module.exports.getFilesFromDir(source, filter);
          files.concat(tempFiles);
        } else {
          files.push({
            name: dirent.name.replace(/(.*)(\..*$)/, "$1"),
            realName: dirent.name,
            innerName: Buffer.from(source).toString("base64"),
            source,
            lrcPath: source.replace(/(.*)(\..*$)/, "$1.lrc"),
            // meta 信息
            artist: "",
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
    return files;
  },

  async addMetadata2Song(songs) {
    return Promise.all(
      songs.map(async (song) => {
        const metadata = await mm.parseFile(song.source);
        song.artist = metadata.common.artist;
        return song;
      })
    );
  },
};
