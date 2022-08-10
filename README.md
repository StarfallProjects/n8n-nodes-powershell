# n8n-nodes-powershell

This is a custom node for [n8n](https://n8n.io/). It allows you to execute PowerShell commands within an n8n workflow.

## Purpose

n8n provides an Execute Command node, which allows you to execute scripts on your system's default shell. On Windows, this is Command Prompt (cmd). There is currently no option to use PowerShell, other than changing your system's default shell. This node provides an alternative. It copies _heavily_ from the Execute Command node (source for that node is [here](https://github.com/n8n-io/n8n/tree/master/packages/nodes-base/nodes/ExecuteCommand) if you're curious just how blatantly I've copied).

## Installation

1. Make sure you have PowerShell installed on the same machine as n8n. The node gives you the option to use either your default PowerShell installation, or your default PowerShell Core installation. You can't choose between multiple PowerShell (or PowerShell Core) versions.
2. Follow the n8n documentation to [install community nodes](https://docs.n8n.io/integrations/community-nodes/installation/).

## Usage



## Limitations

### Not available on Cloud or Desktop

Like the Execute Command node, the PowerShell node won't work on n8n Cloud.

Community nodes are currently unavailable on n8n Desktop.

###

## Technical background

This node uses `execPromise`, an n8n function that promisifies Node.js' `child_process.exec()`. Refer to the [Node.js 16.x documentation](https://nodejs.org/docs/latest-v16.x/api/child_process.html#child_processexeccommand-options-callback) for more background.

> **Note:** because we're using `exec` rather than `spawn`, there is no option to detach the child process. This means the n8n workflow waits for the PowerShell script to complete before proceeding.

> **Note:** `exec` is designed to handle commands with small outputs. Be cautious about using this node for memory-heavy operations.


