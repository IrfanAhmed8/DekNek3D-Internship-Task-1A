import bpy
import sys

stl_path = sys.argv[-2]
out_path = sys.argv[-1]

bpy.ops.import_mesh.stl(filepath=stl_path)
bpy.ops.export_mesh.threemf(filepath=out_path)