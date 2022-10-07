chrome.runtime.onMessage.addListener(async (response, callback) => {
    if (response.message === "start Page-Avis") {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          { message: "start_page_avis" },
          function (response) {
            console.log("message sent");
          }
        );
      });
    }
  });