# n8n-nodes-powershell

This is a custom node for [n8n](https://n8n.io/). It allows you to execute PowerShell commands within an n8n workflow.

## Purpose

n8n provides an Execute Command node, which allows you to execute scripts on your system's default shell. On Windows, this is Command Prompt (cmd). There is currently no option to use PowerShell, other than changing your system's default shell. This node provides an alternative. It copies _heavily_ from the Execute Command node (source for that node is [here](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes/ExecuteCommand) if you're curious just how blatantly I've copied).

## Installation

1. Make sure you have PowerShell installed on the same machine as n8n. The node gives you the option to use either your default PowerShell installation, or your default PowerShell Core installation. You can't currently choose between multiple PowerShell (or PowerShell Core) versions.
2. Follow the n8n documentation to [install community nodes](https://docs.n8n.io/integrations/community-nodes/installation/).

## Usage



## Limitations

Like the Execute Command node, the PowerShell node won't work on n8n Cloud.

Community nodes are currently unavailable on n8n Desktop.

