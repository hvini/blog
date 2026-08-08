---
title: "Benchmarking YOLO11s for Autonomous Driving: From Edge to Data Center"
date: 2026-08-08T10:00:00-03:00
draft: false
tags: ["YOLO11", "Computer Vision", "TensorRT", "Autonomous Driving", "Edge Computing", "CUDA"]
---

In autonomous driving, perception is everything. But detecting vehicles and pedestrians accurately is just the beginning; doing it with deterministic, ultra low latency within a strict power budget is what actually makes a system viable. A delayed frame or a massive power spike on an edge device can compromise safety and vehicle range.

To understand where the current hardware and inference stacks stand, I ran a massive benchmark matrix on **YOLO11s**. I wanted to see exactly how different execution environments behave, from the Python prototyping phase all the way down to native C++ deployments.

The test roster included a broad range of hardware: RTX 4060 Ti, 4090, 5060 Ti, 5090, A6000, L40, and the Jetson Orin. I evaluated PyTorch, ONNX, and TensorRT across FP32, FP16, and INT8 precisions. To isolate compute performance, I configured the run to repeat 3 times with 1,000 iterations each, inferencing on a single static image.

Here is what the data actually reveals about scaling perception pipelines.

### The Scaling Wall: From 640p to 1920p

In standard edge deployments today, 640p is the baseline. However, modern Advanced Driver Assistance Systems (ADAS) are rapidly moving toward high resolution cameras (8MP+) to detect distant objects, like a pedestrian crossing a highway hundreds of meters ahead.

I wanted to illustrate what happens when we force the hardware to process increasingly larger grids.


![Figure 1: FPS degradation as resolution scales across TensorRT, ONNX, and PyTorch backends.](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/benchmarking-yolo11s-autonomous-driving/fps_degrad.png)
*Figure 1: FPS degradation as resolution scales across TensorRT, ONNX, and PyTorch backends.*

As you can see in the chart above, performance drops aggressively as we scale from 640p to 1280p, and finally to 1920p. This visually separates the hardware that hits a memory wall from the hardware with enough memory bandwidth to brute-force the higher resolutions, like the RTX 5090. It serves as a stark reminder that while 640p is manageable, high-resolution perception requires serious architectural consideration.

### The Python Tax: A 1920p Stress Test

Prototyping in Python is the industry standard, but deploying Python in a real time OS environment is a massive liability. At 640p, the Python overhead is bad but potentially survivable on high end hardware. However, when we push the resolution to 1920p, our absolute stress test, the overhead becomes catastrophic.


![Figure 2: Multiplicative speedup achieved simply by dropping Python for Native C++ at 1920p resolution.](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/benchmarking-yolo11s-autonomous-driving/native_speedup.png)
*Figure 2: Multiplicative speedup achieved simply by dropping Python for Native C++ at 1920p resolution.*

This heatmap is arguably the most striking finding of the experiment. Under heavy load at 1920p, moving to Native C++ yields a massive 7.64x speedup on an 6000 Ada Generation running ONNX, and a 7.01x speedup on an RTX 5090. Translating that to raw frames, dropping Python for Native C++ on a 5090 running TensorRT grants an additional 1,093 frames per second. You are literally leaving the majority of your hardware's potential on the table by not compiling down.

### Determinism dictates Braking Distance

In an autonomous vehicle pipeline, average FPS is a vanity metric. What actually dictates your system's braking distance safety margins is the P99 latency, the worst case execution time.


![Figure 3: Violin plots comparing latency consistency between Python and Native C++](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/benchmarking-yolo11s-autonomous-driving/latency_dist.png)
*Figure 3: Violin plots comparing latency consistency between Python and Native C++.*

The latency distribution above tells the true safety story. Notice the massive, unpredictable latency tails (P95 and P99) in the Python plots. In contrast, the Native C++ runs are tightly clustered, showcasing deterministic, predictable execution times. In a vehicle moving at highway speeds, a latency spike caused by the Python Global Interpreter Lock (GIL) or garbage collection could mean the difference between stopping safely and a collision.

### TensorRT Efficiency at Scale

When we look strictly at the most optimized deployment path, TensorRT FP16, we can see how Native C++ scales relative to the hardware.


![Figure 4: How the Native C++ speedup trend changes across resolutions for TensorRT FP16](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/benchmarking-yolo11s-autonomous-driving/speedup_trend_tensorrt_fp16.png)
*Figure 4: How the Native C++ speedup trend changes across resolutions for TensorRT FP16.*

This deep dive chart shows that the relative speedup of Native C++ over Python isn't static; it changes dynamically depending on the GPU architecture as the resolution scales up. TensorRT manages memory highly efficiently, allowing cards like the 6000 Ada Generation and L40S to maintain massive performance multiples over their Python counterparts even at 1920p.

### Power Efficiency: The Edge Computing Reality

Finally, we have to talk about the physical realities of edge computing. For offline auto labeling in a datacenter, power is less of a constraint than raw throughput. But in a vehicle, a massive power spike can degrade range and overwhelm cooling systems.


![Figure 5: Average power draw versus mean FPS for Native C++ deployments.](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/benchmarking-yolo11s-autonomous-driving/power_draw_native.png)
*Figure 5: Average power draw versus mean FPS for Native C++ deployments.*

This chart perfectly separates offline processing hardware from edge hardware. The 4090 and 5090 cards sit in the upper right, achieving astronomical frame rates but demanding a significantly higher average power draw to do so.

On the complete opposite end of the spectrum, the Jetson Orin is clustered entirely by itself in the bottom left corner. This represents the strict, ultra low power budget required for edge devices. When deploying on the edge, *FPS per Watt* is the governing metric, and the data confirms that Native C++ universally outclasses Python for power efficiency across every single GPU tested.

### Future Work: Dynamic Environments

While inferencing on a single static image provides a rock solid baseline of YOLO11s' theoretical compute efficiency across modern hardware, real world driving conditions introduce additional variables.

In a deployed autonomous vehicle, the perception system processes continuous video streams, handles dynamic batching across multiple cameras, and faces fluctuating lighting and weather conditions. These factors can influence activation sparsity and cache behavior.

This benchmark successfully isolates and evaluates the core inference performance and hardware scaling limits. Phase 2 of this study will expand on this foundation by introducing continuous video streams and varying environmental conditions to evaluate how these baseline metrics translate to dynamic scenarios.
