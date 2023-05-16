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
 * @param {string} shellChoice
 * @returns {Promise<IExecReturnData>}
 */
function execPromise(command: string, shellChoice: string): Promise<IExecReturnData> {
	const returnData: IExecReturnData = {
		error: undefined,
		exitCode: 0,
		stderr: '',
		stdout: '',
	};

	return new Promise((resolve, reject) => {
		exec(command, { 'shell': shellChoice }, (error, stdout, stderr) => {
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
		subtitle: '',
		description: 'Run PowerShell commands from n8n',
		defaults: {
			name: 'PowerShell',
		},
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Choose PowerShell Type',
				name: 'shellChoice',
				description: 'Choose PowerShell to use your default full PowerShell installation (probably PowerShell 5), or PowerShell Core to use your default PowerShell Core (PowerShell 6 or 7) installation',
				type: 'options',
				default: 'powershell.exe',
				options: [
					{
						name: 'PowerShell',
						value: 'powershell.exe',
					},
					{
						name: 'PowerShell Core',
						value: 'pwsh',
					},
				],
			},
			{
				displayName: 'Command',
				name: 'command',
				type: 'string',
				default: '',
				typeOptions: {
					rows: 10,
				},
				placeholder: 'Write-Output "Hello World"',
				description: 'Write a command to execute',
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
		let shellChoice: string;
		const executeOnce = this.getNodeParameter('executeOnce', 0) as boolean;

		if (executeOnce === true) {
			items = [items[0]];
		}
		const returnItems: INodeExecutionData[] = [];
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				command = this.getNodeParameter('command', itemIndex) as string;
				shellChoice = this.getNodeParameter('shellChoice', itemIndex) as string;

				const { error, exitCode, stdout, stderr } = await execPromise(command, shellChoice);

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

}
