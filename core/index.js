'use strict';
const { ProtocolCore, FeatureFlag, FeatureFlagSet, CompatibilityManager, SchemaRegistry, CapabilityRegistry } = require('./protocol/ProtocolCore.js');
const { Header, Payload, Metadata, Envelope, Message } = require('./messages/Message.js');
const { Event, EventHeader, EventMetadata } = require('./events/Event.js');
const { ContextReference, ContextDelta, ContextSnapshot, ContextMetadata } = require('./context/Context.js');
const { ASTNode, MissionAST, WorkflowAST, RuntimeAST, ContextAST, KnowledgeAST, ASTBuilder } = require('./ast/ASTNode.js');
const { InstitutionalError, ErrorTracker, ErrorFactory } = require('./errors/ErrorSystem.js');
const { Version, VersionManager } = require('./version/VersionManager.js');
const types = require('./common/types.js');
const ids = require('./common/identifiers.js');
const utils = require('./utils/utils.js');

module.exports = {
  ProtocolCore, FeatureFlag, FeatureFlagSet, CompatibilityManager, SchemaRegistry, CapabilityRegistry,
  Header, Payload, Metadata, Envelope, Message,
  Event, EventHeader, EventMetadata,
  ContextReference, ContextDelta, ContextSnapshot, ContextMetadata,
  ASTNode, MissionAST, WorkflowAST, RuntimeAST, ContextAST, KnowledgeAST, ASTBuilder,
  InstitutionalError, ErrorTracker, ErrorFactory,
  Version, VersionManager,
  types, ids, utils,
};
