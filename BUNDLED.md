# The same benchmark, on bundled files

The [main benchmark](README.md) lints every description where its team publishes it.
This page lints the same six APIs after `redocly bundle` turns each one into a single self-contained file, so the tools are compared on identical content with the `$ref` resolution removed from the equation.
Three of the inputs are multi-file trees.
GitHub, Cloudflare and AWS EC2 are already published as single files, and bundling them only rewrites the same file, so their rows show that bundling changes nothing for them.

The bundles are committed under `specs/bundled/` and produced with Redocly CLI 2.55.0 (the Cloudflare bundle with 2.60.0):

```bash
redocly bundle specs/stripe-split/openapi.yaml -o specs/bundled/stripe.yaml
redocly bundle specs/digitalocean/DigitalOcean-public.v2.yaml -o specs/bundled/digitalocean.yaml
redocly bundle specs/azure/.../ComputeRP.json -o specs/bundled/azure.yaml
redocly bundle specs/github/api.github.com.yaml -o specs/bundled/github.yaml
redocly bundle specs/cloudflare/openapi.yaml -o specs/bundled/cloudflare.yaml
redocly bundle specs/aws-ec2/openapi.yaml -o specs/bundled/aws-ec2.yaml
```

Refs inside vendor extensions stay as written, because bundling does not follow them by default: Stripe's `x-expansionResources` keeps 382 relative refs and Azure's `x-ms-paths` and `x-ms-examples` keep 6.
No linter follows them either, so the findings match the multi-file runs.

The workflow is [`benchmark-bundled.yml`](.github/workflows/benchmark-bundled.yml), the same shape as the main one: five runs per tool, medians, a 5 minute timeout.

## Results

<!-- BENCHMARK:START -->
Generated 2026-10-08 13:50 UTC by [this workflow run](https://github.com/AlbinaBlazhko17/openapi-lint-benchmark/actions/runs/37787491745) on AMD EPYC 7763 64-Core Processor, 4 cores, 15 GB RAM, Linux 6.17.0-1022-azure, Node v24.21.0
Latest releases at run time: vacuum 0.32.0, Spectral 6.17.0, Redocly CLI 2.60.0, Scalar CLI 2.10.0, Speakeasy CLI 1.801.0.
Each command ran 5 times, one after another, after a 5 s pause; the time is wall-clock from process start to exit, as `time` reports it, and the table shows the median. A command that did not finish within 5 minutes was killed and not repeated. 💥 marks a command that crashed; its output has the error.

### Stripe

Input: `specs/bundled/stripe.yaml`, bundled from `specs/stripe-split/openapi.yaml (1,874 files)`

| Tool | Time (median) | Errors | Warnings<br>+ info |
| --- | --- | ---: | ---: |
| [Redocly CLI](results-bundled/stripe/redocly.1.txt) | 1.53 s<br>▓ | 641 | 1,012 |
| [vacuum](results-bundled/stripe/vacuum.1.txt) | 2.26 s<br>▓ | 1 | 23,086 |
| [Speakeasy CLI](results-bundled/stripe/speakeasy.1.txt) | 4.73 s<br>▓ | 2 | 5,873 |
| [Spectral](results-bundled/stripe/spectral.1.txt) | 12.71 s<br>▓▓▓ | 75 | 600 |
| [Scalar CLI](results-bundled/stripe/scalar.1.txt) | 💥 crashed |  |  |

### DigitalOcean

Input: `specs/bundled/digitalocean.yaml`, bundled from `specs/digitalocean/DigitalOcean-public.v2.yaml (2,911 files)`

| Tool | Time (median) | Errors | Warnings<br>+ info |
| --- | --- | ---: | ---: |
| [Redocly CLI](results-bundled/digitalocean/redocly.1.txt) | 2.31 s<br>▓ | 7 | 118 |
| [Speakeasy CLI](results-bundled/digitalocean/speakeasy.1.txt) | 2.35 s<br>▓ | 2 | 1,347 |
| [vacuum](results-bundled/digitalocean/vacuum.1.txt) | 2.55 s<br>▓ | 14 | 4,393 |
| [Spectral](results-bundled/digitalocean/spectral.1.txt) | 38.61 s<br>▓▓▓▓▓▓▓▓▓ | 0 | 682 |
| [Scalar CLI](results-bundled/digitalocean/scalar.1.txt) | 163.39 s<br>▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ | 14 | 3,568 |

### Azure Compute (Swagger 2.0)

Input: `specs/bundled/azure.yaml`, bundled from `specs/azure/.../ComputeRP.json (489 files)`

| Tool | Time (median) | Errors | Warnings<br>+ info |
| --- | --- | ---: | ---: |
| [vacuum](results-bundled/azure/vacuum.1.txt) | 0.41 s<br>▓ | 301 | 1,394 |
| [Redocly CLI](results-bundled/azure/redocly.1.txt) | 0.91 s<br>▓ | 205 | 893 |
| [Speakeasy CLI](results-bundled/azure/speakeasy.1.txt) | 1.01 s<br>▓ | 216 | 1,277 |
| [Spectral](results-bundled/azure/spectral.1.txt) | 4.34 s<br>▓ | 661 | 17 |
| [Scalar CLI](results-bundled/azure/scalar.1.txt) | 21.36 s<br>▓▓▓▓▓ | 301 | 25 |

### GitHub

Input: `specs/bundled/github.yaml`, bundled from `specs/github/api.github.com.yaml (1 file)`

| Tool | Time (median) | Errors | Warnings<br>+ info |
| --- | --- | ---: | ---: |
| [Redocly CLI](results-bundled/github/redocly.1.txt) | 4.45 s<br>▓ | 1,648 | 2,268 |
| [vacuum](results-bundled/github/vacuum.1.txt) | 6.84 s<br>▓▓ | 1 | 33,339 |
| [Speakeasy CLI](results-bundled/github/speakeasy.1.txt) | 8.18 s<br>▓▓ | 0 | 3,498 |
| [Spectral](results-bundled/github/spectral.1.txt) | 71.89 s<br>▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ | 795 | 51 |
| [Scalar CLI](results-bundled/github/scalar.1.txt) | ☠️ > 5 min |  |  |

### Cloudflare

Input: `specs/bundled/cloudflare.yaml`, bundled from `specs/cloudflare/openapi.yaml (1 file)`

| Tool | Time (median) | Errors | Warnings<br>+ info |
| --- | --- | ---: | ---: |
| [Redocly CLI](results-bundled/cloudflare/redocly.1.txt) | 8.10 s<br>▓▓ | 16 | 4,995 |
| [vacuum](results-bundled/cloudflare/vacuum.1.txt) | 9.50 s<br>▓▓ | 397 | 62,463 |
| [Speakeasy CLI](results-bundled/cloudflare/speakeasy.1.txt) | 13.35 s<br>▓▓▓ | 43 | 24,217 |
| [Spectral](results-bundled/cloudflare/spectral.1.txt) | 108.00 s<br>▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ | 2,257 | 3,797 |
| [Scalar CLI](results-bundled/cloudflare/scalar.1.txt) | ☠️ > 5 min |  |  |

### AWS EC2

Input: `specs/bundled/aws-ec2.yaml`, bundled from `specs/aws-ec2/openapi.yaml (1 file)`

| Tool | Time (median) | Errors | Warnings<br>+ info |
| --- | --- | ---: | ---: |
| [Redocly CLI](results-bundled/aws-ec2/redocly.1.txt) | 2.38 s<br>▓ | 1,188 | 1,191 |
| [vacuum](results-bundled/aws-ec2/vacuum.1.txt) | 2.82 s<br>▓ | 0 | 26,400 |
| [Spectral](results-bundled/aws-ec2/spectral.1.txt) | 8.65 s<br>▓▓ | 3 | 1,188 |
| [Speakeasy CLI](results-bundled/aws-ec2/speakeasy.1.txt) | 10.90 s<br>▓▓▓ | 0 | 12,312 |
| [Scalar CLI](results-bundled/aws-ec2/scalar.1.txt) | ☠️ > 5 min |  |  |

<!-- BENCHMARK:END -->
