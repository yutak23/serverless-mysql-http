export default (data: Record<string, unknown>): { lengths: string[]; values: string } => {
	const lengths: string[] = [];
	let concatenatedValues = '';

	Object.values(data).forEach((value) => {
		if (value === null) {
			lengths.push('-1');
		} else if (typeof value === 'object' && value !== null) {
			// オブジェクト形式の値をJSON文字列に変換し、バイト長を計算
			const jsonStr = JSON.stringify(value);
			const encodedJsonStr = new TextEncoder().encode(jsonStr);
			lengths.push(encodedJsonStr.length.toString());
			concatenatedValues += jsonStr;
		} else {
			const str = value.toString();
			const encodedStr = new TextEncoder().encode(str);
			lengths.push(encodedStr.length.toString());
			concatenatedValues += str;
		}
	});

	// プロパティを連結し、Base64でエンコード
	const values = btoa(unescape(encodeURIComponent(concatenatedValues)));

	return { lengths, values };
};
