## Serverless MySQL HTTP (SMH)

これはserverlessのMySQLサービスである[PlanetScale](https://planetscale.com/)と[TiDB](https://docs.pingcap.com/)それぞれの`serverless driver`用のエミュレータです。  
これを用いることで、HTTPリクエストをDockerなどのMySQLサーバへのリクエストにプロキシできます。

このプロジェクトのゴールは、実際にPlanetScale・TiDBに接続することなく、それらに接続するのと同じようにローカル環境で開発できるようにすることです。

## 動機（私がこのサービスを開発する理由）

### 問題 😕

以下のような理由で、ローカルの開発環境から PlanetScale・TiDB に接続したくない場合があります：

- 意図しない課金のリスクがある（無駄な出費を抑えるため）
- 大規模開発において、本番サービスに接続するための ID とパスワードを発行するのが面倒な場合
- AWSの[LocalStack](https://www.localstack.cloud/)やFirebaseの[Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite)のように、ローカルで開発・テストすることで開発期間を短縮し、プロダクトの開発生産性を向上させたい。

実際にPlanetScale・TiDBに接続しながらローカル環境で開発するには課題があるように思えます。

### 解決方法

このサービスを利用することで、PlanetScale・TiDBそれぞれのserverless driverへのリクエストはローカル環境のMySQLサーバにプロキシされます。つまり、本番サービスに接続することなく、ローカル環境で開発を完了することができます。

- Before  
  \<your server> ++(HTTP)++ \<PlanetScale>
- After  
  \<your server> ++(HTTP)++ <Serverless MySQL HTTP(SMH)> ++(MySQL protocol)++ <MySQL server(ex. Docker)>\*\*

## How to use

### [`@planetscale/database`](https://github.com/planetscale/database-js) SDKでの利用方法

`connect`のオプション`url`をSMHが稼働している場所に設定するだけです。例えば、以下のように設定します。

```ts
import { connect } from '@planetscale/database';

const config = { host: '<host>', username: '<user>', password: '<password>' };
if (import.meta.env.DEV) config.url = 'http://localhost:6306';

const conn = connect(config);
const results = await conn.execute('select 1 from dual where 1=?', [1]);
console.log(results);
```

この設定をローカル環境でだけ行いたい場合は、Viteを使っている場合は[Env Variables](https://vitejs.dev/guide/env-and-mode#env-variables)の`import.meta.env.DEV`を使うと便利です。また、`process.env.NODE_ENV`などでも同じように実装できるでしょう。

**注**  
MySQLサーバへの接続情報はSMHの環境変数（[設定](#configuration)の項を参照）によって設定されるので、`connect(config)`に渡される`user`, `password`は使用されない。つまり、ローカル環境で開発する場合は、 `name`, `password` の値はなんでもよい。

### [`@tidbcloud/serverless`](https://github.com/tidbcloud/serverless-js) SDKでの利用方法

まず初めに、`@tidbcloud/serverless`ではリクエスト先のドメインに`http-`プレフィックスがつくため、`http-localhost`を`127.0.0.1`に名前解決されるように設定してください。

Linuxであれば`/etc/hosts`を以下のように変更できます。

```
127.0.0.1   http-localhost
```

または

```console
$ sudo echo "127.0.0.1 http-localhost" | sudo tee -a /etc/hosts
```

あとは、以下のようにホストに`localhost`を指定して初期化するだけです。これでTiDBに接続しているときと同じように、ローカル環境でも開発ができます。

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

この設定をローカル環境でだけ行いたい場合は、Viteを使っている場合は[Env Variables](https://vitejs.dev/guide/env-and-mode#env-variables)の`import.meta.env.DEV`を使うと便利です。また、`process.env.NODE_ENV`などでも同じように実装できるでしょう。

**注**  
MySQLサーバへの接続情報はSMHの環境変数（[設定](#configuration)の項を参照）によって設定されるので、`connect(config)`に渡される`user`, `password`は使用されない。つまり、ローカル環境で開発する場合は、 `name`, `password` の値はなんでもよい。

**注**  
SMHでは自己署名SSL証明書を利用しているため、`@tidbcloud/serverless`内部で利用している`fetch`のリクエスト時にエラーになります。そのため[undici](https://github.com/nodejs/undici)を利用した設定が必要です。

### SMH のセットアップ

SMHを起動するには、SMHから接続可能なMySQLサーバも同時に起動する必要があります。MySQLサーバの起動を忘れないようにしてください。

MySQLサーバは別に存在するのか、`docker compose`で同時に起動するのか。それによって方法が異なります。

#### Docker

ローカルに MySQL サーバーがあれば、それに接続する SMH コンテナーを起動できる。この例では、SMH はポート 6000(HTTP)、6443(HTTPS) で実行される。

```console
$ docker run \
    -d -it -p 6000:6000 -p 6443:6443 \
    -e MYSQL_DATABASE=<your_database_name> \
    -e MYSQL_HOST=<your_server_host_here> \
    yutak23/serverless-mysql-http:latest
```

MySQLサーバーへの接続設定については、[設定](#設定)を参照してください。

Docker hubへのリンク: https://hub.docker.com/r/yutak23/serverless-mysql-http

**注**  
PlanetScaleの[タイムゾーンはUTCに固定されています](https://planetscale.com/docs/reference/mysql-compatibility#queries-functions-syntax-data-types-and-sql-modes)（以下の引用を参照）。ローカルの MySQL サーバのタイムゾーンも UTC に設定する必要があります。

> The global time zone is set to UTC and can not be modified.

TiDBは[タイムゾーンの任意の設定がサポートされています](https://docs.pingcap.com/tidb/stable/configure-time-zone)が、デフォルトではUTCになります。

#### Docker Compose

docker composeの場合は、以下のように設定する。

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

## 設定

SMHでは、MySQLサーバーへの接続設定を以下の環境変数で変更することができます。

| 環境変数名     | デフォルト値 | 説明                                                                                                                              |
| -------------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| MYSQL_HOST     | `127.0.0.1`  | `127.0.0.1`はコンテナ内のlocalhostであり、SMH使用時には上書きされるものとする。**必ず自分のサーバーのホストを指定してください。** |
| MYSQL_PORT     | `3306`       |                                                                                                                                   |
| MYSQL_USER     | `root`       |                                                                                                                                   |
| MYSQL_PASSWORD | `''`         | 空文字g                                                                                                                           |
| MYSQL_DATABASE | `sample_db`  |                                                                                                                                   |
| MYSQL_TZ       | `Z`          | デフォルトはUTCになります。変更する場合は、`+HH:MM` または `-HH:MM` 形式で記述。                                                  |

## GitHub Actionsでの利用方法

SMH は GitHub Actions のような CI 環境でも使えます。

SMH は Docker イメージとして提供されるので、ジョブのサービスコンテナとして起動することができるからです。

SMHはリクエストが来るまでMySQLに接続しないので、MySQLコンテナが準備できていないという競合状態を心配する必要はありません。心配な場合は、次の例のようにMySQLサーバーの起動を確認してください。

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

## 注意

### PlanetScaleとの違い

SMHは、PlanetScaleに接続した場合と同じ結果が得られるようにテストされています。ただし、PlanetScaleとの動作には以下の部分で若干の違いがあります：

- PlanetScale Boostによるクエリ・キャッシュをサポートしていません。

  `await conn.execute('SET @@boost_cached_queries = true')`のようなコードを実装しても**エラーにはなりません**が、`boost_cached_queries = true`を設定してもクエリ結果はキャッシュされません。
  しかし、ローカル環境で開発する場合、クエリ・キャッシュが使えなくても困ることはないので、これは致命的な問題ではないと考えます。

- フィールドのデータには若干の差異があるかもしれません

  PlanetScale への接続時に Field が返すフィールドのプロパティと、SMH が返すフィールドのプロパティに相違がある場合があります。具体的には、以下のような違いが生じる可能性があります。

  | PlanetScale                                                                                       | SMH                                                                                                                                                                      |
  | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
  | name: 'count(\*)', <br> type: 'INT64', <br> columnLength: 21, <br> charset: 63, <br> flags: 32897 | name: 'count(\*)', <br> type: 'INT64', <br> table: '', <br> orgTable: '', <br> database: 'sample_db', <br> orgName: 'count(\*)', <br> columnLength: 21, <br> charset: 63 |

  ただし、この再現性（相違）によるローカル環境構築の問題は少ないと考えています（ご希望があればissueを起票していただければ、再現性向上のための修正を検討します）。

## サーバーレスサービスをエミュレートする類似サービス

- [Serverless Redis HTTP(SRH)](https://github.com/hiett/serverless-redis-http/tree/master)

## ライセンス

[MITライセンス](./LICENSE)
