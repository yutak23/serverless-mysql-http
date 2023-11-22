## Serverless MySQL HTTP (SMH)

This is a PlanetScale emulator service that proxies HTTP requests to PlanetScale into requests for MySQL servers such as Docker.  
The goal of this project is to allow development in a local environment in the same way as connecting to PlanetScale, without actually connecting to PlanetScale.

## Motivation (Why I develop this service)

### Problem 😕

There may be times when you don't want to connect to the PlanetScale from your local development environment for reasons such as:

- There is a risk of unintended billing
- In large-scale development, issuing ID and password to connect to the production service can be cumbersome
- You may not want to register for PlanetScale if you just want to try out some prototyping development

It seems that there are challenges to developing in a local environment while connected to PlanetScale.

### Solution 😄

By using this service, requests to PlanetScale are proxied to a MySQL server in your local environment. This means that you can complete development in your local environment without having to connect to PlanetScale.

- Before: \<your server> ++(HTTP)++ \<PlanetScale>
- **After: \<your server> ++(HTTP)++ <Serverless MySQL HTTP(SMH)> ++(MySQL protocol)++ <MySQL server(ex. Docker)>**

## How to use

### How to use with the [`@planetscale/database`](https://github.com/planetscale/database-js) SDK

To make requests to SMH, set the `url` to `http://localhost:6306` (port number can be set). If you only want to make this setting in your local environment, it's convenient to use `import.meta.env.DEV` from [Env Variables](https://vitejs.dev/guide/env-and-mode#env-variables) if you're using Vite (you can probably implement it in the same way with `process.env.NODE_ENV` or similar).

After that, you can implement it exactly the same way as when connecting to PlanetScale, and you can start developing comfortably in your local environment!

```ts
import { connect } from '@planetscale/database';

const config = { host: '<host>', username: '<user>', password: '<password>' };
if (import.meta.env.DEV) config.url = 'http://localhost:6306';

const conn = connect(config);
const results = await conn.execute('select 1 from dual where 1=?', [1]);
console.log(results);
```

### Set up SMH

To start SMH, MySQL server that can be connected from SMH must also be started at the same time. Since it depends on whether Docker or Docker compose is used, the respective methods are described below.

#### Docker

If you have a MySQL server locally, you can start an SMH container that connects to it. In this example, SMH runs on port 6306.

```console
$ docker run \
    -d -it -p 6306:6306 \
    -e MYSQL_DATABASE=<your_database_name> \
    -e MYSQL_HOST=<your_server_host_here> \
    yutak23/serverless-mysql-http:latest
```

See [Configuration](#configuration) for more information on connecting to the MySQL server.

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
      - 6306:6306
    environment:
      MYSQL_DATABASE: <your database name>
      MYSQL_HOST: mysql # Using `mysql` hostname since they're in the same Docker network.
```

#### Configuration

SMH allows you to change the connection settings to the MySQL server with the following environment variables. The default values are as per `Default Value`.

| Environment variable name | Default Value | Notes                                                                                                                                                |
| ------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| MYSQL_HOST                | `127.0.0.1`   | `127.0.0.1` is the localhost in the container and is assumed to be overwritten when SMH is used. **Be sure to specify the host of your own server**. |
| MYSQL_PORT                | `3306`        |                                                                                                                                                      |
| MYSQL_USER                | `root`        |                                                                                                                                                      |
| MYSQL_PASSWORD            | `''`          | empty string                                                                                                                                         |
| MYSQL_DATABASE            | `sample_db`   |                                                                                                                                                      |

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

## License

[MIT licensed](./LICENSE)
