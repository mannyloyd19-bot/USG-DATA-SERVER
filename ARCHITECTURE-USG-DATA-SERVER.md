# USG DATA SERVER - Final Architecture

## Runtime
- Express server
- Node runtime
- PM2/service mode recommended
- Browser dashboard for management

## Data Layer
- Sequelize
- SQLite (current default)
- Collections / Fields / Records
- Files / Relationships / Indexes / Backups

## Platform Layer
- Users / Permissions / Tenants
- API Keys / Logs / Analytics
- Settings / Audit Logs
- Realtime / Webhooks / Functions
- SDK / Query Builder / Enterprise DB

## Hosting + Infra Layer
- Domains
- DuckDNS / DDNS
- SSL Center
- Env Manager
- Apps / Deployments / Docker
- Live Readiness / Boot Diagnostics

## Operating Model
- Always-on server running on PC
- Browser UI used on PC/tablet
- Public gateway via DuckDNS
- Internal domains via .usg registry
- Backups + restore + health monitoring

## Public Flow
Internet -> usgdataserver.duckdns.org -> USG routing -> app/service route

## Internal Flow
.usg domain -> routePath -> bound service -> publicAddress
