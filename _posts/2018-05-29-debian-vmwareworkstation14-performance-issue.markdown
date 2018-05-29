---
layout: default
author: MDY
title:  VMWare workstation 14 performance issue on Debian 8
date:   2018-05-29 06:00:00
image: /assets/css/images/blog/workstation.jpg
categories: main
description: "VMWare workstation 14.2.1 debian 8.10 performance issue meltdown spectre"
---
VMWare published a new version of Workstation Pro 14.1.2 on may the 21st of 2018. As an intensive user of VMWare workstation, I always accept new version, and update as soon as possible. But this version was a great deception. With this new version, my VMs, that usually run smoothly on my PC, consumes all the CPUs. As soon as I fired up a VM, my CPU was loaded at more than 80%. I tried to investigate a bit to understand the problem...<!--break-->

# Hardware configuration
I worked on a 7 years old laptop but still in the running. I launched a few commands to get my workstation specifications.
## CPU specifications
```
$ sudo lscpu 
Architecture :        x86_64
Mode(s) opératoire(s) des processeurs : 32-bit, 64-bit
Boutisme :            Little Endian
Processeur(s) :       8
Liste de processeur(s) en ligne : 0-7
Thread(s) par cœur : 2
Cœur(s) par socket : 4
Socket(s) :           1
Nœud(s) NUMA :       1
Identifiant constructeur : GenuineIntel
Famille de processeur : 6
Modèle :             42
Nom de modèle :      Intel(R) Core(TM) i7-2720QM CPU @ 2.20GHz
Révision :           7
Vitesse du processeur en MHz : 843.906
Vitesse maximale du processeur en MHz : 3300,0000
Vitesse minimale du processeur en MHz : 800,0000
BogoMIPS :            4390.25
Virtualisation :      VT-x
Cache L1d :           32K
Cache L1i :           32K
Cache L2 :            256K
```
## Memory specifications
My PC is well equipped with RAM :
```
$ cat /proc/meminfo
MemTotal:       32972168 kB
MemFree:          246404 kB
MemAvailable:   13267076 kB
Buffers:          183064 kB
Cached:         28702732 kB
SwapCached:            0 kB
```
## Disks specification
My PC is equipped with an SSD. I run LVM on top of it :
```
$ sudo hdparm -i /dev/sda1
/dev/sda1:
 Model=Samsung SSD 850 PRO 1TB, FwRev=EXM02B6Q
 Config={ Fixed }
 RawCHS=16383/16/63, TrkSize=0, SectSize=0, ECCbytes=0
 BuffType=unknown, BuffSize=unknown, MaxMultSect=1, MultSect=1
 CurCHS=16383/16/63, CurSects=16514064, LBA=yes, LBAsects=2000409264
 IORDY=on/off, tPIO={min:120,w/IORDY:120}, tDMA={min:120,rec:120}
```

The hardware is well dimensionned if you consider that I run standard VMs such as small linux or Windows Workstations.

# OS configuration
Debian 8.6 is installed :
```
hostnamectl
           Chassis: laptop
  Operating System: Debian GNU/Linux 8 (jessie)
            Kernel: Linux 3.16.0-6-amd64
      Architecture: x86-64
```
# VMWare workstation configuration
I subscribed to a Workstation Pro license. I've been running the previous version (14.1.1 build-7528167) since january 2018 without any performance issue. In may 2018, VMWare published a new version (14.2.1). 

# The issue with this new version
I updated to this new version at the end of may. The upgrade was installed smoothly. But, with this new version, my PC freezes two or three minutes after any VM (linux, windows, very small or larger configuration) starts. The load of the RAM was not high but the CPU was around 80% or above.

I didn't catch the correlation between VMWare upgrade and my performance problems in the first time. I thought that, as my PC was old and summer was approaching, the performance was probably due to an overheating. I check the temperature of my system. It was quite hot but not alarming :
```
$ sensors
acpitz-virtual-0
Adapter: Virtual device
temp1:        +25.0°C  (crit = +107.0°C)

coretemp-isa-0000
Adapter: ISA adapter
Physical id 0:  +59.0°C  (high = +86.0°C, crit = +100.0°C)
Core 0:         +57.0°C  (high = +86.0°C, crit = +100.0°C)
Core 1:         +57.0°C  (high = +86.0°C, crit = +100.0°C)
Core 2:         +57.0°C  (high = +86.0°C, crit = +100.0°C)
Core 3:         +59.0°C  (high = +86.0°C, crit = +100.0°C)
```
I then thought about a problem with my browsers, that are very CPU-demanding. I tried various configurations. 

I thought I should upgrade to the last version of Debian (9.x). I didn't make the leap to 9.x because I was too busy to do so (but I definitely should).

I ended up by identifying that the problem occurs as soon as I started up a VM. I decided to rollback to VMWare workstation previous version (14.1.1). The performance issues have gone away with the downgrade.

# Potential root cause
The root of the problem is probably in VMWare Meltdown/Spectre patching strategy. As mentionned in [the release notes of workstation 14.2.1](https://docs.vmware.com/en/VMware-Workstation-Pro/14/rn/workstation-1412-release-notes.html) on VMWare site:

 *This update provides guest access to the SSBD feature in IA32_SPEC_CTRL.  This feature will be provided to all HWv9 or later virtual machines when running on an Intel based platform with the appropriate microcode updates.  Guest operating systems may choose to use this new CPU feature to mitigate CVE-2018-3639. Please see VMware knowledge base article 54951 for more details*.

The KB 54951 article on VMWare site mentions that SSB mitigation *requires both Hypervisor-Assisted Guest Mitigations and Operating System-Specific Mitigations*. I suspect that I should check that the OS that is installed on my laptop is compatible with SSB mitigation and how the whole thing works with VMWare workstation. 

I'll let you know more about this when I'll upgrade to Debian 9!






