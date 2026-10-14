<!--
SPDX-FileCopyrightText: 2026 Deutsche Telekom AG

SPDX-License-Identifier: CC0-1.0
-->

# opencode – T-Systems AI Engineer fork

> **Official documentation:** the original opencode README with all product documentation, installation and usage instructions is maintained upstream at
> **[https://github.com/anomalyco/opencode/blob/dev/README.md](https://github.com/anomalyco/opencode/blob/dev/README.md)**.
> An unchanged copy is kept on the [`dev`](../../tree/dev) branch of this fork.

[![REUSE Compliance Check](../../actions/workflows/reuse-compliance.yml/badge.svg)](../../actions/workflows/reuse-compliance.yml)

## About

opencode is an open source AI coding agent for the terminal, desktop and IDE.

This repository is the T-Systems **AI Engineer (AIE)** fork of [opencode](https://github.com/anomalyco/opencode).

## Installation

<strong>Step 1: </strong> Install OpenCode globally

```bash 
npm install -g @telekom/opencode-ai
```

<strong>Step 2: </strong> Authenticate with OpenCode
```bash 
opencode auth login https://plugins.ai.t-systems.net
```

<strong>Step 3: </strong> Open OpenCode and type /connect to connect with your provider and then put the api key
```bash
/connect
```

> 🌐 **Proxy usage:**
>
> If your network requires a proxy connection, configure the proxy settings **before starting OpenCode**.
> On Windows, set the following environment variables:
>
> ```bash
> http_proxy=<your-proxy-url:port>
> https_proxy=<your-proxy-url:port>
> ```
> Replace `<your-proxy-url:port>` with the proxy details provided by your network administrator.


## Code of Conduct

This project has adopted the [Contributor Covenant](https://www.contributor-covenant.org/) in version 2.1 as our code of conduct, using the file from [telekom/reuse-template](https://github.com/telekom/reuse-template). Please see the details in our [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). All contributors must abide by the code of conduct.

By participating in this project, you agree to abide by its [Code of Conduct](./CODE_OF_CONDUCT.md) at all times.

## Licensing

Copyright (c) 2026 Deutsche Telekom AG

This repository is a fork of [https://github.com/anomalyco/opencode](https://github.com/anomalyco/opencode). The original work is Copyright (c) 2025 opencode / 2026 Anomaly Innovations Inc. and licensed under the [MIT](./LICENSE) license. Changes made by Deutsche Telekom AG are documented in the section above and are licensed under the same license.

All content in this repository is licensed under at least one of the licenses found in [./LICENSES](./LICENSES); you may not use this file, or any other file in this repository, except in compliance with the Licenses.
You may obtain a copy of the Licenses by reviewing the files found in the [./LICENSES](./LICENSES) folder.

Unless required by applicable law or agreed to in writing, software distributed under the Licenses is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See in the [./LICENSES](./LICENSES) folder for the specific language governing permissions and limitations under the Licenses.

This project follows the [REUSE standard for software licensing](https://reuse.software/).
Each file contains copyright and license information, and license texts can be found in the [./LICENSES](./LICENSES) folder. For more information visit https://reuse.software/.
You can find a guide for developers at https://telekom.github.io/reuse-template/.
