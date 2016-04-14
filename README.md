# node-hashpattern
A node.js program to find the required input to generate a specified pattern at the start of a SHA256 hash.

## Features

*   Multi-threaded
*   Continuous operation
*   Splits output to STDOUT and STDERR for headless operation and cloud deployment.

## Usage

    node findhash.js [OPTIONS] PATTERN

## Options

**Crypto options**

-t
Specify the method of encryption.

-p
What prefix to prepend to the hash source
