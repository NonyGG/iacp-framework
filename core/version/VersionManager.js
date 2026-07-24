'use strict';

const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)(-(\w+))?$/;

class Version {
  constructor(major, minor, patch, label = 'stable') {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.label = label;
  }

  toString() {
    return `${this.major}.${this.minor}.${this.patch}${this.label !== 'stable' ? '-' + this.label : ''}`;
  }

  compareTo(other) {
    if (this.major !== other.major) return this.major - other.major;
    if (this.minor !== other.minor) return this.minor - other.minor;
    return this.patch - other.patch;
  }

  isCompatibleWith(other) {
    return this.major === other.major && this.minor <= other.minor + 1;
  }

  static parse(str) {
    const m = VERSION_PATTERN.exec(str);
    if (!m) throw new Error(`Invalid version string: ${str}`);
    return new Version(parseInt(m[1]), parseInt(m[2]), parseInt(m[3]), m[5] || 'stable');
  }

  static latest(versions) {
    return versions.reduce((a, b) => a.compareTo(b) > 0 ? a : b);
  }
}

class VersionManager {
  constructor() {
    this._protocol = new Version(1, 0, 0);
    this._packet = new Version(1, 0, 0);
    this._capabilities = new Version(1, 0, 0);
    this._registrations = new Map();
  }

  get protocol() { return this._protocol.toString(); }
  get packet() { return this._packet.toString(); }
  get capabilities() { return this._capabilities.toString(); }

  register(domain, versionStr) {
    const v = Version.parse(versionStr);
    const key = domain.toLowerCase();
    if (!this._registrations.has(key) || v.compareTo(this._registrations.get(key)) > 0) {
      this._registrations.set(key, v);
    }
    return this;
  }

  getVersion(domain) {
    const v = this._registrations.get(domain.toLowerCase());
    return v ? v.toString() : null;
  }

  checkCompatibility(domain, versionStr) {
    const v = Version.parse(versionStr);
    const registered = this._registrations.get(domain.toLowerCase());
    if (!registered) return true;
    return v.isCompatibleWith(registered);
  }

  findCommonVersion(versions) {
    if (!versions || versions.length === 0) return null;
    const sorted = versions.map(v => typeof v === 'string' ? Version.parse(v) : v).sort((a, b) => a.compareTo(b));
    return sorted[0].toString();
  }
}

module.exports = { Version, VersionManager };
