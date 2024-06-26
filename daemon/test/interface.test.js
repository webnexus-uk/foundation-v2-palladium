const Interface = require("../main/interface");
const nock = require("nock");

const daemons = [
  {
    host: "127.0.0.1",
    port: "2332",
    username: "foundation",
    password: "foundation",
  },
];

const multiDaemons = [
  {
    host: "127.0.0.1",
    port: "2332",
    username: "foundation",
    password: "foundation",
  },
  {
    host: "127.0.0.2",
    port: "2332",
    username: "foundation",
    password: "foundation",
  },
];

nock.disableNetConnect();
nock.enableNetConnect("127.0.0.1");

////////////////////////////////////////////////////////////////////////////////

describe("Test interface functionality", () => {
  let daemonsCopy, multiDaemonsCopy;
  beforeEach(() => {
    daemonsCopy = JSON.parse(JSON.stringify(daemons));
    multiDaemonsCopy = JSON.parse(JSON.stringify(multiDaemons));
  });

  beforeEach(() => nock.cleanAll());
  afterAll(() => nock.restore());
  beforeAll(() => {
    if (!nock.isActive()) nock.activate();
    nock.enableNetConnect();
  });

  test("Test interface initialization [1]", (done) => {
    nock("http://127.0.0.1:2332")
      .post("/", (body) => body.method === "getpeerinfo")
      .reply(
        200,
        JSON.stringify({
          error: null,
          result: null,
          instance: "nocktest",
        })
      );
    const daemon = new Interface(daemonsCopy);
    daemon.on("online", () => done());
    daemon.checkInitialized();
  });

  test("Test interface initialization [2]", (done) => {
    nock("http://127.0.0.1:2332")
      .post("/", (body) => body.method === "getpeerinfo")
      .reply(
        200,
        JSON.stringify({
          error: null,
          result: null,
          instance: "nocktest",
        })
      );
    nock("http://127.0.0.2:2332")
      .post("/", (body) => body.method === "getpeerinfo")
      .reply(
        200,
        JSON.stringify({
          error: null,
          result: null,
          instance: "nocktest",
        })
      );
    const multiDaemon = new Interface(multiDaemonsCopy);
    multiDaemon.on("online", () => done());
    multiDaemon.checkInitialized();
  });

  test("Test interface initialization [3]", (done) => {
    const daemon = new Interface(daemonsCopy);
    daemon.on("failed", () => done());
    daemon.checkInitialized();
  });

  test("Test interface commands [1]", (done) => {
    nock("http://127.0.0.1:2332")
      .post("/", (body) => body.method === "getblocktemplate")
      .reply(
        200,
        JSON.stringify({
          error: null,
          result: null,
          instance: "nocktest",
        })
      );
    const daemon = new Interface(daemonsCopy);
    const requests = [["getblocktemplate", []]];
    const expected = [
      {
        data: '{"error":null,"result":null,"instance":"nocktest"}',
        error: null,
        instance: {
          host: "127.0.0.1",
          port: "2332",
          username: "foundation",
          password: "foundation",
          index: 0,
        },
        response: null,
      },
    ];
    daemon.sendCommands(requests, false, (response) => {
      expect(response).toStrictEqual(expected);
      done();
    });
  });

  test("Test interface commands [2]", (done) => {
    nock("http://127.0.0.1:2332")
      .post("/", (body) => body.method === "getblocktemplate")
      .reply(
        401,
        JSON.stringify({
          error: true,
          result: null,
          instance: "nocktest",
        })
      );
    const daemon = new Interface(daemonsCopy);
    const requests = [["getblocktemplate", []]];
    const expected = [
      {
        data: '{"error":true,"result":null,"instance":"nocktest"}',
        error: {
          code: -1,
          message: "Unauthorized RPC access. Invalid RPC username or password",
        },
        instance: {
          host: "127.0.0.1",
          index: 0,
          password: "foundation",
          port: "2332",
          username: "foundation",
        },
        response: null,
      },
    ];
    daemon.sendCommands(requests, false, (response) => {
      expect(response).toStrictEqual(expected);
      done();
    });
  });

  test("Test interface commands [3]", (done) => {
    nock("http://127.0.0.1:2332")
      .post("/")
      .reply(
        200,
        JSON.stringify([
          { id: "nocktest", error: null, result: null },
          { id: "nocktest", error: null, result: null },
        ])
      );
    const daemon = new Interface(daemonsCopy);
    const requests = [
      ["getblocktemplate", []],
      ["getpeerinfo", []],
    ];
    const expected = [
      [
        {
          error: null,
          response: null,
          instance: {
            host: "127.0.0.1",
            port: "2332",
            username: "foundation",
            password: "foundation",
            index: 0,
          },
          data: '{"id":"nocktest","error":null,"result":null}',
        },
        {
          error: null,
          response: null,
          instance: {
            host: "127.0.0.1",
            port: "2332",
            username: "foundation",
            password: "foundation",
            index: 0,
          },
          data: '{"id":"nocktest","error":null,"result":null}',
        },
      ],
    ];
    daemon.sendCommands(requests, false, (response) => {
      expect(response).toStrictEqual(expected);
      done();
    });
  });

  test("Test interface commands [4]", (done) => {
    nock("http://127.0.0.1:2332")
      .post("/")
      .reply(
        200,
        JSON.stringify([
          { id: "nocktest", error: null, result: null },
          { id: "nocktest", error: null, result: null },
        ])
      );
    nock("http://127.0.0.2:2332")
      .post("/")
      .reply(
        200,
        JSON.stringify([
          { id: "nocktest", error: null, result: null },
          { id: "nocktest", error: null, result: null },
        ])
      );
    const multiDaemon = new Interface(multiDaemonsCopy);
    const requests = [
      ["getblocktemplate", []],
      ["getpeerinfo", []],
    ];
    const expected = [
      [
        {
          error: null,
          response: null,
          instance: {
            host: "127.0.0.1",
            port: "2332",
            username: "foundation",
            password: "foundation",
            index: 0,
          },
          data: '{"id":"nocktest","error":null,"result":null}',
        },
        {
          error: null,
          response: null,
          instance: {
            host: "127.0.0.1",
            port: "2332",
            username: "foundation",
            password: "foundation",
            index: 0,
          },
          data: '{"id":"nocktest","error":null,"result":null}',
        },
      ],
      [
        {
          error: null,
          response: null,
          instance: {
            host: "127.0.0.2",
            port: "2332",
            username: "foundation",
            password: "foundation",
            index: 1,
          },
          data: '{"id":"nocktest","error":null,"result":null}',
        },
        {
          error: null,
          response: null,
          instance: {
            host: "127.0.0.2",
            port: "2332",
            username: "foundation",
            password: "foundation",
            index: 1,
          },
          data: '{"id":"nocktest","error":null,"result":null}',
        },
      ],
    ];
    multiDaemon.sendCommands(requests, false, (response) => {
      expect(response).toStrictEqual(expected);
      done();
    });
  });

  test("Test interface commands [5]", (done) => {
    nock("http://127.0.0.1:2332")
      .post("/")
      .reply(
        200,
        JSON.stringify([
          { id: "nocktest", error: null, result: null },
          { id: "nocktest", error: null, result: null },
        ])
      );
    const daemon = new Interface(daemonsCopy);
    const requests = [
      ["getblocktemplate", []],
      ["getpeerinfo", []],
    ];
    const expected = [
      {
        error: null,
        response: null,
        instance: {
          host: "127.0.0.1",
          port: "2332",
          username: "foundation",
          password: "foundation",
          index: 0,
        },
        data: '{"id":"nocktest","error":null,"result":null}',
      },
      {
        error: null,
        response: null,
        instance: {
          host: "127.0.0.1",
          port: "2332",
          username: "foundation",
          password: "foundation",
          index: 0,
        },
        data: '{"id":"nocktest","error":null,"result":null}',
      },
    ];
    daemon.sendCommands(requests, true, (response) => {
      expect(response).toStrictEqual(expected);
      done();
    });
  });

  test("Test interface commands [6]", (done) => {
    const daemon = new Interface(daemonsCopy);
    const expected = {
      data: null,
      error: { code: -1, message: "No commands passed to daemon" },
      instance: null,
      response: null,
    };
    daemon.sendCommands([], false, (response) => {
      expect(response).toStrictEqual(expected);
      done();
    });
  });

  test("Test interface commands [7]", (done) => {
    nock("http://127.0.0.1:2332")
      .post("/", (body) => body.method === "getblocktemplate")
      .reply(200, null);
    const daemon = new Interface(daemonsCopy);
    const requests = [["getblocktemplate", []]];
    const expected = [
      {
        data: "null",
        error: {
          code: -1,
          message: "Could not parse RPC data from daemon response",
        },
        instance: {
          host: "127.0.0.1",
          index: 0,
          password: "foundation",
          port: "2332",
          username: "foundation",
        },
        response: null,
      },
    ];
    daemon.sendCommands(requests, false, (response) => {
      expect(response).toStrictEqual(expected);
      done();
    });
  });

  test("Test interface commands [8]", (done) => {
    nock("http://127.0.0.1:2332")
      .post("/", (body) => body.method === "getblocktemplate")
      .reply(200, "blajahahge");
    const daemon = new Interface(daemonsCopy);
    const requests = [["getblocktemplate", []]];
    const expected = [
      {
        data: "blajahahge",
        error: {
          code: -1,
          message: "Could not parse RPC data from daemon response",
        },
        instance: {
          host: "127.0.0.1",
          index: 0,
          password: "foundation",
          port: "2332",
          username: "foundation",
        },
        response: null,
      },
    ];
    daemon.sendCommands(requests, false, (response) => {
      expect(response).toStrictEqual(expected);
      done();
    });
  });

  test("Test interface commands [9]", (done) => {
    const daemon = new Interface(daemonsCopy);
    const requests = [["getblocktemplate", []]];
    const expected = {
      data: null,
      error: { code: -1, message: "connect ECONNREFUSED 127.0.0.1:2332" },
      instance: {
        host: "127.0.0.1",
        index: 0,
        password: "foundation",
        port: "2332",
        username: "foundation",
      },
      response: null,
    };
    daemon.sendCommands(requests, true, (response) => {
      expect(response).toStrictEqual(expected);
      done();
    });
  });
});
