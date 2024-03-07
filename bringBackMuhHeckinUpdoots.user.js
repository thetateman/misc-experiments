fetch("/account/reactions", { method: "GET" }).then((response) => {
  response.text().then((text) => {
    const parser = new DOMParser();

    // Parse the text
    const doc = parser.parseFromString(text, "text/html");
    console.log(doc);
  });
});
