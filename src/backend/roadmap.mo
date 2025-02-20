import Time "mo:base/Time";
import List "mo:base/List";
import Text "mo:base/Text";
import Iter "mo:base/Iter";

actor Roadmap {
    public type TaskStatus = {
        #ToDo;
        #InProgress;
        #Done;
    };

    type Task = {
        id : Nat;
        title : Text;
        description : Text;
        status : TaskStatus;
        timestamp : Time.Time;
    };

    type Milestone = {
        id : Nat;
        period : Text;  // e.g., "2025-Q2"
        title : Text;
        description : Text;
        tasks : List.List<Task>;
        isCompleted : Bool;
    };

    var milestones : List.List<Milestone> = List.nil<Milestone>();
    var nextMilestoneId : Nat = 0;
    var nextTaskId : Nat = 0;

    public func addMilestone(period : Text, title : Text, description : Text) : async ?Milestone {
        let newMilestone : Milestone = {
            id = nextMilestoneId;
            period = period;
            title = title;
            description = description;
            tasks = List.nil<Task>();
            isCompleted = false;
        };
        nextMilestoneId += 1;

        milestones := List.push(newMilestone, milestones);
        return ?newMilestone;
    };

    public func addTask(milestoneId : Nat, title : Text, description : Text, status : TaskStatus) : async ?Task {
        let currentTime = Time.now();
        let newTask : Task = { id = nextTaskId; title = title; description = description; status = status; timestamp = currentTime };
        nextTaskId += 1;

        var updatedMilestones = List.map<Milestone, Milestone>(milestones, func(m) {
            if (m.id == milestoneId) {
                { id = m.id; period = m.period; title = m.title; description = m.description; tasks = List.push(newTask, m.tasks); isCompleted = m.isCompleted }
            } else {
                m
            }
        });

        milestones := updatedMilestones;
        return ?newTask;
    };

    public func updateTaskStatus(milestoneId : Nat, taskId : Nat, newStatus : TaskStatus) : async Bool {
        var updated = false;

        func allTasksCompleted(tasks : List.List<Task>) : Bool {
            return List.all<Task>(tasks, func(t) { switch (t.status) { case (#Done) true; case _ false } });
        };

        var updatedMilestones = List.map<Milestone, Milestone>(milestones, func(m) {
            if (m.id == milestoneId) {
                let updatedTasks = List.map<Task, Task>(m.tasks, func(t) {
                    if (t.id == taskId) {
                        updated := true;
                        { id = t.id; title = t.title; description = t.description; status = newStatus; timestamp = t.timestamp }
                    } else {
                        t
                    }
                });

                let milestoneCompleted = allTasksCompleted(updatedTasks);
                { id = m.id; period = m.period; title = m.title; description = m.description; tasks = updatedTasks; isCompleted = milestoneCompleted }
            } else {
                m
            }
        });

        milestones := updatedMilestones;
        return updated;
    };

    public query func getMilestones() : async [Milestone] {
        return Iter.toArray(List.toIter(milestones));
    };

    public query func getTasks(milestoneId : Nat) : async [Task] {
        for (m in List.toIter(milestones)) {
            if (m.id == milestoneId) {
                return Iter.toArray(List.toIter(m.tasks));
            }
        };
        return [];
    };
}
