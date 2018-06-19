---
layout: default
author: MDY
title:  How to make a debian linux machine Ansible ready
date:   2018-06-19 06:00:00
image: /assets/css/images/blog/ansible.jpg
categories: main
description: "Debian linux machine ansible ready"
---
## Introduction
This document shows how to prepare a debian linux machine to connect to Ansible (or to get the machine ansible ready so that you can configure it using ansible). This is a very simple example that shows Ansible prerequisites. 
<!--break-->
## Ansible prerequisites
Very simple prerequisites :
- You can ssh into your ansible-managed server
- The ssh client public key is installed on the server so that the client can authenticate automatically and securely
- Python is installed on the server so that Ansible can execute tasks 
- The server is identified either by its name or its ip address
- The server is connected to the Internet (it's not a prerequisite of Ansible but it's a prerequisite to install it as follows)

## Deployment scenario
As a first step with Ansible, we may imagine that you deal with a few machines (10 servers for instance), and that network addresses are statically assigned or that the servers are registered in the DNS.

## Adjusting network parameter

### Debian version < 9
```
$su
$ vi /etc/network/interfaces
allow-hotplug eth0
iface eth0 inet static
  address AAA.AAA.AAA.AAA  # REPLACE WITH YOUR OWN VALUE
    netmask 255.255.255.0
      gateway GGG.GGG.GGG.GGG # REPLACE WITH YOUR OWN VALUE
      $vi /etc/resolv.conf
      nameserver NNN.NNN.NNN.NNN # REPLACE WITH YOUR OWN VALUE
      $service networking restart
      $vi /etc/hostname
      couchbase1
      $vi /etc/hosts
      127.0.0.1       localhost
      127.0.1.1       SERVERNAME # REPLACE WITH YOUR OWN VALUE
```

### Debian version >= 9
You may notice that there is a new instruction in /etc/network/interfaces :
```
source /etc/network/interfaces.d/*
```
This instruction requires the network daemon to configure interfaces by executing scripts located in /etc/network/interfaces.d and then to fall back to the default configuration defined in /etc/network/interfaces

Consequently, you should let /etc/network/interfaces file as it is and add a file in interfaces.d directory :
```
$vi /etc/network/interfaces.d/<INTERFACE NAME>
auto <INTERFACE NAME>
iface <INTERCACE NAME> inet static
address AAA.AAA.AAA.AAA
netmask NNN.NNN.NNN.NNN
gateway GGG.GGG.GGG.GGG
```
## Openssh
Install openssh-server on the ansible target (or another ssh server):
```
$su
$apt-get install openssh-server
```
Check that you can ssh into your server using your login/password.

## Adding an account with public key to the server
### Create a new account on the server
We create a new user "ansible". This account will be used by ansible to connect on the target server. You may as well connect with another regular linux account. We choose to create a specific account to be consistent across our servers (same account, named ansible, on every server)
```
$adduser ansible
...
```
### Create a public/private keys pair on your client
Ansible requires that the account used to connect to the configured server authenticates with private/public key.

USER = your local account

First, generate a key pair on your local machine :
```
LOCAL$cd
LOCAL$mkdir .ssh
LOCAL$chmod 700 .ssh
LOCAL$ssh-keygen -t rsa -b 2048
Generating public/private rsa key pair.
Enter file in which to save the key (/home/USER/.ssh/id_rsa): /home/USER/.ssh/ansiblekey
Enter passphrase (empty for no passphrase): **********
Enter same passphrase again: **********
```
Then, copy your public key to the remote server :
```
LOCAL$ssh-copy-id -i /home/USER/.ssh/ansiblekey.pub USER@SERVER
```
Finally, register your credentials in your local ssh client configuration :
```
LOCAL$cd
$vim .ssh/config
Host SERVER
    HostName SERVERIP
    User USER
    IdentityFile ~/.ssh/ansiblekey
```
### Add ansible account to sudoer group on the server
The ansible account on the server should have sudo privilege without password :
- sudo must be installed on the server
- add the user ansible to sudo role without password
```
log into the server
$su
$apt-get install sudo
$cd /etc/sudoers.d/
$visudo -f ansible
ansible ALL=NOPASSWD: ALL
$chmod 0440 /etc/sudoers.d/ansible
```
### Install python on the target server
We work with python. Ansible compatibility with python 3 is rather fresh. We'll upgrade when we need to...
```
LOCAL$ssh ansible@SERVER
$sudo apt-get install python
```
## Improvements
Should you have to manage many Ansible servers, you'll probably instantiate some kind of directory 
- when a server fires up, it gets its parameters by Net boot and then registers automatically to the directory and the DNS
- credentials are managed centrally by a PKI server

# And you're done :-) !
