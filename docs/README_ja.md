## Serverless MySQL HTTP (SMH)

これはserverlessのMySQLサービスである[PlanetScale](https://planetscale.com/)と[TiDB](https://docs.pingcap.com/)それぞれの`serverless driver`用のエミュレータです。  
これを用いることで、HTTPリクエストをDockerなどのMySQLサーバへのリクエストにプロキシできます。

このプロジェクトのゴールは、実際にPlanetScale・TiDBに接続することなく、それらに接続するのと同じようにローカル環境で開発できるようにすることです。

## 動機（私がこのサービスを開発する理由）

## 問題 😕

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

### [`@tidbcloud/serverless`](https://github.com/tidbcloud/serverless-js) SDKでの利用方法

まず初めに、`@tidbcloud/serverless`ではリクエスト先のドメインに`http-`プレフィックスがつくため、`http-localhost`を`127.0.0.1`に名前解決されるように設定してください。

Linuxであれば`/etc/hosts`を以下のように変更できます。

```
127.0.0.1   http-localhost
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
	username: '<user name>',
	password: '<password>',
	database: '<your database name>'
});
const results = await conn.execute('select * from users where id=?', [1]);
console.log(results);
```

この設定をローカル環境でだけ行いたい場合は、Viteを使っている場合は[Env Variables](https://vitejs.dev/guide/env-and-mode#env-variables)の`import.meta.env.DEV`を使うと便利です。また、`process.env.NODE_ENV`などでも同じように実装できるでしょう。
