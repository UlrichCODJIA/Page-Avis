chrome.runtime.onMessage.addListener((response, callback) => {
  if (response.message == "start_page_avis") {
    console.log("Start Page-avis");
    scrollTillEnd(
      getElementsByXPath(
        "/html/body/div[1]/div/div[1]/div/div[3]/div/div/div/div[1]/div[1]/div/div/div[4]/div/div/div"
      )[0]
    );
  }
});

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
    } catch (err) {}
  }
  var profile_list_count = profile_list.length;

  return { profile_list: profile_list, profile_list_count: profile_list_count };
}

function check_elmt_height(elmt) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(elmt.scrollHeight);
    }, 2000);
  });
}

async function scrollTillEnd(elmt) {
  var profile_list_count = getElementsByXPath(
    "/html/body/div[1]/div/div[1]/div/div[3]/div/div/div/div[1]/div[1]/div/div/div[4]/div/div/div"
  )[0].scrollHeight;
  window.scrollTo(0, document.body.scrollHeight);
  var time = setInterval(async function () {
    if ((await check_elmt_height(elmt)) != profile_list_count) {
      window.scrollTo(0, document.body.scrollHeight);
      profile_list_count = getElementsByXPath(
        "/html/body/div[1]/div/div[1]/div/div[3]/div/div/div/div[1]/div[1]/div/div/div[4]/div/div/div"
      )[0].scrollHeight;
    } else {
      clearInterval(time);
      const profiles_href_list = {};
      const profiles_hrefs = get_profile_href(elmt);
      for (const i in profiles_hrefs) {
        if (profiles_hrefs[i].indexOf("profile.php?id") != -1) {
          var url = new URL(profiles_hrefs[i]);
          var uid = url.searchParams.get("id");
          profiles_href_list[i] = uid;
        } else {
          if (profiles_hrefs[i].indexOf("?__cft__") != -1) {
            profiles_href_list[i] = profiles_hrefs[i].slice(
              0,
              profiles_hrefs[i].indexOf("?__cft__")
            );
          } else {
            if (
              (profiles_hrefs[i],
              /(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\-]*)?/.test(
                profiles_hrefs[i]
              ) == true)
            ) {
              console.log(
                profiles_hrefs[i],
                /(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\-]*)?/.exec(
                  profiles_hrefs[i]
                )
              );
              profiles_href_list[i] =
                /(?:(?:http|https):\/\/)?(?:www.)?facebook.com\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\-]*)?/.exec(
                  profiles_hrefs[i]
                )[0];
            }
          }
        }
      }
      console.log(profiles_href_list.length);
      chrome.runtime.sendMessage(
        { message: "profile_href_loaded", profiles_href: profiles_href_list },
        function (response) {
          console.log("profile_href_loaded");
        }
      );
    }
  }, 5000);
}
