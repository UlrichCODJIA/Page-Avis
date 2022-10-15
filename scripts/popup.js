const get_uid_btn = document.getElementById("get_uid");
const loader = document.getElementById("load");

function start() {
  loader.style.display = "block";
  chrome.runtime.sendMessage(
    { message: "start Page-Avis" },
    function (response) {
      console.log("start Page-Avis");
    }
  );
}

get_uid_btn.addEventListener("click", start);

chrome.runtime.onMessage.addListener((response, callback) => {
  switch (response.message) {
    case "first_users_uid_and_cursor":
      download(response.first_user_list, response.first_user_list_length);
      break;
    case "error":
      var h5 = document.createElement("h5");
      h5.appendChild(document.createTextNode(`Error: ${response.error_msg}`));
      document.body.children[0].insertBefore(
        h5,
        document.body.children[0].children[5]
      );
      break;
  }
});

function onStartedDownload(id) {
  console.log(`Started downloading: ${id}`);
}

function onFailed(error) {
  console.log(`Download failed: ${error}`);
}

function populate_html_table(allEntries, profiles_hrefs, i) {
  allEntries = allEntries.concat(i + " : " + profiles_hrefs[i] + "\n");
  var no = document.createElement("td");
  var no_text = document.createTextNode(i);
  no.appendChild(no_text);
  var uid = document.createElement("td");
  var uid_text = document.createTextNode(profiles_hrefs[i]);
  uid.appendChild(uid_text);
  var tr = document.createElement("tr");
  tr.appendChild(no);
  tr.appendChild(uid);
  var element = document.getElementById("list_of_uid");
  element.appendChild(tr);
}

function download_excel(folder_name, now) {
  /* Create worksheet from HTML DOM TABLE */
  var wb = XLSX.utils.table_to_book(document.getElementById("uid_table"));
  /* Export to file (start a download) */
  XLSX.writeFile(
    wb,
    `${folder_name}/` +
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
    ".xlsx"
  );
};

function download_text(allEntries, folder_name, now) {
  const blob = new Blob([allEntries], {
    type: "text/plain",
  });
  var url = URL.createObjectURL(blob);
  chrome.downloads
    .download({
      url: url,
      filename:
        `${folder_name}/` +
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
    .then(onStartedDownload, onFailed);
};

function download(profiles_hrefs, profiles_href_length) {
  var time = setInterval(() => {
    if (profiles_href_length == Object.keys(profiles_hrefs).length) {
      clearInterval(time);
      var allEntries = "";
      for (const i in profiles_hrefs) {
        populate_html_table(allEntries, profiles_hrefs, i);
      }
      loader.style.display = "none";
      const now = new Date();
      download_text(allEntries, "PageAvis", now);
      download_excel("PageAvis", now);
    }
  });
}
