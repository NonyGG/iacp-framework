import time

class Runtime:
    def __init__(self, name, version="1.0.0"):
        self.name = name
        self.version = version
        self._clients = {}
        self._workflows = {}
        self._events = []
        self._started_at = time.time()

    def register_client(self, client_id, metadata=None):
        self._clients[client_id] = metadata or {}
        return self

    def start_workflow(self, wf):
        self._workflows[wf.id] = wf
        return wf.start()

    def get_workflow(self, wf_id):
        return self._workflows.get(wf_id)

    def list_workflows(self):
        return list(self._workflows.values())

    def emit_event(self, event_type, data):
        evt = {"type": event_type, "data": data, "timestamp": time.time()}
        self._events.append(evt)
        return evt

    def status(self):
        return {"runtime": self.name, "version": self.version,
                "clients": len(self._clients), "workflows": len(self._workflows),
                "events": len(self._events), "uptime": time.time() - self._started_at}
