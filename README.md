## Serverless MySQL HTTP (SMH)

This is an emulator for the `serverless driver` of [PlanetScale](https://planetscale.com/) and [TiDB](https://docs.pingcap.com/), which are serverless MySQL services.  
By using this, you can proxy HTTP requests to requests for a MySQL server like Docker.

The goal of this project is to enable local development in the same way as connecting to PlanetScale or TiDB, without actually connecting to them.

## Motivation (Why I develop this service)

### Problem 😕

There may be times when you don't want to connect to the PlanetScale from your local development environment for reasons such as:

- There is a risk of unintended billing (to reduce unnecessary spending)
- In large-scale development, issuing id and password to connect to the production service can be cumbersome
- Want to reduce development time and improve product velocity by developing and testing locally, like [LocalStack](https://www.localstack.cloud/) in AWS or [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite) in Firebase

It seems that there are challenges to developing in a local environment while connected to PlanetScale.

### Solution 😄

By using this service, requests to PlanetScale are proxied to a MySQL server in your local environment. This means that you can complete development in your local environment without having to connect to PlanetScale.

- Before: \<your server> ++(HTTP)++ \<PlanetScale>
- **After: \<your server> ++(HTTP)++ <Serverless MySQL HTTP(SMH)> ++(MySQL protocol)++ <MySQL server(ex. Docker)>**

## How to use

### How to use with the [`@planetscale/database`](https://github.com/planetscale/database-js) SDK

Simply set the REST URL to the location where SMH is running. For example,

```ts
import { connect } from '@planetscale/database';

const config = { host: '<host>', username: '<user>', password: '<password>' };
if (import.meta.env.DEV) config.url = 'http://localhost:6306';

const conn = connect(config);
const results = await conn.execute('select 1 from dual where 1=?', [1]);
console.log(results);
```

If you only want to make this setting in your local environment, it's convenient to use `import.meta.env.DEV` from [Env Variables](https://vitejs.dev/guide/env-and-mode#env-variables) if you're using Vite. And you can probably implement it in the same way with `process.env.NODE_ENV` or similar.

※The connection information to the MySQL server is set by SMH environment variables (see [Configuration](#configuration) section), so `host`, `user`, and `password` passed to `connect(config)` are not used. In other words, when you are developing in a local environment, you can specify anything in `host`, `name`, and `password`.

### How to use with the [`@tidbcloud/serverless`](https://github.com/tidbcloud/serverless-js)

First, with `@tidbcloud/serverless`, requests to the domain have the `http-` prefix, so set `http-localhost` to resolve to `127.0.0.1`.

On Linux, you can modify `/etc/hosts` as follows:

```
127.0.0.1   http-localhost
```

or

```console
$ sudo echo "127.0.0.1 http-localhost" | sudo tee -a /etc/hosts
```

Then, just specify `localhost` as the host to initialize as follows. This allows development in a local environment just like connecting to TiDB.

```js
import { connect } from '@tidbcloud/serverless';

if (import.meta.env.DEV) {
	// For using SMH,
	// 	it is necessary to allow self-signed server certificates during HTTPS communication.
	// https://github.com/orgs/nodejs/discussions/44038
	const { Agent, setGlobalDispatcher } = await import('undici');
	const agent = new Agent({
		connect: {
			rejectUnauthorized: false
		}
	});
	setGlobalDispatcher(agent);
}

const conn = connect({
	host: 'localhost',
	username: '<username>',
	password: '<password>',
	database: '<database>'
});
const results = await conn.execute('select * from users where id=?', [1]);
console.log(results);
```

If you only want to make this setting in your local environment, it's convenient to use `import.meta.env.DEV` from [Env Variables](https://vitejs.dev/guide/env-and-mode#env-variables) if you're using Vite. And you can probably implement it in the same way with `process.env.NODE_ENV` or similar.

※The connection information to the MySQL server is set by SMH environment variables (see [Configuration](#configuration) section), so `user`, and `password` passed to `connect(config)` are not used. In other words, when you are developing in a local environment, you can specify anything in `name`, and `password`.

**注**  
SMH uses a self-signed SSL certificate, so there will be errors in `fetch` requests used internally by `@tidbcloud/serverless`. Therefore, it is necessary to use the configuration with [undici](https://github.com/nodejs/undici).

### Set up SMH

To start SMH, a MySQL server that can be connected from SMH must also be started at the same time. Do not forget to start the MySQL server.

Will the MySQL server exist separately or will it be started at the same time with `docker compose`? The method differs depending on that.

#### Docker

If you have a MySQL server locally, you can start an SMH container that connects to it. In this example, SMH runs on port 6306.

```console
$ docker run \
    -d -it -p 6000:6000 -p 6443:6443 \
    -e MYSQL_DATABASE=<your_database_name> \
    -e MYSQL_HOST=<your_server_host_here> \
    yutak23/serverless-mysql-http:latest
```

See [Configuration](#configuration) for information on setting up a connection to the MySQL server.

Link to the Docker hub: https://hub.docker.com/r/yutak23/serverless-mysql-http

##### Attention

PlanetScale's timezone is fixed at UTC. The local MySQL server timezone must also be set to UTC.

#### Docker Compose

If it is docker compose, it can be configured as follows.

```yaml
version: '3.9'
services:
  mysql:
    image: mysql:8.0.32
    container_name: mysql
    environment:
      MYSQL_ROOT_PASSWORD: ''
      MYSQL_ALLOW_EMPTY_PASSWORD: 'yes'
      TZ: 'UTC' # PlanetScale's timezone is fixed at UTC
    ports:
      - 3306:3306
  serverless-mysql-http:
    image: yutak23/serverless-mysql-http:latest
    container_name: serverless-mysql-http
    ports:
      - 6000:6000
      - 6443:6443
    environment:
      MYSQL_DATABASE: <your database name>
      MYSQL_HOST: mysql # Using `mysql` hostname since they're in the same Docker network.
```

## Configuration Options

SMH allows you to change the connection settings to the MySQL server with the following environment variables.

| Environment variable name | Default Value | Notes                                                                                                                                                |
| ------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| MYSQL_HOST                | `127.0.0.1`   | `127.0.0.1` is the localhost in the container and is assumed to be overwritten when SMH is used. **Be sure to specify the host of your own server**. |
| MYSQL_PORT                | `3306`        |                                                                                                                                                      |
| MYSQL_USER                | `root`        |                                                                                                                                                      |
| MYSQL_PASSWORD            | `''`          | empty string                                                                                                                                         |
| MYSQL_DATABASE            | `sample_db`   |                                                                                                                                                      |

## In GitHub Actions

SMH can also be used in a CI environment such as GitHub Actions.

This is because SMH is provided as a Docker image, so it can be started as a service container for a job; just start a MySQL server and put SRH next to it.

SMH does not connect to MySQL until a request comes in, so you don't have to worry about a race condition where the MySQL container is not ready. If you are worried, just make sure to check the MySQL server startup as shown in the following example.

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ALLOW_EMPTY_PASSWORD: yes
          TZ: UTC
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3
      smh:
        image: yutak23/serverless-mysql-http:latest
        env:
          MYSQL_DATABASE: sample_db
          MYSQL_HOST: mysql
        ports:
          - 6000:6000
          - 6443:6443
```

## Notes

### Differences between PlanetScale

SMH has been tested to produce the same results as when connecting to PlanetScale. However, there are some differences in the behavior with PlanetScale in the following parts:

- It does not support query caching by PlanetScale Boost

  Even if you implement code like `await conn.execute('SET @@boost_cached_queries = true')`, it **will not** result in an error, but setting `boost_cached_queries = true` will not cache the query results.  
  However, we do not think this is a critical issue as you would not be troubled by not being able to use query caching when developing in a local environment.

- There may be discrepancies in the `fields` data

  There may be discrepancies in the properties of the fields([Field](https://github.com/planetscale/database-js/blob/v1.11.0/src/index.ts)) returned when connecting to PlanetScale and the properties of the fields returned by SMH. Specifically, differences like the following may occur.  
  | PlanetScale | SMH |
  | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | name: 'count(\*)', <br> type: 'INT64', <br> columnLength: 21, <br> charset: 63, <br> flags: 32897 | name: 'count(\*)', <br> type: 'INT64', <br> table: '', <br> orgTable: '', <br> database: 'sample_db', <br> orgName: 'count(\*)', <br> columnLength: 21, <br> charset: 63 |

  However, we believe that there is few problem with local environment construction due to this reproducibility (compatibility)(If you wish, please raise the issue and we will consider modifications to improve reproducibility).

## Similar services that emulate serverless services

- [Serverless Redis HTTP (SRH)](https://github.com/hiett/serverless-redis-http/tree/master)

## License

[MIT licensed](./LICENSE)
