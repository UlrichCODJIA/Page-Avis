var cursor_res;
var all_users_uid = {};

let table = document.createElement('table');
table.style.display = 'none';
let thead = document.createElement('thead');
var name_elmt = document.createElement("th");
var name_text = document.createTextNode("Firstname / Lastname");
name_elmt.appendChild(name_text);
var uid_elmt = document.createElement("th");
var uid_elmt_text = document.createTextNode("UID");
uid_elmt.appendChild(uid_elmt_text);
var tr = document.createElement("tr");
tr.appendChild(name_elmt);
tr.appendChild(uid_elmt);
thead.appendChild(tr);
let tbody = document.createElement('tbody');
table.appendChild(thead);
table.appendChild(tbody);

// Adding the entire table to the body tag
document.getElementsByTagName('body')[0].appendChild(table);

function DeleteRows() {
  var rowCount = table.rows.length;
  for (var i = rowCount - 1; i > 0; i--) {
    table.deleteRow(i);
  }
}

chrome.runtime.onMessage.addListener((response, callback) => {
  if (response.message == "start_page_avis") {
    console.log(
      "%cStart Page-Avis",
      "color: white; font-weight: 900; font-size: 25px; background-color: blue;padding: 2px"
    );
    if (response.cursor != undefined) {
      get_first_uid_and_cursor(response.cursor);
    } else {
      get_first_uid_and_cursor();
    }
  }
});

function data_concat_and_add_to_table(first_user_list) {
  var allEntries = "";
  for (const i in first_user_list) {
    allEntries = allEntries.concat(i + " : " + first_user_list[i] + "\n");
    var no = document.createElement("td");
    var no_text = document.createTextNode(i);
    no.appendChild(no_text);
    var uid = document.createElement("td");
    var uid_text = document.createTextNode(first_user_list[i]);
    uid.appendChild(uid_text);
    var tr = document.createElement("tr");
    tr.appendChild(no);
    tr.appendChild(uid);
    tbody.appendChild(tr);
  };
  const blob = new Blob([allEntries], {
    type: "text/plain",
  });
  var url = URL.createObjectURL(blob);

  return url;
}

function download_as_excel(table) {
  const now = new Date();
  /* Create worksheet from HTML DOM TABLE */
  var wb = XLSX.utils.table_to_book(table);
  /* Export to file (start a download) */
  XLSX.writeFile(
    wb,
    "Page-Avis/Report-" +
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
}

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

async function get_first_uid_and_cursor(cursor = /"end_cursor":"{\\"in_progresscursor_type\\":\\"open_graph_and_page_rec\\",\\"local_rec_pattern_cursor\\":\\"([^"]+)\\",\\"rating_cursor\\"/gm.exec(document.body.innerHTML)[1]) {
  const analyze = /\?__a=([^"]+)&__user=([^"]+)&__comet_req=([^"]+)&jazoest=([^"]+)","e":"([^"]+)","s":"([^"]+)","w":([^"]+),"f":"([^"]+)","l":null}/.exec(document.head.innerHTML);
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
  const page_id_reg = /"props":{"pageID":"([^"]+)",/.exec(document.body.innerHTML) || /{"__dr":"ProfileCometReviewsTabRoot\.react"},"props":{"userID":"([^"]+)","userVanity":/gm.exec(document.body.innerHTML);
  const page_id = page_id_reg[1];
  const sort_order_reg = /"feedLocation":"PAGE_TIMELINE","order":"([^"]+)","pageID"/gm.exec(document.body.innerHTML);

  const firsts_users_uid = {};

  var scripts_ = [];
  var doc_id;
  await fetch(window.location.href)
    .then((response) => {
      return response.text();
    })
    .then(async (data) => {
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
            let doc_id_regex_test = /__d\("ProfileCometReviewsFeedRefetchQuery_facebookRelayOperation",\[],\(function\(a,b,c,d,e,f\){e\.exports="([^"]+)"}\),null\);/gm.exec(text) || /__d\("CometPageReviewsRecommendationsPostsPaginationQuery_facebookRelayOperation",\[],\(function\(a,b,c,d,e,f\){e\.exports="([^"]+)"}\),null\);/gm.exec(text);
            if (doc_id_regex_test != undefined) {
              doc_id = doc_id_regex_test[1];
            }
          })
      };
    });

  if (cursor != null) {
    console.clear();
    console.log(
      "%cExtracting",
      "color: white; font-weight: 900; font-size: 25px; background-color: blue;padding: 2px"
    );
    get_uid(progressCallback, firsts_users_uid, all_users_uid, cursor, doc_id, page_id, lsd, __spin_t, __spin_b, __rev_and__spin_r, fb_dtsg, __hsi, jazoest, __comet_req, __user, __a, 12500, sort_order_reg)
      .then(result => {
        if (result.error != undefined) {
          console.log(
            `%c${result.error}`,
            "color: blue; font-weight: 900; font-size: 25px;padding: 2px"
          );
          const url = data_concat_and_add_to_table(result.first_user_list);
          download_as_excel(table);
          DeleteRows();
          const blob = new Blob([cursor_res], {
            type: "text/plain",
          });
          var cursor_url = URL.createObjectURL(blob);
          chrome.runtime.sendMessage(
            { message: "first_users_uid_and_cursor", 'url': url, 'cursor_url': cursor_url, 'msg': result.error },
          );
        } else {
          console.log(
            "%cDOWNLOADING",
            "color: white; font-weight: 900; font-size: 25px; background-color: blue;padding: 2px"
          );
          const url = data_concat_and_add_to_table(result);
          download_as_excel(table);
          DeleteRows();
          chrome.runtime.sendMessage(
            { message: "first_users_uid_and_cursor", 'url': url, 'msg': "EXTRACTION COMPLETE" },
          );
        }
      })
      .catch(console.error);
  } else {
    console.log(
      "%cERROR!!! PLEASE RETRY OR CONTACT ME",
      "color: red; font-weight: 900; font-size: 25px;padding: 2px"
    );
    const url = data_concat_and_add_to_table(all_users_uid);
    download_as_excel(table);
    DeleteRows();
    chrome.runtime.sendMessage(
      { message: "first_users_uid_and_cursor", 'url': url, 'msg': "ERROR!!! PLEASE RETRY OR CONTACT ME" },
    );
  }
}

function create_payload(cursor, doc_id, page_id, lsd, __spin_t, __spin_b, __rev_and__spin_r, fb_dtsg, __hsi, jazoest, __comet_req, __user, __a, sort_order_reg) {
  let payload;
  if (sort_order_reg == null) {
    payload = `av=${__user}&__user=${__user}&__a=${__a}&__dyn=&__csr=&__req=&__hs=19279.HYP%3Acomet_pkg.2.1.0.2.1&dpr=1.5&__ccg=EXCELLENT&__rev=${__rev_and__spin_r}&__s=&__hsi=${__hsi}&__comet_req=${__comet_req}&fb_dtsg=${fb_dtsg}&jazoest=${jazoest}&lsd=${lsd}&__spin_r=${__rev_and__spin_r}&__spin_b=${__spin_b}&__spin_t=${__spin_t}&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=ProfileCometReviewsFeedRefetchQuery&variables=%7B%22UFI2CommentsProvider_commentsKey%22%3A%22ProfileCometReviewsTabRoute%22%2C%22count%22%3A3%2C%22cursor%22%3A%22%7B%5C%22in_progresscursor_type%5C%22%3A%5C%22open_graph_and_page_rec%5C%22%2C%5C%22local_rec_pattern_cursor%5C%22%3A%5C%22${cursor}%5C%22%2C%5C%22rating_cursor%5C%22%3A%5C%22%5C%22%2C%5C%22offline_offset%5C%22%3A-1%2C%5C%22og_post_cursor%5C%22%3A%5C%22end_of_og_post_query%5C%22%7D%22%2C%22displayCommentsContextEnableComment%22%3Anull%2C%22displayCommentsContextIsAdPreview%22%3Anull%2C%22displayCommentsContextIsAggregatedShare%22%3Anull%2C%22displayCommentsContextIsStorySet%22%3Anull%2C%22displayCommentsFeedbackContext%22%3Anull%2C%22feedLocation%22%3A%22PAGE_SURFACE_RECOMMENDATIONS%22%2C%22feedbackSource%22%3A0%2C%22focusCommentID%22%3Anull%2C%22privacySelectorRenderLocation%22%3A%22COMET_STREAM%22%2C%22renderLocation%22%3A%22timeline%22%2C%22scale%22%3A1.5%2C%22useDefaultActor%22%3Afalse%2C%22id%22%3A%22${page_id}%22%2C%22__relay_internal__pv__FBReelsEnableDeferrelayprovider%22%3Atrue%7D&server_timestamps=true&doc_id=${doc_id}`;
  } else {
    payload = `av=${__user}&__user=${__user}&__a=${__a}&__dyn=&__csr=&__req=&__hs=19289.HYP%3Acomet_pkg.2.1.0.2.1&dpr=1.5&__ccg=EXCELLENT&__rev=${__rev_and__spin_r}&__s=&__hsi=${__hsi}&__comet_req=${__comet_req}&fb_dtsg=${fb_dtsg}&jazoest=${jazoest}&lsd=${lsd}&__spin_r=${__rev_and__spin_r}&__spin_b=${__spin_b}&__spin_t=${__spin_t}&fb_api_caller_class=RelayModern&fb_api_req_friendly_name=CometPageReviewsRecommendationsPostsPaginationQuery&variables=%7B%22UFI2CommentsProvider_commentsKey%22%3Anull%2C%22count%22%3A3%2C%22cursor%22%3A%22%7B%5C%22in_progresscursor_type%5C%22%3A%5C%22open_graph_and_page_rec%5C%22%2C%5C%22local_rec_pattern_cursor%5C%22%3A%5C%22${cursor}%5C%22%2C%5C%22rating_cursor%5C%22%3A%5C%22%5C%22%2C%5C%22offline_offset%5C%22%3A-1%2C%5C%22og_post_cursor%5C%22%3A%5C%22end_of_og_post_query%5C%22%7D%22%2C%22displayCommentsContextEnableComment%22%3Anull%2C%22displayCommentsContextIsAdPreview%22%3Anull%2C%22displayCommentsContextIsAggregatedShare%22%3Anull%2C%22displayCommentsContextIsStorySet%22%3Anull%2C%22displayCommentsFeedbackContext%22%3Anull%2C%22feedLocation%22%3A%22PAGE_TIMELINE%22%2C%22feedbackSource%22%3A0%2C%22focusCommentID%22%3Anull%2C%22privacySelectorRenderLocation%22%3A%22COMET_STREAM%22%2C%22renderLocation%22%3A%22permalink%22%2C%22scale%22%3A1.5%2C%22sort_order%22%3A%22${sort_order_reg[1]}%22%2C%22useDefaultActor%22%3Afalse%2C%22id%22%3A%22${page_id}%22%7D&server_timestamps=true&doc_id=${doc_id}`
  }

  return payload
};

function get_uid(progress, first_user_list, all_users_uid, cursor, doc_id, page_id, lsd, __spin_t, __spin_b, __rev_and__spin_r, fb_dtsg, __hsi, jazoest, __comet_req, __user, __a, limit, sort_order_reg) {

  const payload = create_payload();

  const myHeaders = new Headers({
    'scheme': 'https',
    'accept': '*/*',
    'content-type': 'application/x-www-form-urlencoded',
    'referer': window.location.href,
  });

  const myOptions = {
    method: "POST",
    headers: myHeaders,
    body: payload,
    mode: "cors",
  };
  const myRequest = new Request('https://www.facebook.com/api/graphql/');
  return new Promise((resolve, reject) => fetch(myRequest, myOptions)
    .then(response => {
      if (response.status !== 200) {
        throw `${response.status}: ${response.statusText}`;
      }
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("text/javascript") !== -1) {
        response.json().then(json => {
          let new_forum_members = json.data.node.reviews_recommendations_feed.edges;
          for (const elmt of new_forum_members) {
            first_user_list[elmt.node.comet_sections.content.story.comet_sections.context_layout.story.comet_sections.actor_photo.story.actors[0].name] = elmt.node.comet_sections.content.story.comet_sections.context_layout.story.comet_sections.actor_photo.story.actors[0].id;
            all_users_uid[elmt.node.comet_sections.content.story.comet_sections.context_layout.story.comet_sections.actor_photo.story.actors[0].name] = elmt.node.comet_sections.content.story.comet_sections.context_layout.story.comet_sections.actor_photo.story.actors[0].id;
          }
          if (json.data.node.reviews_recommendations_feed.page_info.has_next_page == true && Object.keys(first_user_list).length < limit) {
            cursor_res = cursor = JSON.parse(json.data.node.reviews_recommendations_feed.page_info.end_cursor).local_rec_pattern_cursor;
            progress && progress(first_user_list);
            get_uid(progress, first_user_list, all_users_uid, cursor, doc_id, page_id, lsd, __spin_t, __spin_b, __rev_and__spin_r, fb_dtsg, __hsi, jazoest, __comet_req, __user, __a, limit, sort_order_reg)
              .then(resolve)
              .catch(reject)
          } else if (json.errors != undefined || (Object.keys(first_user_list).length <= limit + 500 && Object.keys(first_user_list).length >= limit)) {
            const new_etat = {};
            if (json.errors != undefined) {
              new_etat['error'] = `%c${json.errors[0].message.toUpperCase()}. CONTINUE WHEN THIS FEATURE WILL BE UNLOCKED`
            } else {
              new_etat['error'] = "CONTINUE EXTRACTION AFTER 24 HOURS";
            };
            new_etat['first_user_list'] = first_user_list;
            progress && progress(first_user_list);
            resolve(new_etat);
          } else {
            resolve(all_users_uid);
          }
        }).catch(reject);
      } else {
        response.text().then(text => {
          let new_forum_members = text.matchAll(/{"actors":\[{"__typename":"User","__isActor":"User","id":"([^"]+)","__isEntity":"User","url":"([^"]+)","work_foreign_entity_info":null,"work_info":null,"profile_url":"([^"]+)","story_bucket":{"nodes":\[]},"name":"([^"]+)","profile_picture"/gm);
          for (const elmt of new_forum_members) {
            first_user_list[elmt[4]] = elmt[1];
            all_users_uid[elmt[4]] = elmt[1];
          };
          if (/"has_next_page":([^"]+),"end_cursor"/gm.exec(text)[1] == 'true' && Object.keys(first_user_list).length < limit) {
            cursor_res = cursor = /\\"local_rec_pattern_cursor\\":\\"([^"]+)\\"/gm.exec(text)[1];
            progress && progress(first_user_list);
            get_uid(progress, first_user_list, all_users_uid, cursor, doc_id, page_id, lsd, __spin_t, __spin_b, __rev_and__spin_r, fb_dtsg, __hsi, jazoest, __comet_req, __user, __a, limit)
              .then(resolve)
              .catch(reject)
          } else if (Object.keys(first_user_list).length <= limit + 500 && Object.keys(first_user_list).length >= limit) {
            const new_etat = {};
            new_etat['error'] = "CONTINUE EXTRACTION AFTER 24 HOURS";
            new_etat['first_user_list'] = first_user_list;
            progress && progress(first_user_list);
            resolve(new_etat);
          } else {
            resolve(all_users_uid);
          }
        }).catch(reject);
      }
    }).catch(reject));
}

function progressCallback(first_user_list) {
  // render progress
  console.log(`${Object.keys(first_user_list).length} loaded`);
}