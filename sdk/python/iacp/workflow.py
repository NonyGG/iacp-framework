import time, json

class Workflow:
    def __init__(self, wf_id, name, stages=None):
        self.id = wf_id
        self.name = name
        self.stages = stages or []
        self.current = 0
        self.state = "created"
        self.created_at = time.time()

    def add_stage(self, name, handler=None):
        self.stages.append({"name": name, "handler": str(handler) if handler else None})
        return self

    def start(self):
        self.state = "running"
        return self

    def next_stage(self):
        if self.current < len(self.stages):
            stage = self.stages[self.current]
            self.current += 1
            return stage
        self.state = "completed"
        return None

    def to_dict(self):
        return {"id": self.id, "name": self.name, "stages": len(self.stages),
                "completed": self.current, "state": self.state, "created_at": self.created_at}

    def to_json(self):
        return json.dumps(self.to_dict())
