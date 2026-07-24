'use strict';

const MessagePriority = Object.freeze({
  LOW: 0,
  NORMAL: 1,
  HIGH: 2,
  CRITICAL: 3,
});

const MessageType = Object.freeze({
  REQUEST: 'request',
  RESPONSE: 'response',
  COMMAND: 'command',
  EVENT: 'event',
  QUERY: 'query',
  ACK: 'acknowledgment',
  ERROR: 'error',
  HEARTBEAT: 'heartbeat',
});

const EventCategory = Object.freeze({
  SYSTEM: 'system',
  APPLICATION: 'application',
  SECURITY: 'security',
  AUDIT: 'audit',
  METRIC: 'metric',
  LIFECYCLE: 'lifecycle',
});

const EventSeverity = Object.freeze({
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
  CRITICAL: 4,
});

const ErrorCategory = Object.freeze({
  VALIDATION: 'validation',
  PROTOCOL: 'protocol',
  TRANSPORT: 'transport',
  ROUTING: 'routing',
  SERIALIZATION: 'serialization',
  INTERNAL: 'internal',
  SECURITY: 'security',
  TIMEOUT: 'timeout',
});

const ErrorSeverity = Object.freeze({
  FATAL: 0,
  CRITICAL: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
  INFO: 5,
});

const AstNodeType = Object.freeze({
  MISSION: 'mission',
  WORKFLOW: 'workflow',
  RUNTIME: 'runtime',
  CONTEXT: 'context',
  KNOWLEDGE: 'knowledge',
  CERTIFICATION: 'certification',
});

const CapabilityFlag = Object.freeze({
  ENCRYPTION: 'encryption',
  COMPRESSION: 'compression',
  STREAMING: 'streaming',
  BATCHING: 'batching',
  ROUTING: 'routing',
  PERSISTENCE: 'persistence',
});

const ProtocolPhase = Object.freeze({
  HANDSHAKE: 'handshake',
  ESTABLISHED: 'established',
  RECONNECTING: 'reconnecting',
  TERMINATED: 'terminated',
});

module.exports = {
  MessagePriority,
  MessageType,
  EventCategory,
  EventSeverity,
  ErrorCategory,
  ErrorSeverity,
  AstNodeType,
  CapabilityFlag,
  ProtocolPhase,
};
