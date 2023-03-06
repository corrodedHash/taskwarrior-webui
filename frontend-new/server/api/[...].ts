export default defineEventHandler(async (event) => {
  const url = event.node.req.url;
  if (url === undefined) {
    return;
  }
  if (!url.startsWith("/api")) {
    return;
  }
  const modified_url = url.substring("/api".length).split("?")[0];
  const target = `http://localhost:3000${modified_url}`;
  console.log(url, modified_url, target, getMethod(event));
  console.log(getHeaders(event));
  if (getMethod(event) !== "GET") {
    console.log(await readBody(event));
  }
  try {
    if (getMethod(event) === "DELETE") {
      /// I have no idea what is happening, we don't even get the delete fetch through, because we have content-length: 0
      /// When we delete it, it works
      const headers = getRequestHeaders(event);
      delete headers["content-length"];
      console.log(headers);
      await proxyRequest(event, target + "?tasks[]=2", {
        fetchOptions: {
          headers: headers as unknown as undefined,
        },
      });
    } else {
      await proxyRequest(event, target + "?tasks[]=2", {});
    }
  } catch (e) {
    console.log("Errored with", e);
  }
});
