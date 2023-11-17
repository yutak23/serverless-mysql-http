import { describe, expect, it } from 'vitest';
import encodeRow from '../../srv/lib/encode-row.js';

describe('Encode row', () => {
	it('should encode row', () => {
		const result = encodeRow({
			id: 1,
			name: '日本ホテル',
			address: '東京都千代田区1-1',
			stars: 4.2
		});

		expect(result.lengths).toEqual(['1', '15', '24', '3']);
		expect(result.values).toBe('MeaXpeacrOODm+ODhuODq+adseS6rOmDveWNg+S7o+eUsOWMujEtMTQuMg==');
	});

	it('should encode row another', () => {
		const result = encodeRow({
			id: 2,
			name: '帝国ホテル',
			address: '東京都千代田区内幸町1-1-1',
			stars: 5.0
		});

		expect(result.lengths).toEqual(['1', '15', '35', '1']);
		expect(result.values).toBe(
			'MuW4neWbveODm+ODhuODq+adseS6rOmDveWNg+S7o+eUsOWMuuWGheW5uOeUujEtMS0xNQ=='
		);
	});

	it('should encode row with null', () => {
		const result = encodeRow({
			id: 3,
			name: 'ホテルニューオータニ',
			address: null,
			stars: 4.0
		});

		expect(result.lengths).toEqual(['1', '30', '-1', '1']);
		expect(result.values).toBe('M+ODm+ODhuODq+ODi+ODpeODvOOCquODvOOCv+ODizQ=');
	});

	it('should encode row with empty string', () => {
		const result = encodeRow({
			id: 4,
			name: 'ホテルニューオータニ',
			address: '',
			stars: 4,
			created_at: '2023-11-17 08:30:53',
			updated_at: '2023-11-17 08:30:53'
		});

		expect(result.lengths).toEqual(['1', '30', '0', '1', '19', '19']);
		expect(result.values).toBe(
			'NOODm+ODhuODq+ODi+ODpeODvOOCquODvOOCv+ODizQyMDIzLTExLTE3IDA4OjMwOjUzMjAyMy0xMS0xNyAwODozMDo1Mw=='
		);
	});

	describe('should encode row with JSON', () => {
		it('One-dimensional JSON', () => {
			const result = encodeRow({
				id: 4,
				name: 'ホテルニューオータニ',
				address: '',
				stars: 4,
				created_at: '2023-11-17 08:30:53',
				updated_at: '2023-11-17 08:41:37',
				address_json: { area: '内幸町1-1-1', city: '千代田区', prefecture: '東京都' }
			});

			expect(result.lengths).toEqual(['1', '30', '0', '1', '19', '19', '77']);
			expect(result.values).toBe(
				'NOODm+ODhuODq+ODi+ODpeODvOOCquODvOOCv+ODizQyMDIzLTExLTE3IDA4OjMwOjUzMjAyMy0xMS0xNyAwODo0MTozN3siYXJlYSI6ICLlhoXlubjnlLoxLTEtMSIsICJjaXR5IjogIuWNg+S7o+eUsOWMuiIsICJwcmVmZWN0dXJlIjogIuadseS6rOmDvSJ9'
			);
		});

		it('Multi-dimensional JSON', () => {
			const result = encodeRow({
				id: 4,
				name: 'ホテルニューオータニ',
				address: '',
				stars: 4,
				created_at: '2023-11-17 08:30:53',
				updated_at: '2023-11-17 11:30:56',
				address_json: {
					area: {
						area: { area: 123, city: '千代田区', prefecture: '東京都' },
						city: '千代田区',
						prefecture: '東京都'
					},
					city: '千代田区',
					prefecture: '東京都'
				}
			});

			expect(result.lengths).toEqual(['1', '30', '0', '1', '19', '19', '186']);
			expect(result.values).toBe(
				'NOODm+ODhuODq+ODi+ODpeODvOOCquODvOOCv+ODizQyMDIzLTExLTE3IDA4OjMwOjUzMjAyMy0xMS0xNyAxMTozMDo1NnsiYXJlYSI6IHsiYXJlYSI6IHsiYXJlYSI6IDEyMywgImNpdHkiOiAi5Y2D5Luj55Sw5Yy6IiwgInByZWZlY3R1cmUiOiAi5p2x5Lqs6YO9In0sICJjaXR5IjogIuWNg+S7o+eUsOWMuiIsICJwcmVmZWN0dXJlIjogIuadseS6rOmDvSJ9LCAiY2l0eSI6ICLljYPku6PnlLDljLoiLCAicHJlZmVjdHVyZSI6ICLmnbHkuqzpg70ifQ=='
			);
		});
	});
});
