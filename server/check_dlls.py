import os
import ctypes

# This should point to the CUDA version TensorFlow requires (e.g., 11.8)
cuda_bin_path = r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v11.8\bin"

print(f"Checking for DLLs in: {cuda_bin_path}\n")

# Corrected list of essential DLLs for a typical CUDA 11.x environment
libs_to_check = [
    'cudart64_11.dll',   # CUDA Runtime for any 11.x version
    'cublas64_11.dll',   # cuBLAS for 11.x
    'cufft64_10.dll',    # cuFFT for 11.x is often named cufft64_10.dll or cufft64_11.dll
    'curand64_10.dll',   # cuRAND for 11.x is often named curand64_10.dll
    'cusolver64_11.dll', # cuSOLVER for 11.x
    'cusparse64_11.dll', # cuSPARSE for 11.x
    'cudnn64_8.dll'      # cuDNN version 8
]

all_found = True
for lib in libs_to_check:
    dll_path = os.path.join(cuda_bin_path, lib)
    if os.path.exists(dll_path):
        try:
            # Try to load the library from its full path
            ctypes.WinDLL(dll_path)
            print(f"[SUCCESS] Found and loaded {lib}")
        except OSError as e:
            print(f"[FAILURE] Found but failed to load {lib}. Error: {e}")
            all_found = False
    else:
        print(f"[FAILURE] Did not find {lib} at the specified path.")
        all_found = False

print("\n-------------------")
if all_found:
    print("All essential CUDA DLLs were found and loaded successfully.")
else:
    print("One or more essential CUDA DLLs were not found or failed to load.")