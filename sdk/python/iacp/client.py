import json, time, uuid, threading

class Client:
    def __init__(self, agent_id=None, transport=None):
        self.agent_id = agent_id or f"py-{uuid.uuid4().hex[:8]}"
        self._transport = transport
        self._queue = []
        self._handlers = {}
        self._lock = threading.Lock()

    def send(self, to, payload, timeout=5000):
        msg = {"id": f"msg_{int(time.time()*1000)}_{uuid.uuid4().hex[:4]}",
               "from": self.agent_id, "to": to, "payload": payload, "timestamp": time.time(), "type": "request"}
        if self._transport:
            self._transport.deliver(json.dumps(msg))
        return msg

    def request(self, to, payload, timeout=5000):
        return self.send(to, payload, timeout)

    def listen(self, event_type, handler):
        self._handlers[event_type] = handler

    def publish(self, topic, payload):
        return self.send("events", {"topic": topic, "payload": payload})

    def _on_message(self, raw):
        try:
            msg = json.loads(raw) if isinstance(raw, str) else raw
            topic = msg.get("topic", "")
            if topic in self._handlers:
                self._handlers[topic](msg)
        except Exception:
            pass

    def wait_for(self, topic, timeout=10):
        deadline = time.time() + timeout
        while time.time() < deadline:
            with self._lock:
                for m in self._queue:
                    if m.get("topic") == topic:
                        self._queue.remove(m)
                        return m
            time.sleep(0.01)
        return None
