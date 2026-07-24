//! IACP Framework — Rust SDK
//!
//! Institutional Agent Communication Protocol for Rust.
//!
//! This SDK provides the Rust interface for building agents that communicate
//! via the IACP protocol. It handles message serialization, transport
//! abstraction, and protocol version negotiation.

pub const VERSION: &str = "0.2.0";

/// Represents an IACP agent identity.
pub struct Agent {
    pub id: String,
}

impl Agent {
    pub fn new(id: impl Into<String>) -> Self {
        Self { id: id.into() }
    }

    pub fn send(&self, to: &str, payload: &str) -> String {
        format!("{{\"from\":\"{}\",\"to\":\"{}\",\"payload\":\"{}\"}}", self.id, to, payload)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn agent_has_id() {
        let agent = Agent::new("test-agent");
        assert_eq!(agent.id, "test-agent");
    }

    #[test]
    fn agent_send_formats_json() {
        let agent = Agent::new("agent-1");
        let msg = agent.send("agent-2", "ping");
        assert!(msg.contains("agent-1"));
        assert!(msg.contains("agent-2"));
        assert!(msg.contains("ping"));
    }
}
