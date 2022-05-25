# Monorepo Template for Service + Dashboard

**WARNING** This repo is still work in progress.

## TODO

```
[ ] install vue.js (Nuxt)
[ ] package the repeated source code as library instead of embed in applications' folder.
[ ] readme
[ ] authorizer
```

## Feature

- Service using `kobp` (Service that can run on K8s), using Postgres Database as an example.
- Dashboard application that runs on Vue (WIP)
- Implemented API Gateway using `kong` see `infra/local-development`

## Getting started

Using node v14. (see ~/.nvmrc).

To spin up infra structure. `yarn infra:up`

To drop the infra structure. `yarn infra:down`

NOTE: By spin up vs down it doesn't destroy the docker's volume.