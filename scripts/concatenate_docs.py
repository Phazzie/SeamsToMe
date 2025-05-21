import glob
import os


def concatenate_docs(docs_directory, output_file):
    """
    Concatenates specified documentation files from a directory and its subdirectories
    into a single output file.
    """
    allowed_extensions = ['.md', '.txt', '.doc']
    doc_files = []

    for extension in allowed_extensions:
        # Search recursively for files with the allowed extensions
        doc_files.extend(glob.glob(os.path.join(docs_directory, '**', '*' + extension), recursive=True))

    # Filter out the output file itself to prevent it from being included if it already exists
    output_file_abs_path = os.path.abspath(output_file)
    doc_files = [f for f in doc_files if os.path.abspath(f) != output_file_abs_path]

    # Sort files to ensure a consistent order (optional, but good for reproducibility)
    doc_files.sort()

    with open(output_file, 'w', encoding='utf-8') as outfile:
        for filepath in doc_files:
            try:
                with open(filepath, 'r', encoding='utf-8') as infile:
                    content = infile.read()
                    outfile.write(f"--- START OF FILE: {os.path.relpath(filepath, docs_directory)} ---\n\n")
                    outfile.write(content)
                    outfile.write(f"\n\n--- END OF FILE: {os.path.relpath(filepath, docs_directory)} ---\n\n")
                print(f"Successfully processed: {filepath}")
            except Exception as e:
                outfile.write(f"--- ERROR PROCESSING FILE: {os.path.relpath(filepath, docs_directory)} ---\n")
                outfile.write(f"Error: {e}\n")
                outfile.write(f"--- END OF ERROR FOR FILE: {os.path.relpath(filepath, docs_directory)} ---\n\n")
                print(f"Error processing file {filepath}: {e}")

    print(f"\nAll specified documents have been concatenated into: {output_file}")

if __name__ == '__main__':
    # The script assumes it's in the 'scripts' directory, and 'docs' is a sibling.
    # Adjust if your directory structure is different.
    current_script_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_root = os.path.dirname(current_script_dir) # Moves up one level from 'scripts'
    docs_dir = os.path.join(workspace_root, 'docs')
    output_concatenated_file = os.path.join(docs_dir, 'concatenated_docs.txt')

    concatenate_docs(docs_dir, output_concatenated_file)
