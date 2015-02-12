# node-hashpattern
A node.js program to find the required input to generate a specified pattern at the start of a SHA256 hash.

## Features

*   Multi-threaded
*   Continuous operation
*   Splits output to STDOUT and STDERR for headless operation and cloud deployment.

## Usage

     node findsha256.js [OPTIONS] PATTERN [INPUT PREFIX]

## Options

    ** Crypto options **
    -t
    Specify the method of encryption.
