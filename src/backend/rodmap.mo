import Time "mo:base/Time";
import List "mo:base/List";
import Text "mo:base/Text";
import Iter "mo:base/Iter";

actor Roadmap {
    type Task = {
        id : Nat;
        title : Text;
        description : Text;
        status : Text; // "To Do", "In Progress", "Done"
        timestamp : Time.Time;
    };

    type Quarter = {
        name : Text; // e.g., "Q2 2025"
        milestone : Text;
        tasks : List.List<Task>;
    };

    var roadmap : List.List<Quarter> = List.nil<Quarter>();
    var nextTaskId : Nat = 0;

    // Add a new quarter
    public func addQuarter(name : Text, milestone : Text) : async () {
        roadmap := List.push({ name = name; milestone = milestone; tasks = List.nil<Task>() }, roadmap);
    };

    // Add a task to a specific quarter
    public func addTask(quarterName : Text, title : Text, description : Text, status : Text) : async ?Task {
        let currentTime = Time.now();
        let newTask : Task = { id = nextTaskId; title = title; description = description; status = status; timestamp = currentTime };
        nextTaskId += 1;

        var updatedRoadmap = List.map<Quarter, Quarter>(roadmap, func(q) {
            if (q.name == quarterName) {
                { name = q.name; milestone = q.milestone; tasks = List.push(newTask, q.tasks) }
            } else {
                q
            }
        });

        roadmap := updatedRoadmap;
        return ?newTask;
    };

    // Get all quarters
    public query func getRoadmap() : async [Quarter] {
        return Iter.toArray(List.toIter(roadmap));
    };

    // Get all tasks for a specific quarter
    public query func getTasks(quarterName : Text) : async [Task] {
        for (q in List.toIter(roadmap)) {
            if (q.name == quarterName) {
                return Iter.toArray(List.toIter(q.tasks));
            }
        };
        return [];
    };

    // Update a task's status
    public func updateTaskStatus(quarterName : Text, taskId : Nat, newStatus : Text) : async Bool {
        var updated = false;
        var updatedRoadmap = List.map<Quarter, Quarter>(roadmap, func(q) {
            if (q.name == quarterName) {
                let updatedTasks = List.map<Task, Task>(q.tasks, func(t) {
                    if (t.id == taskId) {
                        updated := true;
                        { id = t.id; title = t.title; description = t.description; status = newStatus; timestamp = t.timestamp }
                    } else {
                        t
                    }
                });
                { name = q.name; milestone = q.milestone; tasks = updatedTasks }
            } else {
                q
            }
        });

        roadmap := updatedRoadmap;
        return updated;
    };
}
