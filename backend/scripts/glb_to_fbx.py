import bpy
import sys

input_path = sys.argv[-2]
output_path = sys.argv[-1]

bpy.ops.import_scene.gltf(filepath=input_path)
bpy.ops.export_scene.fbx(filepath=output_path)
