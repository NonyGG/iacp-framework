# Python SDK

```python
from iacp import Client, Server, Workflow, Runtime

# Client
agent = Client("agent-1")
agent.send("agent-2", {"cmd": "ping"})
agent.publish("events.status", {"status": "online"})

# Server
server = Server("srv-api")
server.register_service("ping", lambda p: {"pong": True})

# Workflow
wf = Workflow("WF-01", "My Workflow")
wf.add_stage("init").add_stage("process")
wf.start()
while stage := wf.next_stage():
    print(f"Executing: {stage['name']}")

# Runtime
rt = Runtime("production", "1.0.0")
rt.register_client("agent-1")
rt.start_workflow(wf)
print(rt.status())
```
