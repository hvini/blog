---
title: "Cracking Legacy ZIP File Encryption"
date: 2026-10-21T09:00:00-03:00
draft: false
math: false
tags: ["Security", "Legacy", "ZIP", "Reverse Engineering"]
---

***Are password-protected ZIP files really secure?***

### Introduction

Recently, I faced a challenge where I needed to convert some telemetry files into CSV format. A trivial task, right?  
However, looking at the files, I realized it wouldn't be solved with a simple ***df.to_csv()***.

That was when my saga began to find out: what type of file was that, which software did it come from, whether there was a converter available from the community, and if not, which options i have.

In this article, both the software name and the original file extensions are fictitious to avoid exposing the tool. The goal here is to share basic knowledge about legacy encryption in ZIP files and how I structured the solution to this problem step by step.

### The Saga

Initially, I ran a simple browser search for the extension of the file I wanted to convert, something like: `".tmx filetype telemetry"`. Right off the bat, I discovered that the file belonged to a proprietary software, let's call it **Telemetrix Pro**, widely used by industry professionals. 

The software operates under a licensing system, so I wouldn't be able to use it just to export the files. Furthermore, the goal was to **automate the process** via a script without requiring manual interactions with graphical user interfaces.

During this initial search, I also discovered that the file's structure closely resembled that of a `.zip` file. That's when I made my first attempt to access it. Upon trying to extract it, I hit my first limitation:

> *"Password Required: file.tmx is password-protected"*

Now I was stuck. *"What do I do now?"*, I thought. My first instinct was to guess a few obvious passwords. What did I have to lose? Just time.

#### Brute Force

I started by building a password dictionary based on all the context and information I had (folder name, project name, dates, etc.). After creating this dictionary, I wrote a simple Python loop to iterate through it and try unzipping the file. The result? **Nothing**. All passwords failed.

The next logical step was testing a more robust brute-force tool than my custom script. I turned to **John the Ripper**, a famous open-source tool for password auditing and recovery that runs offline. I installed it, configured it, and left it running for a long 40 minutes. Again, nothing.

At that point, I realized the path forward wouldn't be that simple. I decided to step back and do what I should have done from the start: **deeply inspect the file** before running headfirst into the password wall.

### The Vulnerability

Using **7-Zip**, I inspected the file via the command line with `7z l -slt file.tmx`. The result was eye-opening. The terminal output returned a list with metadata for all internal files, similar to this:

Folder          = -  
Size            = 20188  
Packed Size     = 7912  
Modified        = 2026-09-12 12:11:02  
Created         =   
Accessed        =   
Attributes      = A  
Encrypted       = +  
Comment         =   
CRC             =   
Method          = ZipCrypto Deflate:Fastest  
Characteristics = Encrypt Descriptor  
Host OS         = FAT  
Version         = 20  
Volume Index    = 0  
Offset          = 0  

Right there, my first major opportunity appeared.

### ZipCrypto

Looking at the `Method` line returned by 7-Zip, I noticed the string **"ZipCrypto"**. Upon researching this using an LLM to summarize the context, I got the following confirmation:

> In computing, **ZipCrypto** is the original and default encryption method used to password-protect `.zip` files. It was created in the 1990s by the PKZIP program.
>
> **The problem:** By modern security standards, ZipCrypto is considered very weak and obsolete. It is vulnerable to attacks (such as the "known-plaintext attack"), and password recovery tools can break a ZipCrypto-protected file very quickly.
>
> **The solution:** Nowadays, to password-protect a ZIP file, the absolute recommendation is to use the **AES-256** standard.

There it was, what I was looking for. But what exactly was this *"Known-Plaintext Attack"*?

In simple terms: if you know a small fraction (about 13 to 40 bytes) of the unencrypted content inside the ZIP file, you can use that "known text" to deduce the encryption keys and unlock the entire file. This fatal flaw was mathematically proven and disclosed by cryptographers Eli Biham and Paul C. Kocher in 1994.

In their study, they proved that an attacker would need only a tiny snippet of the original file to compute the internal keys in a matter of minutes (or seconds) on a modern computer. It was this discovery that forced the industry years later to adopt the military-grade **AES-256** encryption standard.

With this attack vector in mind, I went searching for tools that exploited this vulnerability and stumbled upon **BKCrack**.

### BKCrack

[BKCrack](https://github.com/kimci86/bkcrack) is an open-source command-line tool developed by *kimci86*, specifically designed to break legacy ZIP encryption by implementing the Biham and Kocher attack (*Known Plaintext Attack*).

I installed the tool on my machine and began testing. Since I already had a few sample telemetry files (giving me an idea of what the final format should look like), I opened them in a hex editor to extract the header bytes (column names). Using that, I generated a file to serve as my *"Known Plaintext"*.

That's when the iterations began:

1. **First attempt:** The attack failed. Looking back at the 7-Zip results, I noticed there were multiple files inside the ZIP. Most likely, the specific file I tried to attack didn't share the header bytes I had deduced.
2. **Second attempt:** I noticed that most of the internal files shared the exact same checksum, with an uncompressed size of 9,824 bytes. I generated a new plaintext, but it still wasn't enough for the algorithm to extract the keys.
3. **Third attempt:** I focused solely on the outlier file among the rest. I mapped 28 bytes of its header. Once again, no success.
4. **Fourth attempt (Success):** Finally, paying closer attention to the nature of the data, I noticed that some columns were standardized and filled identically. There was a section containing exactly 98,240 bytes of pure zeros. By generating the known-plaintext file with those zeros and setting the tool's compression level to Level 1, **bingo!** 

BKCrack successfully derived the three internal keys, which were immediately used to extract the entire ZIP file without ever having to recover the original plaintext password.

*"Was this the end of the saga?"*, I thought. Answer: **No.**

### Post-Exploitation: Handling Raw Data

After successfully unzipping the files, I faced dozens of files in an unknown format, which appeared to represent each telemetry column in isolation. The good news? There were no more encryption layers.

Analyzing these files in a hex editor (*Hex Editor*), I noticed the data structure was extremely uniform, indicating an array of raw binary numerical data. 

I ran a few quick tests regarding *endianness*, data types, and precision points. I quickly concluded that these were continuous arrays of 64-bit floating-point numbers (`float64`). 

With the mystery finally solved, I wrote a simple Python script using the `struct` and `pandas` libraries to parse these binary files, merge all columns, and output everything into the format I wanted from the very beginning: **a glorious CSV file**.

### Conclusion

Going back to the question at the start of this article: **Are password-protected ZIP files really secure?** The answer is: *it depends on when and how they were created.*

This challenge taught me two fundamental security lessons:

*   **Security through obscurity is not security:** Hiding a ZIP file by renaming its extension to something proprietary (like `.tmx`) merely delays analysis; it does not prevent reverse engineering.
*   **Legacy encryption is an open door:** The *ZipCrypto* method, despite requiring a password, offers a false sense of security. If an attacker knows even the smallest detail about the file's contents (even if it's just a sequence of zeros), the protection crumbles like a house of cards.

Today, if you need to transfer or store sensitive data, always ensure your compression tool is configured to use **AES-256**. 

In the end, what started as a "trivial task" to read a CSV became a practical lesson in classical cryptography. It wasn't the easiest path, but the satisfaction of seeing the data perfectly aligned on the screen after hours of investigation made every failed attempt completely worth it.