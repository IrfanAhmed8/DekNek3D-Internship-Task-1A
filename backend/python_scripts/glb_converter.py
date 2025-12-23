import sys
import os
import trimesh

SUPPORTED_FORMATS = {"stl", "obj", "ply", "3mf"}

def convert_glb(input_file_path, output_format):
    # Validate input file
    if not os.path.isfile(input_file_path):
        raise FileNotFoundError("Input GLB file not found")

    # Normalize format
    output_format = output_format.lower().replace(".", "")
    if output_format not in SUPPORTED_FORMATS:
        raise ValueError(f"Unsupported format: {output_format}")

    # Ensure output directory exists
    output_dir = "output"
    os.makedirs(output_dir, exist_ok=True)

    # Create output file path
    base_name = os.path.splitext(os.path.basename(input_file_path))[0]
    output_file_path = os.path.join(output_dir, f"{base_name}.{output_format}")

    # Load GLB (force scene to handle multi-mesh files)
    scene_or_mesh = trimesh.load(input_file_path, force="scene")

    # Merge scene meshes
    if isinstance(scene_or_mesh, trimesh.Scene):
        if not scene_or_mesh.geometry:
            raise ValueError("No geometry found in GLB file")

        mesh = trimesh.util.concatenate(
            tuple(scene_or_mesh.geometry.values())
        )
    else:
        mesh = scene_or_mesh

    # ---- Optional but RECOMMENDED for 3MF ----
    # GLB is usually meters, 3MF assumes millimeters
    if output_format == "3mf":
        mesh.apply_scale(1000.0)

    # Export
    mesh.export(output_file_path)

    return output_file_path


if __name__ == "__main__":
    try:
        input_path = sys.argv[1]
        output_format = sys.argv[2]  # stl | obj | ply | 3mf

        output_path = convert_glb(input_path, output_format)

        # IMPORTANT: Only print the path (Node.js depends on this)
        print(output_path)

    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
        sys.exit(1)
