import { BrowserWindow, Utils } from "electrobun/bun";

const mainWindow = new BrowserWindow({
  title: "Skills Manager",
  url: "views://mainview/index.html",
  frame: {
    x: 80,
    y: 80,
    width: 1280,
    height: 860,
  },
});

mainWindow.on("close", () => {
  Utils.quit();
});
