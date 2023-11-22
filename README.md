## Serverless MySQL HTTP (SMH)

This is a PlanetScale emulator service that proxies HTTP requests to PlanetScale into requests for MySQL servers such as Docker.  
The goal of this project is to allow development in a local environment in the same way as connecting to PlanetScale, without actually connecting to PlanetScale.

## How to use

### docker

### docker compose

## Motivation (Why I develop this service)

### Problem 😕

There may be times when you don't want to connect to the PlanetScale from your local development environment for reasons such as:

- There is a risk of unintended billing
- In large-scale development, issuing ID and password to connect to the production service can be cumbersome
- You may not want to register for PlanetScale if you just want to try out some prototyping development

It seems that there are challenges to developing in a local environment while connected to PlanetScale.

### Solution 😄

By using this service, requests to PlanetScale are proxied to a MySQL server in your local environment. This means that you can complete development in your local environment without having to connect to PlanetScale.

- Before: <\<your server>> +++(HTTP)+++ <\<PlanetScale>>
- **After: <\<your server>> +++(HTTP)+++ <<Serverless MySQL HTTP(SMH)> +++(MySQL protocol)+++ <<MySQL server(ex. Docker)>>**

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
  | name: 'count(\*)', <br> type: 'INT64', <br> columnLength: 21, <br> charset: 63, <br> flags: 32897 | name: 'count(\*)', <br> type: 'INT64', <br> table: '', <br> orgTable: '', <br> database: 'for_vitest', <br> orgName: 'count(id)', <br> columnLength: 21, <br> charset: 63 |

  However, we believe that there is few problem with local environment construction due to this reproducibility (compatibility)(If you wish, please raise the issue and we will consider modifications to improve reproducibility).
