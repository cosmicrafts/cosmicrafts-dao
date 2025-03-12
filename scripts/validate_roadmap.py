#!/usr/bin/env python3

import json
import os
import sys
from typing import Dict, List, Any, Tuple

class RoadmapValidator:
    def __init__(self, roadmap_dir: str):
        self.roadmap_dir = roadmap_dir
        self.quarter_dir = os.path.join(roadmap_dir, 'roadmap')
        self.roadmap_file = os.path.join(roadmap_dir, 'roadmap.json')
        self.errors: List[str] = []
        self.standard_structure = None
        
    def load_standard_structure(self):
        """Load the standard structure from roadmap.json"""
        try:
            with open(self.roadmap_file, 'r') as f:
                self.standard_structure = json.load(f)
        except Exception as e:
            print(f"Error loading roadmap.json: {str(e)}")
            sys.exit(1)

    def validate_period_format(self, period: str) -> bool:
        """Validate period follows YYYY-QN format."""
        try:
            year, quarter = period.split('-')
            return (len(year) == 4 and year.isdigit() and 
                   quarter.startswith('Q') and quarter[1].isdigit() and
                   1 <= int(quarter[1]) <= 4)
        except:
            return False

    def validate_subtask(self, subtask: Dict[str, Any], path: str) -> None:
        """Validate subtask structure."""
        required_fields = {
            'title': str,
            'description': str,
            'completed': bool
        }
        
        for field, field_type in required_fields.items():
            if field not in subtask:
                self.errors.append(f"{path}: Missing required field '{field}' in subtask")
            elif not isinstance(subtask[field], field_type):
                self.errors.append(f"{path}: Field '{field}' should be of type {field_type.__name__}")

    def validate_task(self, task: Dict[str, Any], path: str) -> None:
        """Validate task structure."""
        required_fields = {
            'title': str,
            'description': str,
            'completed': int,
            'total': int,
            'status': str,
            'subtasks': list
        }
        
        for field, field_type in required_fields.items():
            if field not in task:
                self.errors.append(f"{path}: Missing required field '{field}' in task")
            elif not isinstance(task[field], field_type):
                self.errors.append(f"{path}: Field '{field}' should be of type {field_type.__name__}")
        
        if task.get('status') != 'ToDo':
            self.errors.append(f"{path}: Task status should be 'ToDo'")
        
        if task.get('total') != len(task.get('subtasks', [])):
            self.errors.append(f"{path}: Task total should match number of subtasks")
        
        for i, subtask in enumerate(task.get('subtasks', [])):
            self.validate_subtask(subtask, f"{path} -> subtask[{i}]")

    def validate_milestone(self, milestone: Dict[str, Any], path: str) -> None:
        """Validate milestone structure."""
        required_fields = {
            'title': str,
            'description': str,
            'completed': int,
            'total': int,
            'tasks': list
        }
        
        for field, field_type in required_fields.items():
            if field not in milestone:
                self.errors.append(f"{path}: Missing required field '{field}' in milestone")
            elif not isinstance(milestone[field], field_type):
                self.errors.append(f"{path}: Field '{field}' should be of type {field_type.__name__}")
        
        if milestone.get('total') != len(milestone.get('tasks', [])):
            self.errors.append(f"{path}: Milestone total should match number of tasks")
        
        for i, task in enumerate(milestone.get('tasks', [])):
            self.validate_task(task, f"{path} -> task[{i}]")

    def validate_quarter(self, quarter_data: Dict[str, Any], path: str) -> None:
        """Validate a quarter's data structure."""
        required_fields = {
            'period': str,
            'description': str,
            'completed': int,
            'total': int,
            'milestones': list
        }
        
        for field, field_type in required_fields.items():
            if field not in quarter_data:
                self.errors.append(f"{path}: Missing required field '{field}'")
            elif not isinstance(quarter_data[field], field_type):
                self.errors.append(f"{path}: Field '{field}' should be of type {field_type.__name__}")
        
        if not self.validate_period_format(quarter_data.get('period', '')):
            self.errors.append(f"{path}: Invalid period format. Should be YYYY-QN")
        
        if quarter_data.get('total') != len(quarter_data.get('milestones', [])):
            self.errors.append(f"{path}: Quarter total should match number of milestones")
        
        for i, milestone in enumerate(quarter_data.get('milestones', [])):
            self.validate_milestone(milestone, f"{path} -> milestone[{i}]")

    def validate_roadmap_file(self, filepath: str) -> None:
        """Validate a single roadmap JSON file."""
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            # If this is a quarter file (not roadmap.json)
            if filepath != self.roadmap_file:
                self.validate_quarter(data, filepath)
            else:
                # For roadmap.json, validate each quarter
                for quarter_key, quarter_data in data.items():
                    self.validate_quarter(quarter_data, f"{filepath} -> {quarter_key}")
                
        except json.JSONDecodeError:
            self.errors.append(f"{filepath}: Invalid JSON format")
        except Exception as e:
            self.errors.append(f"{filepath}: Unexpected error: {str(e)}")

    def validate_all_files(self) -> Tuple[bool, List[str]]:
        """Validate all roadmap JSON files in the directory."""
        # First load and validate roadmap.json as the source of truth
        self.load_standard_structure()
        self.validate_roadmap_file(self.roadmap_file)
        
        # Then validate all quarter files
        for filename in os.listdir(self.quarter_dir):
            if filename.startswith('Q') and filename.endswith('.json'):
                filepath = os.path.join(self.quarter_dir, filename)
                self.validate_roadmap_file(filepath)
        
        return len(self.errors) == 0, self.errors

def main():
    roadmap_dir = os.path.join('src', 'frontend', 'src', 'data')
    roadmap_file = os.path.join(roadmap_dir, 'roadmap.json')
    quarter_dir = os.path.join(roadmap_dir, 'roadmap')
    
    if not os.path.exists(roadmap_file):
        print(f"Error: roadmap.json not found at {roadmap_file}")
        sys.exit(1)
    if not os.path.exists(quarter_dir):
        print(f"Error: Roadmap directory not found at {quarter_dir}")
        sys.exit(1)
    
    validator = RoadmapValidator(roadmap_dir)
    is_valid, errors = validator.validate_all_files()
    
    if is_valid:
        print("✅ All roadmap files are valid and follow the standard structure!")
        sys.exit(0)
    else:
        print("❌ Found the following validation errors:")
        for error in errors:
            print(f"  - {error}")
        sys.exit(1)

if __name__ == '__main__':
    main() 