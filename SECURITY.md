# Security Policy

## Supported Versions

Until the 1.0.0 release, only the latest development version receives security updates.

## Reporting a Vulnerability

If you discover a security vulnerability in the IACP Framework, please report it privately to the maintainers before disclosing it publicly.

**Do not report security vulnerabilities through public GitHub issues.**

Instead, send a description of the issue to the project maintainers via a private channel. Include:

- Type of issue (buffer overflow, privilege escalation, etc.)
- Location of the affected code (file, function, line)
- Steps to reproduce
- Potential impact

You should receive a response within 48 hours. If you do not, follow up.

## Disclosure Policy

When a vulnerability is reported:

1. The maintainers will acknowledge receipt within 48 hours
2. An investigation will determine scope and impact
3. A fix will be developed and tested
4. The fix will be released with an advisory

## Best Practices

Users of the framework should:

- Always use the latest available version
- Validate all messages at trust boundaries
- Apply principle of least privilege when configuring transports
- Use encrypted channels in production deployments
