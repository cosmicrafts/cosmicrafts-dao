import subprocess
import time

# ✅ Full roadmap data for 4 quarters
roadmap_data = {
    "Q2 2025": {
        "period": "2025-Q2",
        "milestones": [
            {
                "title": "Platform Identification & Research",
                "description": "Identify key web game platforms and their requirements.",
                "tasks": [
                    {"title": "Identify Key Platforms", "description": "List platforms like CrazyGames, Poki, Kongregate.", "status": "ToDo"},
                    {"title": "Research Platform Requirements", "description": "Document WebGL specs, SDKs, policies.", "status": "ToDo"}
                ]
            },
            {
                "title": "Technical Assessment & Planning",
                "description": "Assess WebGL performance and plan multiplayer architecture.",
                "tasks": [
                    {"title": "WebGL Performance Profiling", "description": "Test performance across browsers.", "status": "ToDo"},
                    {"title": "Multiplayer WebSocket Design", "description": "Define WebSocket integration with canisters.", "status": "ToDo"}
                ]
            }
        ]
    },
    "Q3 2025": {
        "period": "2025-Q3",
        "milestones": [
            {
                "title": "WebGL Optimization",
                "description": "Optimize asset sizes and rendering for faster performance.",
                "tasks": [
                    {"title": "Reduce Texture Sizes", "description": "Optimize textures for faster load times.", "status": "ToDo"},
                    {"title": "Script Performance Review", "description": "Review scripts and optimize performance.", "status": "ToDo"}
                ]
            },
            {
                "title": "Multiplayer Infrastructure Setup",
                "description": "Implement WebSocket servers and connect with canisters.",
                "tasks": [
                    {"title": "WebSocket Server Deployment", "description": "Deploy WebSocket servers for real-time gameplay.", "status": "ToDo"},
                    {"title": "Canister Integration Testing", "description": "Test real-time data exchange between WebSockets and canisters.", "status": "ToDo"}
                ]
            }
        ]
    },
    "Q4 2025": {
        "period": "2025-Q4",
        "milestones": [
            {
                "title": "Platform SDK Integration",
                "description": "Integrate SDKs from target web platforms.",
                "tasks": [
                    {"title": "Integrate CrazyGames SDK", "description": "Embed and configure CrazyGames SDK.", "status": "ToDo"},
                    {"title": "Implement Ads & Analytics", "description": "Integrate ads and analytics tools from platforms.", "status": "ToDo"}
                ]
            },
            {
                "title": "Off-Chain Data Integration",
                "description": "Configure canisters to gather data from external sources.",
                "tasks": [
                    {"title": "Set Up HTTPS Outcalls", "description": "Configure HTTPS outcalls for analytics and platform events.", "status": "ToDo"},
                    {"title": "Implement Off-Chain Data Handlers", "description": "Handle incoming data in game logic.", "status": "ToDo"}
                ]
            }
        ]
    },
    "Q1 2026": {
        "period": "2026-Q1",
        "milestones": [
            {
                "title": "Compliance & Performance Testing",
                "description": "Ensure the game meets platform requirements.",
                "tasks": [
                    {"title": "Platform Compatibility Testing", "description": "Test across different platforms for performance and compatibility.", "status": "ToDo"},
                    {"title": "Latency and Load Time Optimization", "description": "Optimize network latency and load times.", "status": "ToDo"}
                ]
            },
            {
                "title": "Final Launch Preparations",
                "description": "Prepare the game for public launch on web platforms.",
                "tasks": [
                    {"title": "Submission to Platforms", "description": "Submit the game to all selected web platforms.", "status": "ToDo"},
                    {"title": "Marketing & Community Engagement", "description": "Launch marketing campaigns and engage with the gaming community.", "status": "ToDo"}
                ]
            }
        ]
    }
}

# ✅ Run Shell Commands
def run_command(command):
    """Execute a shell command and return its output or error."""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(result.stdout)
    except subprocess.CalledProcessError as e:
        print(f"Error: {e.stderr}")


def get_latest_milestone_id():
    """Retrieve the latest milestone ID by calling the canister."""
    result = subprocess.run('dfx canister call roadmap getMilestones', shell=True, capture_output=True, text=True)
    milestones_output = result.stdout
    milestone_id = 0
    if "id =" in milestones_output:
        milestone_id = int(milestones_output.split("id = ")[1].split(":")[0])
    return milestone_id


def populate_roadmap(data):
    """Populate the canister with roadmap data using DFX commands."""
    for quarter, details in data.items():
        print(f"\n🚀 Adding Quarter: {quarter}")
        period = details["period"]
        for milestone in details["milestones"]:
            milestone_title = milestone["title"]
            milestone_description = milestone["description"]

            # Add milestone
            cmd_add_milestone = f'dfx canister call roadmap addMilestone \'("{period}", "{milestone_title}", "{milestone_description}")\''
            print(f"Adding milestone: {milestone_title}")
            run_command(cmd_add_milestone)
            time.sleep(1)

            # Retrieve milestone ID (assuming sequential IDs)
            milestone_id = get_latest_milestone_id()

            # Add tasks
            for task in milestone["tasks"]:
                task_title = task["title"]
                task_description = task["description"]
                task_status = task["status"]
                cmd_add_task = f'dfx canister call roadmap addTask \'({milestone_id}, "{task_title}", "{task_description}", variant {{ {task_status} }})\''
                print(f"  Adding task: {task_title}")
                run_command(cmd_add_task)
                time.sleep(0.5)


# ✅ MAIN FUNCTION
if __name__ == "__main__":
    print("🚀 Starting to populate roadmap canister...")
    populate_roadmap(roadmap_data)
    print("✅ Roadmap population complete!")
