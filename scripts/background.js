chrome.runtime.onMessage.addListener(async (response, callback) => {
  if (response.message === "start Page-Avis") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { message: "start_page_avis" },
      );
    });
  }
});

chrome.runtime.onMessage.addListener((response, callback) => {
  if (response.message == "first_users_uid_and_cursor") {
    download(response.url, response.cursor_url);
    if (response.msg != undefined) {
      chrome.runtime.sendMessage(
        { message: "continue_msg", 'msg': response.msg },
      );
    }
  }
});

function onStartedDownload(id) {
  console.log(`Started downloading: ${id}`);
}

function onFailed(error) {
  console.log(`Download failed: ${error}`);
}

function download(url, cursor_url) {
  const now = new Date();
  chrome.downloads
    .download({
      url: url,
      filename:
        "Page-Avis/" +
        "Report-" +
        now.getFullYear() +
        "-" +
        now.getMonth() +
        "-" +
        now.getDate() +
        " at " +
        now.getHours() +
        "_" +
        now.getMinutes() +
        "_" +
        now.getMilliseconds() +
        ".txt",
      conflictAction: "uniquify",
    })
    .then(chrome.downloads
      .download({
        url: cursor_url,
        filename:
          "Page-Avis/" +
          "Next_cursor-" +
          now.getFullYear() +
          "-" +
          now.getMonth() +
          "-" +
          now.getDate() +
          " at " +
          now.getHours() +
          "_" +
          now.getMinutes() +
          "_" +
          now.getMilliseconds() +
          ".txt",
        conflictAction: "uniquify",
      })
      .then(onStartedDownload, onFailed)
      , onFailed);
}