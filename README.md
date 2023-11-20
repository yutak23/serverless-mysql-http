## Serverless MySQL HTTP (SMH)

## Differences between PlanetScale

SMH is tested to have the same results as when connected to PlanetScale, but some parts are different from PlanetScale's return, and there is no compatibility there.

- Whether the property is defined in the [interface Field](https://github.com/planetscale/database-js/blob/v1.11.0/src/index.ts)  
  Queries that do not include `table` or `orgTable` in the return value of PlanetScale may include them in the return value of SMH.  
  However, the reproducibility (compatibility) of this part of the system will have almost no impact on development in the local environment.
  (If you wish, please raise an issue and we will modify it to improve compatibility.)
