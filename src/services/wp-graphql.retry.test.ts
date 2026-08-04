jest.mock("react", () => ({
  ...jest.requireActual("react"),
  cache: (fn: any) => fn,
}));

import http from "http";

jest.setTimeout(60000);

/**
 * Guards the retry exchange in makeClient against the failure that blanked out
 * the homepage: WordPress running out of DB connections and answering with an
 * HTML error page under a 200 status and a JSON content-type.
 *
 * Worth keeping hermetic — the retry silently stopped working once already when
 * a mismatched @urql/exchange-retry pulled in its own @urql/core copy.
 */
const WPDB_ERROR_PAGE =
  '<div id="error"><p class="wpdberror"><strong>WordPress database error</strong></p></div>';

describe("wp-graphql client retry", () => {
  let server: http.Server;
  let port: number;
  let requestCount = 0;
  let failuresToServe = 0;

  beforeAll(async () => {
    server = http.createServer((_req, res) => {
      requestCount++;
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        requestCount <= failuresToServe
          ? WPDB_ERROR_PAGE
          : JSON.stringify({
              data: { post: { id: "1", title: "recovered", databaseId: 1 } },
            })
      );
    });
    await new Promise<void>((resolve) =>
      server.listen(0, "127.0.0.1", () => resolve())
    );
    port = (server.address() as any).port;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  function freshClient() {
    process.env.NEXT_PUBLIC_WP_URL = `http://127.0.0.1:${port}/`;
    let mod: any;
    jest.isolateModules(() => {
      mod = require("@/services/wp-graphql");
    });
    return mod;
  }

  it("retries past transient WordPress DB error pages", async () => {
    requestCount = 0;
    failuresToServe = 2;

    const { getClient, GET_POST_BY_ID } = freshClient();
    const result = await getClient().query(GET_POST_BY_ID, { id: "1" });

    expect(result.error).toBeUndefined();
    expect(result.data?.post?.title).toBe("recovered");
    expect(requestCount).toBe(3); // initial attempt + 2 retries
  });

  it("surfaces the error once attempts are exhausted", async () => {
    requestCount = 0;
    failuresToServe = Infinity;

    const { getClient, GET_POST_BY_ID } = freshClient();
    const result = await getClient().query(GET_POST_BY_ID, { id: "1" });

    // Must still fail: the caller throws on error so a broken render is never
    // cached in place of the last good page.
    expect(result.error).toBeDefined();
    expect(requestCount).toBe(3); // maxNumberAttempts
  });
});
