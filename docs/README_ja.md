## Serverless MySQL HTTP (SMH)

これはserverlessのMySQLサービスである[PlanetScale](https://planetscale.com/)と[TiDB](https://docs.pingcap.com/)serverless driver用のエミュレータです。
これを用いることで、HTTPリクエストをDockerなどのMySQLサーバへのリクエストにプロキシします。
このプロジェクトのゴールは、実際にPlanetScale・TiDBに接続することなく、それらに接続するのと同じようにローカル環境で開発できるようにすることです。

## Motivation (Why I develop this service)

## How to use

### How to use with the [`@tidbcloud/serverless`](https://github.com/tidbcloud/serverless-js) SDK

まず初めに、`@tidbcloud/serverless`ではリクエスト先のドメインに`http-`プレフィックスがつくため、`http-localhost`を`127.0.0.1`に名前解決されるように設定してください。

Linuxであれば`/etc/hosts`を以下のように変更できます。

```
127.0.0.1   localhost localhost.localdomain localhost4 localhost4.localdomain4 http-localhost
::1         localhost localhost.localdomain localhost6 localhost6.localdomain6
```
