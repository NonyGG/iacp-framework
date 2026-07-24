import json, time, uuid, threading

class Server:
    def __init__(self, server_id=None, transport=None):
        self.server_id = server_id or f"srv-{uuid.uuid4().hex[:8]}"
        self._transport = transport
        self._services = {}
        self._events = []
        self._running = False

    def register_service(self, name, handler):
        self._services[name] = handler
        return self

    def handle(self, raw):
        try:
            msg = json.loads(raw) if isinstance(raw, str) else raw
            svc = msg.get("service") or msg.get("type")
            if svc in self._services:
                result = self._services[svc](msg.get("payload", {}))
                return {"status": "ok", "result": result}
            return {"status": "error", "message": f"Unknown service: {svc}"}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def emit(self, topic, data):
        evt = {"id": f"evt_{int(time.time()*1000)}", "topic": topic, "data": data,
               "server": self.server_id, "timestamp": time.time()}
        self._events.append(evt)
        return evt

    def get_events(self, since=None):
        if since is None:
            return self._events
        return [e for e in self._events if e["timestamp"] >= since]

    def start(self):
        self._running = True

    def stop(self):
        self._running = False
