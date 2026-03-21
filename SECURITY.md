# Security Policy

## Supported Versions

The following versions of the Sovereign Edge AI Platform are currently being supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of the Sovereign Edge AI Platform seriously. If you believe you have found a security vulnerability, please report it to us as soon as possible.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to [security@sovereign-edge.ai](mailto:security@sovereign-edge.ai).

### What to include in your report

Please include as much information as possible to help us understand and reproduce the issue:

- A description of the vulnerability.
- Steps to reproduce the issue.
- Potential impact of the vulnerability.
- Any suggested fixes or mitigations.

### Our Response Process

1. **Acknowledgment**: We will acknowledge receipt of your report within 48 hours.
2. **Investigation**: We will investigate the issue and determine its severity.
3. **Fix**: We will work on a fix or mitigation for the vulnerability.
4. **Disclosure**: We will coordinate with you on a public disclosure timeline once the fix is ready.

## Security Principles

The Sovereign Edge AI Platform is built on the following security principles:

1. **Zero Cloud Context**: No data is ever sent to the cloud without explicit user configuration.
2. **Local-First Auth**: Authentication is handled locally via encrypted mesh protocols.
3. **Encrypted Mesh**: All node-to-node communication is encrypted via WireGuard.
4. **Verifiable Artifacts**: All model weights and platform binaries are cryptographically hashed and verified before execution.
