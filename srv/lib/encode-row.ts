import { DateTime } from 'luxon';
import { Field } from './fields-converter.js';

const customJsonStringify = (inputData: Record<string, unknown>): string => {
	const keyValuePairs = Object.keys(inputData).map((key) => {
		const value = inputData[key];
		if (typeof value === 'number') return `"${key}": ${value}`;

		if (typeof value === 'object')
			return `"${key}": ${customJsonStringify(inputData[key] as Record<string, unknown>)}`;

		return `"${key}": "${inputData[key] as string}"`;
	});
	return `{${keyValuePairs.join(', ')}}`;
};

const textEncoder = new TextEncoder();
const encodeString = (string: string) => textEncoder.encode(string);
const decodeBinaryString = (uint8Array: Uint8Array) =>
	uint8Array.reduce((binaryString, uint8) => binaryString + String.fromCharCode(uint8), '');

export default (
	data: Record<string, unknown>,
	fields: Field[]
): { lengths: string[]; values: string } => {
	const lengths: string[] = [];
	let concatenatedValues = '';

	Object.keys(data).forEach((key) => {
		if (data[key] === null) {
			lengths.push('-1');
			return;
		}

		// Planetscale timezone is UTC
		const dt = DateTime.fromJSDate(data[key] as Date, { zone: 'utc' });
		const dateType = fields.find((f) => f.name === key)?.type?.toUpperCase() || '';
		if (dt.isValid && ['TIMESTAMP', 'DATE', 'DATETIME'].includes(dateType)) {
			let dtStr;
			switch (dateType) {
				case 'DATE':
					dtStr = dt.toFormat('yyyy-MM-dd');
					break;
				case 'TIMESTAMP':
				case 'DATETIME':
				default:
					dtStr = dt.toFormat('yyyy-MM-dd HH:mm:ss');
					break;
			}

			const encodedStr = new TextEncoder().encode(dtStr);
			lengths.push(encodedStr.length.toString());
			concatenatedValues += dtStr;
			return;
		}

		if (typeof data[key] === 'object' && data[key] !== null) {
			const jsonStr = customJsonStringify(data[key] as Record<string, unknown>);
			const encodedJson = new TextEncoder().encode(jsonStr);
			lengths.push(encodedJson.length.toString());
			concatenatedValues += jsonStr;
			return;
		}

		const str = data[key]?.toString();
		const encodedStr = new TextEncoder().encode(str);
		lengths.push(encodedStr.length.toString());
		concatenatedValues += str;
	});

	const uint8Array = encodeString(concatenatedValues);
	const binaryString = decodeBinaryString(uint8Array);
	const base64 = btoa(binaryString);

	/* antother way to encode */
	// const base64 = btoa(unescape(encodeURIComponent(concatenatedValues)));
	// const base64 = btoa(
	// 	encodeURIComponent(concatenatedValues).replace(/%([0-9A-F]{2})/g, (match, p1) =>
	// 		String.fromCharCode(parseInt(p1, 16))
	// 	)
	// );

	return { lengths, values: base64 };
};
