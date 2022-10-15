const analyze = /\?__a=([^"]+)&__user=([^"]+)&__comet_req=([^"]+)&jazoest=([^"]+)","e":"([^"]+)","s":"([^"]+)","w":([^"]+),"f":"([^"]+)","l":null}/.exec(document.head.innerHTML);
console.log(analyze);
const __a = analyze[1];
const __user = analyze[2];
const __comet_req = analyze[3];
const jazoest = analyze[4];
const __hsi = analyze[5];
const fb_dtsg = analyze[8].replaceAll(":", "%3A");
const analyze1 = /"__spin_r":([^"]+),"__spin_b":"([^"]+)","__spin_t":([^"]+),"vip"/.exec(document.body.innerHTML);
const __rev_and__spin_r = analyze1[1];
const __spin_b = analyze1[2];
const __spin_t = analyze1[3];
const lsd = /"LSD",([^"]+),{"token":"([^"]+)"}/.exec(document.body.innerHTML)[2];
const cursor = /"end_cursor":"{\\"in_progresscursor_type\\":\\"open_graph_and_page_rec\\",\\"local_rec_pattern_cursor\\":\\"([^"]+)\\",\\"rating_cursor\\"/gm.exec(document.body.innerHTML);

chrome.runtime.onMessage.addListener((response, callback) => {
  if (response.message == "start_page_avis") {
    console.log("Start Page-avis");
    get_first_uid_and_cursor();
  }
});

async function get_doc_id_and_page_id() {
  var scripts_ = [];
  var doc_id;
  var page_id;
  await fetch(window.location.href)
    .then((response) => {
      return response.text();
    })
    .then(async (data) => {
      let page_id_regex_test = /{"__dr":"ProfileCometReviewsTabRoot\.react"},"props":{"userID":"([^"]+)","userVanity":/gm.exec(data);
      if (page_id_regex_test != undefined) {
        page_id = page_id_regex_test[1];
      }
      const all = data.matchAll(/([^"]+rsrc\.php\/[^"]+\.js[^"]+)/g);
      for (const elmt of all) {
        scripts_.push(elmt)
      };
      for (const url of scripts_) {
        await fetch(url[1])
          .then((response) => {
            return response.text();
          })
          .then((text) => {
            let doc_id_regex_test = /__d\("ProfileCometReviewsFeedRefetchQuery_facebookRelayOperation",\[],\(function\(a,b,c,d,e,f\){e\.exports="([^"]+)"}\),null\);/gm.exec(text);
            if (doc_id_regex_test != undefined) {
              doc_id = doc_id_regex_test[1];
            }
          })
      };
      console.log(`doc_id: ${doc_id}, page_id: ${page_id}`);
      return { 'doc_id': doc_id, 'page_id': page_id }
    })
};

function getElementsByXPath(xpath, parent) {
  let results = [];
  let query = document.evaluate(
    xpath,
    parent || document,
    null,
    XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
    null
  );
  for (let i = 0, length = query.snapshotLength; i < length; ++i) {
    results.push(query.snapshotItem(i));
  }
  return results;
}

function get_profile_href(elmt) {
  var all_profiles_list = get_profiles_list_count(elmt)["profile_list"];
  const profiles_href = {};
  for (var i = 0; i < all_profiles_list.length; i++) {
    var profile = getElementsByXPath(
      "div/div/div/div/div/div/div/div/div/div[2]/div/div[2]/div/div[2]/div/div[1]/span/h2/span/strong[1]/span/a",
      all_profiles_list[i]
    )[0];
    var profiles_name = profile.innerText;
    profiles_href[profiles_name] = profile.getAttribute("href");
  }
  return profiles_href;
}

function get_profiles_list_count(elmt) {
  var profile_list = [];
  for (var i = 1; i < elmt.children.length; i++) {
    try {
      if (
        elmt.children[i].getAttribute("class") !=
        elmt.children[i + 1].getAttribute("class")
      ) {
      } else {
        profile_list.push(elmt.children[i]);
      }
    } catch (err) { }
  }
  var profile_list_count = profile_list.length;

  return { profile_list: profile_list, profile_list_count: profile_list_count };
}

function get_first_user_uid(user_list) {
  const profiles_href = user_list;
  const profiles_hrefs = {};
  for (const i in profiles_href) {
    if (profiles_href[i].search("http") != -1) {
      const myRequest = new Request(profiles_href[i]);
      fetch(myRequest)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error, status = ${response.status}`);
          }
          return response.text();
        })
        .then((data) => {
          let uid = /"userID":"([^"]+)"/.exec(data);
          if (uid != null) {
            profiles_hrefs[i] = uid[1];
          } else {
            profiles_hrefs[i] = "";
          }
        })
        .catch((error) => {
          profiles_hrefs[i] = error.message;
        });
    } else {
      profiles_hrefs[i] = profiles_href[i];
    }
  }
  return profiles_hrefs;
}

async function get_first_uid_and_cursor() {

  const firsts_users_href = get_profile_href(getElementsByXPath("/html/body/div[1]/div/div[1]/div/div[3]/div/div/div/div[1]/div[1]/div/div/div[4]/div/div/div")[0]);
  const firsts_users_uid = get_first_user_uid(firsts_users_href);
  const doc_id = get_doc_id_and_page_id()['doc_id'];
  const page_id = get_doc_id_and_page_id()['page_id'];

  if (Object.keys(firsts_users_uid).length != 0 && cursor != null) {
    get_uid(
      progressCallback,
      firsts_users_uid,
      cursor[1],
      doc_id,
      page_id,
      lsd,
      __spin_t,
      __spin_b,
      __rev_and__spin_r,
      fb_dtsg,
      __hsi,
      jazoest,
      __comet_req,
      __user,
      __a)
      .then(first_user_list => {
        // all first_user_list have been loaded
        chrome.runtime.sendMessage(
          {
            message: "first_users_uid_and_cursor",
            first_user_list: first_user_list,
            first_user_list_length: Object.keys(first_user_list).length,
          },
          function (response) {
            console.log("first_users_uid_and_cursor_loaded");
          }
        );
      })
      .catch(console.error);
  } else {
    chrome.runtime.sendMessage(
      { message: "error", error_msg: "ERROR TRYING TO GET THE DATAS" },
      function (response) {
        console.log("error");
      }
    );
  }
}

function get_uid(
  progress,
  first_user_list,
  cursor,
  doc_id,
  page_id,
  lsd,
  __spin_t,
  __spin_b,
  __rev_and__spin_r,
  fb_dtsg,
  __hsi,
  jazoest,
  __comet_req,
  __user,
  __a) {

  const formData = `av=${__user}&__user=${__user}&__a=${__a}&__dyn=&__csr=&__req=&__hs=19279.HYP%3Acomet_pkg.2.1.0.2.1&dpr=1.5&__ccg=EXCELLENT&__rev=${__rev_and__spin_r}&__s=&__hsi=${__hsi}&__comet_req=${__comet_req}&fb_dtsg=${fb_dtsg}&jazoest=${jazoest}&lsd=${lsd}&__spin_r=${__rev_and__spin_r}&__spin_b=${__spin_b}&__spin_t=${__spin_t}&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=ProfileCometReviewsFeedRefetchQuery&variables=%7B%22UFI2CommentsProvider_commentsKey%22%3A%22ProfileCometReviewsTabRoute%22%2C%22count%22%3A3%2C%22cursor%22%3A%22%7B%5C%22in_progresscursor_type%5C%22%3A%5C%22open_graph_and_page_rec%5C%22%2C%5C%22local_rec_pattern_cursor%5C%22%3A%5C%22${cursor}%5C%22%2C%5C%22rating_cursor%5C%22%3A%5C%22%5C%22%2C%5C%22offline_offset%5C%22%3A-1%2C%5C%22og_post_cursor%5C%22%3A%5C%22end_of_og_post_query%5C%22%7D%22%2C%22displayCommentsContextEnableComment%22%3Anull%2C%22displayCommentsContextIsAdPreview%22%3Anull%2C%22displayCommentsContextIsAggregatedShare%22%3Anull%2C%22displayCommentsContextIsStorySet%22%3Anull%2C%22displayCommentsFeedbackContext%22%3Anull%2C%22feedLocation%22%3A%22PAGE_SURFACE_RECOMMENDATIONS%22%2C%22feedbackSource%22%3A0%2C%22focusCommentID%22%3Anull%2C%22privacySelectorRenderLocation%22%3A%22COMET_STREAM%22%2C%22renderLocation%22%3A%22timeline%22%2C%22scale%22%3A1.5%2C%22useDefaultActor%22%3Afalse%2C%22id%22%3A%22${page_id}%22%2C%22__relay_internal__pv__FBReelsEnableDeferrelayprovider%22%3Atrue%7D&server_timestamps=true&doc_id=${doc_id}`;

  const myHeaders = new Headers({
    'scheme': 'https',
    'accept': '*/*',
    'content-type': 'application/x-www-form-urlencoded',
    'referer': window.location.href,
  });

  const myOptions = {
    method: "POST",
    headers: myHeaders,
    body: formData,
    mode: "cors",
  };
  const myRequest = new Request('https://www.facebook.com/api/graphql/');
  return new Promise((resolve, reject) => fetch(myRequest, myOptions)
    .then(response => {
      if (response.status !== 200) {
        throw `${response.status}: ${response.statusText}`;
      }
      response.json().then(json => {
        console.log(json);
        let new_forum_members = json.data.node.new_forum_members;
        let user_list = new_forum_members.edges;
        for (var i = 0; i < user_list.length; i++) {
          first_user_list[user_list[i].node.name] = user_list[i].node.id;
        };

        try {
          const members_count = parseInt(
            getElementsByXPath(
              '/html/body/div[1]/div/div[1]/div/div[3]/div/div/div/div[1]/div[1]/div[4]/div/div/div/div/div/div/div/div/div/div/div[1]/div/div/div/div/div[1]/h2/span/span/span/strong'
            )[0].childNodes[1].nodeValue);
          console.log(members_count, Object.keys(first_user_list).length);
        } catch (err) { };

        if (new_forum_members.page_info.has_next_page == true) {
          cursor = new_forum_members.page_info.end_cursor
          progress && progress(first_user_list);
          get_uid(
            progress,
            first_user_list,
            cursor,
            group_id_and_id,
            doc_id,
            lsd,
            __spin_t,
            __spin_b,
            __rev_and__spin_r,
            fb_dtsg,
            __hsi,
            jazoest,
            __comet_req,
            __user,
            __a)
            .then(resolve).catch(reject)
        } else {
          resolve(first_user_list);
        }
      }).catch(reject);
    }).catch(reject));
}

function progressCallback(first_user_list) {
  // render progress
  console.log(`${first_user_list.length} loaded`);
}