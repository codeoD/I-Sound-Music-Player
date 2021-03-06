const { opendirSync, readdirSync } = require("fs");
const ffmetadata = require("ffmetadata");
const path = require("path");
ffmetadata.setFfmpegPath(path.join(__dirname, "../ffmpeg/bin/ffmpeg"));

async function getFileInfo(path) {
  return await new Promise((resolve, reject) => {
    ffmetadata.read(path, (err, data) => {
      res = data;
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

module.exports = {
  /**
   *
   * @param {*} path
   * @param {RegExp} filter /.(mp3|wav)$/
   * @returns
   */
  getFilesFromDir(path, filter = /.*$/) {
    const files = [];
    if (!path) return files;
    try {
      const dirents = readdirSync(path, {
        withFileTypes: true,
      });
      dirents.forEach((dirent, i) => {
        const source = path + "\\" + dirent.name;
        if (dirent.isDirectory()) {
          const tempFiles = module.exports.getFilesFromDir(source, filter);
          files.concat(tempFiles);
        } else {
          files.push({
            realName: dirent.name,
            innerName: Buffer.from(source).toString("base64"),
            source: path + "\\" + dirent.name,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
    return files;
  },
};
