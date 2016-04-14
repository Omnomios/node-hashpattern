# hashpattern
A node.js program to find the required input to generate a specified pattern at the start of a hash.

## Features

*   Multi-threaded
*   Continuous operation
*   Splits output to STDOUT and STDERR for headless operation and cloud deployment.

## Usage

    node findhash.js [OPTIONS] PATTERN

## Options

    Type
    -t [string] Default: "sha256"
    Specify the method to hash with.

    Prefix
    -p [string] Default: ""
    What prefix to prepend to the hash source. The hash source is always a hex encoded integer.

    Detune
    -d [number] Default: 0
    Reduces the number of threads by [number]
