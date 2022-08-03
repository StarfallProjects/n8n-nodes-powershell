import { IExecuteFunctions } from 'n8n-core';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { exec } from 'child_process';

export interface IExecReturnData {
	exitCode: number;
	error?: Error;
	stderr: string;
	stdout: string;
}

/**
 * Promisifiy exec manually to also get the exit code
 *
 * @param {string} command
 * @returns {Promise<IExecReturnData>}
 */
function execPromise(command: string): Promise<IExecReturnData> {
	const returnData: IExecReturnData = {
		error: undefined,
		exitCode: 0,
		stderr: '',
		stdout: '',
	};

	return new Promise((resolve, reject) => {
		exec(command, { 'shell': 'powershell.exe' }, (error, stdout, stderr) => {
			returnData.stdout = stdout.trim();
			returnData.stderr = stderr.trim();

			if (error) {
				returnData.error = error;
			}

			resolve(returnData);
		}).on('exit', (code) => {
			returnData.exitCode = code || 0;
		});
	});
}

export class PowerShell implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'PowerShell',
    name: 'PowerShell',
    icon: 'file:powershell.svg',
    group: [],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Run PowerShell commands from n8n',
    defaults: {
      name: 'PowerShell'
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Command',
        name: 'command',
        type: 'string',
        default: '',
        typeOptions: {
          rows: 10,
        },
        placeholder: 'Write-Output "Hello World"',
        description: 'The command to execute',  
      },
      {
				displayName: 'Execute Once',
				name: 'executeOnce',
				type: 'boolean',
				default: true,
				description: 'Whether to execute only once (enabled) instead of once for each entry (disabled)',
			},
    ],
  };


  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    let items = this.getInputData();
		let command: string;
    const executeOnce = this.getNodeParameter('executeOnce', 0) as boolean;

		if (executeOnce === true) {
			items = [items[0]];
		}
    const returnItems: INodeExecutionData[] = [];
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				command = this.getNodeParameter('command', itemIndex) as string;

				const { error, exitCode, stdout, stderr } = await execPromise(command);

				if (error !== undefined) {
					throw new NodeOperationError(this.getNode(), error.message, { itemIndex });
				}

				returnItems.push({
					json: {
						exitCode,
						stderr,
						stdout,
					},
					pairedItem: {
						item: itemIndex,
					},
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnItems.push({
						json: {
							error: error.message,
						},
						pairedItem: {
							item: itemIndex,
						},
					});
					continue;
				}
				throw error;
			}
		}

		return this.prepareOutputData(returnItems);
  }

};