---
title: "How I Installed Assetto Corsa into a Mac: A Step-by-Step Guide"
slug: "installing-assetto-corsa-on-mac"
date: 2026-08-15T09:50:00-03:00
draft: false
tags: ["Assetto Corsa", "Sim Racing", "Telemetry", "Mac", "Gaming", "Wine"]
---

### Why Run Assetto Corsa on a Mac?

Because my only desktop computer is a Mac, my primary motivation behind this setup is to be able to run Assetto Corsa on macOS without needing a dedicated Windows machine. Additionally, I wanted to collect telemetry data for research and performance analysis purposes. By collecting telemetry data, engineers and drivers can meticulously analyze vehicle parameters, such as throttle inputs, braking points, suspension travel, and tire temperatures. This allows drivers to identify exactly where they are losing time, optimize their car setups, and significantly improve their driving technique and consistency on the track.

### CrossOver, Wine, and Sikarugir

When looking to run Windows games on a Mac, the first solution that often comes to mind is CrossOver. While CrossOver is excellent and user-friendly, it only offers a trial plan.

An alternative is to use Wine directly. Wine is a compatibility layer capable of running Windows applications on operating systems like macOS and Linux. Instead of simulating internal Windows logic like a virtual machine, Wine translates Windows API calls into POSIX calls on the fly, eliminating the performance penalties associated with emulation.

To make managing Wine easier on macOS, this guide uses **Sikarugir**, a tool based on Wine that simplifies the process of creating custom wrappers for Windows apps.

### Prerequisites
Before starting, ensure that **Sikarugir Creator** is downloaded and installed on the Mac.

---

### 1. Creating the Wrapper
To kick things off, we need to create the environment where Assetto Corsa will run. Open the Sikarugir Creator application to begin building the initial wrapper.
![Sikarugir Creator](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/installing-assetto-corsa-on-mac/sikarugir_creator.png)

Select the engine `WS12WineSikarugir10.0_2` and click **Create** to build the initial wrapper.

### 2. Configuring the Wrapper
With the wrapper created, the next step is to configure its internal settings to ensure the game will run smoothly on Mac hardware. Right-click on the new wrapper, select **Show Package Contents**, and open the configuration utility.
![Wrapper Configuration](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/installing-assetto-corsa-on-mac/wrapper-configure.png)

Inside the configuration menu, ensure the Direct3D to Metal translation layer is set (**D3DMetal**). This step is crucial for achieving optimal performance on Apple Silicon chips.

### 3. Installing Dependencies and Steam
Before we can install the game, we need to set up Steam and the essential Windows dependencies that Assetto Corsa relies on. Using Winetricks within the wrapper configuration, install the following packages:
- `vc2010`, `vc2012`, `vc2013`, `vc2022`
- `ucrtbase2019`
- `dotnet40`, `dotnet48`
- `steam`

After the installations are finished, select `steam.exe` as the Windows app to run and hit **Test Run**.

Once the Steam setup finishes its updates and displays the login screen, go to **Tools** in the wrapper configuration and select **Kill Wine Processes** to close it cleanly. From this point onward, Steam can be launched directly from the app executable inside the Sikarugir directory.

### 4. Installing Assetto Corsa
Now that the foundation is laid and Steam is running, it's time to actually install the game. Launch the newly created Steam app, log into your account, download Assetto Corsa, and verify that the game launches successfully.
![Steam](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/installing-assetto-corsa-on-mac/steam.png)

### 5. Adding Content Manager
Content Manager is an alternative launcher that offers a cleaner, significantly faster user interface than the original game. It makes managing mods, configuring graphics, and fine-tuning control settings much more intuitive.

To configure the wrapper to launch the Content Manager directly instead of just Steam, follow these steps:

First, download the Content Manager installer from its official website. Then, return to the **Tools** section in the wrapper configuration, select **Install Software**, and choose the option to copy a folder inside. Select the Content Manager directory, and change the main executable path in the configuration to point to `Content Manager.exe` inside the Program Files directory.

Run a quick **Test Run** to validate the setup. Once confirmed, everything can be closed; the main executable will now launch the Content Manager directly.

### 6. Enabling the Performance HUD
As a final touch to the base setup, you might want to monitor your framerates to see how well your Mac is handling the game. To do this, the FPS HUD can be enabled in-game. Open the wrapper configurer, navigate to the **Advanced** tab, and select **Performance HUD**.
![Performance HUD Option](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/installing-assetto-corsa-on-mac/perf-hud_option.png)

### Extra: Installing the ACTI Plugin

Now moving to the main subject of interest: as pointed out in the introduction, my primary objective was to collect telemetry data. A great way of achieving this is by installing a telemetry plugin, and for this step, I will cover the installation of ACTI (Assetto Corsa Telemetry Interface). This is where having installed Content Manager earlier proves incredibly useful, as it drastically simplifies the process of enabling and managing Python apps like ACTI.

Before proceeding, you will need to download the ACTI plugin from its official source and extract the downloaded archive to access its files. 

First, move the extracted `acti` directory to a location inside the wrapper, for example: `C:/Users/Sikarugir/AppData/Local/acti`.

Next, move the contents of the `acti_trig_cntrl` into the Assetto Corsa directory (e.g., `Sikarugir/Steam.app/Contents/SharedSupport/prefix/drive_c/Program Files (x86)/Steam/steamapps/common/assettocorsa`). **Take care to append these files to the existing directories rather than replacing them.**

In Content Manager, navigate to **Settings** > **Python Apps**. Ensure that **Enable Python Apps** is checked, and select `acti` in the activated apps list.
![Python Apps](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/installing-assetto-corsa-on-mac/python-apps.png)

In the Python app settings for ACTI, set the local `acti.exe` location to the full path where it was placed in the first step. The **IP0 address** should be set to `localhost`.
![Python App Settings](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/installing-assetto-corsa-on-mac/python-app_settings.png)

Inside the game, look for the ACTI settings on the side panel and enable **Auto Launch** and **Auto Connect**. At first, the ACTI control status will be yellow. After enabling the auto launch and auto connect features and restarting the session, the plugin will show as active and will start collecting telemetry.
![ACTI In-Game Settings](https://storage.googleapis.com/blog-images-southamerica-east1/2026/08/installing-assetto-corsa-on-mac/acti_ingame.png)

The recorded sessions will be available in the `telem` directory inside the `acti` folder defined in the first step.

### Conclusion
And that’s it! You now have Assetto Corsa fully functional on a Mac, complete with Content Manager for a better UI and the ACTI plugin successfully gathering telemetry data. Whether you're trying to shave those last few tenths off your lap time or just getting started with telemetry analysis, this setup gives you all the tools you need natively on macOS. 

As a next step, when I have access to a racing wheel like the Logitech G29, I will be exploring its compatibility through this wrapper and testing how well it functions within this environment.

Happy racing! 🏎️
