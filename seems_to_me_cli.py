'''
Main CLI entry point for SeemsToMe tools.
'''
import argparse
import json
import subprocess # For calling the Node.js-based MVPSddScaffolderAgent
import os

# Assuming the MVPSddScaffolderAgent is run via a Node.js script.
# This path might need adjustment based on your project structure and how you expose the agent.
NODE_SCRIPT_PATH = os.path.join(os.path.dirname(__file__), 'dist', 'index.js') # Placeholder
# Or, if you have a specific runner for the scaffolder agent:
# NODE_SCRIPT_PATH = os.path.join(os.path.dirname(__file__), 'run_scaffolder.js')

def scaffold_component(args):
    '''Handles the scaffolding of a new SDD component.'''
    print(f"Attempting to scaffold component: {args.name}")
    print(f"Type: {args.type}")
    print(f"Target Directory: {args.targetDir}")

    # 1. Construct the MVPSddScaffoldRequest object (as a dictionary for JSON)
    # The actual MVPSddScaffolderAgent expects specific casing and structure,
    # ensure this matches its TypeScript contract.
    request_payload = {
        "componentName": args.name,
        "sddComponentType": args.type.upper(), # Assuming enum values are uppercase in TS
        "targetDirectory": args.targetDir,
        "templateVariables": {} # Add if you want to pass custom template variables from CLI
    }

    # 2. Call the MVPSddScaffolderAgent.
    # This is the part where Python needs to invoke the TypeScript/Node.js agent.
    # One common way is to have a Node.js script that can run the agent
    # and accept arguments / JSON payload, then print JSON output.

    print(f"Preparing to call MVPSddScaffolderAgent via Node.js script: {NODE_SCRIPT_PATH}")

    try:
        # We'll pass the request payload as a JSON string argument or via stdin.
        # For simplicity, let's use an argument. Modify if your Node script expects stdin.
        # The Node script would need to parse this JSON string.
        process = subprocess.run(
            ['node', NODE_SCRIPT_PATH, 'scaffold', json.dumps(request_payload)],
            capture_output=True,
            text=True,
            check=True # Will raise CalledProcessError if Node script exits with non-zero
        )

        # 3. Print the MVPSddScaffoldOutput to the console.
        # Assuming the Node script prints a JSON string representing MVPSddScaffoldOutput.
        print("\n--- Agent Output ---")
        try:
            output_json = json.loads(process.stdout)
            print(json.dumps(output_json, indent=2))
            if output_json.get("overallStatus") == "Success":
                print("\nScaffolding reported success.")
            else:
                print("\nScaffolding reported issues or failure.")
        except json.JSONDecodeError:
            print("Could not parse JSON output from agent:")
            print(process.stdout)

    except subprocess.CalledProcessError as e:
        print("\n--- Error calling MVPSddScaffolderAgent ---")
        print(f"Node script exited with error code: {e.returncode}")
        print("Stdout:")
        print(e.stdout)
        print("Stderr:")
        print(e.stderr)
    except FileNotFoundError:
        print(f"Error: Node.js executable or script not found. Is Node.js installed and in PATH?")
        print(f"Attempted to run: node {NODE_SCRIPT_PATH}")
    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")

def main():
    parser = argparse.ArgumentParser(description="SeemsToMe CLI Orchestrator")
    subparsers = parser.add_subparsers(dest="command", help="Available commands", required=True)

    # Subcommand: scaffold
    scaffold_parser = subparsers.add_parser("scaffold", help="Scaffold a new SDD component")
    scaffold_parser.add_argument(
        "--name", 
        required=True, 
        help="Name of the component (e.g., myNewAgent)"
    )
    scaffold_parser.add_argument(
        "--type", 
        required=True, 
        choices=["AGENT", "CONTRACT", "TEST", "FULL_AGENT_SET"], 
        type=str.upper, # Convert to uppercase to match typical enum style
        help="Type of SDD component to scaffold"
    )
    scaffold_parser.add_argument(
        "--targetDir", 
        required=True, 
        help="Target directory for the scaffolded files (e.g., src/agents)"
    )
    scaffold_parser.set_defaults(func=scaffold_component)

    args = parser.parse_args()
    args.func(args)

if __name__ == "__main__":
    main()
