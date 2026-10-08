# OpenAPI linter benchmark

Five OpenAPI linters, timed on seven inputs: the single 6 MB file that Stripe publishes, the same description split into 1,874 files, one API description that its team publishes as a multi-file tree (DigitalOcean), three more single-file descriptions (GitHub, Cloudflare, AWS EC2), and one Azure service spec with its shared types (Swagger 2.0).
The specs are pinned to a commit; the tools are installed at their latest release when the workflow runs, and the versions used are listed above the tables.
The benchmark is the [GitHub Actions workflow](.github/workflows/benchmark.yml) itself: one step per tool and spec, each a shell loop of `time`, the lint command, and `sleep 5`.
**Note**: Spectral is the one exception to "default rules": it has none, and without a config it exits with "No ruleset has been found", so it got a one-line `.spectral.yaml` that extends `spectral:oas`.

| Tool | Language | Notes |
| --- | --- | --- |
| [Redocly CLI](https://github.com/Redocly/redocly-cli) | TypeScript | Default `recommended` ruleset |
| [vacuum](https://github.com/daveshanley/vacuum) | Go | Default `recommended` ruleset |
| [Spectral](https://github.com/stoplightio/spectral) | TypeScript | `spectral:oas` ruleset (Spectral has no default) |
| [Scalar CLI](https://github.com/scalar/scalar) | TypeScript | `scalar document lint`; runs Spectral's rules |
| [Speakeasy CLI](https://github.com/speakeasy-api/speakeasy) | Go | `speakeasy lint openapi`; default `speakeasy-recommended` ruleset, built on `pb33f/libopenapi`, the parser vacuum uses |

The same four multi-file inputs, bundled into one file each with `redocly bundle`, are timed separately in [BUNDLED.md](BUNDLED.md).

## Results

<!-- BENCHMARK:START -->
Generated 2026-10-08 13:50 UTC by [this workflow run](https://github.com/AlbinaBlazhko17/openapi-lint-benchmark/actions/runs/37787491916) on AMD EPYC 9V45 96-Core Processor, 4 cores, 15 GB RAM, Linux 6.17.0-1022-azure, Node v24.21.0
Latest releases at run time: vacuum 0.32.0, Spectral 6.17.0, Redocly CLI 2.60.0, Scalar CLI 2.10.0, Speakeasy CLI 1.801.0.
Each command ran 5 times, one after another, after a 5 s pause; the time is wall-clock from process start to exit, as `time` reports it, and the table shows the median. A command that did not finish within 5 minutes was killed and not repeated. 💥 marks a command that crashed; its output has the error.

### Stripe, single file

Input: `specs/stripe/spec3.yaml`

| Tool | Time (median) | Errors | Warnings<br>+ info |
| --- | --- | ---: | ---: |
| [Redocly CLI](results/stripe/redocly.1.txt) | 1.18 s<br>▓ | 641 | 1,012 |
| [vacuum](results/stripe/vacuum.1.txt) | 1.53 s<br>▓ | 2 | 23,086 |
| [Speakeasy CLI](results/stripe/speakeasy.1.txt) | 3.29 s<br>▓▓ | 2 | 5,873 |
| [Spectral](results/stripe/spectral.1.txt) | 11.79 s<br>▓▓▓▓▓▓▓▓ | 0 | 600 |
| [Scalar CLI](results/stripe/scalar.1.txt) | 💥 crashed |  |  |

### Stripe, split into files

Input: `specs/stripe-split/openapi.yaml`

| Tool | Time (median) | Errors | Warnings<br>+ info |
| --- | --- | ---: | ---: |
| [Redocly CLI](results/stripe-split/redocly.1.txt) | 1.03 s<br>▓ | 641 | 1,012 |
| [Speakeasy CLI](results/stripe-split/speakeasy.1.txt) | 2.92 s<br>▓▓ | 2 | 4,345 |
| [vacuum](results/stripe-split/vacuum.1.txt) | ☠️ > 5 min |  |  |
| [Spectral](results/stripe-split/spectral.1.txt) | ☠️ > 5 min |  |  |
| [Scalar CLI](results/stripe-split/scalar.1.txt) | ☠️ > 5 min |  |  |

### DigitalOcean, split into files as published

Input: `specs/digitalocean/DigitalOcean-public.v2.yaml`

| Tool | Time (median) | Errors | Warnings<br>+ info |
| --- | --- | ---: | ---: |
| [Speakeasy CLI](results/digitalocean/speakeasy.1.txt) | 0.39 s<br>▓ | 1,000 | 1,659 |
| [Redocly CLI](results/digitalocean/redocly.1.txt) | 1.69 s<br>▓ | 7 | 122 |
| [vacuum](results/digitalocean/vacuum.1.txt) | 2.94 s<br>▓▓ | 675 | 1,607 |
| [Scalar CLI](results/digitalocean/scalar.1.txt) | 6.70 s<br>▓▓▓▓▓ | 833 | 1,162 |
| [Spectral](results/digitalocean/spectral.1.txt) | 9.27 s<br>▓▓▓▓▓▓ | 1,320 | 682 |

### GitHub, single file

Input: `specs/github/api.github.com.yaml`

| Tool | Time (median) | Errors | Warnings<br>+ info |
| --- | --- | ---: | ---: |
| [Redocly CLI](results/github/redocly.1.txt) | 2.93 s<br>▓▓ | 1,648 | 2,268 |
| [vacuum](results/github/vacuum.1.txt) | 4.51 s<br>▓▓▓ | 1 | 33,338 |
| [Speakeasy CLI](results/github/speakeasy.1.txt) | 5.49 s<br>▓▓▓▓ | 0 | 3,498 |
| [Spectral](results/github/spectral.1.txt) | 36.44 s<br>▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ | 795 | 50 |
| [Scalar CLI](results/github/scalar.1.txt) | ☠️ > 5 min |  |  |

### Cloudflare, single file

Input: `specs/cloudflare/openapi.yaml`

| Tool | Time (median) | Errors | Warnings<br>+ info |
| --- | --- | ---: | ---: |
| [Redocly CLI](results/cloudflare/redocly.1.txt) | 4.99 s<br>▓▓▓ | 16 | 4,995 |
| [vacuum](results/cloudflare/vacuum.1.txt) | 6.51 s<br>▓▓▓▓ | 397 | 62,664 |
| [Speakeasy CLI](results/cloudflare/speakeasy.1.txt) | 9.52 s<br>▓▓▓▓▓▓ | 43 | 24,217 |
| [Spectral](results/cloudflare/spectral.1.txt) | 59.39 s<br>▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ | 2,257 | 3,797 |
| [Scalar CLI](results/cloudflare/scalar.1.txt) | ☠️ > 5 min |  |  |

### Azure Compute, split into files as published (Swagger 2.0)

Input: `specs/azure/specification/compute/resource-manager/Microsoft.Compute/Compute/stable/2026-04-01/ComputeRP.json`

| Tool | Time (median) | Errors | Warnings<br>+ info |
| --- | --- | ---: | ---: |
| [vacuum](results/azure/vacuum.1.txt) | 0.20 s<br>▓ | 302 | 1,388 |
| [Speakeasy CLI](results/azure/speakeasy.1.txt) | 0.53 s<br>▓ | 219 | 1,277 |
| [Redocly CLI](results/azure/redocly.1.txt) | 0.63 s<br>▓ | 205 | 893 |
| [Spectral](results/azure/spectral.1.txt) | 2.87 s<br>▓▓ | 651 | 17 |
| [Scalar CLI](results/azure/scalar.1.txt) | 8.69 s<br>▓▓▓▓▓▓ | 302 | 26 |

### AWS EC2, single file (third-party conversion)

Input: `specs/aws-ec2/openapi.yaml`

| Tool | Time (median) | Errors | Warnings<br>+ info |
| --- | --- | ---: | ---: |
| [Redocly CLI](results/aws-ec2/redocly.1.txt) | 1.52 s<br>▓ | 1,188 | 1,191 |
| [vacuum](results/aws-ec2/vacuum.1.txt) | 1.90 s<br>▓ | 0 | 26,400 |
| [Spectral](results/aws-ec2/spectral.1.txt) | 5.04 s<br>▓▓▓ | 3 | 1,188 |
| [Speakeasy CLI](results/aws-ec2/speakeasy.1.txt) | 7.41 s<br>▓▓▓▓▓ | 0 | 12,312 |
| [Scalar CLI](results/aws-ec2/scalar.1.txt) | ☠️ > 5 min |  |  |

<!-- BENCHMARK:END -->

## Specs and sources

| Spec | Source | License |
| --- | --- | --- |
| `specs/stripe/spec3.yaml` (6.1 MB, OpenAPI 3.0) | [stripe/openapi, openapi/spec3.yaml](https://github.com/stripe/openapi/blob/master/openapi/spec3.yaml) at commit [`30d3391`](https://github.com/stripe/openapi/blob/30d3391cc09a0f67ad29bee002f570811b19e1da/openapi/spec3.yaml) (2026-08-26) | MIT |
| `specs/stripe-split/` (11 MB, 1,874 files) | Produced from the file above with `redocly split specs/stripe/spec3.yaml --outDir specs/stripe-split` (Redocly CLI 2.50.0) | MIT |
| `specs/digitalocean/` (12 MB, 2,911 files, OpenAPI 3.0) | [digitalocean/openapi, specification/](https://github.com/digitalocean/openapi/tree/8041307476bda69ea1640dcf44b220dd653c6808/specification) at commit [`8041307`](https://github.com/digitalocean/openapi/commit/8041307476bda69ea1640dcf44b220dd653c6808) (2026-09-10) | Apache-2.0 |
| `specs/github/api.github.com.yaml` (9.4 MB, OpenAPI 3.0) | [github/rest-api-description, descriptions/api.github.com/](https://github.com/github/rest-api-description/blob/9f6ad3b0ba6f7ef9619adb7135a1a56de62ed2d3/descriptions/api.github.com/api.github.com.yaml) at commit [`9f6ad3b`](https://github.com/github/rest-api-description/commit/9f6ad3b0ba6f7ef9619adb7135a1a56de62ed2d3) (2026-09-14) | MIT |
| `specs/cloudflare/openapi.yaml` (20 MB, OpenAPI 3.0) | [cloudflare/api-schemas, openapi.yaml](https://github.com/cloudflare/api-schemas/blob/f20240cf7d68bcebb138ab5ed5240ed523cb10ef/openapi.yaml) at commit [`f20240c`](https://github.com/cloudflare/api-schemas/commit/f20240cf7d68bcebb138ab5ed5240ed523cb10ef) (2026-10-08) | BSD-3-Clause |
| `specs/azure/` (4.1 MB, 489 files, Swagger 2.0) | [Azure/azure-rest-api-specs](https://github.com/Azure/azure-rest-api-specs/tree/8b747d606f494c1ceb4db2de65d657fa00ed0c4f/specification/compute/resource-manager/Microsoft.Compute/Compute/stable/2026-04-01) at commit [`8b747d6`](https://github.com/Azure/azure-rest-api-specs/commit/8b747d606f494c1ceb4db2de65d657fa00ed0c4f) (2026-09-14): the Compute `2026-04-01` folder with its examples, plus the `common-types` files it references, at their original paths | MIT |
| `specs/aws-ec2/openapi.yaml` (5.4 MB, OpenAPI 3.0) | [APIs-guru/openapi-directory, APIs/amazonaws.com/ec2/2016-11-15/](https://github.com/APIs-guru/openapi-directory/blob/f04b8d0bcd39c52e1cf3ad7a5fe744709832ae49/APIs/amazonaws.com/ec2/2016-11-15/openapi.yaml) at commit [`f04b8d0`](https://github.com/APIs-guru/openapi-directory/commit/f04b8d0bcd39c52e1cf3ad7a5fe744709832ae49) (2026-04-20). AWS does not publish OpenAPI; this file is APIs.guru's conversion of the AWS SDK model | CC0-1.0 |

The Stripe file is byte-identical to the file at the pinned commit (checked by SHA-256 at import time).
DigitalOcean puts `$ref` on operations (`get: $ref: resources/...yml`), which OpenAPI 3.0 allows only on path items; the tools disagree on how to treat that, and the counts show it.
Speakeasy reads the Azure file as OpenAPI 3, so Swagger 2.0 constructs such as `in: body` parameters show up in its error count.

## How the split and bundled inputs were made

```bash
redocly split spec3.yaml --outDir stripe-split
redocly bundle DigitalOcean-public.v2.yaml -o bundle.yaml
```

## Reproduce

```bash
npm install -g @redocly/cli @stoplight/spectral-cli @scalar/cli
# install vacuum and Speakeasy from their latest GitHub releases, as the Install steps in the workflow do
export RESULTS="$PWD/results" TIMEFORMAT=%R
# run the loops from .github/workflows/benchmark.yml, then:
npm run render                  # writes the Results section of this README
npm run render:bundled          # writes the Results section of BUNDLED.md, from results-bundled/
```

Or open Actions, Benchmark, Run workflow on GitHub.
The workflow runs everything in one job and commits the updated `README.md` and `results/` to `main`.
